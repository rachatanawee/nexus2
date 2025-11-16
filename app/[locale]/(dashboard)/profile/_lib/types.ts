export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  updated_at: string
}

export type UserProfileUpdate = Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'phone' | 'bio'>>