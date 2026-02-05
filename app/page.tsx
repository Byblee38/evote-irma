import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCandidates, getTotalVotes } from '@/app/actions/candidates'

export default async function HomePage() {
  const candidates = await getCandidates()
  const totalVotes = await getTotalVotes()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Pemilihan Ketua & Wakil Ketua
          </h1>
          <p className="text-lg text-muted-foreground">
            Gunakan hak suara Anda untuk memilih pemimpin terbaik
          </p>
        </div>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/candidates">Lihat Kandidat</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/vote">Mulai Vote</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold">{candidates.length}</p>
              <p className="text-sm text-muted-foreground">Kandidat</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold">{totalVotes}</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
