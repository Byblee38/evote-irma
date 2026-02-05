# Implementation Steps - E-Vote System

Panduan langkah-demi-langkah untuk membangun aplikasi E-Vote dari awal hingga deployment.

---

## Phase 1: Project Setup & Configuration

### Step 1.1: Initialize Project Structure

✅ **Already done** - Next.js project sudah ter-setup

Verify dengan:
```bash
cd /home/ubay/Project/vs-code/irma-evote
npm run dev
```

### Step 1.2: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# UI Libraries
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-slot
npm install @radix-ui/react-toast @radix-ui/react-progress @radix-ui/react-separator
npm install lucide-react
npm install recharts

# Utilities
npm install zod
npm install clsx tailwind-merge
npm install class-variance-authority

# Dev dependencies
npm install -D @types/node
```

### Step 1.3: Setup shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Pilih options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Generate components
npx shadcn@latest add button card input label dialog toast badge separator skeleton alert progress tabs
```

### Step 1.4: Setup Environment Variables

Buat file `.env.local`:

```bash
# Copy dari template
cp .env.example .env.local

# Edit .env.local dengan values dari Supabase
```

**File `.env.example`:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Phase 2: Supabase Setup

### Step 2.1: Create Supabase Project

1. Buka [https://supabase.com](https://supabase.com)
2. Create new project
3. Catat Project URL dan API Keys

### Step 2.2: Create Database Tables

Execute SQL di Supabase SQL Editor:

```sql
-- Lihat detail di doc/database-erd.md

-- 1. Create candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    vision TEXT NOT NULL,
    mission TEXT NOT NULL,
    order_number INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create tokens table
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    description TEXT
);

-- 3. Create votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    token_id UUID NOT NULL UNIQUE REFERENCES tokens(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT
);

-- 4. Create indexes
CREATE INDEX idx_candidates_order ON candidates(order_number);
CREATE UNIQUE INDEX idx_tokens_code ON tokens(token_code);
CREATE INDEX idx_tokens_is_used ON tokens(is_used);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE UNIQUE INDEX idx_votes_token_id ON votes(token_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

-- 5. Create view for results
CREATE OR REPLACE VIEW vote_results AS
SELECT 
    c.id,
    c.name,
    c.photo_url,
    c.order_number,
    COUNT(v.id) as vote_count,
    ROUND(
        (COUNT(v.id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM votes), 0)) * 100, 
        2
    ) as percentage
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
GROUP BY c.id, c.name, c.photo_url, c.order_number
ORDER BY c.order_number;

-- 6. Create submit_vote function
-- (Lihat lengkapnya di doc/database-erd.md)
```

### Step 2.3: Setup Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view candidates"
ON candidates FOR SELECT USING (true);

CREATE POLICY "Anyone can view vote counts"
ON votes FOR SELECT USING (true);
```

### Step 2.4: Enable Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

### Step 2.5: Insert Seed Data

```sql
-- Insert kandidat contoh
INSERT INTO candidates (name, photo_url, vision, mission, order_number) VALUES
('Kandidat 1: John & Jane', '/candidates/candidate-1.jpg', 'Visi 1...', 'Misi 1...', 1),
('Kandidat 2: Alice & Bob', '/candidates/candidate-2.jpg', 'Visi 2...', 'Misi 2...', 2),
('Kandidat 3: David & Emily', '/candidates/candidate-3.jpg', 'Visi 3...', 'Misi 3...', 3);

-- Generate 100 tokens
INSERT INTO tokens (token_code, description)
SELECT 
    'VOTE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(generate_series::TEXT, 6, '0'),
    'Token untuk pemilihan ' || TO_CHAR(CURRENT_DATE, 'YYYY')
FROM generate_series(1, 100);
```

### Step 2.6: Setup Supabase Storage (untuk foto)

1. Buka Storage di Supabase Dashboard
2. Create bucket `candidates` (public)
3. Upload foto kandidat

---

## Phase 3: Core Implementation

### Step 3.1: Setup Folder Structure

```bash
# Create directories
mkdir -p components/ui
mkdir -p components/candidate
mkdir -p components/vote
mkdir -p components/results
mkdir -p components/layout
mkdir -p components/providers
mkdir -p lib/supabase
mkdir -p lib/utils
mkdir -p lib/validations
mkdir -p types
mkdir -p hooks
mkdir -p app/actions
mkdir -p app/api/votes
mkdir -p app/\(main\)/candidates
mkdir -p app/\(main\)/vote
mkdir -p app/\(main\)/results
mkdir -p app/\(auth\)/verify-token
mkdir -p public/candidates
```

### Step 3.2: Create Supabase Clients

**File: `lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### Step 3.3: Create Type Definitions

**File: `types/database.ts`**
```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          vision: string
          mission: string
          order_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          photo_url?: string | null
          vision: string
          mission: string
          order_number: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          vision?: string
          mission?: string
          order_number?: number
          created_at?: string
          updated_at?: string
        }
      }
      // ... tokens & votes tables
    }
    Views: {
      vote_results: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          order_number: number
          vote_count: number
          percentage: number
        }
      }
    }
    Functions: {
      submit_vote: {
        Args: {
          p_token_code: string
          p_candidate_id: string
          p_ip_address?: string
        }
        Returns: Json
      }
    }
  }
}
```

**File: `types/candidate.ts`**
```typescript
export interface Candidate {
  id: string
  name: string
  photo_url: string | null
  vision: string
  mission: string
  order_number: number
  created_at: string
  updated_at: string
}
```

### Step 3.4: Create Utility Functions

**File: `lib/utils/cn.ts`**
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**File: `lib/validations/token.ts`**
```typescript
import { z } from 'zod'

export const tokenSchema = z.object({
  tokenCode: z.string()
    .min(1, 'Token tidak boleh kosong')
    .regex(/^VOTE-\d{4}-\d{6}$/, 'Format token tidak valid')
    .trim()
})

export type TokenInput = z.infer<typeof tokenSchema>
```

### Step 3.5: Implement Server Actions

Copy full implementation dari [doc/api-endpoints.md](doc/api-endpoints.md):

1. `app/actions/token.ts` - Token validation actions
2. `app/actions/vote.ts` - Vote submission actions
3. `app/actions/candidates.ts` - Candidates data actions

### Step 3.6: Create UI Components

Implement components dari [doc/ui-components.md](doc/ui-components.md):

**Candidate Components:**
1. `components/candidate/candidate-card.tsx`
2. `components/candidate/candidate-detail.tsx`
3. `components/candidate/candidate-list.tsx`

**Vote Components:**
1. `components/vote/token-input.tsx`
2. `components/vote/vote-form.tsx`
3. `components/vote/vote-success.tsx`

**Results Components:**
1. `components/results/vote-chart.tsx`
2. `components/results/vote-stats.tsx`
3. `components/results/live-indicator.tsx`

**Layout Components:**
1. `components/layout/header.tsx`
2. `components/layout/footer.tsx`

### Step 3.7: Create Pages

**File: `app/(main)/page.tsx`** - Landing page
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getCandidates, getTotalVotes } from '@/app/actions/candidates'

