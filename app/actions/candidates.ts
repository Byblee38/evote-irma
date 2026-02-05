'use server'

import { createClient } from '@/lib/supabase/server'
import type { Candidate, VoteResult } from '@/types/candidate'

export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('order_number', { ascending: true })
  
  if (error) {
    console.error('Error fetching candidates:', error)
    return []
  }
  
  return data || []
}

export async function getCandidateById(
  id: string
): Promise<Candidate | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching candidate:', error)
    return null
  }
  
  return data
}

export async function getVoteResults(): Promise<VoteResult[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vote_results')
    .select('*')
  
  if (error) {
    console.error('Error fetching vote results:', error)
    return []
  }
  
  return data || []
}

export async function getTotalVotes(): Promise<number> {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('Error counting votes:', error)
    return 0
  }
  
  return count || 0
}
