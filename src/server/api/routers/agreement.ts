import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { env } from "@/env";
import { getPublicUrl } from "@/utils/url";
import { documenso } from "@/server/documenso";
import { type PrefillFieldText } from "@documenso/sdk-typescript/models/operations";

export const agreementRouter = createTRPCRouter({
  createAgreement: protectedProcedure
    .input(
      z.object({
        project: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
        title: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        agreement: z.number(),
        fields: z.object({
          title: z.array(z.number()).optional(),
          name: z.array(z.number()).optional(),
          discord: z.array(z.number()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      if (access !== "ADMIN") {
        throw new Error("Unauthorized.");
      }

      const project = await ctx.db.project.findFirst({
        where: {
          username: {
            equals: input.project,
            mode: "insensitive",
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found.");
      }

      const data = await documenso.templates.get({
        templateId: input.agreement,
      });

      const recipient = data.recipients.find(
        recipient =>
          recipient.role === "SIGNER" &&
          recipient.email.endsWith("@documenso.com")
      );

      if (!recipient) {
        throw new Error("No recipient found.");
      }

      const titles = input.fields.title ?? [];
      const names = input.fields.name ?? [];
      const discords = input.fields.discord ?? [];

      const fields = [...titles, ...names, ...discords];

      if (fields.length !== new Set(fields).size) {
        throw new Error("Duplicate fields found.");
      }

      fields.forEach(field => {
        const fieldData = data.fields.find(f => f.id === field);

        if (!fieldData) {
          throw new Error("Field not found.");
        }

        if (fieldData.type !== "TEXT") {
          throw new Error("Field is not a text field.");
        }
      });

      await ctx.db.agreement.create({
        data: {
          projectId: project.id,
          title: input.title,
          description: input.description,
          templateId: input.agreement,
          recipientId: recipient.id,
          titleFieldIds: titles,
          nameFieldIds: names,
          discordFieldIds: discords,
        },
      });

      return;
    }),

  getAgreements: protectedProcedure
    .input(
      z.object({
        project: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9-]+$/),
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
          deletedAt: null,
        },
      });

      if (!project || (project.status === "DRAFT" && access !== "ADMIN")) {
        return [];
      }

      const agreements = await ctx.db.agreement.findMany({
        where: {
          project: {
            username: input.project,
          },
        },
      });

      const status = Promise.all(
        agreements.map(async agreement => {
          const document = await ctx.db.agreementDocument.findFirst({
            where: {
              agreementId: agreement.id,
              userId: ctx.session.user.id,
              agreement: {
                project: {
                  deletedAt: null,
                },
              },
            },
          });

          if (document) {
            const data = await documenso.documents.get({
              documentId: document.documentId,
            });

            return {
              id: agreement.id,
              title: agreement.title,
              description: agreement.description,
              status: data.status,
            };
          }

          return {
            id: agreement.id,
            title: agreement.title,
            description: agreement.description,
            status: "UNOPENED",
          };
        })
      );

      return status;
    }),

  signAgreement: protectedProcedure
    .input(
      z.object({
        agreement: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const access = await accessCheck(ctx);

      const document = await ctx.db.agreementDocument.findFirst({
        where: {
          agreementId: input.agreement,
          userId: ctx.session.user.id,
          agreement: {
            project: {
              deletedAt: null,
            },
          },
        },
        include: {
          agreement: true,
        },
      });

      if (document) {
        return document.signingUrl;
      }

      const agreement = await ctx.db.agreement.findUnique({
        where: {
          id: input.agreement,
        },
        include: {
          project: true,
        },
      });

      if (
        !agreement ||
        (agreement.project.status === "DRAFT" && access !== "ADMIN")
      ) {
        throw new Error("Agreement not found.");
      }

      const profile = await ctx.db.profile.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          user: {
            include: {
              accounts: true,
            },
          },
        },
      });

      if (!profile) {
        throw new Error("Profile not found.");
      }

      const data = await documenso.templates.use({
        templateId: agreement.templateId,
        recipients: [
          {
            id: agreement.recipientId,
            email: profile.email,
          },
        ],
        prefillFields: [
          ...agreement.titleFieldIds.map(fieldId => ({
            type: "text",
            value: agreement.project.title,
            id: fieldId,
          })),
          ...agreement.nameFieldIds.map(fieldId => ({
            type: "text",
            value: profile.name,
            id: fieldId,
          })),
          ...agreement.discordFieldIds.map(fieldId => ({
            type: "text",
            value:
              profile.user.accounts.find(
                account => account.provider === "discord"
              )?.providerAccountId ?? "Unknown",
            id: fieldId,
          })),
        ] as Array<PrefillFieldText>,
      });

      const recipient = data.recipients.find(
        recipient => recipient.email === profile.email
      );

      if (!recipient) {
        throw new Error("No recipient found.");
      }

      await documenso.documents.distribute({
        documentId: data.id,
        meta: {
          redirectUrl:
            getPublicUrl() +
            "/dashboard/projects/" +
            agreement.project.username +
            "/agreements",
          emailSettings: {
            recipientSigningRequest: false,
          },
        },
      });

      await ctx.db.agreementDocument.create({
        data: {
          agreementId: agreement.id,
          userId: ctx.session.user.id,
          documentId: data.id,
          email: profile.email,
          signingUrl: env.DOCUMENSO_URL + "/sign/" + recipient.token,
        },
      });

      return env.DOCUMENSO_URL + "/sign/" + recipient.token;
    }),
});
