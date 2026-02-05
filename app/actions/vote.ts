'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidatedToken, clearValidatedToken } from './token'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const VoteSchema = z.object({
  candidateId: z.string().uuid('Kandidat tidak valid'),
})

export type VoteResult = {
  success: boolean
  voteId?: string
  error?: string
}

export async function submitVote(
  candidateId: string
): Promise<VoteResult> {
  try {
    const validated = VoteSchema.parse({ candidateId })
    
    const tokenId = await getValidatedToken()
    
    if (!tokenId) {
      return {
        success: false,
        error: 'Silakan validasi token terlebih dahulu',
      }
    }
    
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    
    const supabase = await createClient()
    
    const { data: token } = await supabase
      .from('tokens')
      .select('token_code')
      .eq('id', tokenId)
      .single()
    
    if (!token) {
      return {
        success: false,
        error: 'Token tidak valid',
      }
    }
    
    const { data, error } = await supabase.rpc('submit_vote', {
      p_token_code: token.token_code,
      p_candidate_id: validated.candidateId,
      p_ip_address: ipAddress,
    })
    
    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }
    
    const result = data as { success: boolean; vote_id?: string; error?: string }
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Gagal submit vote',
      }
    }
    
    await clearValidatedToken()
    
    revalidatePath('/results')
    
    return {
      success: true,
      voteId: result.vote_id,
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validasi gagal',
      }
    }
    
    console.error('Submit vote error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat submit vote',
    }
  }
}

export async function hasUserVoted(): Promise<boolean> {
  const tokenId = await getValidatedToken()
  
  if (!tokenId) {
    return false
  }
  
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('token_id', tokenId)
    .single()
  
  return !!data
}
