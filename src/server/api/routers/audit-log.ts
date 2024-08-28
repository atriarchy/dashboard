import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { humanize } from "@/utils/string";

export const auditLogRouter = createTRPCRouter({
  getTrackAuditLogs: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1).max(64),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const length = 50;

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
        return {
          data: [],
        };
      }

      const auditLogs = await ctx.db.trackAuditLog.findMany({
        take: length + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where: {
          trackId: track.id,
        },
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          targetUser: {
            include: {
              profile: true,
            },
          },
        },
      });

      let cursor;

      if (auditLogs.length > length) {
        cursor = auditLogs.pop()?.id;
      }

      const data = auditLogs
        .map(auditLog => {
          let user;
          let targetUser;

          if (auditLog.user?.profile) {
            user = `${auditLog.user.profile.name}${auditLog.user.profile.username ? ` (@${auditLog.user.profile.username})` : ""}`;
          }

          if (auditLog.discordUserId) {
            user = auditLog.discordUsername
              ? `@${auditLog.discordUsername} (Discord)`
              : `${auditLog.discordUserId} (Discord)`;
          }

          if (auditLog.targetUser?.profile) {
            targetUser = `${auditLog.targetUser.profile.name}${auditLog.targetUser.profile.username ? ` (@${auditLog.targetUser.profile.username})` : ""}`;
          }

          if (auditLog.targetDiscordUserId) {
            targetUser = auditLog.targetDiscordUsername
              ? `@${auditLog.targetDiscordUsername} (Discord)`
              : `${auditLog.targetDiscordUserId} (Discord)`;
          }

          if (auditLog.action === "CREATE_TRACK") {
            return {
              id: auditLog.id,
              action: auditLog.action,
              title: user ? `Track created by ${user}` : "Track created",
              date: auditLog.createdAt,
            };
          }

          if (auditLog.action === "UPDATE_TRACK") {
            const value = auditLog.value
              ? (auditLog.value as {
                  title?: string;
                  description?: string;
                  musicStatus?: string;
                  visualStatus?: string;
                })
              : undefined;

            const oldValue = auditLog.oldValue
              ? (auditLog.oldValue as {
                  title?: string;
                  description?: string;
                  musicStatus?: string;
                  visualStatus?: string;
                })
              : undefined;

            const details = [];

            if (oldValue && value) {
              if (oldValue.title !== value.title) {
                details.push(
                  `Changed title from ${
                    oldValue.title ? `"${oldValue.title}"` : "empty"
                  } to ${value.title ? `"${value.title}"` : "empty"}`
                );
              }

              if (oldValue.description !== value.description) {
                details.push(
                  `Changed description from "${
                    oldValue.description ? `"${oldValue.description}` : "empty"
                  }" to "${value.description ? `"${value.description}` : "empty"}"`
                );
              }

              if (oldValue.musicStatus !== value.musicStatus) {
                details.push(
                  `Changed music status from "${
                    oldValue.musicStatus
                      ? `"${humanize(oldValue.musicStatus)}"`
                      : "empty"
                  }" to "${value.musicStatus ? `"${humanize(value.musicStatus)}"` : "empty"}"`
                );
              }

              if (oldValue.visualStatus !== value.visualStatus) {
                details.push(
                  `Changed visual status from "${
                    oldValue.visualStatus
                      ? `"${humanize(oldValue.visualStatus)}"`
                      : "empty"
                  }" to "${value.visualStatus ? `"${humanize(value.visualStatus)}"` : "empty"}"`
                );
              }
            }

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: user ? `Track updated by ${user}` : "Track updated",
              date: auditLog.createdAt,
              details: details,
            };
          }

          if (auditLog.action === "CREATE_COLLABORATOR") {
            const value = auditLog.value
              ? (auditLog.value as {
                  role?: string;
                })
              : undefined;

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: targetUser
                ? `Invited ${targetUser} as a collaborator`
                : "Invited someone as a collaborator",
              date: auditLog.createdAt,
              details: value?.role
                ? [`With role "${humanize(value.role)}"`]
                : undefined,
            };
          }

          if (auditLog.action === "UPDATE_COLLABORATOR") {
            const value = auditLog.value
              ? (auditLog.value as {
                  role?: string;
                })
              : undefined;

            const oldValue = auditLog.oldValue
              ? (auditLog.oldValue as {
                  role?: string;
                })
              : undefined;

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: targetUser
                ? `Updated ${targetUser} as a collaborator`
                : "Updated someone as a collaborator",
              date: auditLog.createdAt,
              details: value?.role
                ? oldValue?.role
                  ? [
                      `Changed role from "${humanize(oldValue.role)}" to "${humanize(value.role)}"`,
                    ]
                  : [`To role "${humanize(value.role)}"`]
                : undefined,
            };
          }

          if (auditLog.action === "DELETE_COLLABORATOR") {
            return {
              id: auditLog.id,
              action: auditLog.action,
              title: targetUser
                ? `Removed ${targetUser} as a collaborator`
                : "Removed someone as a collaborator",
              date: auditLog.createdAt,
            };
          }

          if (auditLog.action === "ACCEPT_COLLABORATOR_INVITE") {
            return {
              id: auditLog.id,
              action: auditLog.action,
              title: user
                ? `${user} joined as a collaborator`
                : "Someone joined as a collaborator",
              date: auditLog.createdAt,
            };
          }

          if (auditLog.action === "DECLINE_COLLABORATOR_INVITE") {
            return {
              id: auditLog.id,
              action: auditLog.action,
              title: user
                ? `${user} declined the invitation`
                : "Someone declined the invitation",
              date: auditLog.createdAt,
            };
          }

          if (auditLog.action === "CREATE_CREDIT") {
            const value = auditLog.value
              ? (auditLog.value as {
                  type: string;
                  value?: string;
                  name?: string;
                })
              : undefined;

            const details = [`Credited as "${value?.type}"`];

            if (value?.value) {
              details.push(`With value "${value.value}"`);
            }

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: `Added credit for ${targetUser ?? value?.name ?? "someone"}`,
              date: auditLog.createdAt,
              details: details,
            };
          }

          if (auditLog.action === "UPDATE_CREDIT") {
            const oldValue = auditLog.oldValue
              ? (auditLog.oldValue as {
                  type: string;
                  value?: string;
                  name?: string;
                })
              : undefined;

            const value = auditLog.value
              ? (auditLog.value as {
                  type: string;
                  value?: string;
                  name?: string;
                })
              : undefined;

            const details = [];

            if (oldValue && value) {
              if (oldValue?.type !== value?.type) {
                details.push(
                  `Changed credit from "${oldValue.type}" to "${value.type}"`
                );
              }

              if (oldValue?.value !== value?.value) {
                details.push(
                  `Changed value from ${oldValue.value ? `"${oldValue.value}"` : "empty"} to ${value.value ? `"${value.value}"` : "empty"}`
                );
              }
            }

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: `Credit updated for ${targetUser ?? value?.name ?? "someone"}`,
              date: auditLog.createdAt,
              details: details,
            };
          }

          if (auditLog.action === "DELETE_CREDIT") {
            const oldValue = auditLog.oldValue
              ? (auditLog.oldValue as {
                  type: string;
                  value?: string;
                  name?: string;
                })
              : undefined;

            return {
              id: auditLog.id,
              action: auditLog.action,
              title: `Removed credit for ${targetUser ?? oldValue?.name ?? "someone"}`,
              date: auditLog.createdAt,
            };
          }

          if (auditLog.action === "UPLOAD_SONG") {
            return {
              id: auditLog.id,
              action: auditLog.action,
              title: user ? `Song uploaded by ${user}` : "Song uploaded",
              date: auditLog.createdAt,
            };
          }

          return null;
        })
        .filter(a => a !== null);

      return {
        data,
        cursor,
      };
    }),
});
