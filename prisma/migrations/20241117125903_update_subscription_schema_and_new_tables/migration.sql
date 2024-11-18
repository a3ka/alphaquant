/*
  Warnings:

  - You are about to drop the column `subscription` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plan_id]` on the table `subscriptions_plans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Period" AS ENUM ('MINUTE_15', 'HOUR_1', 'HOUR_4', 'DAY_1');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "subscription";

-- CreateTable
CREATE TABLE "crypto_metadata" (
    "id" SERIAL NOT NULL,
    "coin_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "market_cap_rank" INTEGER,
    "current_price" DOUBLE PRECISION,
    "price_change_24h" DOUBLE PRECISION,
    "ath" DOUBLE PRECISION,
    "ath_date" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_history" (
    "id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" "Period" NOT NULL,

    CONSTRAINT "portfolio_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crypto_metadata_coin_id_key" ON "crypto_metadata"("coin_id");

-- CreateIndex
CREATE INDEX "crypto_metadata_symbol_idx" ON "crypto_metadata"("symbol");

-- CreateIndex
CREATE INDEX "portfolio_history_portfolio_id_timestamp_idx" ON "portfolio_history"("portfolio_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_history_portfolio_id_period_timestamp_key" ON "portfolio_history"("portfolio_id", "period", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_id_key" ON "subscriptions"("subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_plans_plan_id_key" ON "subscriptions_plans"("plan_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscriptions_plans"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_history" ADD CONSTRAINT "portfolio_history_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "user_portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
