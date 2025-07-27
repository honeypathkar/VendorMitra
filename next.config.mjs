/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'bcryptjs', 'jsonwebtoken']
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('nodemailer')
    }
    return config
  },
}

export default nextConfig
