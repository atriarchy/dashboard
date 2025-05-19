-- DropForeignKey (prepping for nullable changes)
ALTER TABLE "AgreementDocument" DROP CONSTRAINT "AgreementDocument_userId_fkey";
ALTER TABLE "ProjectThumbnail" DROP CONSTRAINT "ProjectThumbnail_userId_fkey";
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";
ALTER TABLE "TrackCredit" DROP CONSTRAINT "TrackCredit_collaboratorId_fkey";
ALTER TABLE "TrackSong" DROP CONSTRAINT "TrackSong_userId_fkey";

-- AlterTables to allow nulls before data migration
ALTER TABLE "AgreementDocument" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "ProjectThumbnail" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "TrackSong" ALTER COLUMN "userId" DROP NOT NULL;

-- Step 1: Create DiscordUser table
CREATE TABLE "DiscordUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "avatar" TEXT,

    CONSTRAINT "DiscordUser_pkey" PRIMARY KEY ("id")
);

-- Step 2: Backfill DiscordUser data

-- From TrackCollaborator
INSERT INTO "DiscordUser" ("id", "username", "avatar")
SELECT DISTINCT "discordUserId", "discordUsername", "discordAvatar"
FROM "TrackCollaborator"
WHERE "discordUserId" IS NOT NULL
  AND "discordUserId" NOT IN (SELECT "id" FROM "DiscordUser");

-- From TrackAuditLog (actor)
INSERT INTO "DiscordUser" ("id", "username", "avatar")
SELECT DISTINCT "discordUserId", "discordUsername", "discordAvatar"
FROM "TrackAuditLog"
WHERE "discordUserId" IS NOT NULL
  AND "discordUserId" NOT IN (SELECT "id" FROM "DiscordUser");

-- From TrackAuditLog (target)
INSERT INTO "DiscordUser" ("id", "username", "avatar")
SELECT DISTINCT "targetDiscordUserId", "targetDiscordUsername", "targetDiscordAvatar"
FROM "TrackAuditLog"
WHERE "targetDiscordUserId" IS NOT NULL
  AND "targetDiscordUserId" NOT IN (SELECT "id" FROM "DiscordUser");

-- From Ticket
INSERT INTO "DiscordUser" ("id", "username", "avatar")
SELECT DISTINCT "discordUserId", "discordUsername", "discordAvatar"
FROM "Ticket"
WHERE "discordUserId" IS NOT NULL
  AND "discordUserId" NOT IN (SELECT "id" FROM "DiscordUser");

-- From TicketFeedItem
INSERT INTO "DiscordUser" ("id", "username", "avatar")
SELECT DISTINCT "discordUserId", "discordUsername", "discordAvatar"
FROM "TicketFeedItem"
WHERE "discordUserId" IS NOT NULL
  AND "discordUserId" NOT IN (SELECT "id" FROM "DiscordUser");

-- Step 3: Now safe to drop columns
ALTER TABLE "Ticket"
    DROP COLUMN "discordAvatar",
    DROP COLUMN "discordUsername";

ALTER TABLE "TicketFeedItem"
    DROP COLUMN "discordAvatar",
    DROP COLUMN "discordUsername";

ALTER TABLE "TrackAuditLog"
    DROP COLUMN "discordAvatar",
    DROP COLUMN "discordUsername",
    DROP COLUMN "targetDiscordAvatar",
    DROP COLUMN "targetDiscordUsername";

ALTER TABLE "TrackCollaborator"
    DROP COLUMN "discordAvatar",
    DROP COLUMN "discordUsername";

-- Step 4: Re-add foreign keys
ALTER TABLE "ProjectThumbnail" ADD CONSTRAINT "ProjectThumbnail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrackSong" ADD CONSTRAINT "TrackSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrackCollaborator" ADD CONSTRAINT "TrackCollaborator_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrackCredit" ADD CONSTRAINT "TrackCredit_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "TrackCollaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_targetDiscordUserId_fkey" FOREIGN KEY ("targetDiscordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgreementDocument" ADD CONSTRAINT "AgreementDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TicketFeedItem" ADD CONSTRAINT "TicketFeedItem_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
