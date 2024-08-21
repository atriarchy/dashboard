import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getOnboarding: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.profile.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return !!profile;
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.profile.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().max(64).optional(),
        name: z.string().max(256).optional(),
        bio: z.string().max(1024).optional(),
        firstName: z.string().max(256).optional(),
        lastName: z.string().max(256).optional(),
        country: z.string().max(256).optional(),
        ascapNumber: z.string().max(256).optional(),
        privacy: z.enum(["PUBLIC", "PRIVATE"]).optional().default("PRIVATE"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const username = await ctx.db.profile.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
      });

      if (username && username.userId !== ctx.session.user.id) {
        throw new Error("Username already exists.");
      }

      if (input.username && !/^\w{1,64}$/.test(input.username)) {
        throw new Error(
          "Username can only contain letters, numbers, and underscores."
        );
      }

      const profile = await ctx.db.profile.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!profile && (!input.username || !input.name)) {
        throw new Error("Username and name are required.");
      }

      return await ctx.db.profile.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          username: input.username,
          name: input.name,
          bio: input.bio,
          firstName: input.firstName,
          lastName: input.lastName,
          country: input.country,
          ascapNumber: input.ascapNumber,
          privacy: input.privacy,
        },
        create: {
          userId: ctx.session.user.id,
          username: input.username!,
          name: input.name!,
          bio: input.bio,
          firstName: input.firstName,
          lastName: input.lastName,
          country: input.country,
          ascapNumber: input.ascapNumber,
          privacy: input.privacy,
        },
      });
    }),
});
