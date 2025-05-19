/*
  Warnings:

  - You are about to drop the column `discordAvatar` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `discordUsername` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `discordAvatar` on the `TicketFeedItem` table. All the data in the column will be lost.
  - You are about to drop the column `discordUsername` on the `TicketFeedItem` table. All the data in the column will be lost.
  - You are about to drop the column `discordAvatar` on the `TrackAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `discordUsername` on the `TrackAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetDiscordAvatar` on the `TrackAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetDiscordUsername` on the `TrackAuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `discordAvatar` on the `TrackCollaborator` table. All the data in the column will be lost.
  - You are about to drop the column `discordUsername` on the `TrackCollaborator` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AgreementDocument" DROP CONSTRAINT "AgreementDocument_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectThumbnail" DROP CONSTRAINT "ProjectThumbnail_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrackCredit" DROP CONSTRAINT "TrackCredit_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "TrackSong" DROP CONSTRAINT "TrackSong_userId_fkey";

-- AlterTable
ALTER TABLE "AgreementDocument" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectThumbnail" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "discordAvatar",
DROP COLUMN "discordUsername";

-- AlterTable
ALTER TABLE "TicketFeedItem" DROP COLUMN "discordAvatar",
DROP COLUMN "discordUsername";

-- AlterTable
ALTER TABLE "TrackAuditLog" DROP COLUMN "discordAvatar",
DROP COLUMN "discordUsername",
DROP COLUMN "targetDiscordAvatar",
DROP COLUMN "targetDiscordUsername";

-- AlterTable
ALTER TABLE "TrackCollaborator" DROP COLUMN "discordAvatar",
DROP COLUMN "discordUsername";

-- AlterTable
ALTER TABLE "TrackSong" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DiscordUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "avatar" TEXT,

    CONSTRAINT "DiscordUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectThumbnail" ADD CONSTRAINT "ProjectThumbnail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackSong" ADD CONSTRAINT "TrackSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCollaborator" ADD CONSTRAINT "TrackCollaborator_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCredit" ADD CONSTRAINT "TrackCredit_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "TrackCollaborator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_targetDiscordUserId_fkey" FOREIGN KEY ("targetDiscordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementDocument" ADD CONSTRAINT "AgreementDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketFeedItem" ADD CONSTRAINT "TicketFeedItem_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
