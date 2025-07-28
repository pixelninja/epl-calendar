import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getTeamLogoUrl } from '@/utils/teamLogos'
import { TEAM_COLORS, DEFAULT_TEAM_COLOR } from '@/utils/constants'

interface TeamCrestProps {
  teamShortName: string
  teamFullName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Team crest component with fallback to colored badge
 * Replaces innerHTML manipulation with proper React component
 */
export function TeamCrest({ 
  teamShortName, 
  teamFullName, 
  size = 'md',
  className 
}: TeamCrestProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: 'w-4 h-4 text-[8px]',
    md: 'w-6 h-6 text-[10px]',
    lg: 'w-8 h-8 text-xs'
  }
  
  const logoUrl = getTeamLogoUrl(teamFullName)
  const teamColor = TEAM_COLORS[teamShortName] || DEFAULT_TEAM_COLOR
  
  // If image failed to load, show colored badge fallback
  if (imageError) {
    return (
      <div 
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white',
          teamColor,
          sizeClasses[size],
          className
        )}
        aria-label={`${teamFullName} team badge`}
        title={teamFullName}
      >
        {teamShortName.slice(0, 2)}
      </div>
    )
  }
  
  return (
    <img 
      src={logoUrl}
      alt={`${teamFullName} team crest`}
      title={teamFullName}
      className={cn('object-contain', sizeClasses[size], className)}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}