import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCandidates, getTotalVotes } from '@/app/actions/candidates'
import { CandidateList } from '@/components/candidate/candidate-list'

export default async function HomePage() {
  const candidates = await getCandidates()
  const totalVotes = await getTotalVotes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pemilihan Ketua & Wakil Ketua
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Gunakan hak suara Anda untuk memilih pemimpin terbaik IRMA 2026
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Link href="/vote">Mulai Vote</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 hover:bg-gray-50">
                <Link href="/results">Lihat Hasil</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">{candidates.length}</p>
                  <p className="text-sm text-muted-foreground">Kandidat</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">{totalVotes}</p>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Candidates Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Daftar Kandidat</h2>
              <p className="text-muted-foreground">Pilih kandidat yang sesuai dengan visi dan misi Anda</p>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Belum ada kandidat tersedia.</p>
              </div>
            ) : (
              <CandidateList candidates={candidates} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
