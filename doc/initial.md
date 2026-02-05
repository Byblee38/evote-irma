# E-Vote Website Project Plan

## 1. Gambaran Umum Proyek

Website **E-Vote** adalah aplikasi pemungutan suara elektronik yang bertujuan untuk memfasilitasi proses pemilihan ketua dan wakil ketua secara **aman**, **transparan**, dan **real-time**.

Aplikasi ini dirancang untuk mencegah kecurangan seperti **double vote**, menyediakan **informasi lengkap kandidat**, serta menampilkan **hasil perolehan suara secara langsung** dalam bentuk visual.

---

## 2. Fitur Utama

### 2.1 Informasi Kandidat

* Menampilkan daftar **Calon Ketua dan Wakil Ketua**
* Setiap kandidat memiliki:

  * Nama
  * Foto
  * Visi
  * Misi

### 2.2 Sistem E-Vote Berbasis Token

* Setiap pemilih harus memasukkan **token unik** sebelum melakukan voting
* Token hanya dapat digunakan **satu kali**
* Token berfungsi untuk:

  * Mencegah double vote
  * Mengontrol validitas pemilih

Alur singkat:

1. Pemilih memasukkan token
2. Sistem memverifikasi token
3. Jika valid → pemilih dapat memilih
4. Token ditandai sebagai *used*

### 2.3 Real Count (Hasil Voting Real-Time)

* Menampilkan hasil voting secara langsung
* Bentuk visual:

  * Diagram persentase (bar / pie chart)
* Data diperbarui otomatis setelah ada vote masuk

---

## 3. Tech Stack

### 3.1 Frontend

* **Framework**: Next.js (App Router)
* **Bahasa**: TypeScript
* **Styling**: Tailwind CSS
* **UI Components**: Radix UI

### 3.2 Backend & Database

* **Backend as a Service**: Supabase
* **Database**: PostgreSQL (via Supabase)
* **Auth / Security**:

  * Validasi token voting
  * Database constraint untuk mencegah duplikasi vote

---

## 4. Struktur Data (High Level)

### 4.1 Tabel `candidates`

* id
* name
* photo_url
* vision
* mission

### 4.2 Tabel `tokens`

* id
* token_code
* is_used (boolean)
* used_at (timestamp)

### 4.3 Tabel `votes`

* id
* candidate_id
* token_id
* created_at

---

## 5. Flow Aplikasi

1. User membuka website
2. User melihat daftar kandidat + visi misi
3. User masuk ke halaman voting
4. User memasukkan token
5. Sistem validasi token
6. User memilih kandidat
7. Vote tersimpan ke database
8. Real count langsung ter-update

---

## 6. Catatan Teknis untuk AI Agent

* Gunakan **TypeScript strict mode**
* Gunakan **Server Actions / API Route** untuk proses voting
* Validasi token dilakukan di server (bukan client)
* Setelah vote berhasil:

  * Insert ke tabel `votes`
  * Update `tokens.is_used = true`
* Real-time update dapat menggunakan:

  * Supabase Realtime
  * atau re-fetch berkala (polling)

---

## 7. Tujuan Akhir

* Sistem voting yang aman dan sederhana
* UI bersih dan mudah digunakan
* Data transparan dan real-time
* Mudah dikembangkan untuk skala lebih besar di masa depan

---

**Dokumen ini dirancang sebagai instruksi utama untuk AI Agent dalam mengeksekusi pembangunan website E-Vote.**
