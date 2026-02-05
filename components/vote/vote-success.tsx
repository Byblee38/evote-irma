import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function VoteSuccess() {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vote Berhasil!</h2>
        <p className="text-muted-foreground mb-6">
          Terima kasih telah berpartisipasi dalam pemilihan ini.
        </p>
        <Button asChild>
          <Link href="/results">Lihat Hasil Real-Time</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
