import { accessRouter } from "@/server/api/routers/access";
import { profileRouter } from "@/server/api/routers/profile";
import { projectRouter } from "@/server/api/routers/project";
import { agreementRouter } from "@/server/api/routers/agreement";
import { trackRouter } from "@/server/api/routers/track";
import { collaboratorRouter } from "@/server/api/routers/collaborator";
import { creditRouter } from "@/server/api/routers/credit";
import { searchRouter } from "@/server/api/routers/search";
import { auditLogRouter } from "@/server/api/routers/audit-log";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  access: accessRouter,
  profile: profileRouter,
  project: projectRouter,
  agreement: agreementRouter,
  track: trackRouter,
  collaborator: collaboratorRouter,
  credit: creditRouter,
  search: searchRouter,
  auditLog: auditLogRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
