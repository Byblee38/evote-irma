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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Memuat kandidat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {step === 'token' && (
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Validasi Token</CardTitle>
                <p className="text-muted-foreground">
                  Masukkan kode token untuk mulai voting
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <TokenInput onSuccess={() => setStep('vote')} />
              </CardContent>
            </Card>
          )}

          {step === 'vote' && (
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Vote Kandidat</CardTitle>
                <p className="text-muted-foreground">
                  Pilih kandidat yang sesuai dengan visi dan misi Anda
                </p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
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
    </div>
  )
}
