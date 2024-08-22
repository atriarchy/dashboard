# Atriarchy Release Dashboard

This is the community-built, open-source Atriarchy Release Dashboard.
You can access the site at [dash.atriarchy.studio](https://dash.atriarchy.studio).

## Tech stack

For development:

- Node.js
- PNPM
- Prettier (code formatting)
- ESLint (code linting)
- Docker (Compose) (local Postgres + S3 \[MinIO])

Website stack (based on [T3 Stack](https://create.t3.gg/)):

- TypeScript
- Next.js (framework)
- tRPC (typesafe API)
- Prisma (database ORM)
- Auth.js aka NextAuth.js (auth via OAuth)
- Tailwind CSS (styling)

Hosting (production):

- Vercel (serverless hosting)
- AWS S3

## How to contribute

There's a few ways that you can help contribute.

1. If you find a bug - you can [fill out a bug report](https://github.com/atriarchy/dashboard/issues/new/choose)
2. If you have an idea that would make the dashboard better - please [fill out an idea issue](https://github.com/atriarchy/dashboard/issues/new/choose)
3. If you have development experience, read our [contributing guide](https://github.com/atriarchy/dashboard/blob/main/CONTRIBUTING.md) and agree to our [code of conduct](https://github.com/atriarchy/dashboard/blob/main/.github/CODE_OF_CONDUCT.md) before you get started.

## Development setup

### Prerequisite

Create a [Discord application](https://discord.com/developers/applications), setting the OAuth callback to be `http://localhost:3000/api/auth/callback/discord`. Note down your client ID and client secret.

### Local development

1. Install dependencies: `pnpm install --frozen-lockfile`
2. Run `docker compose up -d` to start a local PostgreSQL database, and an S3 bucket with MinIO.
3. Copy `.env.example` to `.env` and open your copy in a text editor and fill it:
   1. The Next Auth secret (`NEXTAUTH_SECRET`) has to be filled with a 32-byte Base64-encoded secret. See [Generate secrets](#generate-secrets) below.
   2. The data encryption passphrase (`PRISMA_FIELD_ENCRYPTION_KEY`) has to be filled with an AES-GCM 256 key. See [Generate secrets](#generate-secrets) below.
4. Push the database schema to the new database using `pnpm prisma db push`.
5. Start the dev server using `pnpm dev`
6. The website should be running at `http://localhost:3000/` (open in browser)

- Learn more about the stack at [Create T3 App - Introduction](https://create.t3.gg/en/introduction)
- You can use the Prisma Studio to view your database. Launch it with `pnpm prisma studio`

### Generate secrets

We use Base64-encoded random strings for various secrets. To generate these secrets you can use OpenSSL or Python. OpenSSL should be preinstalled on most Unix-like systems (Linux, macOS, WSL). If neither is installed on your system, you may need to install it yourself.

- Using OpenSSL:
  - Generate a 32-byte secret: `openssl rand -base64 32`
  - Generate a 24-byte secret: `openssl rand -base64 24`

For the `PRISMA_FIELD_ENCRYPTION_KEY`, you can use https://cloak.47ng.com to get an encryption key to use for development.
