import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Candidate } from '@/types/candidate'

interface CandidateDetailProps {
  candidate: Candidate
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit mb-2">Kandidat {candidate.order_number}</Badge>
        <CardTitle className="text-xl">{candidate.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {candidate.photo_url && (
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
            <Image
              src={candidate.photo_url}
              alt={candidate.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-sm mb-2">Visi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {candidate.vision}
          </p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-semibold text-sm mb-2">Misi</h3>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {candidate.mission}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
