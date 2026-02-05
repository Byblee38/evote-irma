'use client'

import { CandidateCard } from './candidate-card'
import type { Candidate } from '@/types/candidate'

interface CandidateListProps {
  candidates: Candidate[]
  onSelectCandidate?: (candidate: Candidate) => void
  selectedCandidateId?: string
}

export function CandidateList({ 
  candidates, 
  onSelectCandidate,
  selectedCandidateId 
}: CandidateListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onClick={() => onSelectCandidate?.(candidate)}
          selected={selectedCandidateId === candidate.id}
        />
      ))}
    </div>
  )
}
