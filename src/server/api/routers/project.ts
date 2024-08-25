import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { env } from "@/env";
import { getUploadURL } from "@/server/s3";

const allowedFileTypes = ["image/png", "image/jpeg"];
const maxFileSize = 1048576; // 1MB
const discordChannelTypes = [
  0, // GUILD_TEXT
  11, // PUBLIC_THREAD
  12, // PRIVATE THREAD
  15, // GUILD_FORUM
];
const projectValidation = z.object({
  title: z.string().min(1).max(64),
  username: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(1024).optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "RELEASED"]).optional(),
  discordChannelId: z.string().regex(/^\d+$/).optional(),
  thumbnail: z
    .object({
      fileType: z.string(),
      fileSize: z.number(),
      checksum: z.string(),
    })
    .optional(),
});

type ProjectMutation = {
  username: string;
  upload?: { url: string };
};

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(projectValidation)
    .mutation(async ({ ctx, input }): Promise<ProjectMutation> => {
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

      let discordChannelType;

      if (input.discordChannelId) {
        const check = await ctx.db.project.findUnique({
          where: {
            discordChannelId: input.discordChannelId,
          },
        });

        if (check) {
          throw new Error("Discord channel already in use.");
        }

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

        if (!discordChannelTypes.includes(data.type)) {
          throw new Error("Invalid Discord channel type.");
        }

        discordChannelType = data.type;
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
          discordChannelType: input.discordChannelId
            ? discordChannelType
            : undefined,
          status: input.status ?? "DRAFT",
        },
      });

      if (!input.thumbnail) {
        return {
          username: project.username,
        };
      }
      const { url, key } = await getUploadURL({
        file: {
          type: input.thumbnail.fileType,
          size: input.thumbnail.fileSize,
          checksum: input.thumbnail.checksum,
        },
        metadata: {
          userId: ctx.session.user.id,
        },
      });

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
        id: data.id,
        username: data.username,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        discordChannelId: data.discordChannelId,
        status: data.status,
        thumbnail: data.thumbnail
          ? `${env.FILE_STORAGE_CDN_URL}/${data.thumbnail.key}`
          : undefined,
      };
    }),

  updateProject: protectedProcedure
    .input(
      projectValidation.extend({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<ProjectMutation> => {
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

      const project = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          title: input.title,
          username: input.username,
          description: input.description,
          deadline: input.deadline,
          status: input.status,
        },
      });

      if (!input.thumbnail) {
        return {
          username: project.username,
        };
      }

      const { url, key } = await getUploadURL({
        file: {
          type: input.thumbnail.fileType,
          size: input.thumbnail.fileSize,
          checksum: input.thumbnail.checksum,
        },
        metadata: {
          userId: ctx.session.user.id,
        },
      });

      await ctx.db.projectThumbnail.deleteMany({
        where: { projectId: input.id },
      });
      await ctx.db.projectThumbnail.create({
        data: {
          projectId: input.id,
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
