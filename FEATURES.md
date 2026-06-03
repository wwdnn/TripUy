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

## 2. Create Trip / Room (MVP)

### 2.1 Tujuan
Memungkinkan user yang sudah login untuk membuat sebuah "trip" (room perjalanan) sebagai wadah utama bagi semua aktivitas: mencatat pengeluaran, mengundang member, menghitung balance, hingga settlement.

### 2.2 Scope MVP

**Termasuk dalam MVP:**
- User authenticated dapat membuat trip baru
- Form input: nama trip, deskripsi (opsional), tanggal mulai, tanggal selesai (opsional), mata uang default
- Auto-generate kode invite unik (untuk dipakai fitur invite di iterasi berikutnya)
- Creator otomatis menjadi member pertama dengan role `OWNER`
- Halaman list trip milik user (yang dibuat atau diikuti)
- Halaman detail trip (header info trip + placeholder untuk fitur lain)
- Edit trip (nama, deskripsi, tanggal, mata uang) — hanya OWNER
- Delete trip — hanya OWNER, dengan konfirmasi
- Status trip: `ACTIVE` (default) dan `ARCHIVED` (untuk trip yang sudah selesai)
- Archive / Unarchive trip — hanya OWNER

**Tidak termasuk MVP (future):**
- Invite member via kode / QR (fitur terpisah berikutnya)
- Upload cover image trip
- Kategori trip (liburan, kerja, dll)
- Multi-currency per expense
- Duplicate trip
- Transfer ownership ke member lain
- Trip template
- Trip privacy setting (public / private)

### 2.3 Entity / Data Model (Prisma)

```
Trip
  id              String   @id @default(cuid())
  name            String
  description     String?
  startDate       DateTime
  endDate         DateTime?
  currency        String   @default("IDR")
  inviteCode      String   @unique
  status          TripStatus @default(ACTIVE)
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])
  members         TripMember[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([createdById])
  @@index([status])

TripMember
  id              String   @id @default(cuid())
  tripId          String
  userId          String
  role            TripRole @default(MEMBER)
  joinedAt        DateTime @default(now())
  trip            Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id])

  @@unique([tripId, userId])
  @@index([userId])

enum TripStatus {
  ACTIVE
  ARCHIVED
}

enum TripRole {
  OWNER
  MEMBER
}
```

**Catatan:**
- `inviteCode` di-generate saat trip dibuat (misal 8 karakter alfanumerik), unik global
- Saat trip dibuat, otomatis insert 1 record `TripMember` dengan role `OWNER`
- `onDelete: Cascade` pada TripMember agar member ter-clean saat trip dihapus

### 2.4 Halaman / Route

| Route | Tipe | Akses | Deskripsi |
|---|---|---|---|
| `/trips` | Protected | Authenticated | List semua trip milik user |
| `/trips/new` | Protected | Authenticated | Form buat trip baru |
| `/trips/[id]` | Protected | Member only | Detail trip |
| `/trips/[id]/edit` | Protected | OWNER only | Form edit trip |
| `/api/trips` | API | Authenticated | GET (list), POST (create) |
| `/api/trips/[id]` | API | Member only | GET (detail), PATCH (update), DELETE |
| `/api/trips/[id]/archive` | API | OWNER only | POST archive/unarchive |

### 2.5 User Flow

#### A. Flow Create Trip
1. User di `/dashboard` atau `/trips` klik tombol "Buat Trip Baru"
2. Redirect ke `/trips/new`
3. User mengisi form: `name` (wajib), `description` (opsional), `startDate` (wajib), `endDate` (opsional), `currency` (default IDR)
4. Client-side: validasi Zod (name min 3 char, endDate >= startDate jika ada)
5. Submit → call `POST /api/trips`
6. Server:
   - Validasi ulang dengan Zod
   - Cek auth session
   - Generate `inviteCode` unik (retry jika collision)
   - Insert `Trip` + insert `TripMember` (role OWNER) dalam transaction
7. Response sukses → redirect ke `/trips/[id]`
8. Tampilkan toast "Trip berhasil dibuat"

#### B. Flow List Trip
1. User membuka `/trips`
2. Server Component fetch list trip via service: `getTripsByUserId(userId)`
3. Query mengambil semua trip yang user-nya jadi member, di-order berdasar `updatedAt DESC`
4. Tampilkan dalam card list (mobile-first):
   - Nama trip, tanggal, jumlah member, role user, status badge
5. Filter UI: tab "Aktif" | "Diarsipkan"
6. Empty state jika belum punya trip → CTA "Buat Trip Baru"

