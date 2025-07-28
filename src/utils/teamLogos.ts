/**
 * Team logo utilities for handling team crests and fallbacks
 */

/**
 * Converts team name to filename format for logo images
 * @param teamFullName - Full team name (e.g., "Manchester United")
 * @returns Normalized filename (e.g., "manchester-united")
 */
export function getTeamLogoPath(teamFullName: string): string {
  return teamFullName
    .toLowerCase()
    .replace(/\s+/g, '-')      // spaces to hyphens
    .replace(/'/g, '')         // remove apostrophes
    .replace(/[^a-z0-9-]/g, '') // remove other special chars
}

/**
 * Gets the full image path for a team logo
 * @param teamFullName - Full team name
 * @returns Full path to team logo image
 */
export function getTeamLogoUrl(teamFullName: string): string {
  return `/images/team-logos/${getTeamLogoPath(teamFullName)}.png`
}