import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, BarChart3 } from 'lucide-react'

export function VoteSuccess() {
  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm max-w-md mx-auto">
      <CardContent className="pt-8 pb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Vote Berhasil! 🎉
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Terima kasih telah berpartisipasi dalam pemilihan Ketua & Wakil Ketua IRMA 2026.
        </p>
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
            <Link href="/results">
              <BarChart3 className="mr-2 h-5 w-5" />
              Lihat Hasil Real-Time
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full border-2 hover:bg-gray-50">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
