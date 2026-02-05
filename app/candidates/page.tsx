import { getCandidates } from '@/app/actions/candidates'
import { CandidateList } from '@/components/candidate/candidate-list'

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Daftar Kandidat</h1>
        {candidates.length === 0 ? (
          <p className="text-muted-foreground">Belum ada kandidat tersedia.</p>
        ) : (
          <CandidateList candidates={candidates} />
        )}
      </div>
    </div>
  )
}
