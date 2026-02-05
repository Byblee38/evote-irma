'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const TokenSchema = z.object({
  tokenCode: z.string().min(1, 'Token tidak boleh kosong').trim(),
})

export type TokenValidationResult = {
  success: boolean
  isValid: boolean
  tokenId?: string
  error?: string
}

export async function validateToken(
  tokenCode: string
): Promise<TokenValidationResult> {
  try {
    const validated = TokenSchema.parse({ tokenCode: tokenCode.toUpperCase() })
    
    const supabase = await createClient()
    
    const { data: token, error } = await supabase
      .from('tokens')
      .select('id, token_code, is_used, expires_at')
      .eq('token_code', validated.tokenCode)
      .single()
    
    if (error || !token) {
      return {
        success: true,
        isValid: false,
        error: 'Token tidak ditemukan',
      }
    }
    
    if (token.is_used) {
      return {
        success: true,
        isValid: false,
        error: 'Token sudah digunakan',
      }
    }
    
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return {
        success: true,
        isValid: false,
        error: 'Token sudah kadaluarsa',
      }
    }
    
    return {
      success: true,
      isValid: true,
      tokenId: token.id,
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        isValid: false,
        error: error.issues[0]?.message || 'Validasi gagal',
      }
    }
    
    return {
      success: false,
      isValid: false,
      error: 'Terjadi kesalahan saat validasi token',
    }
  }
}

export async function storeValidatedToken(tokenId: string) {
  const cookieStore = await cookies()
  
  cookieStore.set('validated_token_id', tokenId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
  })
  
  return { success: true }
}

export async function getValidatedToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const tokenId = cookieStore.get('validated_token_id')
  return tokenId?.value || null
}

export async function clearValidatedToken() {
  const cookieStore = await cookies()
  cookieStore.delete('validated_token_id')
  return { success: true }
}
