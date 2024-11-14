/*
  Warnings:

  - The values [TRANSFER_TO_MARGIN,TRANSFER_FROM_MARGIN] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `borrowed` on the `crypto_transaction` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('BUY', 'SELL', 'MARGIN_BUY', 'MARGIN_SELL', 'TRANSFER');
ALTER TABLE "crypto_transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "crypto_transaction" DROP COLUMN "borrowed",
ADD COLUMN     "borrowed_amount" DOUBLE PRECISION,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_price" DOUBLE PRECISION,
ADD COLUMN     "payment_total" DOUBLE PRECISION,
ADD COLUMN     "target_portfolio_id" INTEGER,
ALTER COLUMN "price_usd" DROP NOT NULL,
ALTER COLUMN "total_usd" DROP NOT NULL;
