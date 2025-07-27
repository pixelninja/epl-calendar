import { Calendar, Table } from '@/components/icons'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  activeTab: 'fixtures' | 'table'
  onTabChange: (tab: 'fixtures' | 'table') => void
  showScores: boolean
  onScoreToggle: (show: boolean) => void
}

export function BottomNav({ activeTab, onTabChange, showScores, onScoreToggle }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-border z-50 backdrop-blur-sm">
      <div className="flex items-center justify-around py-3">
        <button
          onClick={() => onTabChange('fixtures')}
          className={cn(
            'flex flex-col items-center gap-1 px-6 py-2 text-xs font-medium transition-colors rounded-lg',
            activeTab === 'fixtures' 
              ? 'text-white bg-white/20' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          )}
        >
          <Calendar className="h-5 w-5" />
          <span>Fixtures</span>
        </button>
        
        <button
          onClick={() => onTabChange('table')}
          className={cn(
            'flex flex-col items-center gap-1 px-6 py-2 text-xs font-medium transition-colors rounded-lg',
            activeTab === 'table' 
              ? 'text-white bg-white/20' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          )}
        >
          <Table className="h-5 w-5" />
          <span>Table</span>
        </button>
        
        <div className="flex flex-col items-center gap-1 px-6 py-2">
          <Switch
            checked={showScores}
            onCheckedChange={onScoreToggle}
            className="scale-75"
          />
          <span className="text-xs font-medium text-white/70">Scores</span>
        </div>
      </div>
    </div>
  )
}