import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { env } from "@/env";

export const accessRouter = createTRPCRouter({
  getAccess: protectedProcedure.query(async ({ ctx }) => {
    return await accessCheck(ctx);
  }),

  getProviders: protectedProcedure.query(async ({ ctx }) => {
    return await providersCheck(ctx);
  }),

  getAllAccess: protectedProcedure.query(async ({ ctx }) => {
    const access = await accessCheck(ctx);

    if (access !== "ADMIN") {
      return null;
    }

    return await ctx.db.access.findMany({});
  }),

  updateNote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        note: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        return null;
      }

      if (!input.note) {
        return await ctx.db.access.update({
          where: { id: input.id },
          data: { note: null },
        });
      }

      return await ctx.db.access.update({
        where: { id: input.id },
        data: { note: input.note },
      });
    }),

  updateAccess: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        role: z.enum(["ADMIN"]),
        note: z.string().optional(),
        discordId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        return null;
      }

      if (!input.discordId && !input.id) {
        return null;
      }

      const user = input.id
        ? await ctx.db.access.findFirst({
            where: { id: input.id },
          })
        : null;

      if (input.id && !user) {
        return null;
      }

      if (!user) {
        if (!input.discordId) {
          return null;
        }

        const check = await ctx.db.access.findFirst({
          where: {
            provider: "discord",
            providerAccountId: input.discordId,
          },
        });

        if (check) {
          return null;
        }

        const response = await fetch(
          `https://discord.com/api/v10/users/${input.discordId}`,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as {
          username: string;
        };

        return await ctx.db.access.create({
          data: {
            role: input.role,
            note: input.note,
            provider: "discord",
            providerAccountId: input.discordId,
            providerAccountUsername: data.username,
          },
        });
      }

      const providers = await providersCheck(ctx);

      if (
        providers?.some(
          p =>
            p.provider === user.provider &&
            p.providerAccountId === user.providerAccountId
        )
      ) {
        return null;
      }

      return await ctx.db.access.update({
        where: { id: input.id },
        data: { role: input.role, note: input.note },
      });
    }),

  deleteAccess: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        return null;
      }

      const user = await ctx.db.access.findFirst({
        where: { id: input.id },
      });

      const providers = await providersCheck(ctx);

      if (
        !user ||
        providers?.some(
          p =>
            p.provider === user.provider &&
            p.providerAccountId === user.providerAccountId
        )
      ) {
        return null;
      }

      return await ctx.db.access.delete({
        where: { id: input.id },
      });
    }),

  updateUsername: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (!access) {
        return null;
      }

      const user = await ctx.db.access.findFirst({
        where: { id: input.id },
      });

      if (!user) {
        return null;
      }

      if (user.provider === "discord") {
        const response = await fetch(
          `https://discord.com/api/v10/users/${user.providerAccountId}`,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            },
          }
        );

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as {
          username: string;
        };

        return await ctx.db.access.update({
          where: { id: input.id },
          data: { providerAccountUsername: data.username },
        });
      }

      return null;
    }),
});

export async function accessCheck(
  ctx: inferProcedureBuilderResolverOptions<typeof protectedProcedure>["ctx"]
) {
  const user = await ctx.db.user.findFirst({
    where: { id: ctx.session.user.id },
    include: { accounts: true },
  });

  if (!user) {
    return undefined;
  }

  const access = await Promise.all(
    user.accounts.map(async account => {
      return await ctx.db.access.findFirst({
        where: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      });
    })
  );

  const hasAdmin = access.some(a => a?.role === "ADMIN");

  if (hasAdmin) {
    return "ADMIN";
  }

  return null;
}

export async function providersCheck(
  ctx: inferProcedureBuilderResolverOptions<typeof protectedProcedure>["ctx"]
) {
  const user = await ctx.db.user.findFirst({
    where: { id: ctx.session.user.id },
    include: { accounts: true },
  });

  if (!user) {
    return null;
  }

  return user.accounts.map(account => {
    return {
      provider: account.provider,
      providerAccountId: account.providerAccountId,
    };
  });
}
