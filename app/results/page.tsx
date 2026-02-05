import { getVoteResults } from '@/app/actions/candidates'
import { VoteChart } from '@/components/results/vote-chart'
import { VoteStats } from '@/components/results/vote-stats'
import { LiveIndicator } from '@/components/results/live-indicator'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'

export const revalidate = 10

export default async function ResultsPage() {
  const results = await getVoteResults()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Hasil Voting Real-Time
              </h1>
              <p className="text-xl text-muted-foreground">Pantau hasil pemilihan secara langsung</p>
            </div>

            <div className="flex justify-center">
              <LiveIndicator />
            </div>
          </div>

          {results.length === 0 ? (
            <Card className="max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Belum Ada Vote</h3>
                <p className="text-muted-foreground">Hasil voting akan muncul setelah ada yang voting.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <VoteChart data={results} />
              <VoteStats results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
