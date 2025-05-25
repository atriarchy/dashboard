-- CreateEnum
CREATE TYPE "TrackSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "submissionNote" TEXT,
ADD COLUMN     "submissionStatus" "TrackSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3);