#### C. Flow Detail Trip
1. User klik salah satu trip di list → `/trips/[id]`
2. Server Component fetch detail trip via `getTripById(id, userId)`
3. Cek user adalah member dari trip tersebut, jika tidak → 404 / redirect
4. Tampilkan header: nama, tanggal, currency, jumlah member, kode invite (jika OWNER)
5. Section placeholder untuk fitur berikutnya (expense list, balance, dll)
6. Tombol aksi (kondisional berdasar role):
   - OWNER: Edit, Archive, Delete
   - MEMBER: hanya view + Leave trip (future)

#### D. Flow Edit Trip
1. OWNER klik tombol "Edit" di detail trip → `/trips/[id]/edit`
2. Form prefilled dengan data trip
3. Submit → `PATCH /api/trips/[id]`
4. Server validasi: user adalah OWNER, payload valid
5. Update record → redirect balik ke `/trips/[id]` + toast sukses

#### E. Flow Archive Trip
1. OWNER klik tombol "Arsipkan" di detail trip
2. Tampilkan konfirmasi (bottom sheet di mobile)
3. Confirm → `POST /api/trips/[id]/archive`
4. Server set `status = ARCHIVED`
5. Refresh data → trip pindah ke tab "Diarsipkan"

#### F. Flow Delete Trip
1. OWNER klik tombol "Hapus" di detail trip
2. Tampilkan konfirmasi dengan input ketik ulang nama trip
3. Confirm → `DELETE /api/trips/[id]`
4. Server validasi: user adalah OWNER
5. Hapus trip (cascade hapus TripMember)
6. Redirect ke `/trips` + toast "Trip telah dihapus"

### 2.6 Technical Flow

**Stack:**
- Server Component untuk list & detail (initial fetch)
- Client Component untuk form (interaction)
- React Query untuk mutation (create, update, archive, delete)
- Zod untuk validation di client & server
- Prisma transaction saat create (Trip + TripMember atomik)

**Struktur file:**
```
src/
  app/
    (protected)/
      trips/
        page.tsx                   # List trip
        new/page.tsx               # Create form
        [id]/
          page.tsx                 # Detail
          edit/page.tsx            # Edit form
    api/
      trips/
        route.ts                   # GET list, POST create
        [id]/
          route.ts                 # GET, PATCH, DELETE
          archive/route.ts         # POST archive/unarchive
  features/
    trip/
      components/
        TripCard.tsx
        TripList.tsx
        TripForm.tsx               # Reusable create + edit
        TripHeader.tsx
        TripEmptyState.tsx
        TripStatusBadge.tsx
        TripActionsMenu.tsx
        DeleteTripDialog.tsx
        ArchiveTripDialog.tsx
      hooks/
        useCreateTrip.ts
        useUpdateTrip.ts
        useDeleteTrip.ts
        useArchiveTrip.ts
      schemas/
        tripSchema.ts              # createTripSchema, updateTripSchema
      services/
        createTrip.ts
        getTripById.ts
        getTripsByUserId.ts
        updateTrip.ts
        deleteTrip.ts
        archiveTrip.ts
        generateInviteCode.ts
      stores/
        useTripUiStore.ts          # UI state: active tab, filter, dll
  lib/
    api/
      trip/
        createTrip.ts              # Client fetch wrapper
        getTrips.ts
        updateTrip.ts
        deleteTrip.ts
        archiveTrip.ts
  types/
    trip.ts                        # Trip, TripMember, TripRole, TripStatus
```

**Validation (Zod):**
- `createTripSchema`: name (min 3, max 60), description (max 500, optional), startDate (date), endDate (date, optional, >= startDate), currency (3 char ISO)
- `updateTripSchema`: semua field optional, partial update

**Authorization rules:**
- Semua endpoint cek session (`auth.api.getSession`)
- GET detail: user harus member dari trip
- PATCH / DELETE / Archive: user harus OWNER
- Helper service `assertTripOwner(tripId, userId)` dan `assertTripMember(tripId, userId)`

**Invite code generation:**
- 8 karakter, alfanumerik uppercase (exclude ambigu: 0, O, I, 1)
- Loop generate sampai unik di database (max retry 5x)
- Disimpan di Trip, dipakai untuk fitur invite di iterasi berikutnya

**Error handling:**
- 401 jika belum login
- 403 jika bukan OWNER untuk aksi sensitif
- 404 jika trip tidak ada atau user bukan member
- 422 jika validation gagal
- Pesan user-friendly: "Trip tidak ditemukan", "Anda tidak memiliki akses ke trip ini"