export default async function HomePage() {
  const candidates = await getCandidates()
  const totalVotes = await getTotalVotes()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Pemilihan Ketua & Wakil Ketua
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Gunakan hak suara Anda untuk memilih pemimpin terbaik
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Button asChild size="lg">
            <Link href="/candidates">Lihat Kandidat</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/vote">Mulai Vote</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-3xl font-bold">{candidates.length}</p>
            <p className="text-sm text-muted-foreground">Kandidat</p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <p className="text-3xl font-bold">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**File: `app/(main)/candidates/page.tsx`** - Kandidat list
```typescript
import { getCandidates } from '@/app/actions/candidates'
import { CandidateList } from '@/components/candidate/candidate-list'

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daftar Kandidat</h1>
      <CandidateList candidates={candidates} />
    </div>
  )
}
```

**File: `app/(main)/candidates/[id]/page.tsx`** - Detail kandidat
```typescript
import { getCandidateById } from '@/app/actions/candidates'
import { CandidateDetail } from '@/components/candidate/candidate-detail'
import { notFound } from 'next/navigation'

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const candidate = await getCandidateById(params.id)

  if (!candidate) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <CandidateDetail candidate={candidate} />
    </div>
  )
}
```

**File: `app/(main)/vote/page.tsx`** - Voting page
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TokenInput } from '@/components/vote/token-input'
import { VoteForm } from '@/components/vote/vote-form'
import { VoteSuccess } from '@/components/vote/vote-success'

// Will be completed with full implementation
```

**File: `app/(main)/results/page.tsx`** - Results page
```typescript
import { getVoteResults } from '@/app/actions/candidates'
import { VoteChart } from '@/components/results/vote-chart'
import { VoteStats } from '@/components/results/vote-stats'
import { LiveIndicator } from '@/components/results/live-indicator'

