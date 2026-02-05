'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateList } from '@/components/candidate/candidate-list'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { submitVote } from '@/app/actions/vote'
import type { Candidate } from '@/types/candidate'

interface VoteFormProps {
  candidates: Candidate[]
  onSuccess: () => void
}

export function VoteForm({ candidates, onSuccess }: VoteFormProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedCandidate) return

    setError('')
    setLoading(true)

    const result = await submitVote(selectedCandidate.id)

    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Gagal submit vote')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Pilih Kandidat</h2>
        <CandidateList
          candidates={candidates}
          onSelectCandidate={setSelectedCandidate}
          selectedCandidateId={selectedCandidate?.id}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedCandidate || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim vote...
          </>
        ) : (
          'Kirim Vote'
        )}
      </Button>
    </div>
  )
}
