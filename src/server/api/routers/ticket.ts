import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";

export const ticketRouter = createTRPCRouter({
  getTickets: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const length = 50;

      const access = await accessCheck(ctx);

      const tickets = await ctx.db.ticket.findMany({
        take: length + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where:
          access === "ADMIN"
            ? undefined
            : {
                userId: ctx.session.user.id,
              },
        orderBy: [{ createdAt: "desc" }],
      });

      let cursor;

      if (tickets.length > length) {
        cursor = tickets.pop()?.id;
      }

      return {
        data: tickets.map(ticket => ({
          id: ticket.id,
          category: ticket.category,
          title: ticket.title,
          status: ticket.status,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        })),
        cursor,
      };
    }),

  getTicket: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const ticket = await ctx.db.ticket.findFirst({
        where: {
          id: input.id,
          userId: access === "ADMIN" ? undefined : ctx.session.user.id,
        },
        include: {
          feed: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!ticket) {
        return null;
      }

      const ticketUserType = ticket.userId
        ? ("ATRIARCHY" as const)
        : ticket.discordUserId
          ? ("DISCORD" as const)
          : ("UNKNOWN" as const);

      return {
        user: {
          name:
            ticketUserType === "ATRIARCHY"
              ? ticket.user?.profile?.name
              : ticketUserType === "DISCORD"
                ? ticket.discordUsername
                : undefined,
          username:
            ticketUserType === "ATRIARCHY"
              ? ticket.user?.profile?.username
              : undefined,
          image:
            ticketUserType === "ATRIARCHY"
              ? ticket.user?.image
              : ticketUserType === "DISCORD"
                ? ticket.discordAvatar
                : undefined,
        },
        id: ticket.id,
        category: ticket.category,
        title: ticket.title,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        feed: ticket.feed
          .filter(item => {
            if (access === "ADMIN") {
              return true;
            }

            if (item.private) {
              return false;
            }

            return true;
          })
          .map(item => {
            const userType = item.system
              ? ("SYSTEM" as const)
              : item.userId
                ? ("ATRIARCHY" as const)
                : item.discordUserId
                  ? ("DISCORD" as const)
                  : ("UNKNOWN" as const);

            return {
              userType,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              private: access === "ADMIN" ? item.private : undefined,
              name:
                userType === "ATRIARCHY"
                  ? item.user?.profile?.name
                  : userType === "DISCORD"
                    ? item.discordUsername
                    : undefined,
              username:
                userType === "ATRIARCHY"
                  ? item.user?.profile?.username
                  : undefined,
              avatar:
                userType === "ATRIARCHY"
                  ? item.user?.image
                  : userType === "DISCORD"
                    ? item.discordAvatar
                    : undefined,
              action:
                item.action === "CREATE_COMMENT"
                  ? {
                      type: item.action,
                      message: (
                        JSON.parse(item.value) as {
                          message?: string;
                        }
                      )?.message,
                    }
                  : {
                      type: item.action,
                      status: (
                        JSON.parse(item.value) as {
                          status?: string;
                        }
                      )?.status,
                      category: (
                        JSON.parse(item.value) as {
                          category?: string;
                        }
                      )?.category,
                      title: (
                        JSON.parse(item.value) as {
                          title?: string;
                        }
                      )?.title,
                    },
            };
          }),
      };
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        message: z.string().min(1).max(2048).optional(),
        private: z.boolean().optional(),
        status: z.enum(["CLOSED", "PENDING", "OPEN"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const ticket = await ctx.db.ticket.findFirst({
        where: {
          id: input.id,
          userId: access === "ADMIN" ? undefined : ctx.session.user.id,
        },
      });

      if (!ticket) {
        throw new Error("Ticket not found.");
      }

      if (
        ticket.status === "CLOSED" &&
        input.status === "OPEN" &&
        !input.message
      ) {
        const updatedTicket = await ctx.db.ticket.update({
          where: { id: ticket.id },
          data: {
            status: input.status,
          },
        });

        await ctx.db.ticketFeedItem.create({
          data: {
            ticketId: updatedTicket.id,
            userId: ctx.session.user.id,
            action: "UPDATE_TICKET",
            value: JSON.stringify({
              status: updatedTicket.status,
            }),
          },
        });

        return;
      }

      if (ticket.status === "CLOSED") {
        throw new Error("Ticket is closed.");
      }

      if (ticket.status === input.status) {
        throw new Error("Status is already set.");
      }

      if (!input.status && !input.message) {
        throw new Error("Message is required.");
      }

      if (input.message) {
        await ctx.db.ticketFeedItem.create({
          data: {
            ticketId: ticket.id,
            userId: ctx.session.user.id,
            action: "CREATE_COMMENT",
            private: access === "ADMIN" ? input.private : undefined,
            value: JSON.stringify({
              message: input.message,
            }),
          },
        });
      }

      if (input.status) {
        const updatedTicket = await ctx.db.ticket.update({
          where: { id: ticket.id },
          data: {
            status: input.status,
          },
        });

        await ctx.db.ticketFeedItem.create({
          data: {
            ticketId: updatedTicket.id,
            userId: ctx.session.user.id,
            action:
              input.status === "CLOSED" ? "CLOSE_TICKET" : "UPDATE_TICKET",
            value: JSON.stringify({
              status: updatedTicket.status,
            }),
          },
        });
      }

      return;
    }),

  editTicket: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(256).optional(),
        category: z.enum(["PROFILE_UPDATE"]).optional(),
        status: z.enum(["CLOSED", "PENDING", "OPEN"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      const ticket = await ctx.db.ticket.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!ticket) {
        throw new Error("Ticket not found.");
      }

      if (!input.title && !input.category && !input.status) {
        throw new Error("No changes.");
      }

      const updatedTicket = await ctx.db.ticket.update({
        where: { id: ticket.id },
        data: {
          title: input.title,
          category: input.category,
          status: input.status,
        },
      });

      await ctx.db.ticketFeedItem.create({
        data: {
          ticketId: updatedTicket.id,
          userId: ctx.session.user.id,
          action: "UPDATE_TICKET",
          value: JSON.stringify({
            title: updatedTicket.title,
            category: updatedTicket.category,
            status:
              updatedTicket.status === "CLOSED"
                ? undefined
                : updatedTicket.status,
          }),
        },
      });

      if (input.status === "CLOSED") {
        await ctx.db.ticketFeedItem.create({
          data: {
            ticketId: updatedTicket.id,
            userId: ctx.session.user.id,
            action: "CLOSE_TICKET",
            value: JSON.stringify({
              status: updatedTicket.status,
            }),
          },
        });
      }

      return;
    }),
});
