'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateList } from '@/components/candidate/candidate-list'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Vote, CheckCircle } from 'lucide-react'
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
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
          <Vote className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Pilih Kandidat Anda</h2>
        <p className="text-muted-foreground">Pilih kandidat yang sesuai dengan visi dan misi Anda</p>
      </div>

      <div className="space-y-6">
        <CandidateList
          candidates={candidates}
          onSelectCandidate={setSelectedCandidate}
          selectedCandidateId={selectedCandidate?.id}
          showDialog={false}
        />

        {selectedCandidate && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Kandidat Terpilih</p>
                <p className="text-sm text-green-700">{selectedCandidate.name}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedCandidate || loading}
          className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg transition-all duration-200 disabled:opacity-50"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Mengirim Vote...
            </>
          ) : (
            <>
              <Vote className="mr-2 h-5 w-5" />
              Kirim Vote Saya
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
