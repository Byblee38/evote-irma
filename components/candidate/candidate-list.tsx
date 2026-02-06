'use client'

import { useState } from 'react'
import { CandidateCard } from './candidate-card'
import { CandidateDetail } from './candidate-detail'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Candidate } from '@/types/candidate'

interface CandidateListProps {
  candidates: Candidate[]
  onSelectCandidate?: (candidate: Candidate) => void
  selectedCandidateId?: string
  showDialog?: boolean
}

export function CandidateList({
  candidates,
  onSelectCandidate,
  selectedCandidateId,
  showDialog = true
}: CandidateListProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleCardClick = (candidate: Candidate) => {
    if (showDialog) {
      setSelectedCandidate(candidate)
    }
    onSelectCandidate?.(candidate)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onClick={() => handleCardClick(candidate)}
            selected={selectedCandidateId === candidate.id}
          />
        ))}
      </div>

      {showDialog && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Kandidat</DialogTitle>
            </DialogHeader>
            {selectedCandidate && <CandidateDetail candidate={selectedCandidate} />}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
