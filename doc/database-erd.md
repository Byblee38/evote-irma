# Database ERD - E-Vote System

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│       candidates            │
├─────────────────────────────┤
│ id (PK)          UUID        │
│ name             TEXT        │
│ photo_url        TEXT        │
│ vision           TEXT        │
│ mission          TEXT        │
│ order_number     INTEGER     │
│ created_at       TIMESTAMP   │
│ updated_at       TIMESTAMP   │
└─────────────────────────────┘
                │
                │ 1:N
                │
                ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│          votes              │         │          tokens             │
├─────────────────────────────┤         ├─────────────────────────────┤
│ id (PK)          UUID        │         │ id (PK)          UUID        │
│ candidate_id (FK) UUID       │─────────│ token_code       TEXT (UQ)  │
│ token_id (FK)    UUID        │   1:1   │ is_used          BOOLEAN    │
│ created_at       TIMESTAMP   │◄────────│ used_at          TIMESTAMP  │
│ ip_address       TEXT        │         │ created_at       TIMESTAMP  │
└─────────────────────────────┘         │ expires_at       TIMESTAMP  │
                                         │ description      TEXT        │
                                         └─────────────────────────────┘
```

## Database Schema

### Table: `candidates`

Menyimpan informasi kandidat ketua dan wakil ketua.

```sql
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

-- Index untuk performa
CREATE INDEX idx_candidates_order ON candidates(order_number);

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Columns:**
- `id`: Primary key (UUID)
- `name`: Nama lengkap kandidat
- `photo_url`: URL foto kandidat (stored in Supabase Storage)
- `vision`: Visi kandidat (text panjang)
- `mission`: Misi kandidat (text panjang)
- `order_number`: Urutan tampilan (1, 2, 3, ...)
- `created_at`: Timestamp pembuatan
- `updated_at`: Timestamp update terakhir

---

### Table: `tokens`

Menyimpan token voting yang dapat digunakan sekali.

```sql
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    description TEXT
);

-- Index untuk performa lookup
CREATE UNIQUE INDEX idx_tokens_code ON tokens(token_code);
CREATE INDEX idx_tokens_is_used ON tokens(is_used);

-- Check constraint
ALTER TABLE tokens 
ADD CONSTRAINT check_used_at_when_used 
CHECK (
    (is_used = true AND used_at IS NOT NULL) OR 
    (is_used = false AND used_at IS NULL)
);
```

**Columns:**
- `id`: Primary key (UUID)
- `token_code`: Kode token unik (misal: "VOTE-2024-XXXX")
- `is_used`: Status apakah token sudah digunakan
- `used_at`: Timestamp saat token digunakan
- `created_at`: Timestamp pembuatan token
- `expires_at`: Timestamp kadaluarsa (optional)
- `description`: Deskripsi/catatan token (misal: "Kelas 12-A")

---

### Table: `votes`

Menyimpan data voting yang telah dilakukan.

```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    token_id UUID NOT NULL UNIQUE REFERENCES tokens(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT
);

-- Index untuk performa
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE UNIQUE INDEX idx_votes_token_id ON votes(token_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

-- Constraint: Satu token hanya bisa vote sekali
ALTER TABLE votes 
ADD CONSTRAINT unique_token_vote 
UNIQUE (token_id);

-- Constraint: Pastikan token yang digunakan sudah di-mark sebagai used
-- (Ini akan di-handle di application logic)
```

**Columns:**
- `id`: Primary key (UUID)
- `candidate_id`: Foreign key ke `candidates.id`
- `token_id`: Foreign key ke `tokens.id` (UNIQUE - satu token hanya bisa vote 1x)
- `created_at`: Timestamp saat vote dilakukan
- `ip_address`: IP address pemilih (optional, untuk audit)

---

## Row Level Security (RLS) Policies

Untuk keamanan, kita akan menggunakan Supabase RLS:

### Candidates Table

```sql
-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read candidates
CREATE POLICY "Anyone can view candidates"
ON candidates FOR SELECT
USING (true);

-- Policy: Only authenticated admins can modify (if needed later)
-- CREATE POLICY "Only admins can modify candidates"
-- ON candidates FOR ALL
-- USING (auth.role() = 'admin');
```

### Tokens Table

```sql
-- Enable RLS
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Policy: No direct read access (hanya via API/Server Actions)
-- Tidak ada policy SELECT, semua akses via server-side only

-- Policy: No public insert/update/delete
-- Hanya service role yang bisa akses
```

### Votes Table

```sql
-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read vote counts (untuk real-time)
CREATE POLICY "Anyone can view vote counts"
ON votes FOR SELECT
USING (true);

-- Policy: No direct insert (hanya via Server Actions dengan validasi)
-- Insert akan dilakukan dari server dengan service role key
```

---

## Database Views

### View: `vote_results`

View untuk menampilkan hasil voting real-time:

