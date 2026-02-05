'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Candidate } from '@/types/candidate'
import { cn } from '@/lib/utils/cn'

interface CandidateCardProps {
  candidate: Candidate
  onClick?: () => void
  selected?: boolean
}

export function CandidateCard({ 
  candidate, 
  onClick, 
  selected 
}: CandidateCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <Badge className="mb-3 border-gray-300">
          Kandidat {candidate.order_number}
        </Badge>
        
        {candidate.photo_url && (
          <div className="relative w-full aspect-square mb-3 bg-muted rounded-md overflow-hidden">
            <Image
              src={candidate.photo_url}
              alt={candidate.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <h3 className="font-semibold text-sm leading-tight">{candidate.name}</h3>
      </CardContent>
    </Card>
  )
}
