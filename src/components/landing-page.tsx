import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'

export function LandingPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard Builder</h1>
          <p className="text-xl text-muted-foreground">Choose your dashboard type</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/grid">
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Grid Dashboard</CardTitle>
                <CardDescription>
                  Create dashboards with a flexible grid layout system. Drag and drop widgets, resize them, and organize your data visually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-muted-foreground"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/flow">
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Flow Dashboard</CardTitle>
                <CardDescription>
                  Build interactive flow-based dashboards. Connect nodes, create data pipelines, and visualize complex workflows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 text-muted-foreground"
                  >
                    <path d="M4 4v16" />
                    <path d="M20 4v16" />
                    <path d="M4 12h16" />
                    <path d="m8 8-4 4 4 4" />
                    <path d="m16 16 4-4-4-4" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 