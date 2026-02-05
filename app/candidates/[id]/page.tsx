import { getCandidateById } from '@/app/actions/candidates'
import { CandidateDetail } from '@/components/candidate/candidate-detail'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const candidate = await getCandidateById(params.id)

  if (!candidate) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/candidates">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
        
        <CandidateDetail candidate={candidate} />
      </div>
    </div>
  )
}
