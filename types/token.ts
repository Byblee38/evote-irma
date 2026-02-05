export interface Token {
  id: string
  token_code: string
  is_used: boolean
  used_at: string | null
  created_at: string
  expires_at: string | null
  description: string | null
}
