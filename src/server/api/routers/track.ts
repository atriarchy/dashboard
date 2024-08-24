import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck, providersCheck } from "@/server/api/routers/access";
import { env } from "process";
import { getPublicUrl } from "@/utils/url";

export const trackRouter = createTRPCRouter({
  getMyTracks: protectedProcedure
    .input(
      z.object({
        project: z.string().min(1).max(64),
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
      });

      return tracks.map(track => ({
        username: track.username,
        title: track.title,
        description: track.description,
        musicStatus: track.musicStatus,
        visualStatus: track.visualStatus,
      }));
    }),

  createTrack: protectedProcedure
    .input(
      z.object({
        project: z.string().min(1).max(64),
        username: z.string().min(1).max(64).optional(),
        title: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
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
        const usernameCheck =
          input.title
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/\W/g, "")
            .slice(0, 64) || "_";

        let index = 1;

        do {
          const usernameCheckWithIndex =
            index < 2 ? usernameCheck : usernameCheck + index;

          const usernameFind = await ctx.db.project.findFirst({
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
            body: JSON.stringify({
              embeds: [
                {
                  title: input.title,
                  description: input.description,
                  color: 0x171717,
                  fields: [
                    {
                      name: "Track Manager",
                      value: `${profile.name}\n[@${profile.username}](${getPublicUrl()}/@${profile.username})\n<@${discordProvider.providerAccountId}>`,
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
            }),
          }
        );

        if (!messageRequest.ok) {
          throw new Error("Could not send Discord message.");
        }
      }

      await ctx.db.track.create({
        data: {
          projectId: project.id,
          username: username,
          title: input.title,
          description: input.description,
          discordChannelId: discordChannelId,
          musicStatus: "IDEA",
          visualStatus: "SEARCHING",
        },
      });

      return { username: username };
    }),
});
