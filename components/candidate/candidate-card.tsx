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

function getPosition(orderNumber: number): string {
  switch (orderNumber) {
    case 1:
      return 'Calon'
    case 2:
      return 'Calon'
    default:
      return `Calon`
  }
}

export function CandidateCard({
  candidate,
  onClick,
  selected
}: CandidateCardProps) {
  const position = getPosition(candidate.order_number)

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-white/90 backdrop-blur-sm",
        selected && "ring-2 ring-blue-500 shadow-xl scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            {position}
          </Badge>
          <Badge variant="outline" className="text-xs">
            #{candidate.order_number}
          </Badge>
        </div>

        {candidate.photo_url ? (
          <div className="relative w-full aspect-square mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner">
            <Image
              src={candidate.photo_url}
              alt={candidate.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-square mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-inner">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xl">
                  {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-600">Foto belum tersedia</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight text-gray-900">{candidate.name}</h3>
          <p className="text-sm text-muted-foreground">{candidate.class}</p>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <h4 className="font-semibold text-sm text-blue-600 mb-1">Visi</h4>
            <p className="text-xs text-gray-600 line-clamp-2">{candidate.vision}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-purple-600 mb-1">Misi</h4>
            <p className="text-xs text-gray-600 line-clamp-3">{candidate.mission}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
