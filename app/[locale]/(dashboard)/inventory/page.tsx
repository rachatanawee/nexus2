import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory Management</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/inventory/products">
          <Card className="hover:bg-[hsl(var(--color-accent))] cursor-pointer">
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Manage your product inventory
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/inventory/warehouses">
          <Card className="hover:bg-[hsl(var(--color-accent))] cursor-pointer">
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Manage warehouse locations
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
