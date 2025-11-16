export type AppSetting = {
  id: string
  key: string
  value: string | null
  category: string
  type: 'text' | 'email' | 'url' | 'color' | 'number' | 'select'
  description: string | null
  updated_at: string
}
