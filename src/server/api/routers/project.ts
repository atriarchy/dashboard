import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { env } from "@/env";

const allowedFileTypes = ["image/png", "image/jpeg"];
const maxFileSize = 1048576; // 1MB

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(64),
        username: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        deadline: z.string().datetime().optional(),
        discordChannelId: z.string().regex(/^\d+$/).optional(),
        thumbnail: z
          .object({
            fileType: z.string(),
            fileSize: z.number(),
            checksum: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      const username = await ctx.db.project.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
      });

      if (username) {
        throw new Error("Slug already exists.");
      }

      if (input.username && !/^\w{1,64}$/.test(input.username)) {
        throw new Error(
          "Slug can only contain letters, numbers, and underscores."
        );
      }

      if (input.discordChannelId) {
        const request = await fetch(
          "https://discord.com/api/v10/channels/" + input.discordChannelId,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            },
          }
        );

        if (!request.ok) {
          throw new Error("Discord channel not found.");
        }

        const data = (await request.json()) as {
          type: number;
        };

        if (data.type !== 0) {
          throw new Error("Invalid Discord channel type.");
        }
      }

      if (input.thumbnail) {
        if (!allowedFileTypes.includes(input.thumbnail.fileType)) {
          throw new Error("Invalid file type.");
        }

        if (input.thumbnail.fileSize > maxFileSize) {
          throw new Error("File size too large.");
        }
      }

      const project = await ctx.db.project.create({
        data: {
          title: input.title,
          username: input.username,
          description: input.description,
          deadline: input.deadline,
          discordChannelId: input.discordChannelId,
          status: "DRAFT",
        },
      });

      if (input.thumbnail) {
        const key = !env.FILE_STORAGE_ENDPOINT.startsWith("http://localhost")
          ? crypto.randomBytes(32).toString("hex")
          : `${env.FILE_STORAGE_BUCKET}/${crypto.randomBytes(32).toString("hex")}`;

        const url = await getSignedUrl(
          ctx.s3,
          new PutObjectCommand({
            Bucket: env.FILE_STORAGE_BUCKET,
            Key: key,
            ContentType: input.thumbnail.fileType,
            ContentLength: input.thumbnail.fileSize,
            ChecksumSHA256: input.thumbnail.checksum,
            Metadata: {
              userId: ctx.session.user.id,
            },
          }),
          { expiresIn: 60 } // 60 seconds
        );

        await ctx.db.projectThumbnail.create({
          data: {
            projectId: project.id,
            userId: ctx.session.user.id,
            key: key,
          },
        });

        return {
          username: project.username,
          upload: {
            url: url,
          },
        };
      }

      return {
        username: project.username,
      };
    }),

  getProjects: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const length = 100;

      const access = await accessCheck(ctx);

      const data = await ctx.db.project.findMany({
        take: length + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where:
          access !== "ADMIN"
            ? { status: { in: ["ACTIVE", "CLOSED", "RELEASED"] } }
            : undefined,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          thumbnail: true,
        },
      });

      let cursor;

      if (data.length > length) {
        cursor = data.pop()?.id;
      }

      return {
        cursor: cursor,
        data: data.map(project => ({
          username: project.username,
          title: project.title,
          description: project.description,
          deadline: project.deadline,
          status: project.status,
          thumbnail: project.thumbnail
            ? `${env.FILE_STORAGE_CDN_URL}/${project.thumbnail.key}`
            : undefined,
        })),
      };
    }),

  getProject: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const data = await ctx.db.project.findFirst({
        where:
          access !== "ADMIN"
            ? {
                username: {
                  equals: input.username,
                  mode: "insensitive",
                },
                status: { in: ["ACTIVE", "CLOSED", "RELEASED"] },
              }
            : {
                username: {
                  equals: input.username,
                  mode: "insensitive",
                },
              },
        include: {
          thumbnail: true,
        },
      });

      if (!data) {
        return null;
      }

      return {
        username: data.username,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        status: data.status,
        thumbnail: data.thumbnail
          ? `${env.FILE_STORAGE_CDN_URL}/${data.thumbnail.key}`
          : undefined,
      };
    }),

  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(64),
        username: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        deadline: z.string().datetime().optional(),
        discordChannelId: z.string().regex(/^\d+$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      const username = await ctx.db.project.findFirst({
        where: {
          username: {
            equals: input.username,
            mode: "insensitive",
          },
        },
      });

      if (username && username.id !== input.id) {
        throw new Error("Slug already exists.");
      }

      if (input.username && !/^\w{1,64}$/.test(input.username)) {
        throw new Error(
          "Slug can only contain letters, numbers, and underscores."
        );
      }

      if (input.discordChannelId) {
        const request = await fetch(
          "https://discord.com/api/v10/channels/" + input.discordChannelId,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_TOKEN}`,
            },
          }
        );

        if (!request.ok) {
          throw new Error("Discord channel not found.");
        }

        const data = (await request.json()) as {
          type: number;
        };

        if (data.type !== 0) {
          throw new Error("Invalid Discord channel type.");
        }
      }

      await ctx.db.project.update({
        where: { id: input.id },
        data: {
          title: input.title ?? null,
          username: input.username ?? null,
          description: input.description ?? null,
          deadline: input.deadline ?? null,
          discordChannelId: input.discordChannelId ?? null,
        },
      });

      return;
    }),

  deleteProject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project.delete({
        where: { id: input.id },
      });

      return;
    }),
});
