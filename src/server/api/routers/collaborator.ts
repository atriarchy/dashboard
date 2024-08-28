import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { env } from "process";
import { getPublicUrl } from "@/utils/url";

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

      if (!manager) {
        throw new Error("Manager not found.");
      }

      if (
        ((!manager.user || manager.user.id !== ctx.session.user.id) &&
          access !== "ADMIN") ||
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

      const sendDiscordMessage = async (
        name: string,
        discordUserId?: string,
        avatar?: string | null
      ) => {
        if (!input.skipInvite && track.project.discordChannelId) {
          let invitesChannel = track.project.discordInvitesChannelId;

          if (!invitesChannel && track.project.discordChannelId) {
            if (
              track.project.discordChannelType !== 0 &&
              track.project.discordChannelType !== 15
            ) {
              throw new Error("Invalid Discord channel type.");
            }

            const request = await fetch(
              "https://discord.com/api/v10/channels/" +
                track.project.discordChannelId +
                "/threads",
              {
                method: "POST",
                headers: {
                  Authorization: `Bot ${env.DISCORD_TOKEN}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: "Invites",
                  type: 11,
                  parent_id: track.project.discordChannelId,
                  message:
                    track.project.discordChannelType === 15
                      ? {
                          content:
                            "Invites to collaborate on tracks will be posted here.",
                        }
                      : undefined,
                }),
              }
            );

            if (!request.ok) {
              throw new Error("Could not create Discord thread.");
            }

            const response = (await request.json()) as {
              id: string;
            };

            await ctx.db.project.update({
              where: {
                id: track.project.id,
              },
              data: {
                discordInvitesChannelId: response.id,
              },
            });

            invitesChannel = response.id;
          }

          const manager = track.collaborators.find(c => c.role === "MANAGER");

          if (!manager) {
            throw new Error("Manager not found.");
          }

          const managerDiscordProvider = manager.userId
            ? (
                await ctx.db.account.findFirst({
                  where: {
                    userId: manager.userId,
                    provider: "discord",
                  },
                })
              )?.providerAccountId
            : manager.discordUserId;

          if (!managerDiscordProvider) {
            throw new Error("Manager Discord ID not found.");
          }

          const messageRequest = await fetch(
            "https://discord.com/api/v10/channels/" +
              invitesChannel +
              "/messages",
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: discordUserId ? `<@${discordUserId}>` : undefined,
                embeds: [
                  {
                    title: "You have been invited to collaborate!",
                    description:
                      "If you have any questions, please reach out to the track manager.",
                    color: 0x171717,
                    fields: [
                      {
                        name: "Track Manager",
                        value: manager.user?.profile
                          ? `[${manager.user.profile.name} \(@${manager.user.profile.username}\)](${getPublicUrl()}/@${manager.user.profile.username})\n<@${managerDiscordProvider}>`
                          : `<@${managerDiscordProvider}>`,
                        inline: true,
                      },
                      {
                        name: "Track",
                        value: track.title,
                        inline: true,
                      },
                    ],
                    author: {
                      name: name,
                      icon_url: avatar ?? undefined,
                    },
                  },
                ],
                components: [
                  {
                    type: 1,
                    components: [
                      {
                        type: 2,
                        label: "View Invite",
                        style: 5,
                        url: `${getPublicUrl()}/dashboard/projects/${track.project.username}/tracks/${track.username}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (!messageRequest.ok) {
            throw new Error("Could not send Discord message.");
          }
        }
      };

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

        const discordProvider = await ctx.db.account.findFirst({
          where: {
            userId: profileInput.user.id,
            provider: "discord",
          },
        });

        if (discordProvider?.providerAccountId === "120635167105613825") {
          throw new Error("You can not invite Atrioc.");
        }

        await sendDiscordMessage(
          `${profileInput.name} (@${profileInput.username})`,
          discordProvider?.providerAccountId,
          profileInput.user.image
        );

        const updatedData = await ctx.db.trackCollaborator.create({
          data: {
            trackId: track.id,
            userId: profileInput.user.id,
            role: input.role,
            acceptedInvite: input.skipInvite,
          },
        });

        await ctx.db.trackAuditLog.create({
          data: {
            trackId: track.id,
            userId: ctx.session.user.id,
            targetUserId: profileInput.user.id,
            action: "CREATE_COLLABORATOR",
            value: {
              ...updatedData,
              acceptedInvite: false,
            },
          },
        });

        if (input.skipInvite) {
          await ctx.db.trackAuditLog.create({
            data: {
              trackId: track.id,
              userId: profileInput.user.id,
              action: "ACCEPT_COLLABORATOR_INVITE",
              value: updatedData,
              oldValue: {
                ...updatedData,
                acceptedInvite: false,
              },
            },
          });
        }

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
          bot: boolean;
          system: boolean;
        };

        if (data.bot || data.system) {
          throw new Error("User is a bot or system account.");
        }

        if (data.id === "120635167105613825") {
          throw new Error("You can not invite Atrioc.");
        }

        await sendDiscordMessage(
          `${data.username} (Discord)`,
          input.discord,
          data.avatar
        );

        const updatedData = await ctx.db.trackCollaborator.create({
          data: {
            trackId: track.id,
            discordUserId: input.discord,
            discordUsername: data.username,
            discordAvatar: data.avatar
              ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${data.avatar.startsWith("a_") ? "gif" : "png"}`
              : `https://cdn.discordapp.com/embed/avatars/${(parseInt(data.id) >> 22) % 6}.png`,
            role: input.role,
            acceptedInvite: input.skipInvite,
          },
        });

        await ctx.db.trackAuditLog.create({
          data: {
            trackId: track.id,
            userId: ctx.session.user.id,
            targetDiscordUserId: input.discord,
            targetDiscordUsername: updatedData.discordUsername,
            targetDiscordAvatar: updatedData.discordAvatar,
            action: "CREATE_COLLABORATOR",
            value: {
              ...updatedData,
              acceptedInvite: false,
            },
          },
        });

        if (input.skipInvite) {
          await ctx.db.trackAuditLog.create({
            data: {
              trackId: track.id,
              discordUserId: input.discord,
              discordUsername: updatedData.discordUsername,
              discordAvatar: updatedData.discordAvatar,
              action: "ACCEPT_COLLABORATOR_INVITE",
              value: updatedData,
              oldValue: {
                ...updatedData,
                acceptedInvite: false,
              },
            },
          });
        }

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
        role: z.enum(["CONTRIBUTOR", "EDITOR", "MANAGER"]),
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

      if (!manager) {
        throw new Error("Manager not found.");
      }

      if (
        (!manager.user || manager.user.id !== ctx.session.user.id) &&
        access !== "ADMIN"
      ) {
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

          if (
            !check ||
            check.role === "MANAGER" ||
            (!check.acceptedInvite && input.role === "MANAGER")
          ) {
            throw new Error("User is not a collaborator.");
          }

          const updatedData = await ctx.db.trackCollaborator.update({
            where: {
              id: check.id,
            },
            data: {
              role: input.role,
            },
          });

          if (input.role === "MANAGER") {
            const updatedManager = await ctx.db.trackCollaborator.update({
              where: {
                id: manager.id,
              },
              data: {
                role: "EDITOR",
              },
            });

            if (manager.userId) {
              await ctx.db.trackAuditLog.create({
                data: {
                  trackId: track.id,
                  userId: ctx.session.user.id,
                  targetUserId: manager.userId,
                  action: "UPDATE_COLLABORATOR",
                  value: updatedManager,
                  oldValue: manager,
                },
              });
            } else if (manager.discordUserId) {
              await ctx.db.trackAuditLog.create({
                data: {
                  trackId: track.id,
                  userId: ctx.session.user.id,
                  targetDiscordUserId: manager.discordUserId,
                  targetDiscordUsername: manager.discordUsername,
                  targetDiscordAvatar: manager.discordAvatar,
                  action: "UPDATE_COLLABORATOR",
                  value: updatedManager,
                  oldValue: manager,
                },
              });
            } else {
              await ctx.db.trackAuditLog.create({
                data: {
                  trackId: track.id,
                  userId: ctx.session.user.id,
                  action: "UPDATE_COLLABORATOR",
                  value: updatedManager,
                  oldValue: manager,
                },
              });
            }
          }

          await ctx.db.trackAuditLog.create({
            data: {
              trackId: track.id,
              userId: ctx.session.user.id,
              targetUserId: userInput.id,
              action: "UPDATE_COLLABORATOR",
              value: updatedData,
              oldValue: check,
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

        if (
          !check ||
          check.role === "MANAGER" ||
          (!check.acceptedInvite && input.role === "MANAGER")
        ) {
          throw new Error("User is not a collaborator.");
        }

        const updatedData = await ctx.db.trackCollaborator.update({
          where: {
            id: check.id,
          },
          data: {
            role: input.role,
          },
        });

        if (input.role === "MANAGER") {
          const updatedManager = await ctx.db.trackCollaborator.update({
            where: {
              id: manager.id,
            },
            data: {
              role: "EDITOR",
            },
          });

          if (manager.userId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                targetUserId: manager.userId,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          } else if (manager.discordUserId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                targetDiscordUserId: manager.discordUserId,
                targetDiscordUsername: manager.discordUsername,
                targetDiscordAvatar: manager.discordAvatar,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          } else {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          }
        }

        await ctx.db.trackAuditLog.create({
          data: {
            trackId: track.id,
            userId: ctx.session.user.id,
            targetDiscordUserId: input.discord,
            targetDiscordUsername: updatedData.discordUsername,
            targetDiscordAvatar: updatedData.discordAvatar,
            action: "UPDATE_COLLABORATOR",
            value: updatedData,
            oldValue: check,
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

        if (
          !check ||
          check.role === "MANAGER" ||
          (!check.acceptedInvite && input.role === "MANAGER")
        ) {
          throw new Error("User is not a collaborator.");
        }

        const updatedData = await ctx.db.trackCollaborator.update({
          where: {
            id: check.id,
          },
          data: {
            role: input.role,
          },
        });

        if (input.role === "MANAGER") {
          const updatedManager = await ctx.db.trackCollaborator.update({
            where: {
              id: manager.id,
            },
            data: {
              role: "EDITOR",
            },
          });

          if (manager.userId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                targetUserId: manager.userId,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          } else if (manager.discordUserId) {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                targetDiscordUserId: manager.discordUserId,
                targetDiscordUsername: manager.discordUsername,
                targetDiscordAvatar: manager.discordAvatar,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          } else {
            await ctx.db.trackAuditLog.create({
              data: {
                trackId: track.id,
                userId: ctx.session.user.id,
                action: "UPDATE_COLLABORATOR",
                value: updatedManager,
                oldValue: manager,
              },
            });
          }
        }

        await ctx.db.trackAuditLog.create({
          data: {
            trackId: track.id,
            userId: ctx.session.user.id,
            targetUserId: profile.user.id,
            action: "UPDATE_COLLABORATOR",
            value: updatedData,
            oldValue: check,
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

      if (!manager) {
        throw new Error("Manager not found.");
      }

      if (
        (!manager.user || manager.user.id !== ctx.session.user.id) &&
        access !== "ADMIN"
      ) {
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

        await ctx.db.trackAuditLog.create({
          data: {
            trackId: track.id,
            userId: ctx.session.user.id,
            targetUserId: profile.user.id,
            action: "DELETE_COLLABORATOR",
            oldValue: check,
          },
        });

        return;
      }

      throw new Error("Username or Discord ID is required.");
    }),

  getMyInvites: protectedProcedure.query(async ({ ctx }) => {
    const invites = await ctx.db.trackCollaborator.findMany({
      where: {
        userId: ctx.session.user.id,
        acceptedInvite: false,
      },
      include: {
        track: {
          include: {
            project: true,
          },
        },
      },
    });

    return invites.map(invite => ({
      username: invite.track.username,
      title: invite.track.title,
      project: invite.track.project.username,
    }));
  }),

  acceptInvite: protectedProcedure
    .input(
      z.object({
        track: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.track,
            mode: "insensitive",
          },
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
      });

      if (!track) {
        throw new Error("Track not found.");
      }

      const collaborator = track.collaborators.find(
        c => c.userId === ctx.session.user.id
      );

      if (!collaborator?.userId) {
        throw new Error("User not found.");
      }

      if (collaborator.acceptedInvite) {
        throw new Error("Invite already accepted.");
      }

      const find = await ctx.db.trackCollaborator.findFirst({
        where: {
          trackId: track.id,
          userId: collaborator.userId,
        },
      });

      if (!find) {
        throw new Error("Collaborator not found.");
      }

      const updatedData = await ctx.db.trackCollaborator.update({
        where: {
          id: find.id,
        },
        data: {
          acceptedInvite: true,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "ACCEPT_COLLABORATOR_INVITE",
          value: updatedData,
          oldValue: find,
        },
      });

      return;
    }),

  declineInvite: protectedProcedure
    .input(
      z.object({
        track: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const track = await ctx.db.track.findFirst({
        where: {
          username: {
            equals: input.track,
            mode: "insensitive",
          },
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
      });

      if (!track) {
        throw new Error("Track not found.");
      }

      const collaborator = track.collaborators.find(
        c => c.userId === ctx.session.user.id
      );

      if (!collaborator?.userId) {
        throw new Error("User not found.");
      }

      if (collaborator.acceptedInvite) {
        throw new Error("Invite already accepted.");
      }

      const find = await ctx.db.trackCollaborator.findFirst({
        where: {
          trackId: track.id,
          userId: collaborator.userId,
        },
      });

      if (!find) {
        throw new Error("Collaborator not found.");
      }

      await ctx.db.trackCollaborator.delete({
        where: {
          id: find.id,
        },
      });

      await ctx.db.trackAuditLog.create({
        data: {
          trackId: track.id,
          userId: ctx.session.user.id,
          action: "DECLINE_COLLABORATOR_INVITE",
          oldValue: find,
        },
      });

      return;
    }),
});
