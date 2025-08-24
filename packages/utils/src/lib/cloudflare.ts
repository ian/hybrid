/**
 * Cloudflare environment detection and storage utilities
 */

declare const process: {
  env: Record<string, string | undefined>
  cwd(): string
}

export interface CloudflareEnvironment {
  isCloudflare: boolean
  platform: 'pages' | 'workers' | 'local'
  storagePath: string
}

/**
 * Detects if running in Cloudflare environment and returns appropriate storage configuration
 */
export function getCloudflareEnvironment(): CloudflareEnvironment {
  if (process.env.CF_PAGES_BRANCH) {
    return {
      isCloudflare: true,
      platform: 'pages',
      storagePath: '/tmp'
    }
  }

  if (process.env.CF_WORKER_NAME) {
    return {
      isCloudflare: true,
      platform: 'workers',
      storagePath: '/tmp'
    }
  }

  return {
    isCloudflare: false,
    platform: 'local',
    storagePath: process.env.PROJECT_ROOT || process.cwd()
  }
}

/**
 * Gets the appropriate storage path for the current environment
 * @param subPath - Optional subdirectory within the storage path
 */
export function getCloudflareStoragePath(subPath?: string): string {
  const env = getCloudflareEnvironment()
  
  if (env.isCloudflare) {
    return subPath ? `/tmp/${subPath}` : '/tmp'
  }

  const basePath = env.storagePath
  const dataPath = subPath ? `${basePath}/.data/${subPath}` : `${basePath}/.data`
  
  return dataPath
}

/**
 * Gets service URL based on Cloudflare environment variables
 */
export function getCloudflareServiceUrl(fallbackPort = 3000): string {
  if (process.env.CF_PAGES_URL) {
    return process.env.CF_PAGES_URL
  }

  if (process.env.CF_WORKER_URL) {
    return process.env.CF_WORKER_URL
  }

  // Local development fallback
  return `http://localhost:${fallbackPort}`
}
