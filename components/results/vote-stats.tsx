import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import type { VoteResult } from '@/types/candidate'

interface VoteStatsProps {
  results: VoteResult[]
}

export function VoteStats({ results }: VoteStatsProps) {
  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {result.photo_url && (
                <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded-full overflow-hidden">
                  <Image
                    src={result.photo_url}
                    alt={result.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-xs border-gray-300">
                    #{result.order_number}
                  </Badge>
                  <h3 className="font-semibold text-sm truncate">{result.name}</h3>
                </div>
                <p className="text-lg font-bold">
                  {result.vote_count} votes ({result.percentage}%)
                </p>
              </div>
            </div>
            
            <Progress value={result.percentage} className="h-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
