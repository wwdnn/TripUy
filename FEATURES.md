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

## 3. Invite Member via Kode / QR (MVP)

### 3.1 Tujuan
Memungkinkan OWNER (dan kelak member lain yang diizinkan) mengundang orang lain ke dalam sebuah trip secara mudah, baik dengan membagikan **kode invite**, **link invite**, maupun **QR code**, sehingga orang yang diundang dapat melihat preview trip sebelum bergabung.

> Catatan ruang lingkup: fitur ini fokus pada **sisi mengundang dan membagikan** (generate, regenerate, share, preview trip dari kode). Proses **bergabung** (menjadi member baru) didetailkan pada fitur terpisah [Join Trip](#fitur-berikutnya-akan-didetailkan-setelah-invite-member-selesai), namun endpoint preview-by-code di sini menjadi prasyarat agar Join Trip bisa menampilkan info trip sebelum konfirmasi.

### 3.2 Scope MVP

**Termasuk dalam MVP:**
- Menampilkan kode invite trip (sudah di-generate saat trip dibuat) di halaman detail / panel invite
- Salin kode invite ke clipboard
- Membagikan **link invite** berisi kode (mis. `/join/<inviteCode>`) + tombol copy link
- Menampilkan **QR code** yang merepresentasikan link invite (generate di client)
- Regenerate kode invite — hanya OWNER (kode lama langsung tidak berlaku)
- Preview trip berdasarkan kode invite (endpoint publik-terbatas untuk dikonsumsi Join Trip): nama trip, jumlah member, tanggal, currency — tanpa data sensitif
- Web Share API di mobile (share link via aplikasi lain) dengan fallback copy
- Panel "Kelola Undangan" hanya untuk OWNER

**Tidak termasuk MVP (future):**
- Eksekusi join / menambah member (ada di fitur Join Trip)
- Invite via email / kirim notifikasi undangan
- Multiple invite link dengan token & masa berlaku berbeda
- Invite link dengan limit pemakaian (max uses)
- Expiry / kadaluarsa otomatis kode invite
- Role khusus saat invite (mis. langsung sebagai CO-OWNER)
- Approval request join (OWNER menyetujui sebelum member masuk)
- Riwayat / audit log undangan

### 3.3 Entity / Data Model (Prisma)

Fitur ini **tidak menambah tabel baru**. Memanfaatkan field `inviteCode` yang sudah ada di model `Trip`:

```
Trip
  ...
  inviteCode  String @unique   # sudah ada — dipakai untuk invite & join
```

**Catatan:**
- Regenerate hanya meng-update nilai `inviteCode` pada record `Trip` (tetap unik global, retry jika collision) sehingga kode lama otomatis invalid.
- Tidak ada perubahan migration untuk MVP fitur ini.
- (Future) jika butuh multiple link / expiry / max-uses, baru ditambahkan tabel `TripInvite` terpisah.

### 3.4 Halaman / Route

| Route | Tipe | Akses | Deskripsi |
|---|---|---|---|
| `/trips/[id]` | Protected | Member only | Detail trip — menampilkan panel invite (full untuk OWNER) |
| `/join/[code]` | Protected | Authenticated | Halaman preview trip dari kode + tombol "Gabung" (aksi join di fitur Join Trip) |
| `/api/trips/[id]/invite` | API | OWNER only | `POST` regenerate kode invite |
| `/api/trips/invite/[code]` | API | Authenticated | `GET` preview trip dari kode invite (data ringkas, non-sensitif) |

> Catatan: endpoint preview diletakkan di bawah `/api/trips/invite/[code]` (bukan `/api/trips/[id]`) karena pengakses belum tentu member dan hanya tahu kode, bukan `id`.

### 3.5 User Flow

#### A. Flow Menampilkan & Membagikan Invite (OWNER)
1. OWNER membuka `/trips/[id]`
2. Pada panel "Undang Member" tampil: kode invite, link invite, dan QR code
3. OWNER dapat:
   - Klik "Salin kode" → kode tersalin ke clipboard + toast "Kode disalin"
   - Klik "Salin link" → link `${NEXT_PUBLIC_APP_URL}/join/<code>` tersalin
   - Klik "Bagikan" (mobile) → buka Web Share API; fallback copy link bila tidak didukung
   - Melihat QR code untuk discan langsung

#### B. Flow Regenerate Kode (OWNER)
1. OWNER klik "Buat ulang kode" di panel invite
2. Tampilkan konfirmasi (bottom sheet di mobile): "Kode lama akan berhenti berlaku"
3. Confirm → `POST /api/trips/[id]/invite`
4. Server: assert OWNER → `generateInviteCode()` → update `Trip.inviteCode`
5. Refresh data → kode, link, dan QR ter-update + toast "Kode invite diperbarui"

#### C. Flow Preview Trip dari Kode (calon member)
1. Orang yang diundang membuka link `/join/<code>` atau memasukkan kode di halaman join
2. Jika belum login → redirect ke `/login?redirect=/join/<code>`
3. Setelah login → halaman fetch `GET /api/trips/invite/<code>`
4. Server cari trip by `inviteCode`:
   - Tidak ada → 404 "Kode undangan tidak valid"
   - Trip `ARCHIVED` → 409 "Trip ini sudah diarsipkan"
   - Valid → kembalikan data ringkas (nama, tanggal, currency, jumlah member, nama OWNER)
5. Tampilkan preview trip + status keanggotaan:
   - Sudah member → tampilkan "Kamu sudah tergabung" + tombol "Buka trip"
   - Belum member → tombol "Gabung ke trip" (aksi join → fitur Join Trip)

### 3.6 Technical Flow

**Stack:**
- Server Component untuk halaman `/join/[code]` (initial preview fetch)
- Client Component untuk panel invite (copy, share, QR, regenerate interaction)
- React Query untuk mutation regenerate
- QR digenerate di client (butuh konfirmasi penambahan dependency, lihat 3.7)
- Reuse helper `generateInviteCode`, `getSessionUser`, `assertTripAccess`, dan format response `ok/created/fail/handleApiError`

**Struktur file:**
```
src/
  app/
    (protected)/
      trips/
        [id]/page.tsx              # sisipkan <TripInvitePanel /> (sudah ada)
      join/
        [code]/page.tsx            # preview trip dari kode (Server Component)
    api/
      trips/
        [id]/
          invite/route.ts          # POST regenerate kode (OWNER only)
        invite/
          [code]/route.ts          # GET preview trip by kode
  features/
    trip/
      components/
        TripInvitePanel.tsx        # kode + link + QR + tombol (OWNER full, member view)
        InviteCodeDisplay.tsx      # tampilan + copy kode
        InviteQrCode.tsx           # render QR dari link
        ShareInviteButton.tsx      # Web Share API + fallback
        RegenerateInviteDialog.tsx # konfirmasi regenerate
        JoinTripPreview.tsx        # kartu preview trip di /join/[code]
      hooks/
        useRegenerateInvite.ts     # React Query mutation
        useCopyToClipboard.ts      # helper copy + state "copied"
      services/
        regenerateInviteCode.ts    # assert OWNER + generate + update
        getTripByInviteCode.ts     # preview ringkas by kode
  lib/
    api/
      trip/
        regenerateInvite.ts        # client fetch wrapper
        getTripByInviteCode.ts     # client fetch wrapper
  types/
    trip.ts                        # tambah TripInvitePreview
```

**Tambahan tipe (`src/types/trip.ts`):**
```
export interface TripInvitePreview {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
  currency: string;
  status: TripStatus;
  memberCount: number;
  ownerName: string;
  isAlreadyMember: boolean;
}
```

**Authorization rules:**
- `POST /api/trips/[id]/invite` (regenerate): wajib login + assert OWNER (`assertTripAccess` role OWNER)
- `GET /api/trips/invite/[code]` (preview): wajib login; tidak harus member, tapi response hanya data ringkas non-sensitif (tanpa list expense / member detail)
- Jangan kembalikan `inviteCode` trip lain atau data internal di preview

**Invite link & QR:**
- Link dibentuk dari `NEXT_PUBLIC_APP_URL` + `/join/<inviteCode>` (jangan hardcode origin)
- QR code merepresentasikan link invite (bukan hanya kode mentah) agar bisa langsung dibuka
- QR digenerate sepenuhnya di client (tidak perlu endpoint server)

**Error handling:**
- 401 jika belum login
- 403 jika regenerate dilakukan non-OWNER
- 404 jika kode invite tidak ditemukan → "Kode undangan tidak valid"
- 409 jika trip sudah `ARCHIVED` → "Trip ini sudah diarsipkan"
- Copy/Share gagal → fallback tampilkan kode + toast, jangan crash

### 3.7 Dependencies & Environment

**Environment Variables:**
```
NEXT_PUBLIC_APP_URL   # untuk membentuk link invite & isi QR
```

**Dependency baru (sudah dikonfirmasi):**
- `qrcode.react` — komponen React siap pakai untuk render QR di client (dipilih). Install saat tahap implementasi dimulai.

### 3.8 Acceptance Criteria MVP

- [ ] OWNER melihat kode invite di panel detail trip
- [ ] OWNER dapat menyalin kode invite ke clipboard
- [ ] OWNER dapat menyalin link invite (`/join/<code>`)
- [ ] Link invite dibentuk dari `NEXT_PUBLIC_APP_URL` (tidak hardcode)
- [ ] QR code tampil dan merepresentasikan link invite
- [ ] Tombol "Bagikan" memakai Web Share API di mobile dengan fallback copy
- [ ] OWNER dapat regenerate kode; kode lama langsung tidak berlaku
- [ ] Non-OWNER tidak melihat tombol regenerate (403 jika dipaksa via API)
- [ ] Calon member dapat membuka `/join/<code>` dan melihat preview trip
- [ ] Kode tidak valid menampilkan pesan "Kode undangan tidak valid"
- [ ] Trip yang diarsipkan tidak bisa di-preview untuk join (409)
- [ ] User yang sudah member melihat status "sudah tergabung" + tombol buka trip
- [ ] Belum login saat buka `/join/<code>` → redirect login lalu balik ke halaman join
- [ ] Preview tidak membocorkan data sensitif (expense, detail member)
- [ ] Mobile-friendly (tap area ≥ 44px, QR cukup besar untuk discan)
- [ ] Dark mode support (QR tetap kontras & terbaca)
- [ ] Loading & error state konsisten

> Catatan implementasi (disederhanakan, anti over-engineering):
> - Halaman `/join/[code]` dibuat sebagai **Server Component** yang memanggil service `getTripByInviteCode` **langsung**, sehingga endpoint `GET /api/trips/invite/[code]` dan client-fetch preview **tidak dibuat** (tidak diperlukan).
> - Mengikuti pola hook yang sudah ada (`useState`/`useTransition` + `router.refresh()`), **bukan** React Query (project belum memakai React Query provider).
> - Panel invite dikonsolidasi jadi **satu komponen** `TripInvitePanel` (kode, copy, link, QR, share, regenerate) — tidak dipecah menjadi banyak file kecil.
> - Trip `ARCHIVED` tetap bisa di-preview tapi tombol gabung dinonaktifkan di UI (tidak pakai error 409 / error class baru).

**Types & Schema:**
- [x] Tambah `TripInvitePreview` di `src/types/trip.ts`

**Service Layer:**
- [x] `regenerateInviteCode` (assert OWNER + `generateInviteCode` + update)
- [x] `getTripByInviteCode` (preview ringkas + cek `isAlreadyMember`)

**API Routes:**
- [x] `POST /api/trips/[id]/invite` (regenerate, OWNER only)
- [~] ~~`GET /api/trips/invite/[code]`~~ — tidak dibuat, preview dipanggil langsung dari Server Component

**Client Fetch (`src/lib/api/trip`):**
- [x] `regenerateInvite.ts`
- [~] ~~`getTripByInviteCode.ts`~~ — tidak diperlukan (Server Component akses service langsung)

**UI Pages:**
- [x] `/join/[code]` preview page (Server Component)
- [x] Sisipkan `TripInvitePanel` di `/trips/[id]` (OWNER only)

**Components:**
- [x] `TripInvitePanel` (gabungan: kode + copy + link + QR + share + regenerate)

**Hooks:**
- [x] `useRegenerateInvite` (pola `router.refresh()`)

**Setup:**
- [x] Install `qrcode.react`
- [ ] Pastikan `NEXT_PUBLIC_APP_URL` ter-set di `.env.local` (cek environment)

**QA (manual, belum dijalankan):**
- [ ] Test copy kode & copy link
- [ ] Test QR mengarah ke link yang benar
- [ ] Test regenerate (kode lama jadi invalid)
- [ ] Test regenerate oleh non-OWNER (403)
- [ ] Test preview kode valid / tidak valid / archived
- [ ] Test preview sebagai member vs non-member
- [ ] Test redirect login dari `/join/<code>` lalu balik
- [ ] Test dark mode panel invite & QR
- [ ] Test mobile layout (panel, QR, share)

### 3.10 Status

**Current status:** Selesai — sisi mengundang & preview siap; eksekusi *join* ditangani fitur [Join Trip](#4-join-trip-user--guest-mvp)
**Target selesai:** TBD
**Catatan:** Bergantung pada [Create Trip](#2-create-trip--room-mvp) (butuh `inviteCode` & detail trip). Tombol "Gabung" kini aktif via fitur Join Trip.

---

## 4. Join Trip (User & Guest) (MVP)

### 4.1 Tujuan
Memungkinkan orang yang menerima undangan untuk **bergabung ke trip**, baik sebagai **user terdaftar** (sudah/akan login) maupun sebagai **tamu (guest)** tanpa membuat akun terlebih dahulu — cukup mengisi nama.

### 4.2 Scope MVP

**Termasuk dalam MVP:**
- Halaman join **publik** `/join/[code]` (dapat diakses tanpa login)
- Join sebagai **user login**: satu klik "Gabung ke trip" → otomatis menjadi member → diarahkan ke `/trips/[id]`
- Join sebagai **guest**: isi nama → menjadi member tanpa akun, identitas disimpan via cookie `tripuy_guest_id`
- Idempotent: membuka ulang link tidak menggandakan membership (dedup via `userId` atau `guestId`)
- State preview untuk: sudah jadi member, trip diarsipkan, kode tidak valid

**Tidak termasuk (kelak):**
- Dashboard trip penuh untuk guest (saat ini guest hanya melihat konfirmasi "sudah gabung")
- Approval OWNER sebelum member masuk
- Konversi guest → akun (migrasi membership saat guest mendaftar)

### 4.3 Perubahan Data
- `TripMember.userId` → **nullable** (null untuk guest)
- Tambah `TripMember.guestId` (nilai cookie guest) & `TripMember.guestName`
- Unique baru `@@unique([tripId, guestId])` untuk dedup guest per trip
- Migrasi: `add_guest_member` (additive, non-destruktif)

### 4.4 Endpoint
| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/api/trips/join` | Publik | Join sebagai user (jika ada sesi) atau guest (butuh `guestName`); set cookie guest bila perlu |

### 4.5 Struktur File
- `app/join/[code]/page.tsx` — Server Component preview (publik)
- `features/trip/components/JoinTripPanel.tsx` — area aksi join (user/guest/sudah-member/archived)
- `features/trip/services/joinTrip.ts` — logika join idempotent
- `features/trip/schemas/joinTripSchema.ts` — validasi Zod
- `features/trip/hooks/useJoinTrip.ts` — mutation client
- `lib/api/trip/joinTrip.ts` — fetch function
- `lib/auth/guestSession.ts` — baca cookie `tripuy_guest_id`

### 4.6 QA (manual, belum dijalankan)
- [ ] Join sebagai user login → jadi member → redirect ke trip
- [ ] Join sebagai guest (isi nama) → jadi member → konfirmasi
- [ ] Buka ulang link sebagai guest → dikenali, tidak duplikat
- [ ] Trip archived → tidak bisa join
- [ ] Kode tidak valid → tampil InvalidInvite
- [ ] Dark mode & layout mobile panel join

### 4.7 Status
**Current status:** Selesai (implementasi); QA manual menunggu
**Catatan:** Bergantung pada [Invite Member](#3-invite-member-via-kode--qr-mvp) (preview-by-code) & [Create Trip](#2-create-trip--room-mvp).

---

## 5. Add Expense (MVP)

### 5.1 Tujuan
Memungkinkan member trip (user terdaftar maupun guest) untuk **mencatat pengeluaran** di dalam sebuah trip: siapa yang membayar, berapa nominalnya, untuk apa, dan kapan. Fitur ini menjadi sumber data utama bagi perhitungan pembagian biaya, balance, dan settlement di iterasi berikutnya.

> Catatan ruang lingkup: fitur ini fokus pada **pencatatan pengeluaran (CRUD expense)** dan **pemilihan peserta yang menanggung** dengan pembagian **rata (equal split)** sebagai default. Logika pembagian lanjutan (persentase, nominal custom, share tidak rata) didetailkan pada fitur terpisah [Split Expense Logic](#fitur-berikutnya). Perhitungan balance & settlement juga fitur terpisah — di sini hanya menyimpan data mentah pengeluaran beserta share-nya.

### 5.2 Scope MVP

**Termasuk dalam MVP:**
- Member trip dapat menambah expense baru di dalam trip yang aktif
- Form input: judul/deskripsi, nominal, tanggal, pembayar (`paidBy`), peserta yang menanggung (`participants`), kategori (opsional), catatan (opsional)
- Pembayar dipilih dari daftar **member trip** (mendukung user & guest)
- Peserta default = semua member; user dapat memilih sebagian (minimal 1)
- Pembagian biaya **rata (equal split)** otomatis dihitung saat simpan dan disimpan sebagai `ExpenseShare`
- Halaman / section daftar expense per trip (terbaru di atas)
- Detail expense (siapa bayar, peserta, share masing-masing)
- Edit expense — pembuat expense atau OWNER trip
- Delete expense — pembuat expense atau OWNER trip, dengan konfirmasi
- Empty state saat trip belum punya expense
- Nominal disimpan sebagai **integer minor unit** (hindari float) dengan currency mengikuti `Trip.currency`

**Tidak termasuk MVP (future):**
- Split tidak rata / custom (persentase, nominal per orang, weight) → [Split Expense Logic](#fitur-berikutnya)
- Perhitungan balance & settlement → fitur terpisah
- Upload struk / receipt (Receipt upload)
- Multi-currency per expense (ikut currency trip)
- Expense berulang (recurring)
- Kategori custom buatan user (MVP pakai daftar kategori tetap / opsional)
- Edit/hapus expense oleh sembarang member (MVP hanya pembuat + OWNER)
- Komentar / aktivitas pada expense

### 5.3 Entity / Data Model (Prisma)

Menambah model baru pada `prisma/schema/` (mengikuti pola multi-file schema, mis. `prisma/schema/expense.prisma`). Tidak mengubah model yang sudah ada.

```
model Expense {
  id          String   @id @default(cuid())
  tripId      String
  title       String
  amount      Int                       # minor unit (mis. rupiah penuh untuk IDR), hindari float
  currency    String                    # snapshot dari Trip.currency saat dibuat
  date        DateTime                  # tanggal pengeluaran (bukan createdAt)
  category    ExpenseCategory @default(OTHER)
  note        String?
  paidById    String                    # TripMember.id pembayar (mendukung guest)
  createdById String                    # TripMember.id pencatat
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  trip      Trip           @relation(fields: [tripId], references: [id], onDelete: Cascade)
  paidBy    TripMember     @relation("ExpensePaidBy", fields: [paidById], references: [id])
  createdBy TripMember     @relation("ExpenseCreatedBy", fields: [createdById], references: [id])
  shares    ExpenseShare[]

  @@index([tripId])
  @@index([paidById])
  @@map("expense")
}

model ExpenseShare {
  id           String @id @default(cuid())
  expenseId    String
  memberId     String                   # TripMember.id peserta yang menanggung
  amount       Int                      # bagian yang ditanggung (minor unit)

  expense Expense    @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  member  TripMember @relation(fields: [memberId], references: [id])

  @@unique([expenseId, memberId])
  @@index([memberId])
  @@map("expense_share")
}

enum ExpenseCategory {
  FOOD
  TRANSPORT
  LODGING
  ACTIVITY
  SHOPPING
  OTHER
}
```

**Catatan:**
- `paidBy`, `createdBy`, dan `share.member` mengacu ke `TripMember` (bukan `User`) agar **guest** bisa membayar / menanggung expense.
- Relasi balik perlu ditambahkan di `TripMember` (`expensesPaid`, `expensesCreated`, `shares`) dan di `Trip` (`expenses`).
- `amount` disimpan sebagai `Int` minor unit untuk menghindari masalah pembulatan float; pembagian rata menangani sisa pembagian (lihat 5.6).
- `onDelete: Cascade` pada `Expense` & `ExpenseShare` agar bersih saat trip / expense dihapus.
- Migrasi additive baru: `add_expense` (non-destruktif).

### 5.4 Halaman / Route

| Route | Tipe | Akses | Deskripsi |
|---|---|---|---|
| `/trips/[id]` | Protected | Member only | Detail trip — menampilkan section daftar expense + tombol "Tambah Pengeluaran" |
| `/trips/[id]/expenses/new` | Protected | Member only | Form tambah expense |
| `/trips/[id]/expenses/[expenseId]` | Protected | Member only | Detail expense |
| `/trips/[id]/expenses/[expenseId]/edit` | Protected | Pembuat / OWNER | Form edit expense |
| `/api/trips/[id]/expenses` | API | Member only | `GET` list, `POST` create |
| `/api/trips/[id]/expenses/[expenseId]` | API | Member only (mutasi: pembuat/OWNER) | `GET`, `PATCH`, `DELETE` |

### 5.5 User Flow

#### A. Flow Tambah Expense
1. Member membuka `/trips/[id]`, pada section "Pengeluaran" klik "Tambah Pengeluaran"
2. Redirect ke `/trips/[id]/expenses/new`
3. Form menampilkan: judul, nominal, tanggal (default hari ini), pembayar (dropdown member trip, default member saat ini), peserta (multi-select member, default semua tercentang), kategori (default OTHER), catatan (opsional)
4. Client-side: validasi Zod (judul min 1, nominal > 0, minimal 1 peserta, tanggal valid)
5. Submit → `POST /api/trips/[id]/expenses`
6. Server:
   - Cek auth + `assertTripMember` (pengakses harus member)
   - Validasi `paidById` & semua `participantIds` adalah member dari trip ini
   - Tolak jika trip `ARCHIVED` (409 — tidak boleh menambah expense di trip arsip)
   - Hitung equal split → buat `Expense` + banyak `ExpenseShare` dalam satu transaction
7. Sukses → redirect ke detail trip / detail expense + toast "Pengeluaran ditambahkan"

#### B. Flow List Expense (di detail trip)
1. Server Component detail trip memanggil service `getExpensesByTripId(tripId)`
2. Tampilkan card list (mobile-first): judul, nominal terformat, nama pembayar, tanggal, kategori badge, jumlah peserta
3. Order berdasar `date DESC` lalu `createdAt DESC`
4. Empty state jika belum ada expense → CTA "Tambah Pengeluaran"

#### C. Flow Detail Expense
1. User klik card expense → `/trips/[id]/expenses/[expenseId]`
2. Server Component fetch `getExpenseById(expenseId, tripId)` + assert member
3. Tampilkan: judul, nominal, tanggal, kategori, catatan, pembayar, daftar peserta beserta share masing-masing
4. Tombol Edit & Hapus muncul kondisional (pembuat expense atau OWNER trip)

#### D. Flow Edit Expense
1. Pembuat / OWNER klik "Edit" → `/trips/[id]/expenses/[expenseId]/edit`
2. Form prefilled → submit `PATCH /api/trips/[id]/expenses/[expenseId]`
3. Server: assert member + cek pembuat/OWNER → recalculate share → update dalam transaction (hapus share lama, buat ulang)
4. Redirect balik + toast sukses

#### E. Flow Delete Expense
1. Pembuat / OWNER klik "Hapus" → konfirmasi (bottom sheet di mobile)
2. Confirm → `DELETE /api/trips/[id]/expenses/[expenseId]`
3. Server: assert member + cek pembuat/OWNER → hapus expense (cascade hapus share)
4. Refresh data + toast "Pengeluaran dihapus"

### 5.6 Technical Flow

**Stack:**
- Server Component untuk list & detail (initial fetch via service langsung)
- Client Component untuk form (interaction)
- Hook pola **`useState`/`useTransition` + `router.refresh()`** (mengikuti pola existing, project belum memakai React Query)
- Zod untuk validation di client & server
- Prisma **transaction** saat create/edit (Expense + ExpenseShare atomik)
- Reuse `requireSessionUser`, `assertTripMember`, format response `ok/created/fail/handleApiError`, dan error class `TripForbiddenError`/`TripNotFoundError`

**Equal split (helper `calculateEqualShares`):**
- Bagi `amount` rata ke `n` peserta: `base = Math.floor(amount / n)`
- Sisa `remainder = amount - base * n` dibagikan +1 ke `remainder` peserta pertama (deterministik), sehingga `sum(shares) === amount` (tidak ada rupiah hilang/lebih)

**Struktur file:**
```
src/
  app/
    (protected)/
      trips/
        [id]/
          page.tsx                       # sisipkan <ExpenseSection />
          expenses/
            new/page.tsx                 # form tambah
            [expenseId]/
              page.tsx                   # detail expense
              edit/page.tsx              # form edit
    api/
      trips/
        [id]/
          expenses/
            route.ts                     # GET list, POST create
            [expenseId]/route.ts         # GET, PATCH, DELETE
  features/
    expense/
      components/
        ExpenseSection.tsx               # wrapper list + CTA di detail trip
        ExpenseList.tsx
        ExpenseCard.tsx
        ExpenseForm.tsx                  # reusable create + edit
        ExpenseDetail.tsx
        ExpenseEmptyState.tsx
        ExpenseCategoryBadge.tsx
        MemberSelect.tsx                 # pilih pembayar / peserta dari member trip
        DeleteExpenseDialog.tsx
      hooks/
        useCreateExpense.ts
        useUpdateExpense.ts
        useDeleteExpense.ts
      schemas/
        expenseSchema.ts                 # createExpenseSchema, updateExpenseSchema
      services/
        createExpense.ts
        getExpensesByTripId.ts
        getExpenseById.ts
        updateExpense.ts
        deleteExpense.ts
        calculateEqualShares.ts          # helper pembagian rata
        assertExpenseEditable.ts         # cek pembuat / OWNER
  lib/
    api/
      expense/
        createExpense.ts                 # client fetch wrapper
        getExpenses.ts
        updateExpense.ts
        deleteExpense.ts
  types/
    expense.ts                           # Expense, ExpenseShare, ExpenseCategory, input types
```

**Tambahan tipe (`src/types/expense.ts`):**
```
export type ExpenseCategory =
  | "FOOD" | "TRANSPORT" | "LODGING" | "ACTIVITY" | "SHOPPING" | "OTHER";

export interface ExpenseShare {
  id: string;
  expenseId: string;
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: ExpenseCategory;
  note: string | null;
  paidById: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseWithShares extends Expense {
  shares: ExpenseShare[];
}

export interface ExpenseListItem extends Expense {
  paidByName: string;
  participantCount: number;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  date: Date;
  category?: ExpenseCategory;
  note?: string;
  paidById: string;
  participantIds: string[];
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;
```

**Validation (Zod):**
- `createExpenseSchema`: title (min 1, max 100), amount (int positif, > 0), date (coerce date), category (enum, default OTHER), note (max 500, optional), paidById (string non-empty), participantIds (array string, min 1)
- `updateExpenseSchema`: partial dari create

**Authorization rules:**
- Semua endpoint cek session + `assertTripMember` (akses minimal = member trip)
- `paidById` & semua `participantIds` divalidasi sebagai member trip yang sama (tolak jika ada yang bukan member)
- `PATCH` / `DELETE`: `assertExpenseEditable` → boleh jika `createdById` = member saat ini **atau** role member saat ini = OWNER
- Tolak create/edit jika trip `ARCHIVED`

**Error handling:**
- 401 belum login
- 403 bukan pembuat / bukan OWNER saat edit/hapus → "Anda tidak dapat mengubah pengeluaran ini"
- 404 expense / trip tidak ditemukan atau bukan member
- 409 trip diarsipkan → "Trip ini sudah diarsipkan, tidak dapat menambah pengeluaran"
- 422 validation gagal (nominal ≤ 0, tidak ada peserta, dll)
- Jangan expose raw error database

### 5.7 Dependencies & Environment
- **Tidak ada dependency baru** dan **tidak ada environment variable baru** untuk MVP ini.
- Formatting nominal memakai `Intl.NumberFormat` (native) sesuai `currency` trip — disimpan sebagai helper di `src/lib/utils.ts` jika belum ada.

### 5.8 Acceptance Criteria MVP

- [ ] Member dapat menambah expense pada trip aktif
- [ ] Pembayar dapat dipilih dari member trip (termasuk guest)
- [ ] Peserta default semua member, dapat dikurangi (minimal 1)
- [ ] Pembagian rata otomatis dihitung dan `sum(shares) === amount` (tanpa rupiah hilang)
- [ ] Nominal disimpan sebagai integer minor unit (bukan float)
- [ ] Daftar expense tampil di detail trip (terbaru di atas)
- [ ] Detail expense menampilkan pembayar & share tiap peserta
- [ ] Pembuat / OWNER dapat edit expense (share dihitung ulang)
- [ ] Pembuat / OWNER dapat hapus expense dengan konfirmasi
- [ ] Member lain (bukan pembuat/OWNER) tidak melihat tombol edit/hapus (403 jika dipaksa via API)
- [ ] Tidak bisa menambah/ubah expense di trip yang diarsipkan (409)
- [ ] `paidById`/`participantIds` di luar member trip ditolak
- [ ] Validation jalan di client & server
- [ ] Empty state tampil saat belum ada expense
- [ ] Nominal terformat sesuai currency trip
- [ ] Mobile-friendly (tap area ≥ 44px, sticky CTA di form, card list)
- [ ] Dark mode support
- [ ] Loading & error state konsisten

### 5.9 Checklist Implementasi

**Database:**
- [ ] Tambah model `Expense`, `ExpenseShare`, enum `ExpenseCategory` (mis. `prisma/schema/expense.prisma`)
- [ ] Tambah relasi balik di `Trip` (`expenses`) & `TripMember` (`expensesPaid`, `expensesCreated`, `shares`)
- [ ] Run migration `add_expense` (additive)

**Types & Schema:**
- [ ] Buat `src/types/expense.ts`
- [ ] Buat `createExpenseSchema`, `updateExpenseSchema` (Zod)

**Service Layer:**
- [ ] `calculateEqualShares` (helper, remainder deterministik)
- [ ] `createExpense` (transaction Expense + ExpenseShare, validasi member)
- [ ] `getExpensesByTripId` (list item + nama pembayar + jumlah peserta)
- [ ] `getExpenseById` (dengan shares + assert member)
- [ ] `updateExpense` (recalculate share dalam transaction)
- [ ] `deleteExpense` (assert editable)
- [ ] `assertExpenseEditable` (pembuat / OWNER)

**API Routes:**
- [ ] `GET /api/trips/[id]/expenses`
- [ ] `POST /api/trips/[id]/expenses`
- [ ] `GET /api/trips/[id]/expenses/[expenseId]`
- [ ] `PATCH /api/trips/[id]/expenses/[expenseId]`
- [ ] `DELETE /api/trips/[id]/expenses/[expenseId]`

**Client Fetch (`src/lib/api/expense`):**
- [ ] `createExpense.ts`
- [ ] `getExpenses.ts`
- [ ] `updateExpense.ts`
- [ ] `deleteExpense.ts`

**UI Pages:**
- [ ] `/trips/[id]/expenses/new`
- [ ] `/trips/[id]/expenses/[expenseId]`
- [ ] `/trips/[id]/expenses/[expenseId]/edit`
- [ ] Sisipkan `ExpenseSection` di `/trips/[id]`

**Components:**
- [ ] `ExpenseSection`, `ExpenseList`, `ExpenseCard`
- [ ] `ExpenseForm` (reusable create + edit)
- [ ] `ExpenseDetail`
- [ ] `ExpenseEmptyState`, `ExpenseCategoryBadge`
- [ ] `MemberSelect` (pembayar + peserta)
- [ ] `DeleteExpenseDialog`

**Hooks:**
- [ ] `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense` (pola `router.refresh()`)

**QA (manual):**
- [ ] Test tambah expense sukses + equal split benar (cek sisa pembagian)
- [ ] Test tambah dengan validation error (nominal 0, peserta kosong)
- [ ] Test pembayar/peserta guest
- [ ] Test list & detail expense
- [ ] Test edit (share dihitung ulang)
- [ ] Test hapus dengan konfirmasi
- [ ] Test edit/hapus oleh non-pembuat & non-OWNER (403)
- [ ] Test tambah expense di trip archived (409)
- [ ] Test dark mode & layout mobile (form, list, detail)

### 5.10 Status

**Current status:** Belum dimulai
**Target selesai:** TBD
**Catatan:** Bergantung pada [Create Trip](#2-create-trip--room-mvp) & [Join Trip](#4-join-trip-user--guest-mvp) (butuh trip + daftar member, termasuk guest). Menjadi prasyarat untuk Split Expense Logic, Balance Calculation, dan Settlement.

---

## Fitur Berikutnya

- [ ] Group Member
- [ ] Split Expense Logic
- [ ] Balance Calculation
- [ ] Settlement Calculation
- [ ] Trip Summary
- [ ] User Profile
