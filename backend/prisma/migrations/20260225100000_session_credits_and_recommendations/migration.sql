-- DropTable
DROP TABLE IF EXISTS "session_payments";

-- CreateTable
CREATE TABLE "session_credits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "total_credits" INTEGER NOT NULL,
    "used_credits" INTEGER NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(10,3) NOT NULL,
    "platform_fee" DECIMAL(10,3) NOT NULL,
    "teacher_net" DECIMAL(10,3) NOT NULL,
    "flouci_payment_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_credits_pkey" PRIMARY KEY ("id")
);

-- AddColumn recommendations
ALTER TABLE "recommendations" ADD COLUMN "rating" INTEGER;
ALTER TABLE "recommendations" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "recommendations" ADD COLUMN "approved_at" TIMESTAMPTZ;
ALTER TABLE "recommendations" ADD COLUMN "approved_by" UUID;

-- AddColumn teacher_profiles
ALTER TABLE "teacher_profiles" ADD COLUMN "average_rating" DECIMAL(2,1);

-- AddForeignKey
ALTER TABLE "session_credits" ADD CONSTRAINT "session_credits_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_credits" ADD CONSTRAINT "session_credits_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