### 2.7 Acceptance Criteria MVP

- [ ] User authenticated dapat membuat trip baru via form
- [ ] Creator otomatis menjadi OWNER dan member pertama
- [ ] Invite code ter-generate unik saat trip dibuat
- [ ] User dapat melihat list trip yang diikuti
- [ ] User dapat melihat detail trip (jika member)
- [ ] User bukan member tidak bisa akses detail trip
- [ ] OWNER dapat edit data trip
- [ ] OWNER dapat archive / unarchive trip
- [ ] OWNER dapat menghapus trip dengan konfirmasi
- [ ] MEMBER (non-OWNER) tidak melihat tombol edit/delete/archive
- [ ] Validation form jalan di client dan server
- [ ] Empty state tampil saat user belum punya trip
- [ ] Filter tab Aktif / Diarsipkan berfungsi
- [ ] Mobile-friendly (tap area ≥ 44px, sticky CTA di form)
- [ ] Dark mode support
- [ ] Responsive (mobile-first)
- [ ] Loading state dan error state konsisten

### 2.8 Checklist Implementasi

**Database:**
- [ ] Tambah model `Trip`, `TripMember` di Prisma schema
- [ ] Tambah enum `TripStatus`, `TripRole`
- [ ] Tambah relasi ke `User`
- [ ] Run migration

**Types & Schema:**
- [ ] Buat `src/types/trip.ts`
- [ ] Buat `createTripSchema`, `updateTripSchema` (Zod)

**Service Layer:**
- [ ] `createTrip` (dengan transaction Trip + TripMember)
- [ ] `getTripById` (dengan assert member)
- [ ] `getTripsByUserId` (filter by status)
- [ ] `updateTrip` (dengan assert OWNER)
- [ ] `deleteTrip` (dengan assert OWNER)
- [ ] `archiveTrip` (toggle status, assert OWNER)
- [ ] `generateInviteCode` (helper unik)
- [ ] Helper `assertTripOwner`, `assertTripMember`

**API Routes:**
- [ ] `GET /api/trips`
- [ ] `POST /api/trips`
- [ ] `GET /api/trips/[id]`
- [ ] `PATCH /api/trips/[id]`
- [ ] `DELETE /api/trips/[id]`
- [ ] `POST /api/trips/[id]/archive`

**UI Pages:**
- [ ] `/trips` list page (Server Component)
- [ ] `/trips/new` create page
- [ ] `/trips/[id]` detail page (Server Component)
- [ ] `/trips/[id]/edit` edit page

**Components:**
- [ ] `TripCard`
- [ ] `TripList` + tab filter
- [ ] `TripForm` (reusable create + edit)
- [ ] `TripHeader`
- [ ] `TripEmptyState`
- [ ] `TripStatusBadge`
- [ ] `TripActionsMenu`
- [ ] `DeleteTripDialog` (confirm ketik nama)
- [ ] `ArchiveTripDialog`

**Hooks:**
- [ ] `useCreateTrip` (React Query mutation)
- [ ] `useUpdateTrip`
- [ ] `useDeleteTrip`
- [ ] `useArchiveTrip`

**Store:**
- [ ] `useTripUiStore` (active tab filter)

**QA:**
- [ ] Test create trip sukses
- [ ] Test create trip dengan validation error
- [ ] Test list trip (member, OWNER, empty)
- [ ] Test detail trip oleh non-member (harus 404)
- [ ] Test edit oleh non-OWNER (harus 403)
- [ ] Test archive & unarchive
- [ ] Test delete dengan konfirmasi
- [ ] Test invite code unik (tidak collision)
- [ ] Test dark mode di semua halaman trip
- [ ] Test mobile layout (form, list, detail)

### 2.9 Status

**Current status:** Belum dimulai
**Target selesai:** TBD
**Catatan:** Fitur ini bergantung pada [Authentication](#1-authentication-mvp) yang harus selesai terlebih dahulu. Hasil fitur ini menjadi prasyarat untuk fitur Invite Member, Add Expense, Balance, dan Settlement.

---

## Fitur Berikutnya (akan didetailkan setelah Create Trip selesai)

- [ ] Invite Member via Kode / QR
- [ ] Join Trip
- [ ] Add Expense
- [ ] Split Expense Logic
- [ ] Balance Calculation
- [ ] Settlement Calculation
- [ ] Trip Summary
- [ ] User Profile
