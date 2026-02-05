# E-Vote IRMA - Setup Instructions

## Langkah Selanjutnya

### 1. Setup Supabase

Anda perlu setup Supabase database terlebih dahulu:

1. **Buka** [https://supabase.com](https://supabase.com) dan login/sign up
2. **Create Project** baru
3. **Copy credentials** dari Settings > API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

4. **Update** file `.env.local` dengan credentials Anda

### 2. Setup Database Tables

Jalankan SQL berikut di Supabase SQL Editor:

\`\`\`sql
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

CREATE INDEX idx_candidates_order ON candidates(order_number);

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

CREATE UNIQUE INDEX idx_tokens_code ON tokens(token_code);
CREATE INDEX idx_tokens_is_used ON tokens(is_used);

-- 3. Create votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    token_id UUID NOT NULL UNIQUE REFERENCES tokens(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address TEXT
);

CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE UNIQUE INDEX idx_votes_token_id ON votes(token_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

-- 4. Create view for results
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

-- 5. Create submit_vote function
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
    SELECT id, is_used INTO v_token_id, v_token_is_used
    FROM tokens
    WHERE token_code = p_token_code;

    IF v_token_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Token tidak valid');
    END IF;

    IF v_token_is_used THEN
        RETURN json_build_object('success', false, 'error', 'Token sudah digunakan');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id) THEN
        RETURN json_build_object('success', false, 'error', 'Kandidat tidak ditemukan');
    END IF;

    INSERT INTO votes (candidate_id, token_id, ip_address)
    VALUES (p_candidate_id, v_token_id, p_ip_address)
    RETURNING id INTO v_vote_id;

    UPDATE tokens
    SET is_used = true, used_at = now()
    WHERE id = v_token_id;

    RETURN json_build_object('success', true, 'vote_id', v_vote_id);

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view candidates"
ON candidates FOR SELECT USING (true);

CREATE POLICY "Anyone can view vote counts"
ON votes FOR SELECT USING (true);

-- 7. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
\`\`\`

### 3. Insert Sample Data

\`\`\`sql
-- Kandidat
INSERT INTO candidates (name, photo_url, vision, mission, order_number) VALUES
('Kandidat 1: John Doe & Jane Smith', '/candidates/1.jpg', 
 'Menciptakan lingkungan sekolah yang inklusif dan inovatif', 
 E'1. Meningkatkan fasilitas ekstrakurikuler\\n2. Program mentoring\\n3. Transparansi dana OSIS', 1),
('Kandidat 2: Alice Wong & Bob Chen', '/candidates/2.jpg',
 'Membangun OSIS yang terbuka dan responsif', 
 E'1. Digitalisasi layanan OSIS\\n2. Program peduli lingkungan\\n3. Kegiatan sosial rutin', 2),
('Kandidat 3: David Lee & Emily Park', '/candidates/3.jpg',
 'OSIS yang aktif, kreatif, dan berprestasi', 
 E'1. Event bulanan melibatkan semua siswa\\n2. Kompetisi antar kelas\\n3. Kerjasama dengan alumni', 3);

-- Tokens (100 tokens)
INSERT INTO tokens (token_code, description)
SELECT 
    'VOTE-2026-' || LPAD(generate_series::TEXT, 6, '0'),
    'Token pemilihan 2026'
FROM generate_series(1, 100);
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Buka [http://localhost:3000](http://localhost:3000)

### 5. Test Voting

1. Buka halaman `/vote`
2. Masukkan token: `VOTE-2026-000001`
3. Pilih kandidat
4. Submit vote
5. Lihat hasil di `/results`

## Dokumentasi Lengkap

Lihat folder `doc/` untuk dokumentasi detail:
- `database-erd.md` - Schema database
- `api-endpoints.md` - API & Server Actions
- `ui-components.md` - Komponen UI
- `implementation-steps.md` - Panduan implementasi
- `environment-setup.md` - Setup environment

## Design

Design dibuat simpel dan minimalis dengan:
- Warna monochrome (grayscale)
- Typography yang clean
- Spacing yang konsisten
- No fancy animations
- Focus pada functionality

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Radix UI Components
- Recharts (Charts)
- Zod (Validation)
