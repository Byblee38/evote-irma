import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { Trophy, Medal, Award } from 'lucide-react'
import type { VoteResult } from '@/types/candidate'
import { cn } from '@/lib/utils/cn'

interface VoteStatsProps {
  results: VoteResult[]
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
  }
}

function getRankColor(rank: number) {
  switch (rank) {
    case 1:
      return 'from-yellow-400 to-yellow-600'
    case 2:
      return 'from-gray-300 to-gray-500'
    case 3:
      return 'from-amber-400 to-amber-600'
    default:
      return 'from-blue-400 to-blue-600'
  }
}

export function VoteStats({ results }: VoteStatsProps) {
  // Sort by vote count descending
  const sortedResults = [...results].sort((a, b) => b.vote_count - a.vote_count)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Peringkat Kandidat</h3>
          <p className="text-sm text-muted-foreground">Berdasarkan jumlah vote</p>
        </div>
      </div>

      {sortedResults.map((result, index) => {
        const rank = index + 1
        const isTopThree = rank <= 3

        return (
          <Card
            key={result.id}
            className={cn(
              "shadow-lg border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-xl",
              isTopThree && "ring-2 ring-offset-2",
              isTopThree && rank === 1 && "ring-yellow-500",
              isTopThree && rank === 2 && "ring-gray-400",
              isTopThree && rank === 3 && "ring-amber-600"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${getRankColor(rank)} text-white font-bold shadow-lg`}>
                  {getRankIcon(rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs border-gray-300 bg-gray-50">
                      #{result.order_number}
                    </Badge>
                    <h3 className="font-bold text-lg truncate">{result.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-2xl text-gray-900">{result.vote_count}</span>
                    <span>votes</span>
                    <span className="text-blue-600 font-medium">({result.percentage}%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{result.percentage}%</span>
                </div>
                <Progress
                  value={result.percentage}
                  className="h-3 bg-gray-100"
                  style={{
                    background: 'linear-gradient(90deg, #e5e7eb 0%, #e5e7eb 100%)'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
