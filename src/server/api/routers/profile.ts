import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { accessCheck } from "@/server/api/routers/access";

export const profileRouter = createTRPCRouter({
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
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

      return {
        username: profile.username,
        name: profile.name,
        bio: profile.bio,
        links: profile.links.map(link => ({
          type: link.type,
          url: link.url,
        })),
        avatar: profile.user.image,
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
