import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Export mock classes for reuse
export class MockResponse {
  public status: number
  private body: any
  public headers: Headers

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = typeof body === 'string' ? body : JSON.stringify(body)
    this.status = init?.status || 200
    this.headers = new Headers(init?.headers)
  }

  async json() {
    return JSON.parse(this.body)
  }

  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), init)
  }
}

export class MockNextRequest extends Request {
  public nextUrl: URL

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init)
    this.nextUrl = new URL(typeof input === 'string' ? input : input.toString())
  }
}

// Мок для NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: ResponseInit) => MockResponse.json(body, init)
  },
  NextRequest: MockNextRequest
}))

// Мокаем console.log и console.error
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

// Переопределяем глобальные объекты
global.Response = MockResponse as any
global.fetch = jest.fn().mockImplementation(() => Promise.resolve(new MockResponse()))