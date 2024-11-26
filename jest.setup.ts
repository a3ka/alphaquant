import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { NextRequest } from 'next/server'
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives'

// Базовые глобальные объекты
const { TextDecoder, TextEncoder } = require('util')
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

// Настройка сетевых объектов
global.Headers = Headers
global.Request = Request
global.Response = Response
global.fetch = fetch

// Только необходимый мок для crypto API, которого нет в Node
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: BufferSource) => {
        return new Uint8Array([1, 2, 3])
      }
    },
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
      return array
    }
  }
})

// Настройка переменных окружения для тестов
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.CRON_SECRET = 'test-secret'