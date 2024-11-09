-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('SPOT', 'MARGIN');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL', 'TRANSFER_TO_MARGIN', 'TRANSFER_FROM_MARGIN', 'MARGIN_BUY', 'MARGIN_SELL');

-- CreateTable
CREATE TABLE "user_portfolio" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PortfolioType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_transaction" (
    "id" SERIAL NOT NULL,
    "created_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_time" TIMESTAMP(3) NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "coin_name" TEXT NOT NULL,
    "coin_ticker" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,
    "total_usd" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "crypto_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_balance" (
    "id" SERIAL NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portfolio_id" INTEGER NOT NULL,
    "coin_ticker" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "portfolio_balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_portfolio_user_id_idx" ON "user_portfolio"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_portfolio_user_id_name_key" ON "user_portfolio"("user_id", "name");

-- CreateIndex
CREATE INDEX "crypto_transaction_portfolio_id_coin_ticker_idx" ON "crypto_transaction"("portfolio_id", "coin_ticker");

-- CreateIndex
CREATE INDEX "crypto_transaction_user_id_idx" ON "crypto_transaction"("user_id");

-- CreateIndex
CREATE INDEX "crypto_transaction_transaction_time_idx" ON "crypto_transaction"("transaction_time");

-- CreateIndex
CREATE INDEX "portfolio_balance_portfolio_id_idx" ON "portfolio_balance"("portfolio_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_balance_portfolio_id_coin_ticker_key" ON "portfolio_balance"("portfolio_id", "coin_ticker");

-- AddForeignKey
ALTER TABLE "user_portfolio" ADD CONSTRAINT "user_portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_transaction" ADD CONSTRAINT "crypto_transaction_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "user_portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_transaction" ADD CONSTRAINT "crypto_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_balance" ADD CONSTRAINT "portfolio_balance_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "user_portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
