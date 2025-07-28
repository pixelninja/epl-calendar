import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component for loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )} 
    />
  )
}

/**
 * Skeleton for individual fixture rows
 */
export function FixtureRowSkeleton() {
  return (
    <div className="flex items-center py-4 px-4 border-b border-border/20">
      {/* Home Team */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Center Time/Score */}
      <div className="flex flex-col items-center gap-1 px-4">
        <Skeleton className="h-4 w-12" />
      </div>
      
      {/* Away Team */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Skeleton for date group sections
 */
export function DateGroupSkeleton() {
  return (
    <div className="border-b border-border/30">
      {/* Date Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
      
      {/* Fixture Rows */}
      <div>
        <FixtureRowSkeleton />
        <FixtureRowSkeleton />
        <FixtureRowSkeleton />
      </div>
    </div>
  )
}

/**
 * Full loading skeleton for the fixtures list
 */
export function FixturesLoadingSkeleton() {
  return (
    <div 
      className="bg-background"
      aria-busy="true"
      aria-label="Loading EPL fixtures and scores"
      role="status"
    >
      <DateGroupSkeleton />
      <DateGroupSkeleton />
      <DateGroupSkeleton />
    </div>
  )
}