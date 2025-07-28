/**
 * Team color constants for fallback badges
 * Maps team short names to Tailwind CSS background color classes
 */
export const TEAM_COLORS: Record<string, string> = {
  'ARS': 'bg-red-600',
  'CHE': 'bg-blue-600', 
  'LIV': 'bg-red-700',
  'MCI': 'bg-sky-500',
  'MUN': 'bg-red-600',
  'TOT': 'bg-blue-800',
  'NEW': 'bg-black',
  'AVL': 'bg-purple-600',
  'WHU': 'bg-red-900',
  'BRE': 'bg-red-500',
  'BHA': 'bg-blue-400',
  'CRY': 'bg-blue-600',
  'EVE': 'bg-blue-700',
  'FUL': 'bg-black',
  'LEI': 'bg-blue-600',
  'WOL': 'bg-orange-500',
  'BOU': 'bg-red-500',
  'NFO': 'bg-red-600',
  'SOU': 'bg-red-500',
  'IPS': 'bg-blue-600',
  'BUR': 'bg-purple-500',
  'LEE': 'bg-yellow-500',
  'SUN': 'bg-red-500'
}

/**
 * Default fallback color for unknown teams
 */
export const DEFAULT_TEAM_COLOR = 'bg-gray-500'