import Link from 'next/link'
import { Vote } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            <span className="font-bold text-lg">E-Vote IRMA</span>
          </Link>
          
          <nav className="flex gap-6 text-sm">
            <Link 
              href="/candidates"
              className="hover:text-foreground/80 transition-colors"
            >
              Kandidat
            </Link>
            <Link 
              href="/vote"
              className="hover:text-foreground/80 transition-colors"
            >
              Vote
            </Link>
            <Link 
              href="/results"
              className="hover:text-foreground/80 transition-colors"
            >
              Hasil
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
