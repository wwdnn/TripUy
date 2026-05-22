# FEATURES.md — TripUy

Dokumen ini berisi detail flow dan tracking pengembangan fitur TripUy.
Setiap fitur dijelaskan: tujuan, scope MVP, flow user, technical flow, dan checklist progress.

---

## Legend Status

- [ ] Belum dimulai
- [~] Sedang dikerjakan
- [x] Selesai

---

## 1. Authentication (MVP)

### 1.1 Tujuan
Memungkinkan user mendaftar, masuk, dan keluar dari aplikasi dengan aman, sehingga setiap trip dan expense dapat dikaitkan dengan identitas user yang valid.

### 1.2 Scope MVP

**Termasuk dalam MVP:**
- Register dengan email + password
- Login dengan email + password
- Login dengan Google OAuth
- Logout
- Session management (cookie-based via Better Auth)
- Protected route (redirect ke login jika belum auth)
- Basic profile (name, email, avatar)
- Email verification (opsional di MVP, tapi schema sudah disiapkan)

**Tidak termasuk MVP (future):**
- Forgot password / reset password
- Login GitHub
- Two-factor authentication (2FA)
- Magic link login
- Phone number login
- Onboarding wizard (welcome, tutorial)
- Edit profile lengkap (bio, preferences)

### 1.3 Entity / Data Model (Prisma)

Model utama yang dikelola Better Auth:

```
User
  id              String   @id
  name            String
  email           String   @unique
  emailVerified   Boolean  @default(false)
  image           String?
  createdAt       DateTime
  updatedAt       DateTime

Session
  id              String   @id
  userId          String
  token           String   @unique
  expiresAt       DateTime
  ipAddress       String?
  userAgent       String?

Account
  id              String   @id
  userId          String
  providerId      String   # "credential" | "google"
  accountId       String
  password        String?  # hanya untuk credential
  accessToken     String?
  refreshToken    String?

Verification
  id              String   @id
  identifier      String
  value           String
  expiresAt       DateTime
```

### 1.4 Halaman / Route

| Route | Tipe | Akses | Deskripsi |
|---|---|---|---|
| `/login` | Public | Guest only | Form login email/password + tombol Google |
| `/register` | Public | Guest only | Form register email/password |
| `/dashboard` | Protected | Authenticated | Halaman utama setelah login |
| `/api/auth/[...all]` | API | Public | Handler Better Auth (login, register, callback OAuth, dll) |

### 1.5 User Flow

#### A. Flow Register (Email + Password)
1. User membuka `/register`
2. User mengisi form: `name`, `email`, `password`, `confirmPassword`
3. Client-side: validasi Zod (email format, password min 8 char, password match)
4. Submit → call `authClient.signUp.email({ name, email, password })`
5. Better Auth membuat record `User` + `Account` (providerId: "credential")
6. Better Auth membuat session dan set cookie
7. Redirect ke `/dashboard`
8. Jika email sudah terdaftar → tampilkan error "Email sudah digunakan"

#### B. Flow Login (Email + Password)
1. User membuka `/login`
2. User mengisi form: `email`, `password`
3. Submit → call `authClient.signIn.email({ email, password })`
4. Better Auth verifikasi credential
5. Jika valid → buat session + set cookie → redirect ke `/dashboard`
6. Jika invalid → tampilkan error "Email atau password salah"

#### C. Flow Login (Google OAuth)
1. User klik tombol "Lanjut dengan Google" di `/login` atau `/register`
2. Call `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })`
3. Redirect ke Google OAuth consent screen
4. User approve → Google redirect balik ke `/api/auth/callback/google`
5. Better Auth:
   - Jika email belum ada → buat User baru + Account (providerId: "google")
   - Jika email sudah ada (credential) → link Account Google ke User existing
   - Buat session + set cookie
6. Redirect ke `/dashboard`

#### D. Flow Logout
1. User klik tombol Logout (di header/menu)
2. Call `authClient.signOut()`
3. Better Auth hapus session + clear cookie
4. Redirect ke `/login`

#### E. Flow Protected Route
1. User akses route protected (misal `/dashboard`, `/trips`)
2. Middleware Next.js cek session cookie
3. Jika tidak ada session valid → redirect ke `/login?redirect=<original-path>`
4. Jika ada session → lanjut render halaman
5. Setelah login berhasil dari redirect → kembali ke `original-path`

### 1.6 Technical Flow

**Stack auth:**
- Better Auth sebagai library utama
- Prisma adapter (PostgreSQL)
- Cookie-based session
- Middleware Next.js untuk route protection

