-- Add privilegeRank column to track privilege ordering
ALTER TABLE "Product"
ADD COLUMN "privilegeRank" INTEGER;
