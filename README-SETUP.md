# Setup E-Vote Application

## 1. Persiapan Database (Supabase)

### 1.1 Buat Project Supabase
1. Buka [supabase.com](https://supabase.com)
2. Sign up / Login
3. Klik **New Project**
4. Isi nama project dan password database
5. Pilih region terdekat
6. Tunggu project selesai dibuat

### 1.2 Ambil Environment Variables
1. Di dashboard project, buka **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Setup File `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Setup Database Schema

Buka **SQL Editor** di Supabase, copy semua SQL dari file [SETUP.md](./SETUP.md):

1. Jalankan **Table Definitions** (buat 3 tabel: tokens, candidates, votes)
2. Jalankan **Database Functions** (buat function `submit_vote`)
3. Jalankan **Views** (buat view `vote_results`)
4. Jalankan **RLS Policies** (Row Level Security)
5. Jalankan **Sample Data** (data kandidat contoh)

## 3. Jalankan Aplikasi

### Development Mode
```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:3000**

### Production Build
```bash
npm run build
npm start
```

## 4. Testing Flow

1. **Homepage** (`/`) - Lihat jumlah kandidat dan total suara
2. **Halaman Vote** (`/vote`)
   - Input token (contoh: `TOKEN-001`)
   - Pilih kandidat
   - Submit vote
3. **Halaman Kandidat** (`/candidates`) - Lihat semua kandidat
4. **Halaman Hasil** (`/results`) - Lihat hasil voting real-time

## 5. Generate Token Baru

Untuk testing, tambahkan token manual via SQL Editor:

```sql
INSERT INTO tokens (token_code, name, nik, is_used) 
VALUES ('TOKEN-004', 'Pemilih 4', '1234567890123404', false);
```

Atau buat script generate token massal (opsional).

## 6. Monitoring

- **Supabase Dashboard** → **Table Editor**: Lihat data real-time
- **Supabase Dashboard** → **Logs**: Monitor queries dan errors

## Troubleshooting

### Build Error
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error
- Cek `.env.local` sudah benar
- Pastikan Supabase project aktif
- Cek network/firewall

### Token Sudah Digunakan
```sql
-- Reset token untuk testing
UPDATE tokens SET is_used = false WHERE token_code = 'TOKEN-001';
DELETE FROM votes WHERE token_id = (SELECT id FROM tokens WHERE token_code = 'TOKEN-001');
```

---

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS (monochrome theme)
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Validation**: Zod
