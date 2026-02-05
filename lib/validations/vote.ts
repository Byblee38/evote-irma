import { z } from 'zod'

export const voteSchema = z.object({
  candidateId: z.string().uuid('Kandidat tidak valid'),
})

export type VoteInput = z.infer<typeof voteSchema>
