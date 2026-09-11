import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    editorial: { stale: 3600, revalidate: 3600, expire: 86400 },
    praticien: { stale: 86400, revalidate: 86400, expire: 604800 },
    listing: { stale: 43200, revalidate: 86400, expire: 604800 },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.dentalmap.fr' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  typedRoutes: true,
}

export default nextConfig
