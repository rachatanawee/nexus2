// Integration test setup - loads test environment and adds fetch polyfill
/* eslint-disable */

// Load environment variables from .env.test for integration tests
const { config } = require('dotenv')
config({ path: '.env.test' })

// Polyfills for Next.js server actions and Supabase
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Use Node.js built-in fetch (available in Node 18+)
const { fetch, Request, Response, Headers } = require('undici')
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))
