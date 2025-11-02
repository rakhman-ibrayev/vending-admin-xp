import { readFileSync } from 'fs'
import { resolve } from 'path'

// Get variables from .env.example
const getEnvVarsFromFile = () => {
  try {
    const envPath = resolve(process.cwd(), '.env.example')
    const envContent = readFileSync(envPath, 'utf-8')
    return envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#')) // Remove empty lines and comments
      .map(line => line.split('=')[0].trim())
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Could not read .env.local file!')
    process.exit(1)
  }
}

const requiredEnvVariables = getEnvVarsFromFile()

const validateEnv = () => {
  const missingVars = requiredEnvVariables.filter(
    envVar => !process.env[envVar]
  )

  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed!')
    console.error(
      '\x1b[31m%s\x1b[0m',
      'The following required environment variables are missing:'
    )
    missingVars.forEach(envVar => {
      console.error('\x1b[31m%s\x1b[0m', `  - ${envVar}`)
    })
    console.error(
      '\x1b[33m%s\x1b[0m',
      '\nMake sure these variables are defined in your .env.local file.'
    )
    process.exit(1)
  }

  console.log(
    '\x1b[32m%s\x1b[0m',
    '✅ Environment variables validated successfully!'
  )
}

// Run validation
validateEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  output: 'standalone'
}

export default nextConfig
