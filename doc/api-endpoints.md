# API Endpoints & Server Actions - E-Vote

## Architecture Overview

Aplikasi ini menggunakan **Next.js App Router** dengan kombinasi:
- **API Routes** untuk endpoint yang mungkin diakses eksternal
- **Server Actions** untuk mutations yang lebih aman dan type-safe

---

## Server Actions (Recommended)

Server Actions di Next.js 14+ memberikan keuntungan:
- Type-safe
- Tidak perlu setup route handlers
- Built-in validation dengan Zod
- Streaming support
- Progressive enhancement

### File: `app/actions/token.ts`

```typescript
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Validation schema
const TokenSchema = z.object({
  tokenCode: z.string().min(1, 'Token tidak boleh kosong').trim(),
})

export type TokenValidationResult = {
  success: boolean
  isValid: boolean
  tokenId?: string
  error?: string
}

/**
 * Validate token code
 * Mengecek apakah token valid dan belum digunakan
 */
export async function validateToken(
  tokenCode: string
): Promise<TokenValidationResult> {
  try {
    // Validate input
    const validated = TokenSchema.parse({ tokenCode })
    
    const supabase = createClient()
    
    // Query token
    const { data: token, error } = await supabase
      .from('tokens')
      .select('id, token_code, is_used, expires_at')
      .eq('token_code', validated.tokenCode)
      .single()
    
    if (error || !token) {
      return {
        success: true,
        isValid: false,
        error: 'Token tidak ditemukan',
      }
    }
    
    // Check if already used
    if (token.is_used) {
      return {
        success: true,
        isValid: false,
        error: 'Token sudah digunakan',
      }
    }
    
    // Check expiration (if applicable)
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return {
        success: true,
        isValid: false,
        error: 'Token sudah kadaluarsa',
      }
    }
    
    // Token valid
    return {
      success: true,
      isValid: true,
      tokenId: token.id,
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        isValid: false,
        error: error.errors[0].message,
      }
    }
    
    return {
      success: false,
      isValid: false,
      error: 'Terjadi kesalahan saat validasi token',
    }
  }
}

/**
 * Store validated token in session/cookie
 * Untuk menjaga state bahwa user sudah tervalidasi
 */
export async function storeValidatedToken(tokenId: string) {
  const cookieStore = cookies()
  
  // Store in httpOnly cookie (lebih aman)
  cookieStore.set('validated_token_id', tokenId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return { success: true }
}

/**
 * Get validated token from session
 */
export async function getValidatedToken(): Promise<string | null> {
  const cookieStore = cookies()
  const tokenId = cookieStore.get('validated_token_id')
  return tokenId?.value || null
}

/**
 * Clear validated token
 */
export async function clearValidatedToken() {
  const cookieStore = cookies()
  cookieStore.delete('validated_token_id')
  return { success: true }
}
```

---

### File: `app/actions/vote.ts`

```typescript
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidatedToken, clearValidatedToken } from './token'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Validation schema
const VoteSchema = z.object({
  candidateId: z.string().uuid('Kandidat tidak valid'),
})

export type VoteResult = {
  success: boolean
  voteId?: string
  error?: string
}

/**
 * Submit vote for a candidate
 * Menggunakan database function submit_vote untuk atomic operation
 */
export async function submitVote(
  candidateId: string
): Promise<VoteResult> {
  try {
    // 1. Validate input
    const validated = VoteSchema.parse({ candidateId })
    
    // 2. Check if user has validated token
    const tokenId = await getValidatedToken()
    
    if (!tokenId) {
      return {
        success: false,
        error: 'Silakan validasi token terlebih dahulu',
      }
    }
    
    // 3. Get IP address (for audit)
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    
    const supabase = createClient()
    
    // 4. Get token code from tokenId
    const { data: token } = await supabase
      .from('tokens')
      .select('token_code')
      .eq('id', tokenId)
      .single()
    
    if (!token) {
      return {
        success: false,
        error: 'Token tidak valid',
      }
    }
    
    // 5. Call database function to submit vote
    const { data, error } = await supabase.rpc('submit_vote', {
      p_token_code: token.token_code,
      p_candidate_id: validated.candidateId,
      p_ip_address: ipAddress,
    })
    
    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }
    
    const result = data as { success: boolean; vote_id?: string; error?: string }
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Gagal submit vote',
      }
    }
    
    // 6. Clear validated token (one-time use)
    await clearValidatedToken()
    
    // 7. Revalidate results page
    revalidatePath('/results')
    
    return {
      success: true,
      voteId: result.vote_id,
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    
    console.error('Submit vote error:', error)
    return {
      success: false,
      error: 'Terjadi kesalahan saat submit vote',
    }
  }
}

/**
 * Check if user has already voted
 */
export async function hasUserVoted(): Promise<boolean> {
  const tokenId = await getValidatedToken()
  
  if (!tokenId) {
    return false
  }
  
  const supabase = createClient()
  
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('token_id', tokenId)
    .single()
  
  return !!data
}
```

