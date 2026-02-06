export interface Candidate {
  id: string
  name: string
  photo_url: string | null
  vision: string
  mission: string[]
  order_number: number
  class: string
  created_at: string
  updated_at: string
}

export interface VoteResult {
  id: string
  name: string
  photo_url: string | null
  order_number: number
  vote_count: number
  percentage: number
}
