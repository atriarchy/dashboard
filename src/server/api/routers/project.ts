import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(64),
        username: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        deadline: z.string().datetime().optional(),
        agreements: z.array(z.string()).optional(),
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
