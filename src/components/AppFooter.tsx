import { cn } from '@/lib/utils'

interface AppFooterProps {
  className?: string
}

export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer 
      className={cn(
        "mt-8 py-6 px-4 border-t border-border bg-muted/30",
        className
      )}
      role="contentinfo"
      aria-label="Legal information and attribution"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          All Premier League branding, logos, and trademarks are property of The Football Association Premier League Limited. 
          This is an unofficial app not affiliated with the Premier League.
        </p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          Data provided for informational purposes only. Accuracy not guaranteed.
        </p>
      </div>
    </footer>
  )
}