import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { accessCheck } from "@/server/api/routers/access";
import { env } from "@/env";
import { getPublicUrl } from "@/utils/url";

export const agreementRouter = createTRPCRouter({
  createAgreement: protectedProcedure
    .input(
      z.object({
        project: z.string().min(1).max(64),
        title: z.string().min(1).max(64),
        description: z.string().min(1).max(1024).optional(),
        agreement: z.number(),
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
        },
      });

      if (!project) {
        throw new Error("Project not found.");
      }

      const agreement = await ctx.db.agreement.findFirst({
        where: {
          templateId: input.agreement,
        },
      });

      if (agreement) {
        throw new Error("Agreement already exists in a project.");
      }

      const response = await fetch(
        env.DOCUMENSO_URL + "/api/v1/templates/" + input.agreement,
        {
          headers: {
            Authorization: env.DOCUMENSO_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch agreement template.");
      }

      const data = (await response.json()) as {
        Recipient: {
          id: number;
          role: string;
          email: string;
        }[];
      };

      const recipient = data.Recipient.find(
        recipient =>
          recipient.role === "SIGNER" &&
          recipient.email.endsWith("@documenso.com")
      );

      if (!recipient) {
        throw new Error("No recipient found.");
      }

      await ctx.db.agreement.create({
        data: {
          projectId: project.id,
          title: input.title,
          description: input.description,
          templateId: input.agreement,
          recipientId: recipient.id,
        },
      });

      return;
    }),

  getAgreements: protectedProcedure
    .input(
      z.object({
        project: z.string().min(1).max(64),
      })
    )
    .query(async ({ ctx, input }) => {
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
            },
          });

          if (document) {
            const response = await fetch(
              env.DOCUMENSO_URL + "/api/v1/documents/" + document.documentId,
              {
                headers: {
                  Authorization: env.DOCUMENSO_KEY,
                },
              }
            );

            if (response.ok) {
              const data = (await response.json()) as {
                status: string;
              };

              return {
                id: agreement.id,
                title: agreement.title,
                description: agreement.description,
                status: data.status,
              };
            }
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
      const document = await ctx.db.agreementDocument.findFirst({
        where: {
          agreementId: input.agreement,
          userId: ctx.session.user.id,
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

      if (!agreement) {
        throw new Error("Agreement not found.");
      }

      const profile = await ctx.db.profile.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new Error("Profile not found.");
      }

      const response = await fetch(
        env.DOCUMENSO_URL +
          "/api/v1/templates/" +
          agreement.templateId +
          "/generate-document",
        {
          method: "POST",
          headers: {
            Authorization: env.DOCUMENSO_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipients: [
              {
                id: agreement.recipientId,
                email: profile.email,
              },
            ],
            meta: {
              redirectUrl:
                getPublicUrl() +
                "/dashboard/projects/" +
                agreement.project.username +
                "/agreements",
            },
          }),
        }
      );

      const data = (await response.json()) as {
        documentId: number;
        recipients: {
          email: string;
          signingUrl: string;
          role: string;
        }[];
      };

      if (!response.ok) {
        console.log(data);
        throw new Error("Failed to generate document.");
      }

      const recipient = data.recipients.find(
        recipient => recipient.email === profile.email
      );

      if (!recipient) {
        throw new Error("No recipient found.");
      }

      const sendResponse = await fetch(
        env.DOCUMENSO_URL + "/api/v1/documents/" + data.documentId + "/send",
        {
          method: "POST",
          headers: {
            Authorization: env.DOCUMENSO_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sendEmail: false,
          }),
        }
      );

      if (!sendResponse.ok) {
        throw new Error("Failed to send document.");
      }

      await ctx.db.agreementDocument.create({
        data: {
          agreementId: agreement.id,
          userId: ctx.session.user.id,
          documentId: data.documentId,
          email: recipient.email,
          signingUrl: recipient.signingUrl,
        },
      });

      return recipient.signingUrl;
    }),
});
