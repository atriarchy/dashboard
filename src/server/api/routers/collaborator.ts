import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { env } from "process";

export const collaboratorRouter = createTRPCRouter({
  addCollaborator: protectedProcedure
    .input(
      z.object({
        username: z.string().optional(),
        discord: z.string().optional(),
        track: z.string(),
        role: z.enum(["CONTRIBUTOR", "EDITOR"]),
        skipInvite: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.username && !input.discord) {
        throw new Error("Username or Discord ID is required.");
      }

      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.track,
            mode: "insensitive",
          },
        },
        include: {
          project: true,
          collaborators: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });

      if (!track || (track.project.status === "DRAFT" && access !== "ADMIN")) {
        throw new Error("Track not found.");
      }

      const manager = track.collaborators.find(c => c.role === "MANAGER");

      if (!manager?.user?.profile) {
        throw new Error("Manager not found.");
      }

      if (
        (manager.user.id !== ctx.session.user.id && access !== "ADMIN") ||
        (input.skipInvite && access !== "ADMIN")
      ) {
        throw new Error("Unauthorized.");
      }

      let profileInput;

      if (input.discord) {
        const discordToAtriarchy = await ctx.db.account.findFirst({
          where: {
            provider: "discord",
            providerAccountId: input.discord,
          },
          include: {
            user: {
              include: {
                profile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });

        if (discordToAtriarchy) {
          profileInput = discordToAtriarchy.user.profile;
        }
      }

      if (input.username || profileInput) {
        if (!profileInput) {
          const profile = await ctx.db.profile.findFirst({
            where: {
              username: {
                equals: input.username,
                mode: "insensitive",
              },
            },
            include: {
              user: true,
            },
          });

          if (!profile) {
            throw new Error("User not found.");
          }

          profileInput = profile;
        }

        const check = track.collaborators.find(
          c =>
            c.user?.profile?.id ===
            (
              profileInput! as {
                id: string;
              }
            ).id
        );

        if (check) {
          throw new Error("User is already a collaborator.");
        }

        await ctx.db.trackCollaborator.create({
          data: {
            trackId: track.id,
            userId: profileInput.user.id,
            role: input.role,
            acceptedInvite: false,
          },
        });

        return;
      }

      if (input.discord) {
        const check = track.collaborators.find(
          c => c.discordUserId === input.discord
        );

        if (check) {
          throw new Error("User is already a collaborator.");
        }

        const response = await fetch(
          "https://discord.com/api/v10/users/" + input.discord,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Discord user not found.");
        }

        const data = (await response.json()) as {
          id: string;
          username: string;
          avatar?: string;
        };

        await ctx.db.trackCollaborator.create({
          data: {
            trackId: track.id,
            discordUserId: input.discord,
            discordUsername: data.username,
            discordAvatar: data.avatar ?? null,
            role: input.role,
            acceptedInvite: input.skipInvite,
          },
        });

        return;
      }

      throw new Error("Username or Discord ID is required.");
    }),

  updateCollaborator: protectedProcedure
    .input(
      z.object({
        username: z.string().optional(),
        discord: z.string().optional(),
        track: z.string(),
        role: z.enum(["CONTRIBUTOR", "EDITOR"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.username && !input.discord) {
        throw new Error("Username or Discord ID is required.");
      }

      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.track,
            mode: "insensitive",
          },
        },
        include: {
          project: true,
          collaborators: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });

      if (!track || (track.project.status === "DRAFT" && access !== "ADMIN")) {
        throw new Error("Track not found.");
      }

      const manager = track.collaborators.find(c => c.role === "MANAGER");

      if (!manager?.user?.profile) {
        throw new Error("Manager not found.");
      }

      if (manager.user.id !== ctx.session.user.id && access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      if (input.discord) {
        const discordToAtriarchy = await ctx.db.account.findFirst({
          where: {
            provider: "discord",
            providerAccountId: input.discord,
          },
          include: {
            user: true,
          },
        });

        if (discordToAtriarchy) {
          const userInput = discordToAtriarchy.user;

          const check = await ctx.db.trackCollaborator.findFirst({
            where: {
              trackId: track.id,
              userId: userInput.id,
            },
          });

          if (!check || check.role === "MANAGER") {
            throw new Error("User is not a collaborator.");
          }

          await ctx.db.trackCollaborator.update({
            where: {
              id: check.id,
            },
            data: {
              role: input.role,
            },
          });

          return;
        }

        const check = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: track.id,
            discordUserId: input.discord,
          },
        });

        if (!check || check.role === "MANAGER") {
          throw new Error("User is not a collaborator.");
        }

        await ctx.db.trackCollaborator.update({
          where: {
            id: check.id,
          },
          data: {
            role: input.role,
          },
        });

        return;
      }

      if (input.username) {
        const profile = await ctx.db.profile.findFirst({
          where: {
            username: {
              equals: input.username,
              mode: "insensitive",
            },
          },
          include: {
            user: true,
          },
        });

        if (!profile) {
          throw new Error("User not found.");
        }

        const check = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: track.id,
            userId: profile.user.id,
          },
        });

        if (!check || check.role === "MANAGER") {
          throw new Error("User is not a collaborator.");
        }

        await ctx.db.trackCollaborator.update({
          where: {
            id: check.id,
          },
          data: {
            role: input.role,
          },
        });

        return;
      }

      throw new Error("Username or Discord ID is required.");
    }),

  deleteCollaborator: protectedProcedure
    .input(
      z.object({
        username: z.string().optional(),
        discord: z.string().optional(),
        track: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.username && !input.discord) {
        throw new Error("Username or Discord ID is required.");
      }

      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.track,
            mode: "insensitive",
          },
        },
        include: {
          project: true,
          collaborators: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });

      if (!track || (track.project.status === "DRAFT" && access !== "ADMIN")) {
        throw new Error("Track not found.");
      }

      const manager = track.collaborators.find(c => c.role === "MANAGER");

      if (!manager?.user?.profile) {
        throw new Error("Manager not found.");
      }

      if (manager.user.id !== ctx.session.user.id && access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      if (input.discord) {
        const discordToAtriarchy = await ctx.db.account.findFirst({
          where: {
            provider: "discord",
            providerAccountId: input.discord,
          },
          include: {
            user: true,
          },
        });

        if (discordToAtriarchy) {
          const userInput = discordToAtriarchy.user;

          const check = await ctx.db.trackCollaborator.findFirst({
            where: {
              trackId: track.id,
              userId: userInput.id,
            },
          });

          if (!check || check.role === "MANAGER") {
            throw new Error("User is not a collaborator.");
          }

          await ctx.db.trackCollaborator.delete({
            where: {
              id: check.id,
            },
          });

          return;
        }

        const check = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: track.id,
            discordUserId: input.discord,
          },
        });

        if (!check || check.role === "MANAGER") {
          throw new Error("User is not a collaborator.");
        }

        await ctx.db.trackCollaborator.delete({
          where: {
            id: check.id,
          },
        });

        return;
      }

      if (input.username) {
        const profile = await ctx.db.profile.findFirst({
          where: {
            username: {
              equals: input.username,
              mode: "insensitive",
            },
          },
          include: {
            user: true,
          },
        });

        if (!profile) {
          throw new Error("User not found.");
        }

        const check = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: track.id,
            userId: profile.user.id,
          },
        });

        if (!check || check.role === "MANAGER") {
          throw new Error("User is not a collaborator.");
        }

        await ctx.db.trackCollaborator.delete({
          where: {
            id: check.id,
          },
        });

        return;
      }

      throw new Error("Username or Discord ID is required.");
    }),
});
