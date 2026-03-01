-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_expires_at" TIMESTAMPTZ,
ADD COLUMN     "email_verification_token" TEXT;
