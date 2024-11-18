/*
  Warnings:

  - The values [DAY_1] on the enum `Period` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Period_new" AS ENUM ('MINUTE_15', 'HOUR_1', 'HOUR_4', 'HOUR_24');
ALTER TABLE "portfolio_history" ALTER COLUMN "period" TYPE "Period_new" USING ("period"::text::"Period_new");
ALTER TYPE "Period" RENAME TO "Period_old";
ALTER TYPE "Period_new" RENAME TO "Period";
DROP TYPE "Period_old";
COMMIT;
