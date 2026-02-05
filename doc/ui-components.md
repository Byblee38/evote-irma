# UI Components Library - E-Vote

## Library Stack

### Core UI Libraries

1. **shadcn/ui** - Component collection built on Radix UI
2. **Radix UI** - Unstyled, accessible components
3. **Tailwind CSS** - Utility-first CSS framework
4. **Lucide React** - Icon library
5. **Recharts** - Charting library untuk real-time results
6. **Zod** - Schema validation

---

## Components Structure

```
components/
├── ui/                      # Base components from shadcn/ui
├── candidate/               # Candidate-specific components
├── vote/                    # Voting components
├── results/                 # Results visualization components
├── layout/                  # Layout components
└── providers/               # Context providers
```

---

## Base UI Components (shadcn/ui)

Components yang perlu di-generate dari shadcn/ui:

### Essential Components

```bash
# Install shadcn/ui CLI first
npx shadcn@latest init

# Generate required components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add badge
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add tabs
```

### Generated Components:

1. **`components/ui/button.tsx`** - Button variants
2. **`components/ui/card.tsx`** - Card container
3. **`components/ui/input.tsx`** - Input field
4. **`components/ui/label.tsx`** - Form label
5. **`components/ui/dialog.tsx`** - Modal dialog
6. **`components/ui/toast.tsx`** - Toast notifications
7. **`components/ui/badge.tsx`** - Badge/pill
8. **`components/ui/separator.tsx`** - Divider line
9. **`components/ui/skeleton.tsx`** - Loading skeleton
10. **`components/ui/alert.tsx`** - Alert messages
11. **`components/ui/progress.tsx`** - Progress bar
12. **`components/ui/tabs.tsx`** - Tab navigation

---

## Custom Components

### 1. Candidate Components

#### `components/candidate/candidate-card.tsx`

Display card untuk kandidat dengan foto, nama, dan nomor urut.

```typescript
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Candidate } from '@/types/candidate'

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
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <Badge className="mb-4">Kandidat {candidate.order_number}</Badge>
        
        <div className="relative w-full aspect-square mb-4">
          <Image
            src={candidate.photo_url}
            alt={candidate.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
        
        <h3 className="font-bold text-lg">{candidate.name}</h3>
      </CardContent>
    </Card>
  )
}
```

**Props:**
- `candidate` - Data kandidat
- `onClick` - Handler saat card diklik
- `selected` - Status apakah kandidat terpilih

---

#### `components/candidate/candidate-detail.tsx`

Detail lengkap kandidat dengan visi & misi.

```typescript
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
        <Badge className="w-fit">Kandidat {candidate.order_number}</Badge>
        <CardTitle className="text-2xl">{candidate.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="relative w-full aspect-video">
          <Image
            src={candidate.photo_url}
            alt={candidate.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-2">Visi</h3>
          <p className="text-muted-foreground">{candidate.vision}</p>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-bold text-lg mb-2">Misi</h3>
          <div className="text-muted-foreground whitespace-pre-line">
            {candidate.mission}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

#### `components/candidate/candidate-list.tsx`

Grid layout untuk menampilkan semua kandidat.

```typescript
import { CandidateCard } from './candidate-card'
import type { Candidate } from '@/types/candidate'

interface CandidateListProps {
  candidates: Candidate[]
  onSelectCandidate?: (candidate: Candidate) => void
  selectedCandidateId?: string
}

export function CandidateList({ 
  candidates, 
  onSelectCandidate,
  selectedCandidateId 
}: CandidateListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onClick={() => onSelectCandidate?.(candidate)}
          selected={selectedCandidateId === candidate.id}
        />
      ))}
    </div>
  )
}
```

---

### 2. Vote Components

#### `components/vote/token-input.tsx`

Form input untuk token voting.

```typescript
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'
import { validateToken } from '@/app/actions/token'

interface TokenInputProps {
  onSuccess: (tokenId: string) => void
}

export function TokenInput({ onSuccess }: TokenInputProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await validateToken(token)

    setLoading(false)

    if (result.success && result.isValid && result.tokenId) {
      onSuccess(result.tokenId)
    } else {
      setError(result.error || 'Token tidak valid')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="token">Kode Token</Label>
        <Input
          id="token"
          type="text"
          placeholder="VOTE-2024-XXXXXX"
          value={token}
          onChange={(e) => setToken(e.target.value.trim().toUpperCase())}
          disabled={loading}
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memvalidasi...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Validasi Token
          </>
        )}
      </Button>
    </form>
  )
}
```

---

#### `components/vote/vote-form.tsx`

Form untuk memilih kandidat.

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CandidateList } from '@/components/candidate/candidate-list'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { submitVote } from '@/app/actions/vote'
import type { Candidate } from '@/types/candidate'

interface VoteFormProps {
  candidates: Candidate[]
  onSuccess: () => void
}

export function VoteForm({ candidates, onSuccess }: VoteFormProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!selectedCandidate) return

    setError('')
    setLoading(true)

    const result = await submitVote(selectedCandidate.id)

    setLoading(false)

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Gagal submit vote')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Pilih Kandidat</h2>
        <CandidateList
          candidates={candidates}
          onSelectCandidate={setSelectedCandidate}
          selectedCandidateId={selectedCandidate?.id}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedCandidate || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim vote...
          </>
        ) : (
          'Kirim Vote'
        )}
      </Button>
    </div>
  )
}
```