```sql
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
```

**Usage:**
```sql
SELECT * FROM vote_results;
```

Returns:
```
id | name | photo_url | order_number | vote_count | percentage
---+------+-----------+--------------+------------+-----------
```

---

## Seed Data Example

### Sample Candidates

```sql
INSERT INTO candidates (name, photo_url, vision, mission, order_number) VALUES
(
    'Kandidat 1: John Doe & Jane Smith',
    '/candidates/candidate-1.jpg',
    'Menciptakan lingkungan sekolah yang inklusif, inovatif, dan berprestasi untuk semua siswa.',
    E'1. Meningkatkan fasilitas ekstrakurikuler\n2. Mengadakan program mentoring peer-to-peer\n3. Transparansi pengelolaan dana OSIS',
    1
),
(
    'Kandidat 2: Alice Wong & Bob Chen',
    '/candidates/candidate-2.jpg',
    'Membangun OSIS yang terbuka, responsif, dan menjadi wadah aspirasi seluruh siswa.',
    E'1. Digitalisasi layanan OSIS\n2. Program peduli lingkungan\n3. Kegiatan sosial rutin ke masyarakat',
    2
),
(
    'Kandidat 3: David Lee & Emily Park',
    '/candidates/candidate-3.jpg',
    'OSIS yang aktif, kreatif, dan menjadi teladan dalam prestasi akademik maupun non-akademik.',
    E'1. Event bulanan yang melibatkan semua siswa\n2. Kompetisi antar kelas\n3. Kerjasama dengan alumni',
    3
);
```

### Sample Tokens

```sql
-- Generate 100 tokens untuk voting
INSERT INTO tokens (token_code, description)
SELECT 
    'VOTE-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(generate_series::TEXT, 6, '0'),
    'Token untuk pemilihan ' || TO_CHAR(CURRENT_DATE, 'YYYY')
FROM generate_series(1, 100);
```

---

## Database Functions

### Function: `submit_vote`

Function untuk submit vote dengan validasi:

```sql
CREATE OR REPLACE FUNCTION submit_vote(
    p_token_code TEXT,
    p_candidate_id UUID,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_token_id UUID;
    v_token_is_used BOOLEAN;
    v_vote_id UUID;
BEGIN
    -- 1. Cek apakah token valid dan belum digunakan
    SELECT id, is_used INTO v_token_id, v_token_is_used
    FROM tokens
    WHERE token_code = p_token_code;

    IF v_token_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Token tidak valid'
        );
    END IF;

    IF v_token_is_used THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Token sudah digunakan'
        );
    END IF;

    -- 2. Cek apakah kandidat exist
    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Kandidat tidak ditemukan'
        );
    END IF;

    -- 3. Insert vote
    INSERT INTO votes (candidate_id, token_id, ip_address)
    VALUES (p_candidate_id, v_token_id, p_ip_address)
    RETURNING id INTO v_vote_id;

    -- 4. Update token sebagai used
    UPDATE tokens
    SET is_used = true, used_at = now()
    WHERE id = v_token_id;

    -- 5. Return success
    RETURN json_build_object(
        'success', true,
        'vote_id', v_vote_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage dari Server Action:**
```typescript
const result = await supabase.rpc('submit_vote', {
  p_token_code: tokenCode,
  p_candidate_id: candidateId,
  p_ip_address: ipAddress
})
```

---

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| candidates | `idx_candidates_order` | Fast ordering |
| tokens | `idx_tokens_code` | Fast token lookup |
| tokens | `idx_tokens_is_used` | Filter available tokens |
| votes | `idx_votes_candidate_id` | Aggregate vote counts |
| votes | `idx_votes_token_id` | Enforce uniqueness |
| votes | `idx_votes_created_at` | Time-based queries |

---

## Real-time Subscription Setup

Enable Supabase Realtime untuk tabel `votes`:

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
```

Client-side subscription:
```typescript
const subscription = supabase
  .channel('vote-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'votes'
  }, (payload) => {
    // Update UI dengan vote baru
  })
  .subscribe()
```

---

## Backup & Security Considerations

1. **Backup Strategy**: Enable Supabase automated backups
2. **Token Security**: Token hanya di-validate di server-side
3. **Rate Limiting**: Implement rate limiting pada API untuk mencegah spam
4. **Audit Trail**: `ip_address` di table votes untuk tracking
5. **Data Retention**: Consider adding TTL untuk data votes (optional)

---

## Migration Checklist

- [ ] Create `candidates` table
- [ ] Create `tokens` table
- [ ] Create `votes` table
- [ ] Setup foreign keys & constraints
- [ ] Create indexes
- [ ] Setup RLS policies
- [ ] Create `vote_results` view
- [ ] Create `submit_vote` function
- [ ] Enable Realtime on `votes`
- [ ] Insert seed data (candidates & tokens)
- [ ] Test all queries & functions
