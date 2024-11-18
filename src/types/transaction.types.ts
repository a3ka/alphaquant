import { crypto_transaction } from '@prisma/client'

// Базовый тип из Prisma
export interface Transaction extends crypto_transaction {}

// Тип транзакции из схемы
export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  MARGIN_BUY = 'MARGIN_BUY',
  MARGIN_SELL = 'MARGIN_SELL',
  TRANSFER = 'TRANSFER'
}

// Пропсы для создания транзакции
export interface TransactionCreateProps {
  portfolioId: number
  userId: string
  type: TransactionType
  coinName: string
  coinTicker: string
  amount: number
  transactionTime?: Date
  paymentMethod?: string
  paymentPrice?: number
  paymentTotal?: number
  priceUsd?: number
  totalUsd?: number
  borrowedAmount?: number
  targetPortfolioId?: number
  notes?: string
}

// Пропсы для обновления транзакции
export interface TransactionUpdateProps {
  amount?: number
  priceUsd?: number
  totalUsd?: number
  paymentPrice?: number
  paymentTotal?: number
  borrowedAmount?: number
  notes?: string
}

// Расширенный тип с информацией о порфеле
export interface TransactionWithPortfolio extends Transaction {
  portfolio: {
    id: number
    name: string
    type: string
  }
}