export const revalidate = 10 // Revalidate every 10 seconds

export default async function ResultsPage() {
  const results = await getVoteResults()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hasil Voting Real-Time</h1>
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

**File: `app/layout.tsx`** - Root layout
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ToastProvider } from '@/components/providers/toast-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'E-Vote IRMA',
  description: 'Sistem Pemungutan Suara Elektronik',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ToastProvider />
      </body>
    </html>
  )
}
```

---

## Phase 4: Real-time Implementation

### Step 4.1: Setup Real-time Hook

**File: `hooks/use-real-time-votes.ts`**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealTimeVotes() {
  const [votes, setVotes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('vote-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          // Trigger re-fetch
          fetchVotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchVotes = async () => {
    const { data } = await supabase.from('vote_results').select('*')
    setVotes(data || [])
  }

  return votes
}
```

### Step 4.2: Update Results Page

Add real-time updates ke results page dengan client component wrapper.

---

## Phase 5: Testing & Quality Assurance

### Step 5.1: Manual Testing Checklist

- [ ] Token validation (valid, invalid, expired, used)
- [ ] Vote submission (success, error cases)
- [ ] Real-time updates pada results page
- [ ] Kandidat display (list & detail)
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

### Step 5.2: Security Testing

- [ ] Token tidak bisa digunakan 2x
- [ ] Server-side validation works
- [ ] RLS policies active
- [ ] No sensitive data in client logs
- [ ] HTTPS in production

### Step 5.3: Performance Testing

- [ ] Page load times < 3s
- [ ] Images optimized
- [ ] Database queries efficient
- [ ] Real-time updates smooth

---

## Phase 6: Deployment

### Step 6.1: Prepare for Production

```bash
# Build test
npm run build

# Check for errors
npm run lint
```

### Step 6.2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard
```

### Step 6.3: Post-Deployment

1. Test production URL
2. Verify Supabase connection
3. Test full voting flow
4. Monitor error logs
5. Setup analytics (optional)

---

## Phase 7: Admin Panel (Optional)

### Step 7.1: Create Admin Routes

- `/admin/candidates` - Manage candidates
- `/admin/tokens` - Generate & manage tokens
- `/admin/votes` - View vote logs
- `/admin/results` - Export results

### Step 7.2: Authentication

Setup admin authentication dengan Supabase Auth atau simple password protection.

---

## Maintenance Checklist

### Regular Tasks

- [ ] Monitor vote counts
- [ ] Check error logs
- [ ] Database backup
- [ ] Token generation untuk voting events baru
- [ ] Update kandidat info
- [ ] Clear old voting data (after election)

### After Election

- [ ] Archive results
- [ ] Reset database untuk election berikutnya
- [ ] Update seed data
- [ ] Document lessons learned

---

## Troubleshooting Guide

### Common Issues

**1. Supabase Connection Error**
```
Solution: Check .env.local variables, verify Supabase project status
```

**2. Token Validation Fails**
```
Solution: Check RLS policies, verify token exists in database
```

**3. Real-time Not Working**
```
Solution: Verify Realtime enabled on votes table, check WebSocket connection
```

**4. Images Not Loading**
```
Solution: Check Supabase Storage bucket is public, verify image paths
```

**5. Build Errors**
```
Solution: Check TypeScript types, verify all imports, run npm install
```

---

## Next Steps After Completion

1. **Add Features:**
   - Vote scheduling (start/end times)
   - Email notifications
   - PDF results export
   - Voter analytics dashboard

2. **Enhance Security:**
   - IP-based rate limiting
   - Token expiration automation
   - Admin audit logs
   - Two-factor authentication for admin

3. **Improve UX:**
   - Dark mode toggle
   - Multiple language support
   - Animated transitions
   - PWA support (offline access)

4. **Scale:**
   - CDN for static assets
   - Database read replicas
   - Caching layer (Redis)
   - Load testing

---

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 1-2 hours | Setup & config |
| Phase 2 | 2-3 hours | Database setup |
| Phase 3 | 8-12 hours | Core implementation |
| Phase 4 | 2-3 hours | Real-time features |
| Phase 5 | 2-4 hours | Testing & QA |
| Phase 6 | 1-2 hours | Deployment |
| **Total** | **16-26 hours** | Full project |

---

**Ready to build? Start with Phase 1! 🚀**
