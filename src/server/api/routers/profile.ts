import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { accessCheck, providersCheck } from "@/server/api/routers/access";
import { env } from "@/env";

export const profileRouter = createTRPCRouter({
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      // Step 1: Fetch the profile
      const profile = await ctx.db.profile.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
        include: {
          links: true,
          user: true,
        },
      });

      if (!profile) {
        return null;
      }

      // Step 2: Fetch projects that match the criteria
      const projects = await ctx.db.project.findMany({
        where: {
          status: "RELEASED",
          tracks: {
            some: {
              credits: {
                some: {
                  collaborator: {
                    user: {
                      profile: {
                        username: {
                          equals: input.username,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          releasedAt: true,
        },
        orderBy: {
          releasedAt: {
            sort: "desc",
            nulls: "last",
          },
        },
      });

      // Step 3: Fetch tracks for each project
      const tracksGroupedByProject = await Promise.all(
        projects.map(async project => {
          const tracks = await ctx.db.track.findMany({
            where: {
              projectId: project.id,
              credits: {
                some: {
                  collaborator: {
                    user: {
                      profile: {
                        username: {
                          equals: input.username,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                },
              },
            },
            include: {
              project: {
                select: {
                  title: true,
                  thumbnail: true,
                },
              },
              credits: {
                include: {
                  collaborator: {
                    include: {
                      user: {
                        include: {
                          profile: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          });

          return tracks.map(track => {
            const credits = track.credits
              .sort((a, b) => {
                if (a.type === b.type) return 0;
                if (a.type === "Vocalist") return -1;
                if (b.type === "Vocalist") return 1;
                if (a.type === "Producer") return -1;
                if (b.type === "Producer") return 1;
                return 0;
              })
              .map(credit =>
                credit.collaborator
                  ? credit.collaborator.user?.profile
                    ? credit.collaborator.user.profile.username !==
                      profile.username
                      ? {
                          name: credit.collaborator.user.profile.name,
                          username: credit.collaborator.user.profile.username,
                        }
                      : undefined
                    : {
                        name: credit.collaborator.discordUsername ?? "Unknown",
                        username: null,
                      }
                  : {
                      name: credit.name ?? "Unknown",
                      username: null,
                    }
              )
              .filter(c => c !== undefined)
              .slice(0, 4);

            credits.unshift({
              name: profile.name,
              username: profile.username,
            });

            return {
              title: track.title,
              album: track.project.title,
              thumbnail: track.project.thumbnail
                ? `${env.FILE_STORAGE_CDN_URL}/${track.project.thumbnail.key}`
                : undefined,
              credits: credits,
              creditsCount: track.credits.length,
            };
          });
        })
      );

      const flattenedTracks = tracksGroupedByProject.flat();

      return {
        username: profile.username,
        name: profile.name,
        bio: profile.bio,
        links: profile.links.map(link => ({
          type: link.type,
          url: link.url,
        })),
        avatar: profile.user.image,
        tracks: flattenedTracks,
        canEdit: ctx.session?.user.id === profile.userId,
      };
    }),

  getOnboarding: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.profile.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return !!profile;
  }),

  getProfile: protectedProcedure
    .input(
      z
        .object({
          as: z.string(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      if (input) {
        const access = await accessCheck(ctx);

        if (access !== "ADMIN") {
          throw new Error("Unauthorized.");
        }

        return await ctx.db.profile.findUnique({
          where: {
            username: input.as,
          },
          include: {
            links: true,
            pro: true,
          },
        });
      }

      return await ctx.db.profile.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          links: true,
          pro: true,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1).max(64),
        name: z.string().min(1).max(64),
        bio: z.string().min(1).max(1024).optional(),
        legalName: z.string().min(1).max(256).optional(),
        country: z.string().min(1).max(256).optional(),
        phone: z.string().min(1).max(256).optional(),
        pro: z
          .object({
            member: z.string().min(1).max(256),
            country: z.string().min(1).max(256),
            name: z.string().min(1).max(256),
            number: z.string().min(1).max(256),
          })
          .optional(),
        links: z
          .array(
            z.object({
              type: z.enum([
                "SPOTIFY",
                "APPLE_MUSIC",
                "YOUTUBE_MUSIC",
                "YOUTUBE",
                "TWITTER",
                "TWITCH",
              ]),
              url: z.string().url(),
            })
          )
          .optional(),
        privacy: z.enum(["PRIVATE"]).default("PRIVATE"),
        as: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const providers = await providersCheck(ctx);

      let userId = ctx.session.user.id;
      let email = ctx.session.user.email;

      if (input.as) {
        const access = await accessCheck(ctx);

        if (access !== "ADMIN") {
          throw new Error("Unauthorized.");
        }

        const profile = await ctx.db.profile.findUnique({
          where: {
            username: input.as,
          },
        });

        if (!profile) {
          throw new Error("User does not exist.");
        }

        userId = profile.userId;
        email = profile?.email;
      }

      if (input.links) {
        const linkTypes = input.links.map(link => link.type);
        const linkTypesUnique = [...new Set(linkTypes)];

        if (linkTypes.length !== linkTypesUnique.length) {
          throw new Error("Duplicate link types.");
        }

        input.links.forEach(link => {
          try {
            new URL(link.url);
          } catch {
            throw new Error("Invalid link URL.");
          }

          const url = new URL(link.url);

          if (url.pathname === "/") {
            throw new Error("Invalid link URL.");
          }

          if (
            link.type === "SPOTIFY" &&
            (url.hostname !== "open.spotify.com" ||
              !url.pathname.startsWith("/artist/"))
          ) {
            throw new Error("Invalid Spotify URL.");
          }

          if (
            link.type === "APPLE_MUSIC" &&
            url.hostname !== "music.apple.com"
          ) {
            throw new Error("Invalid Apple Music URL.");
          }

          if (
            link.type === "YOUTUBE_MUSIC" &&
            (url.hostname !== "music.youtube.com" ||
              !url.pathname.startsWith("/channel/"))
          ) {
            throw new Error("Invalid YouTube Music URL.");
          }

          if (
            link.type === "YOUTUBE" &&
            url.hostname !== "www.youtube.com" &&
            url.hostname !== "youtube.com"
          ) {
            throw new Error("Invalid YouTube URL.");
          }

          if (
            link.type === "TWITTER" &&
            url.hostname !== "twitter.com" &&
            url.hostname !== "www.twitter.com" &&
            url.hostname !== "x.com"
          ) {
            throw new Error("Invalid Twitter URL.");
          }

          if (
            link.type === "TWITCH" &&
            url.hostname !== "www.twitch.tv" &&
            url.hostname !== "twitch.tv"
          ) {
            throw new Error("Invalid Twitch URL.");
          }
        });
      }

      const username = await ctx.db.profile.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
      });

      if (username && username.userId !== userId) {
        throw new Error("Username already exists.");
      }

      if (input.username && !/^\w{1,64}$/.test(input.username)) {
        throw new Error(
          "Username can only contain letters, numbers, and underscores."
        );
      }

      const data = await ctx.db.profile.upsert({
        where: {
          userId: userId,
        },
        update: {
          username: input.username,
          name: input.name,
          bio: input.bio ?? null,
          legalName: input.legalName ?? null,
          country: input.country ?? null,
          email: email ?? "",
          phone: input.phone ?? null,
          privacy: input.privacy,
        },
        create: {
          userId: userId,
          username: input.username,
          name: input.name,
          bio: input.bio,
          legalName: input.legalName,
          country: input.country,
          email: email ?? "",
          phone: input.phone,
          privacy: input.privacy,
        },
      });

      if (providers && userId === ctx.session.user.id) {
        const discordProviders = providers
          .map(provider => {
            if (provider.provider === "discord") {
              return {
                discordUserId: provider.providerAccountId,
              };
            }

            return null;
          })
          .filter(p => p !== null);

        if (discordProviders && discordProviders.length > 0) {
          await ctx.db.trackCollaborator.updateMany({
            where: {
              OR: discordProviders,
            },
            data: {
              userId: ctx.session.user.id,
              discordUserId: null,
              discordUsername: null,
              discordAvatar: null,
            },
          });

          const targetDiscordProvider = discordProviders.map(p => ({
            targetDiscordUserId: p.discordUserId,
          }));

          await ctx.db.trackAuditLog.updateMany({
            where: {
              OR: discordProviders,
            },
            data: {
              userId: ctx.session.user.id,
              discordUserId: null,
              discordUsername: null,
              discordAvatar: null,
            },
          });

          await ctx.db.trackAuditLog.updateMany({
            where: {
              OR: targetDiscordProvider,
            },
            data: {
              targetUserId: ctx.session.user.id,
              targetDiscordUserId: null,
              targetDiscordUsername: null,
              targetDiscordAvatar: null,
            },
          });
        }
      }

      await ctx.db.profileLink.deleteMany({
        where: {
          profileId: data.id,
        },
      });

      if (input.links) {
        await ctx.db.profileLink.createMany({
          data: input.links.map(link => ({
            profileId: data.id,
            type: link.type,
            url: link.url,
          })),
        });
      }

      if (!input.pro) {
        await ctx.db.proProfile.deleteMany({
          where: {
            profileId: data.id,
          },
        });

        return {
          username: data.username,
        };
      }

      await ctx.db.proProfile.upsert({
        where: {
          profileId: data.id,
        },
        update: {
          member: input.pro.member,
          country: input.pro.country,
          name: input.pro.name,
          number: input.pro.number,
        },
        create: {
          profileId: data.id,
          member: input.pro.member,
          country: input.pro.country,
          name: input.pro.name,
          number: input.pro.number,
        },
      });

      return {
        username: data.username,
      };
    }),
});
