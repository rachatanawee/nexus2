export type UserPreference = {
  id: string
  user_id: string
  key: string
  value: string | null
  category: string
  type: 'text' | 'email' | 'url' | 'color' | 'number' | 'select' | 'boolean'
  description: string | null
  created_at: string
  updated_at: string
}

export type UserPreferenceInsert = Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>
export type UserPreferenceUpdate = Partial<UserPreferenceInsert>