# Project Structure - E-Vote Website

## Folder dan File Structure

```
irma-evote/
├── app/
│   ├── (auth)/
│   │   └── verify-token/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── candidates/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── vote/
│   │   │   └── page.tsx
│   │   └── results/
│   │       └── page.tsx
│   ├── api/
│   │   ├── votes/
│   │   │   └── route.ts
│   │   ├── tokens/
│   │   │   └── verify/
│   │   │       └── route.ts
│   │   └── candidates/
│   │       └── route.ts
│   ├── actions/
│   │   ├── vote.ts
│   │   ├── token.ts
│   │   └── candidates.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── candidate/
│   │   ├── candidate-card.tsx
│   │   ├── candidate-detail.tsx
│   │   └── candidate-list.tsx
│   ├── vote/
│   │   ├── token-input.tsx
│   │   ├── vote-form.tsx
│   │   └── vote-success.tsx
│   ├── results/
│   │   ├── vote-chart.tsx
│   │   ├── vote-stats.tsx
│   │   └── live-indicator.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   └── providers/
│       ├── toast-provider.tsx
│       └── supabase-provider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── format.ts
│   ├── validations/
│   │   ├── token.ts
│   │   └── vote.ts
│   └── constants.ts
├── types/
│   ├── database.ts
│   ├── candidate.ts
│   ├── vote.ts
│   └── token.ts
├── hooks/
│   ├── use-toast.ts
│   ├── use-real-time-votes.ts
│   └── use-token-validation.ts
├── public/
│   ├── candidates/              # Foto kandidat
│   │   └── ...
│   └── ...
├── doc/
│   ├── initial.md
│   ├── project-structure.md
│   ├── database-erd.md
│   ├── api-endpoints.md
│   ├── ui-components.md
│   ├── implementation-steps.md
│   └── environment-setup.md
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.local
├── .env.example
├── .gitignore
├── components.json             # shadcn/ui config
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Penjelasan Struktur

### `/app` Directory

#### Route Groups
- `(auth)` - Halaman authentikasi token
- `(main)` - Halaman utama aplikasi

#### Pages
- **`/`** - Landing page dengan overview
- **`/verify-token`** - Halaman input token
- **`/candidates`** - Daftar kandidat
- **`/candidates/[id]`** - Detail kandidat (visi & misi)
- **`/vote`** - Halaman voting (protected)
- **`/results`** - Real-time hasil voting

#### API Routes
- **`/api/votes`** - CRUD operations untuk votes
- **`/api/tokens/verify`** - Verifikasi token
- **`/api/candidates`** - Fetch data kandidat

#### Server Actions
- **`actions/vote.ts`** - Submit vote action
- **`actions/token.ts`** - Validate & mark token as used
- **`actions/candidates.ts`** - Fetch candidates data

### `/components` Directory

#### `ui/` - Base Components
Komponen dasar dari shadcn/ui yang akan di-generate

#### Feature Components
- **`candidate/`** - Komponen untuk menampilkan kandidat
- **`vote/`** - Komponen untuk proses voting
- **`results/`** - Komponen untuk menampilkan hasil
- **`layout/`** - Komponen layout global

#### `providers/`
Context providers untuk global state management

### `/lib` Directory

#### `supabase/`
- **`client.ts`** - Supabase client untuk client-side
- **`server.ts`** - Supabase client untuk server-side
- **`types.ts`** - Type definitions dari database

#### `utils/`
Utility functions (cn untuk className merging, format functions, etc)

#### `validations/`
Zod schemas untuk validasi data

### `/types` Directory
TypeScript type definitions untuk semua entities

### `/hooks` Directory
Custom React hooks untuk logic reusability

### `/supabase` Directory
Database migrations dan seed data

## Naming Conventions

- **Files**: kebab-case (`candidate-card.tsx`)
- **Components**: PascalCase (`CandidateCard`)
- **Functions**: camelCase (`validateToken`)
- **Types/Interfaces**: PascalCase (`CandidateType`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VOTES`)

## Import Order Convention

```typescript
// 1. React & Next.js
import { useState } from 'react'
import Link from 'next/link'

// 2. External packages
import { Card } from '@/components/ui/card'

// 3. Internal components
import { CandidateCard } from '@/components/candidate/candidate-card'

// 4. Utils & lib
import { cn } from '@/lib/utils/cn'

// 5. Types
import type { Candidate } from '@/types/candidate'

// 6. Styles (if any)
import './styles.css'
```

## Notes

- Gunakan **Server Components** by default
- Client Components hanya untuk interactivity (`'use client'`)
- Server Actions untuk mutations
- Implement proper error boundaries
- Use TypeScript strict mode
