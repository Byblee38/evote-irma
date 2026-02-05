'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenInput } from '@/components/vote/token-input'
import { VoteForm } from '@/components/vote/vote-form'
import { VoteSuccess } from '@/components/vote/vote-success'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCandidates } from '@/app/actions/candidates'
import { useEffect } from 'react'
import type { Candidate } from '@/types/candidate'

export default function VotePage() {
  const router = useRouter()
  const [step, setStep] = useState<'token' | 'vote' | 'success'>('token')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCandidates() {
      const data = await getCandidates()
      setCandidates(data)
      setLoading(false)
    }
    fetchCandidates()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {step === 'token' && (
          <Card>
            <CardHeader>
              <CardTitle>Validasi Token</CardTitle>
              <p className="text-sm text-muted-foreground">
                Masukkan kode token untuk mulai voting
              </p>
            </CardHeader>
            <CardContent>
              <TokenInput onSuccess={() => setStep('vote')} />
            </CardContent>
          </Card>
        )}

        {step === 'vote' && (
          <Card>
            <CardHeader>
              <CardTitle>Vote Kandidat</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pilih salah satu kandidat di bawah ini
              </p>
            </CardHeader>
            <CardContent>
              <VoteForm 
                candidates={candidates}
                onSuccess={() => setStep('success')}
              />
            </CardContent>
          </Card>
        )}

        {step === 'success' && <VoteSuccess />}
      </div>
    </div>
  )
}
