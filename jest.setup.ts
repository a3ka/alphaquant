import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Мок для NextResponse
jest.mock('next/server', () => {
  const json = jest.fn((body, init) => {
    return new Response(JSON.stringify(body), init)
  })
  return {
    NextResponse: {
      json
    },
    NextRequest: Request
  }
})

// Мокаем console.log и console.error для чистоты тестов
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
}

// Добавляем моки для process.env
process.env = {
  ...process.env,
  CRON_SECRET: 'test-secret',
}