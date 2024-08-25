import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";

export const searchRouter = createTRPCRouter({
  searchAtriarchyAndDiscordUsers: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const atriarchyResults = await ctx.db.profile.findMany({
        where: {
          OR: [
            {
              username: {
                search: input.query,
              },
            },
            {
              name: {
                search: input.query,
              },
            },
          ],
        },
        include: {
          user: true,
        },
        take: 3,
      });

      const atriarchyResultsFormatted = atriarchyResults.map(result => ({
        username: result.username,
        name: result.name,
        avatar: result.user.image,
      }));

      const discordResults = await fetch(
        "https://discord.com/api/v10/guilds/" +
          env.DISCORD_GUILD_ID +
          "/members/search?" +
          new URLSearchParams({
            query: input.query,
            limit: "3",
          }).toString(),
        {
          headers: {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
          },
        }
      );

      if (!discordResults.ok) {
        console.error(await discordResults.text());
        return {
          atriarchy: atriarchyResultsFormatted,
          discord: [],
        };
      }

      const discordResultsData = (await discordResults.json()) as {
        nick?: string;
        user: {
          id: string;
          username: string;
          global_name: string;
          avatar?: string;
          bot: boolean;
          system: boolean;
        };
      }[];

      console.log(discordResultsData);

      const discordFromAtriarchy = (
        await Promise.all(
          atriarchyResults.map(async result => {
            const linkedDiscord = await ctx.db.account.findFirst({
              where: {
                provider: "discord",
                userId: result.user.id,
              },
            });

            if (!linkedDiscord) {
              return null;
            }

            return linkedDiscord.providerAccountId;
          })
        )
      ).filter(d => d !== null);

      const discordResultsDataFormatted = discordResultsData
        .filter(
          result =>
            !result.user.bot &&
            !result.user.system &&
            !discordFromAtriarchy.includes(result.user.id)
        )
        .map(result => ({
          id: result.user.id,
          username: result.user.username,
          name: result.nick ?? result.user.global_name,
          avatar: result.user.avatar
            ? `https://cdn.discordapp.com/avatars/${result.user.id}/${result.user.avatar}.png`
            : null,
        }));

      return {
        atriarchy: atriarchyResultsFormatted,
        discord: discordResultsDataFormatted,
      };
    }),
});
