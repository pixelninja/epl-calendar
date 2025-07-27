import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from '@/components/icons'

interface ScoreToggleProps {
  showScores: boolean
  onToggle: (show: boolean) => void
  className?: string
}

export function ScoreToggle({ showScores, onToggle, className }: ScoreToggleProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {showScores ? (
          <Eye className="h-4 w-4 text-primary" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        <Label 
          htmlFor="score-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          {showScores ? 'Hide Scores' : 'Show Scores'}
        </Label>
      </div>
      <Switch
        id="score-toggle"
        checked={showScores}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}