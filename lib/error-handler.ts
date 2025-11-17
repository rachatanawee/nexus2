export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

type SupabaseError = {
  message: string
  code?: string
  details?: string
  hint?: string
  status?: number
}

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This record already exists',
  '23503': 'Cannot delete: related records exist',
  '23502': 'Required field is missing',
  '42501': 'Permission denied',
  'PGRST116': 'No rows found',
  '42P01': 'Table does not exist',
}

export function handleSupabaseError(error: SupabaseError): string {
  const code = error.code || ''
  const customMessage = SUPABASE_ERROR_MESSAGES[code]
  
  if (customMessage) return customMessage
  
  let message = error.message
  
  if (error.details) {
    message += ` (${error.details})`
  }
  
  if (error.hint) {
    message += ` Hint: ${error.hint}`
  }
  
  return message
}

export function handleError(error: unknown): { success: false; message: string } {
  if (error instanceof AppError) {
    return { success: false, message: error.message }
  }
  
  if (isSupabaseError(error)) {
    return { success: false, message: handleSupabaseError(error as SupabaseError) }
  }
  
  if (error instanceof Error) {
    return { success: false, message: error.message }
  }
  
  return { success: false, message: 'An unexpected error occurred' }
}

export function isSupabaseError(error: any): boolean {
  return error && typeof error === 'object' && 'message' in error && ('code' in error || 'status' in error)
}

export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) {
    return handleSupabaseError(error as SupabaseError)
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}
