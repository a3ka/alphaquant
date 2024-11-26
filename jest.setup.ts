import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { NextRequest } from 'next/server'
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives'

class MockResponse extends Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body || '', init)
  }
}

type SafeRequestInit = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal | undefined
}

const Internal = Symbol.for('NextURLInternal')

class MockNextURL {
  private _url: URL
  buildId = ''
  hasBasePath = false
  locale = 'en'
  defaultLocale = 'en'
  domainLocale = undefined
  basePath = ''

  readonly [Internal]: { url: URL; options: { locale?: string } } = {
    url: new URL('http://localhost'),
    options: { locale: 'en' }
  }

  constructor(input: string | URL, base?: string | URL) {
    this._url = new URL(typeof input === 'string' ? input : input.href, base)
    Object.defineProperty(this, Internal, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: {
        url: this._url,
        options: { locale: 'en' }
      }
    })
  }

  get href() { return this._url.href }
  get origin() { return this._url.origin }
  get protocol() { return this._url.protocol }
  get host() { return this._url.host }
  get hostname() { return this._url.hostname }
  get port() { return this._url.port }
  get pathname() { return this._url.pathname }
  get search() { return this._url.search }
  get searchParams() { return this._url.searchParams }
  get hash() { return this._url.hash }

  analyze() {
    return {
      pathname: this.pathname,
      search: this.search,
      hash: this.hash
    }
  }

  formatPathname() {
    return this.pathname
  }

  formatSearch() {
    return this.search
  }

  clone() {
    return new MockNextURL(this._url)
  }

  toString() {
    return this._url.toString()
  }
}

export class MockNextRequest extends NextRequest {
  private _nextUrl: MockNextURL

  constructor(url: string | URL, init?: SafeRequestInit) {
    const cleanInit = {
      ...init,
      headers: new Headers(init?.headers || {})
    }
    
    const urlObj = typeof url === 'string' ? new URL(url) : url
    super(urlObj, cleanInit)
    this._nextUrl = new MockNextURL(urlObj)
  }

  get nextUrl() {
    return this._nextUrl as any // Временное решение для типизации
  }
}

// Глобальные моки
global.Headers = Headers
global.Request = Request
global.Response = MockResponse
global.TextDecoder = require('util').TextDecoder
global.TextEncoder = require('util').TextEncoder
global.fetch = jest.fn(() => 
  Promise.resolve(new MockResponse(JSON.stringify({ success: true })))
) as jest.Mock

// Мок для crypto
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn()
    },
    getRandomValues: jest.fn()
  }
})