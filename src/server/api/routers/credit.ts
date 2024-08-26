import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";

export const creditRouter = createTRPCRouter({
  getTrackCredits: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1).max(64),
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
        },
      });

      if (!track || (track.project.status === "DRAFT" && access !== "ADMIN")) {
        return [];
      }

      const credits = await ctx.db.trackCredit.findMany({
        where: {
          trackId: track.id,
        },
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
      });

      return credits.map(credit => {
        if (credit.name) {
          return {
            id: credit.id,
            name: credit.name,
            nameSource: "MANUAL" as const,
            type: credit.type,
            value: credit.value,
            me: credit.collaborator?.userId === ctx.session.user.id,
          };
        }

        if (credit.collaborator?.user?.profile) {
          return {
            id: credit.id,
            name: credit.collaborator.user.profile.name,
            nameSource: "ATRIARCHY" as const,
            type: credit.type,
            value: credit.value,
            me: credit.collaborator?.userId === ctx.session.user.id,
          };
        }

        if (credit.collaborator?.discordUserId) {
          return {
            id: credit.id,
            name: credit.collaborator.discordUserId,
            nameSource: "DISCORD" as const,
            type: credit.type,
            value: credit.value,
            me: credit.collaborator?.userId === ctx.session.user.id,
          };
        }

        return {
          id: credit.id,
          name: "Unknown",
          nameSource: "UNKNOWN" as const,
          type: credit.type,
          value: credit.value,
          me: credit.collaborator?.userId === ctx.session.user.id,
        };
      });
    }),

  updateTrackCredit: protectedProcedure
    .input(
      z.union([
        z.object({
          id: z.string(),
          type: z.string().min(1).max(128),
          value: z.string().min(1).max(1024).optional(),
        }),
        z.object({
          collaborator: z.string(),
          track: z.string().min(1).max(64),
          type: z.string().min(1).max(128),
          value: z.string().min(1).max(1024).optional(),
        }),
        z.object({
          manual: z.string(),
          track: z.string().min(1).max(64),
          type: z.string().min(1).max(128),
          value: z.string().min(1).max(1024).optional(),
        }),
      ])
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if ("id" in input) {
        const credit = await ctx.db.trackCredit.findUnique({
          where: {
            id: input.id,
          },
          include: {
            track: {
              include: {
                project: true,
              },
            },
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
        });

        if (
          !credit ||
          (credit.track.project.status === "DRAFT" && access !== "ADMIN")
        ) {
          throw new Error("Credit not found.");
        }

        const me = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: credit.trackId,
            userId: ctx.session.user.id,
          },
        });

        if (
          (!credit.collaborator ||
            credit.collaborator.userId !== ctx.session.user.id) &&
          access !== "ADMIN" &&
          (!me || (me.role !== "MANAGER" && me.role !== "EDITOR"))
        ) {
          throw new Error("Unauthorized.");
        }

        const updatedCredit = await ctx.db.trackCredit.update({
          where: {
            id: credit.id,
          },
          data: {
            type: input.type,
            value: input.value ? input.value : null,
          },
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
        });

        if (updatedCredit.collaborator) {
          if (updatedCredit.collaborator.user?.profile) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: updatedCredit.trackId,
                userId: ctx.session.user.id,
                targetUserId: updatedCredit.collaborator.userId,
                action: "UPDATE_CREDIT",
                oldValue: credit,
                value: updatedCredit,
              },
            });
          }

          if (updatedCredit.collaborator.discordUserId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: updatedCredit.trackId,
                userId: ctx.session.user.id,
                discordUserId: updatedCredit.collaborator.discordUserId,
                targetDiscordUsername:
                  updatedCredit.collaborator.discordUsername,
                discordAvatar: updatedCredit.collaborator.discordAvatar,
                action: "UPDATE_CREDIT",
                oldValue: credit,
                value: updatedCredit,
              },
            });
          }
        } else {
          await ctx.db.trackAuditLog.create({
            data: {
              trackId: credit.trackId,
              userId: ctx.session.user.id,
              action: "UPDATE_CREDIT",
              oldValue: credit,
              value: updatedCredit,
            },
          });
        }

        return;
      }

      if ("track" in input) {
        const track = await ctx.db.track.findFirst({
          where: {
            username: {
              equals: input.track,
              mode: "insensitive",
            },
          },
          include: {
            project: true,
          },
        });

        if (
          !track ||
          (track.project.status === "DRAFT" && access !== "ADMIN")
        ) {
          throw new Error("Track not found.");
        }

        const me = await ctx.db.trackCollaborator.findFirst({
          where: {
            trackId: track.id,
            userId: ctx.session.user.id,
          },
        });

        if ("collaborator" in input) {
          const collaborator = await ctx.db.trackCollaborator.findFirst({
            where: {
              id: input.collaborator,
              trackId: track.id,
            },
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          });

          if (!collaborator) {
            throw new Error("Collaborator not found.");
          }

          if (
            collaborator.userId !== ctx.session.user.id &&
            access !== "ADMIN" &&
            (!me || (me.role !== "MANAGER" && me.role !== "EDITOR"))
          ) {
            throw new Error("Unauthorized.");
          }

          const credit = await ctx.db.trackCredit.create({
            data: {
              trackId: track.id,
              collaboratorId: input.collaborator,
              type: input.type,
              value: input.value,
            },
          });

          if (collaborator.user?.profile) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                targetUserId: collaborator.userId,
                action: "CREATE_CREDIT",
                value: credit,
              },
            });
          }

          if (collaborator.discordUserId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                discordUserId: collaborator.discordUserId,
                targetDiscordUsername: collaborator.discordUsername,
                discordAvatar: collaborator.discordAvatar,
                action: "CREATE_CREDIT",
                value: credit,
              },
            });
          }

          return;
        }

        if ("manual" in input) {
          if (
            access !== "ADMIN" &&
            (!me || (me.role !== "MANAGER" && me.role !== "EDITOR"))
          ) {
            throw new Error("Unauthorized.");
          }

          const credit = await ctx.db.trackCredit.create({
            data: {
              trackId: track.id,
              name: input.manual,
              type: input.type,
              value: input.value,
            },
          });

          await ctx.db.trackAuditLog.create({
            data: {
              trackId: track.id,
              userId: ctx.session.user.id,
              action: "CREATE_CREDIT",
              value: credit,
            },
          });

          return;
        }
      }

      throw new Error("Invalid input.");
    }),

  deleteTrackCredit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const credit = await ctx.db.trackCredit.findUnique({
        where: {
          id: input.id,
        },
        include: {
          track: {
            include: {
              project: true,
            },
          },
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
      });

      if (
        !credit ||
        (credit.track.project.status === "DRAFT" && access !== "ADMIN")
      ) {
        throw new Error("Credit not found.");
      }

      const me = await ctx.db.trackCollaborator.findFirst({
        where: {
          trackId: credit.trackId,
          userId: ctx.session.user.id,
        },
      });

      if (
        (!credit.collaborator ||
          credit.collaborator.userId !== ctx.session.user.id) &&
        access !== "ADMIN" &&
        (!me || (me.role !== "MANAGER" && me.role !== "EDITOR"))
      ) {
        throw new Error("Unauthorized.");
      }

      await ctx.db.trackCredit.delete({
        where: {
          id: credit.id,
        },
      });

      if (credit.collaborator) {
        if (credit.collaborator.user?.profile) {
          await ctx.db.trackAuditLog.create({
            data: {
              trackId: credit.trackId,
              userId: ctx.session.user.id,
              targetUserId: credit.collaborator.userId,
              action: "DELETE_CREDIT",
              oldValue: credit,
            },
          });
        }

        if (credit.collaborator.discordUserId) {
          await ctx.db.trackAuditLog.create({
            data: {
              trackId: credit.trackId,
              userId: ctx.session.user.id,
              discordUserId: credit.collaborator.discordUserId,
              targetDiscordUsername: credit.collaborator.discordUsername,
              discordAvatar: credit.collaborator.discordAvatar,
              action: "DELETE_CREDIT",
              oldValue: credit,
            },
          });
        }
      } else {
        await ctx.db.trackAuditLog.create({
          data: {
            trackId: credit.trackId,
            userId: ctx.session.user.id,
            action: "DELETE_CREDIT",
            oldValue: credit,
          },
        });
      }

      return;
    }),
});
