import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalBoolSchema = z
  .enum(["true", "false"])
  .optional()
  .transform(val => val === "true");

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      str => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    DISCORD_TOKEN: z.string(),
    FILE_STORAGE_CDN_URL: z.string(),
    FILE_STORAGE_ENDPOINT: z.string(),
    FILE_STORAGE_KEY: z.string(),
    FILE_STORAGE_REGION: z.string(),
    FILE_STORAGE_SECRET: z.string(),
    FILE_STORAGE_BUCKET: z.string(),
    FILE_STORAGE_PATH_STYLE: optionalBoolSchema,
    PRISMA_FIELD_ENCRYPTION_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "test", "production"])
      .optional()
      .default("development"),
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .url()
      .refine(url => !url.endsWith("/")),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    FILE_STORAGE_CDN_URL: process.env.FILE_STORAGE_CDN_URL,
    FILE_STORAGE_ENDPOINT: process.env.FILE_STORAGE_ENDPOINT,
    FILE_STORAGE_KEY: process.env.FILE_STORAGE_KEY,
    FILE_STORAGE_REGION: process.env.FILE_STORAGE_REGION,
    FILE_STORAGE_SECRET: process.env.FILE_STORAGE_SECRET,
    FILE_STORAGE_BUCKET: process.env.FILE_STORAGE_BUCKET,
    FILE_STORAGE_PATH_STYLE: process.env.FILE_STORAGE_PATH_STYLE,
    PRISMA_FIELD_ENCRYPTION_KEY: process.env.PRISMA_FIELD_ENCRYPTION_KEY,
    // Client:
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    // If there is a NEXT_PUBLIC_VERCEL_URL set, use that like NextAuth.js does
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
