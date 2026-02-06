import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Candidate } from '@/types/candidate'

interface CandidateDetailProps {
  candidate: Candidate
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          Kandidat #{candidate.order_number}
        </Badge>
        <div>
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <p className="text-muted-foreground">{candidate.class}</p>
        </div>
      </div>

      {candidate.photo_url ? (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={candidate.photo_url}
            alt={candidate.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">
                {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <p className="text-muted-foreground">Foto belum tersedia</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg mb-3 text-blue-600">Visi</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {candidate.vision}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-lg mb-3 text-purple-600">Misi</h3>
        <ul className="text-sm text-muted-foreground space-y-3">
          {candidate.mission.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