**Struktur file:**
```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx
    (protected)/
      dashboard/page.tsx
      layout.tsx
    api/
      auth/
        [...all]/route.ts        # Better Auth handler
  features/
    auth/
      components/
        LoginForm.tsx
        RegisterForm.tsx
        GoogleSignInButton.tsx
        LogoutButton.tsx
      hooks/
        useSession.ts
        useSignIn.ts
        useSignUp.ts
        useSignOut.ts
      schemas/
        loginSchema.ts
        registerSchema.ts
      stores/
        useAuthStore.ts          # untuk current user UI state
  lib/
    auth/
      auth.ts                    # Better Auth server instance
      authClient.ts              # Better Auth client instance
  middleware.ts                  # Route protection
  types/
    auth.ts
```

**Session strategy:**
- Server Component: ambil session via `auth.api.getSession({ headers })`
- Client Component: ambil session via `authClient.useSession()` hook
- Middleware: cek session cookie, redirect jika tidak valid

**Validation:**
- Login schema: email valid + password min 8 char
- Register schema: name min 2 char, email valid, password min 8 char, confirmPassword match

**Error handling:**
- Form error ditampilkan di field terkait
- Network error → toast "Terjadi kesalahan, coba lagi"
- Credential salah → message generic "Email atau password salah" (jangan bocorkan mana yang salah)

### 1.7 Environment Variables Dibutuhkan

```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### 1.8 Acceptance Criteria MVP

- [ ] User dapat register dengan email + password
- [ ] User dapat login dengan email + password
- [ ] User dapat login dengan Google
- [ ] User yang sudah login otomatis redirect dari `/login` ke `/dashboard`
- [ ] User yang belum login tidak bisa akses `/dashboard`
- [ ] User dapat logout dan session terhapus
- [ ] Session persist setelah refresh browser
- [ ] Password disimpan ter-hash (bukan plain text)
- [ ] Form validation jalan di client dan server
- [ ] Error message user-friendly (tidak expose raw error)
- [ ] Mobile-friendly UI (tap area min 44px, layout nyaman 1 tangan)
- [ ] Dark mode support
- [ ] Responsive (mobile-first)

### 1.9 Checklist Implementasi

**Setup:**
- [ ] Install dependencies (`better-auth`, `@prisma/client`, `prisma`, `zod`)
- [ ] Setup Prisma schema (User, Session, Account, Verification)
- [ ] Run migration awal
- [ ] Setup `src/lib/auth/auth.ts` (server instance)
- [ ] Setup `src/lib/auth/authClient.ts` (client instance)
- [ ] Setup Google OAuth credential di Google Cloud Console
- [ ] Setup `.env.local` dengan semua variable auth

**API:**
- [ ] Buat handler `/api/auth/[...all]/route.ts`
- [ ] Buat middleware route protection di `src/middleware.ts`

**UI — Auth Pages:**
- [ ] Layout `(auth)` group
- [ ] Halaman `/login` + `LoginForm`
- [ ] Halaman `/register` + `RegisterForm`
- [ ] Component `GoogleSignInButton`
- [ ] Component `LogoutButton`

**Logic:**
- [ ] Schema validasi `loginSchema`, `registerSchema` (Zod)
- [ ] Hook `useSession`
- [ ] Store `useAuthStore` untuk current user
- [ ] Error handling konsisten

**Protected:**
- [ ] Layout `(protected)` group
- [ ] Halaman placeholder `/dashboard`

**QA:**
- [ ] Test flow register (sukses + email duplikat)
- [ ] Test flow login (sukses + credential salah)
- [ ] Test flow Google OAuth
- [ ] Test flow logout
- [ ] Test route protection (akses `/dashboard` saat logout)
- [ ] Test redirect setelah login
- [ ] Test session persist setelah refresh
- [ ] Test dark mode
- [ ] Test mobile layout

### 1.10 Status

**Current status:** Belum dimulai
**Target selesai:** TBD
**Catatan:** Fitur ini adalah prasyarat semua fitur lain (create trip, add expense, dll). Harus selesai terlebih dahulu sebelum lanjut ke fitur trip.

---

## Fitur Berikutnya (akan didetailkan setelah Authentication selesai)

- [ ] Create Trip / Room
- [ ] Invite Member via Kode / QR
- [ ] Join Trip
- [ ] Add Expense
- [ ] Split Expense Logic
- [ ] Balance Calculation
- [ ] Settlement Calculation
- [ ] Trip Summary
- [ ] User Profile
