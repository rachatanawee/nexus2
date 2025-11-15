'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(var(--color-background))',
          color: 'hsl(var(--color-foreground))',
          border: '1px solid hsl(var(--color-border))',
        },
      }}
    />
  )
}
