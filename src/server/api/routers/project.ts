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
        agreements: z.array(z.string()).optional(),
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
          status: "DRAFT",
        },
      });

      if (input.agreements) {
        await ctx.db.agreement.createMany({
          data: input.agreements.map(agreement => ({
            projectId: project.id,
            templateId: agreement,
          })),
        });
      }

      if (input.thumbnail) {
        const url = await getSignedUrl(
          ctx.s3,
          new PutObjectCommand({
            Bucket: env.FILE_STORAGE_BUCKET,
            Key: !env.FILE_STORAGE_ENDPOINT.startsWith("http://localhost")
              ? crypto.randomBytes(32).toString("hex")
              : `${env.FILE_STORAGE_BUCKET}/${crypto.randomBytes(32).toString("hex")}`,
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
            url: url.split("?")[0]!,
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
            ? { status: { in: ["ACTIVE", "RELEASED"] } }
            : undefined,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      });

      let cursor;

      if (data.length > length) {
        cursor = data.pop()?.id;
      }

      return {
        cursor: cursor,
        data: data,
      };
    }),

  getProject: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      return ctx.db.project.findUnique({
        where:
          access !== "ADMIN"
            ? { id: input.id, status: { in: ["ACTIVE", "RELEASED"] } }
            : { id: input.id },
      });
    }),

  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(64),
        username: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        deadline: z.string().datetime().optional(),
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

      await ctx.db.project.update({
        where: { id: input.id },
        data: {
          title: input.title ?? null,
          username: input.username ?? null,
          description: input.description ?? null,
          deadline: input.deadline ?? null,
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
