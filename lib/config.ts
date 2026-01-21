// Config loading utility
import { FunnelConfig } from '@/config/schema'

// Cache for loaded configs
const configCache = new Map<string, FunnelConfig>()

export async function getConfig(funnelId: string): Promise<FunnelConfig | null> {
  // Check cache first
  if (configCache.has(funnelId)) {
    return configCache.get(funnelId)!
  }

  try {
    // Dynamic import of config files
    const config = await import(`@/config/funnels/${funnelId}.json`)
    const funnelConfig = config.default as FunnelConfig

    // Cache the config
    configCache.set(funnelId, funnelConfig)

    return funnelConfig
  } catch (error) {
    console.error(`Failed to load config for funnel: ${funnelId}`, error)
    return null
  }
}

// Get list of available funnels
export function getAvailableFunnels(): string[] {
  // This would be populated from a directory scan in production
  return ['acnescope']
}

// Domain to funnel mapping
export const DOMAIN_MAP: Record<string, string> = {
  'acnescope.com': 'acnescope',
  'www.acnescope.com': 'acnescope',
  'nailscope.com': 'nailscope',
  'www.nailscope.com': 'nailscope',
  'eczemap.com': 'eczemap',
  'www.eczemap.com': 'eczemap',
  // Development domains
  'localhost': 'acnescope',
  'localhost:3000': 'acnescope',
}
