/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acsaaslumtkypjihjnjz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Otimizações para produção
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig
