import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl text-muted-foreground mb-4">Page not found</p>
        <Button asChild>
          <Link href="/en/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