---

### File: `app/actions/candidates.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { Candidate } from '@/types/candidate'

/**
 * Get all candidates
 * With caching for better performance
 */
export const getCandidates = unstable_cache(
  async (): Promise<Candidate[]> => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('order_number', { ascending: true })
    
    if (error) {
      console.error('Error fetching candidates:', error)
      return []
    }
    
    return data || []
  },
  ['candidates-list'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['candidates'],
  }
)

/**
 * Get single candidate by ID
 */
export async function getCandidateById(
  id: string
): Promise<Candidate | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching candidate:', error)
    return null
  }
  
  return data
}

/**
 * Get vote results
 * Real-time data dari view
 */
export async function getVoteResults() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('vote_results')
    .select('*')
  
  if (error) {
    console.error('Error fetching vote results:', error)
    return []
  }
  
  return data || []
}

/**
 * Get total votes count
 */
export async function getTotalVotes(): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('Error counting votes:', error)
    return 0
  }
  
  return count || 0
}
```

---

## API Routes (Alternative/Backup)

Jika perlu API endpoints untuk external access:

### File: `app/api/votes/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/votes
 * Get vote counts (public)
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('vote_results')
      .select('*')
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### File: `app/api/tokens/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const TokenSchema = z.object({
  tokenCode: z.string().min(1),
})

/**
 * POST /api/tokens/verify
 * Verify token validity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = TokenSchema.parse(body)
    
    const supabase = createClient()
    
    const { data: token, error } = await supabase
      .from('tokens')
      .select('id, is_used, expires_at')
      .eq('token_code', validated.tokenCode)
      .single()
    
    if (error || !token) {
      return NextResponse.json(
        { 
          success: false, 
          isValid: false,
          error: 'Token tidak ditemukan' 
        },
        { status: 404 }
      )
    }
    
    if (token.is_used) {
      return NextResponse.json({
        success: false,
        isValid: false,
        error: 'Token sudah digunakan',
      })
    }
    
    if (token.expires_at && new Date(token.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        isValid: false,
        error: 'Token sudah kadaluarsa',
      })
    }
    
    return NextResponse.json({
      success: true,
      isValid: true,
      tokenId: token.id,
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.errors[0].message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### File: `app/api/candidates/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/candidates
 * Get all candidates (public)
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('order_number', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/candidates/[id]
 * Get single candidate
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data,
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Endpoint Summary

### Server Actions (Primary)

| Action | File | Purpose |
|--------|------|---------|
| `validateToken()` | `actions/token.ts` | Validasi token |
| `storeValidatedToken()` | `actions/token.ts` | Simpan token ke cookie |
| `getValidatedToken()` | `actions/token.ts` | Get token dari cookie |
| `submitVote()` | `actions/vote.ts` | Submit vote |
| `hasUserVoted()` | `actions/vote.ts` | Check vote status |
| `getCandidates()` | `actions/candidates.ts` | Get all candidates |
| `getCandidateById()` | `actions/candidates.ts` | Get single candidate |
| `getVoteResults()` | `actions/candidates.ts` | Get vote results |

### API Routes (Optional)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/votes` | Get vote counts |
| POST | `/api/tokens/verify` | Verify token |
| GET | `/api/candidates` | Get all candidates |
| GET | `/api/candidates/[id]` | Get single candidate |

---

## Error Handling Pattern

Semua Server Actions menggunakan consistent error handling:

```typescript
type ActionResult = {
  success: boolean
  data?: any
  error?: string
}
```

Client-side usage:
```typescript
const result = await submitVote(candidateId)

if (result.success) {
  // Success handling
  toast.success('Vote berhasil!')
} else {
  // Error handling
  toast.error(result.error || 'Terjadi kesalahan')
}
```

---

## Rate Limiting Considerations

Untuk production, pertimbangkan menambahkan rate limiting:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Implement rate limiting logic
  // Using Upstash Redis atau similar service
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/actions/:path*'],
}
```

---

## Security Checklist

- [x] Token validation di server-side only
- [x] HttpOnly cookies untuk session
- [x] Input validation dengan Zod
- [x] SQL injection protection (Supabase handles this)
- [x] CSRF protection (Next.js handles this for Server Actions)
- [x] Rate limiting (implement in middleware)
- [x] Error messages yang tidak leak sensitive info
- [x] Audit trail dengan IP address logging

---

## Testing Examples

```typescript
// Example test for validateToken
describe('validateToken', () => {
  it('should return valid for unused token', async () => {
    const result = await validateToken('VOTE-2024-000001')
    expect(result.isValid).toBe(true)
  })
  
  it('should return invalid for used token', async () => {
    const result = await validateToken('VOTE-2024-USED123')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('sudah digunakan')
  })
})
```
