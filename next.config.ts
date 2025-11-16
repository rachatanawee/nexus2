import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 30000
  },
  output: 'standalone'
}

export default withNextIntl(nextConfig)
