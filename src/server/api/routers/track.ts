import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck, providersCheck } from "@/server/api/routers/access";
import { env } from "process";
import { getPublicUrl } from "@/utils/url";
import { slugify } from "@/utils/string";
import { deleteObject, getUploadURL } from "@/server/s3";

const allowedFileTypes = ["audio/wav", "audio/mpeg"];

export const trackRouter = createTRPCRouter({
  getTracks: protectedProcedure
    .input(
      z.object({
        project: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const project = await ctx.db.project.findFirst({
        where: {
          username: {
            equals: input.project,
            mode: "insensitive",
          },
        },
      });

      if (!project || (project.status === "DRAFT" && access !== "ADMIN")) {
        return [];
      }

      const tracks = await ctx.db.track.findMany({
        where: {
          projectId: project.id,
        },
        include: {
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
        orderBy: {
          order: {
            sort: "asc",
            nulls: "last",
          },
        },
      });

      return tracks.map(track => {
        const collaborators = track.collaborators
          .map(collaborator => {
            if (collaborator.user?.profile) {
              return {
                type: "ATRIARCHY",
                username: collaborator.user.profile.username,
                avatar: collaborator.user.image,
                role: collaborator.role,
              };
            }

            if (collaborator.discordUserId) {
              return {
                type: "DISCORD",
                username: collaborator.discordUsername,
                avatar: collaborator.discordAvatar,
                role: collaborator.role,
              };
            }

            return null;
          })
          .filter(c => c !== null)
          .sort((a, b) => {
            // Prioritize the MANAGER role
            if (a.role === "MANAGER") return -1;
            if (b.role === "MANAGER") return 1;
            return 0;
          });

        return {
          username: track.username,
          title: track.title,
          description: track.description,
          musicStatus: track.musicStatus,
          visualStatus: track.visualStatus,
          explicit: track.explicit,
          collaborators: collaborators,
          order: track.order,
        };
      });
    }),

  createTrack: protectedProcedure
    .input(
      z.object({
        project: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
        username: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        title: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        explicit: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const project = await ctx.db.project.findFirst({
        where: {
          username: {
            equals: input.project,
            mode: "insensitive",
          },
        },
      });

      if (!project || (project.status === "DRAFT" && access !== "ADMIN")) {
        throw new Error("Project not found.");
      }

      let username = input.username;

      if (username) {
        const usernameFind = await ctx.db.project.findFirst({
          where: {
            username: {
              equals: input.username,
              mode: "insensitive",
            },
          },
        });

        if (usernameFind) {
          throw new Error("Slug already exists.");
        }

        if (input.username && !/^\w{1,64}$/.test(input.username)) {
          throw new Error(
            "Slug can only contain letters, numbers, and underscores."
          );
        }
      } else {
        const usernameCheck = slugify(input.title).slice(0, 64) || "_";

        let index = 1;

        do {
          const usernameCheckWithIndex =
            index < 2 ? usernameCheck : usernameCheck + index;

          const usernameFind = await ctx.db.track.findFirst({
            where: {
              username: {
                equals: usernameCheckWithIndex,
                mode: "insensitive",
              },
            },
          });

          if (!usernameFind) {
            username = usernameCheckWithIndex;
            break;
          }

          index++;
        } while (index < 10);
      }

      if (!username) {
        throw new Error("Could not generate a slug.");
      }

      const profile = await ctx.db.profile.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new Error("Profile not found.");
      }

      const providers = await providersCheck(ctx);

      const discordProvider = providers?.find(p => p.provider === "discord");

      if (!discordProvider) {
        throw new Error("Discord not connected.");
      }

      let discordChannelId;

      if (project.discordChannelId) {
        if (
          project.discordChannelType !== 0 &&
          project.discordChannelType !== 15
        ) {
          throw new Error("Invalid Discord channel type.");
        }

        const messageContent = {
          content: `<@${discordProvider.providerAccountId}> created a new track!`,
          embeds: [
            {
              title: input.title,
              description: input.description,
              color: 0x171717,
              fields: [
                {
                  name: "Track Manager",
                  value: `[${profile.name} \(@${profile.username}\)](${getPublicUrl()}/@${profile.username})\n<@${discordProvider.providerAccountId}>`,
                },
              ],
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "View Track",
                  style: 5,
                  url: `${getPublicUrl()}/dashboard/projects/${project.username}/tracks/${username}`,
                },
              ],
            },
          ],
        };

        const request = await fetch(
          "https://discord.com/api/v10/channels/" +
            project.discordChannelId +
            "/threads",
          {
            method: "POST",
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: input.title,
              type: 11,
              topic: input.description,
              parent_id: project.discordChannelId,
              message:
                project.discordChannelType === 15 ? messageContent : undefined,
            }),
          }
        );

        if (!request.ok) {
          throw new Error("Could not create Discord thread.");
        }

        const response = (await request.json()) as {
          id: string;
        };

        discordChannelId = response.id;

        if (project.discordChannelType !== 15) {
          const messageRequest = await fetch(
            "https://discord.com/api/v10/channels/" +
              discordChannelId +
              "/messages",
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(messageContent),
            }
          );

          if (!messageRequest.ok) {
            throw new Error("Could not send Discord message.");
          }
        }
      }

      const track = await ctx.db.track.create({
        data: {
          projectId: project.id,
          username: username,
          title: input.title,
          description: input.description,
          discordChannelId: discordChannelId,
          musicStatus: "IDEA",
          visualStatus: "SEARCHING",
          explicit: input.explicit,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "CREATE_TRACK",
          value: track,
        },
      });

      const invite = await ctx.db.trackCollaborator.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          acceptedInvite: true,
          role: "MANAGER",
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          targetUserId: ctx.session.user.id,
          action: "CREATE_COLLABORATOR",
          value: {
            ...invite,
            acceptedInvite: false,
          },
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "ACCEPT_COLLABORATOR_INVITE",
          value: invite,
          oldValue: {
            ...invite,
            acceptedInvite: false,
          },
        },
      });

      return { username: username };
    }),

  getTrack: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
        include: {
          project: true,
          song: true,
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
        return null;
      }

      let myRole: "MANAGER" | "EDITOR" | "CONTRIBUTOR" | "VIEWER" = "VIEWER";
      let myAcceptedInvite;
      let myId;

      const collaborators = (
        await Promise.all(
          track.collaborators.map(async collaborator => {
            if (collaborator.user?.profile) {
              if (collaborator.user.profile.userId === ctx.session.user.id) {
                myRole = collaborator.role;
                myAcceptedInvite = collaborator.acceptedInvite;
                myId = collaborator.id;
              }

              return {
                type: "ATRIARCHY" as const,
                id: collaborator.id,
                username: collaborator.user.profile.username,
                name: collaborator.user.profile.name,
                role: collaborator.role,
                acceptedInvite: collaborator.acceptedInvite,
                avatar: collaborator.user.image,
                me: collaborator.user.profile.userId === ctx.session.user.id,
              };
            }

            if (collaborator.discordUserId) {
              return {
                type: "DISCORD" as const,
                id: collaborator.id,
                discord: {
                  userId: collaborator.discordUserId,
                  username: collaborator.discordUsername,
                  avatar: collaborator.discordAvatar,
                },
                role: collaborator.role,
                acceptedInvite: collaborator.acceptedInvite,
              };
            }

            await ctx.db.trackCollaborator.delete({
              where: {
                id: collaborator.id,
              },
            });

            return null;
          })
        )
      )
        .filter(c => c !== null)
        .sort((a, b) => {
          if (a.role === b.role) return 0;
          if (a.role === "MANAGER") return -1;
          if (b.role === "MANAGER") return 1;
          if (a.role === "EDITOR") return -1;
          if (b.role === "EDITOR") return 1;
          if (a.role === "CONTRIBUTOR") return -1;
          if (b.role === "CONTRIBUTOR") return 1;
          if (a.role === "VIEWER") return -1;
          if (b.role === "VIEWER") return 1;
          return 0;
        });

      const manager = collaborators.find(c => c.role === "MANAGER");

      return {
        username: track.username,
        title: track.title,
        description: track.description,
        explicit: track.explicit,
        musicStatus: track.musicStatus,
        visualStatus: track.visualStatus,
        project: {
          username: track.project.username,
          title: track.project.title,
          description: track.project.description,
        },
        collaborators: collaborators,
        me: {
          role: myRole as "MANAGER" | "EDITOR" | "CONTRIBUTOR" | "VIEWER",
          acceptedInvite: myAcceptedInvite,
          id: myId,
        },
        manager: manager,
        songUrl:
          access === "ADMIN" && track.song
            ? `${env.FILE_STORAGE_CDN_URL}/${track.song.key}`
            : undefined,
      };
    }),

  updateTrack: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
        title: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        explicit: z.boolean(),
        musicStatus: z.enum([
          "IDEA",
          "DEMO",
          "WRITING",
          "PRODUCTION",
          "RECORDING",
          "MIX_MASTER",
          "ABANDONED",
          "FINISHED",
        ]),
        visualStatus: z.enum([
          "SEARCHING",
          "CONCEPT",
          "WORKING",
          "POLISHING",
          "ABANDONED",
          "FINISHED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.username,
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

      if (!manager) {
        throw new Error("Manager not found.");
      }

      const editors = track.collaborators.filter(c => c.role === "EDITOR");

      const accessRoles = [manager, ...editors]
        .map(c => c.userId)
        .filter(c => c !== null);

      if (
        (!accessRoles.includes(ctx.session.user.id) && access !== "ADMIN") ||
        (input.musicStatus === "FINISHED" && access !== "ADMIN")
      ) {
        throw new Error("Unauthorized.");
      }

      if (input.musicStatus !== "FINISHED") {
        const oldTrackSong = await ctx.db.trackSong.findFirst({
          where: { trackId: track.id },
        });

        if (oldTrackSong) {
          await deleteObject(oldTrackSong.key);

          await ctx.db.trackSong.delete({
            where: { id: oldTrackSong.id },
          });
        }
      }

      const newData = await ctx.db.track.update({
        where: { id: track.id },
        data: {
          title: input.title,
          description: input.description,
          musicStatus: input.musicStatus,
          visualStatus: input.visualStatus,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "UPDATE_TRACK",
          oldValue: track,
          value: newData,
        },
      });
    }),

  getMaxSongFileSize: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.username,
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
        return 0;
      }

      const manager = track.collaborators.find(c => c.role === "MANAGER");

      if (!manager) {
        throw new Error("Manager not found.");
      }

      const editors = track.collaborators.filter(c => c.role === "EDITOR");

      const accessRoles = [manager, ...editors]
        .map(c => c.userId)
        .filter(c => c !== null);

      if (!accessRoles.includes(ctx.session.user.id) && access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      return track.maxSongFileSize;
    }),

  updateSong: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
        explicit: z.boolean(),
        song: z.object({
          fileType: z.string(),
          fileSize: z.number(),
          checksum: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.username,
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

      if (!manager) {
        throw new Error("Manager not found.");
      }

      const editors = track.collaborators.filter(c => c.role === "EDITOR");

      const accessRoles = [manager, ...editors]
        .map(c => c.userId)
        .filter(c => c !== null);

      if (!accessRoles.includes(ctx.session.user.id) && access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      if (!allowedFileTypes.includes(input.song.fileType)) {
        throw new Error("Invalid file type.");
      }

      if (input.song.fileSize > track.maxSongFileSize) {
        throw new Error("File size too large.");
      }

      const { url, key } = await getUploadURL({
        file: {
          type: input.song.fileType,
          size: input.song.fileSize,
          checksum: input.song.checksum,
        },
        metadata: {
          userId: ctx.session.user.id,
        },
      });

      const oldTrackSong = await ctx.db.trackSong.findFirst({
        where: { trackId: track.id },
      });

      if (oldTrackSong) {
        await deleteObject(oldTrackSong.key);

        await ctx.db.trackSong.delete({
          where: { id: oldTrackSong.id },
        });
      }

      await ctx.db.trackSong.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          key: key,
        },
      });

      const newData = await ctx.db.track.update({
        where: { id: track.id },
        data: {
          musicStatus: "FINISHED",
          explicit: input.explicit,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "UPDATE_TRACK",
          oldValue: track,
          value: newData,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "UPLOAD_SONG",
        },
      });

      return {
        upload: {
          url: url,
        },
      };
    }),

  reorderTracks: protectedProcedure
    .input(
      z.object({
        tracks: z.array(
          z.object({
            username: z
              .string()
              .min(1)
              .max(64)
              .regex(/^[a-z0-9-]+$/),
            order: z.number().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      await Promise.all(
        input.tracks.map(async track => {
          await ctx.db.track.update({
            where: {
              username: track.username,
            },
            data: {
              order: track.order,
            },
          });
        })
      );

      return;
    }),
});
