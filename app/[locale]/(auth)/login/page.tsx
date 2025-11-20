'use client'

import { useTranslations } from 'next-intl'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const t = useTranslations('auth')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError('')
    document.body.style.cursor = 'wait'
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setIsLoading(false)
      document.body.style.cursor = 'default'
    }
  }

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gray-50 ${isLoading ? 'cursor-wait' : ''}`}>
      <Card className="w-full max-w-md animate-in fade-in duration-300">
        <CardHeader>
          <CardTitle>{t('login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" name="email" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" name="password" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login')}...
                </>
              ) : (
                t('login')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}