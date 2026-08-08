-- CreateTable
CREATE TABLE "evaluation_criteria" (
    "id" SERIAL NOT NULL,
    "tender_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "min_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_value" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "config" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "evaluation_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_evaluation_criteria_tender" ON "evaluation_criteria"("tender_id");

-- CreateIndex
CREATE INDEX "idx_evaluation_criteria_deleted" ON "evaluation_criteria"("deleted_at") WHERE (deleted_at IS NULL);

-- AddForeignKey
ALTER TABLE "evaluation_criteria" ADD CONSTRAINT "evaluation_criteria_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
