-- CreateEnum
CREATE TYPE "AccessRole" AS ENUM ('ADMIN', 'ARTIST');

-- CreateEnum
CREATE TYPE "ProfilePrivacy" AS ENUM ('PRIVATE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'RELEASED');

-- CreateEnum
CREATE TYPE "TrackCollaboratorRole" AS ENUM ('MANAGER', 'EDITOR', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('ORIGINAL', 'PARODY', 'COVER');

-- CreateEnum
CREATE TYPE "TrackMusicStatus" AS ENUM ('IDEA', 'DEMO', 'WRITING', 'PRODUCTION', 'RECORDING', 'MIX_MASTER', 'ABANDONED', 'FINISHED');

-- CreateEnum
CREATE TYPE "TrackVisualStatus" AS ENUM ('SEARCHING', 'CONCEPT', 'WORKING', 'POLISHING', 'ABANDONED', 'FINISHED');

-- CreateEnum
CREATE TYPE "TrackAuditLogAction" AS ENUM ('CREATE_TRACK', 'UPDATE_TRACK', 'CREATE_COLLABORATOR', 'UPDATE_COLLABORATOR', 'DELETE_COLLABORATOR', 'CREATE_CREDIT', 'UPDATE_CREDIT', 'DELETE_CREDIT', 'ACCEPT_COLLABORATOR_INVITE', 'DECLINE_COLLABORATOR_INVITE', 'UPLOAD_SONG');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('PROFILE_UPDATE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketFeedItemAction" AS ENUM ('CREATE_TICKET', 'UPDATE_TICKET', 'CLOSE_TICKET', 'CREATE_COMMENT');

-- CreateTable
CREATE TABLE "Access" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "providerAccountUsername" TEXT NOT NULL,
    "role" "AccessRole" NOT NULL,
    "note" TEXT,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "legalName" TEXT,
    "country" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "privacy" "ProfilePrivacy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "member" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "ProProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL,
    "discordChannelId" TEXT,
    "discordChannelType" INTEGER,
    "discordInvitesChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectThumbnail" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "ProjectThumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "discordChannelId" TEXT,
    "order" INTEGER,
    "musicStatus" "TrackMusicStatus" NOT NULL,
    "visualStatus" "TrackVisualStatus" NOT NULL,
    "type" "TrackType" NOT NULL DEFAULT 'ORIGINAL',
    "maxSongFileSize" INTEGER NOT NULL DEFAULT 62914560,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackSong" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "TrackSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackCollaborator" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "acceptedInvite" BOOLEAN NOT NULL DEFAULT false,
    "role" "TrackCollaboratorRole" NOT NULL,

    CONSTRAINT "TrackCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackCredit" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "collaboratorId" TEXT,
    "name" TEXT,
    "type" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "TrackCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackAuditLog" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "targetUserId" TEXT,
    "targetDiscordUserId" TEXT,
    "targetDiscordUsername" TEXT,
    "targetDiscordAvatar" TEXT,
    "action" "TrackAuditLogAction" NOT NULL,
    "value" JSONB,
    "oldValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "titleFieldIds" INTEGER[],
    "nameFieldIds" INTEGER[],
    "discordFieldIds" INTEGER[],

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementDocument" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "documentId" INTEGER NOT NULL,
    "signingUrl" TEXT NOT NULL,

    CONSTRAINT "AgreementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "TicketCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketFeedItem" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "system" BOOLEAN,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "action" "TicketFeedItemAction" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketFeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ProProfile_profileId_key" ON "ProProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_username_key" ON "Project"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Project_discordChannelId_key" ON "Project"("discordChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_discordInvitesChannelId_key" ON "Project"("discordInvitesChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectThumbnail_projectId_key" ON "ProjectThumbnail"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_username_key" ON "Track"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Track_discordChannelId_key" ON "Track"("discordChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackSong_trackId_key" ON "TrackSong"("trackId");

-- CreateIndex
CREATE INDEX "TrackAuditLog_trackId_idx" ON "TrackAuditLog"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementDocument_documentId_key" ON "AgreementDocument"("documentId");

-- CreateIndex
CREATE INDEX "TicketFeedItem_ticketId_idx" ON "TicketFeedItem"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProProfile" ADD CONSTRAINT "ProProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileLink" ADD CONSTRAINT "ProfileLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectThumbnail" ADD CONSTRAINT "ProjectThumbnail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectThumbnail" ADD CONSTRAINT "ProjectThumbnail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackSong" ADD CONSTRAINT "TrackSong_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackSong" ADD CONSTRAINT "TrackSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCollaborator" ADD CONSTRAINT "TrackCollaborator_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCollaborator" ADD CONSTRAINT "TrackCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCredit" ADD CONSTRAINT "TrackCredit_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackCredit" ADD CONSTRAINT "TrackCredit_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "TrackCollaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackAuditLog" ADD CONSTRAINT "TrackAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementDocument" ADD CONSTRAINT "AgreementDocument_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgreementDocument" ADD CONSTRAINT "AgreementDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketFeedItem" ADD CONSTRAINT "TicketFeedItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketFeedItem" ADD CONSTRAINT "TicketFeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

