import { getVoteResults } from '@/app/actions/candidates'
import { VoteChart } from '@/components/results/vote-chart'
import { VoteStats } from '@/components/results/vote-stats'
import { LiveIndicator } from '@/components/results/live-indicator'

export const revalidate = 10

export default async function ResultsPage() {
  const results = await getVoteResults()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hasil Voting Real-Time</h1>
          <LiveIndicator />
        </div>
        
        {results.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Belum ada vote masuk.
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <VoteChart data={results} />
            <VoteStats results={results} />
          </div>
        )}
      </div>
    </div>
  )
}
