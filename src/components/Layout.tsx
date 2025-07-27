import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">
            EPL Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Premier League fixtures and results
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="fixtures" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="fixtures" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Fixtures
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              League Table
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fixtures" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                Match Fixtures
              </h2>
              {children}
            </Card>
          </TabsContent>
          
          <TabsContent value="table" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">
                Premier League Table
              </h2>
              <p className="text-muted-foreground">
                League table coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            All Premier League branding, logos, and trademarks are property of The Football Association Premier League Limited. 
            This is an unofficial app not affiliated with the Premier League.
          </p>
        </div>
      </footer>
    </div>
  )
}