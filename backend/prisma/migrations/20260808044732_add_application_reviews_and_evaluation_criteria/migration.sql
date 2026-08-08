-- AlterTable
ALTER TABLE "application_reviews" ADD COLUMN     "rating" JSONB,
ADD COLUMN     "total_score" DOUBLE PRECISION;