---

#### `components/vote/vote-success.tsx`

Konfirmasi setelah vote berhasil.

```typescript
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function VoteSuccess() {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
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
```

---

### 3. Results Components

#### `components/results/vote-chart.tsx`

Bar chart untuk menampilkan hasil voting.

```typescript
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface VoteData {
  name: string
  vote_count: number
  percentage: number
}

interface VoteChartProps {
  data: VoteData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function VoteChart({ data }: VoteChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hasil Voting</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="vote_count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

---

#### `components/results/vote-stats.tsx`

Statistik hasil voting dalam card.

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'

interface VoteResultItem {
  id: string
  name: string
  photo_url: string
  order_number: number
  vote_count: number
  percentage: number
}

interface VoteStatsProps {
  results: VoteResultItem[]
}

export function VoteStats({ results }: VoteStatsProps) {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={result.photo_url}
                  alt={result.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge>#{result.order_number}</Badge>
                  <h3 className="font-bold">{result.name}</h3>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {result.vote_count} votes ({result.percentage}%)
                </p>
              </div>
            </div>
            
            <Progress value={result.percentage} className="h-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

#### `components/results/live-indicator.tsx`

Indicator bahwa data live/real-time.

```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

export function LiveIndicator() {
  return (
    <Badge variant="outline" className="gap-2">
      <Activity className="w-3 h-3 animate-pulse text-green-500" />
      <span>Live</span>
    </Badge>
  )
}
```

---

### 4. Layout Components

#### `components/layout/header.tsx`

Header aplikasi dengan navigation.

```typescript
import Link from 'next/link'
import { Vote } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Vote className="w-6 h-6" />
            <span className="font-bold text-xl">E-Vote IRMA</span>
          </Link>
          
          <nav className="flex gap-4">
            <Link 
              href="/candidates"
              className="hover:text-primary transition-colors"
            >
              Kandidat
            </Link>
            <Link 
              href="/vote"
              className="hover:text-primary transition-colors"
            >
              Vote
            </Link>
            <Link 
              href="/results"
              className="hover:text-primary transition-colors"
            >
              Hasil
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
```

---

#### `components/layout/footer.tsx`

Footer aplikasi.

```typescript
export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} E-Vote IRMA. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
```

---

### 5. Provider Components

#### `components/providers/toast-provider.tsx`

Toast notification provider.

```typescript
'use client'

import { Toaster } from '@/components/ui/toast'

export function ToastProvider() {
  return <Toaster />
}
```

---

## Component Usage Examples

### Example: Vote Page

```typescript
// app/vote/page.tsx
import { getCandidates } from '@/app/actions/candidates'
import { VoteForm } from '@/components/vote/vote-form'

export default async function VotePage() {
  const candidates = await getCandidates()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <VoteForm candidates={candidates} onSuccess={() => {}} />
    </div>
  )
}
```

### Example: Results Page

```typescript
// app/results/page.tsx
import { getVoteResults } from '@/app/actions/candidates'
import { VoteChart } from '@/components/results/vote-chart'
import { VoteStats } from '@/components/results/vote-stats'
import { LiveIndicator } from '@/components/results/live-indicator'

export default async function ResultsPage() {
  const results = await getVoteResults()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hasil Voting</h1>
        <LiveIndicator />
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <VoteChart data={results} />
        <VoteStats results={results} />
      </div>
    </div>
  )
}
```

---

## Styling Guidelines

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other shadcn colors
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### Global CSS Variables

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... other variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

---

## Accessibility Checklist

- [x] Semantic HTML tags
- [x] ARIA labels untuk interactive elements
- [x] Keyboard navigation support
- [x] Focus indicators yang jelas
- [x] Color contrast ratio yang baik (WCAG AA)
- [x] Screen reader friendly
- [x] Loading states yang clear
- [x] Error messages yang descriptive

---

## Performance Optimization

1. **Image Optimization**
   - Gunakan Next.js `Image` component
   - Lazy loading by default
   - Responsive images

2. **Code Splitting**
   - Dynamic imports untuk heavy components
   - Client components hanya saat diperlukan

3. **Caching**
   - Server-side caching dengan `unstable_cache`
   - Client-side cache dengan SWR/React Query (optional)

4. **Bundle Size**
   - Tree-shaking by default
   - Import hanya yang dibutuhkan dari Recharts

---

## Component Testing

```typescript
// Example test for CandidateCard
import { render, screen } from '@testing-library/react'
import { CandidateCard } from './candidate-card'

const mockCandidate = {
  id: '1',
  name: 'Test Candidate',
  photo_url: '/test.jpg',
  order_number: 1,
  vision: 'Test vision',
  mission: 'Test mission',
}

describe('CandidateCard', () => {
  it('renders candidate name', () => {
    render(<CandidateCard candidate={mockCandidate} />)
    expect(screen.getByText('Test Candidate')).toBeInTheDocument()
  })
  
  it('shows order number badge', () => {
    render(<CandidateCard candidate={mockCandidate} />)
    expect(screen.getByText('Kandidat 1')).toBeInTheDocument()
  })
})
```
