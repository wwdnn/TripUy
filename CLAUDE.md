# CLAUDE.md — [Nama Project]

---

## 1. Project Overview

* **Name** : TripUy
* **Description** : TripUy adalah aplikasi untuk membantu sekelompok orang merencanakan, mengatur, dan menjalani perjalanan bersama dengan lebih mudah, mulai dari pencatatan pengeluaran, pembagian biaya, hingga aktivitas selama trip.
* **Goal** : Membantu pengguna agar perjalanan bersama menjadi lebih praktis, terorganisir, dan nyaman melalui fitur kolaborasi trip, pencatatan pengeluaran bersama, serta pembagian biaya yang otomatis dan mudah dipahami.
* **Target Users** : Teman, pasangan, keluarga, atau kelompok yang sering pergi bersama dan memiliki pengeluaran patungan.
* **Version** : v1.0.0
* **Status** : Sedang dalam tahap pengembangan aktif.


---

## 2. Tech Stack

- Language : TypeScript
- Framework : Next.js
- Styling : Tailwind CSS
- UI Library : shadcn/ui
- Chart library : apache echarts
- Database : PostgreSql
- ORM : Prisma
- Auth : Better Auth
- State Management : Zustand
- Data Fetching : React Query + fetch
- Package Manager : pnpm
- Deployment : Vercel (frontend) + Railway (database/backend)

---

## 3. Commands

```bash
# Development
pnpm run dev          # Jalankan dev server
pnpm run build        # Build untuk production
pnpm run start        # Jalankan production build
pnpm run lint         # Jalankan linter
pnpm run format       # Format kode

# Package Management
pnpm add [package]    # Install package baru

# Testing
pnpm run test         # Jalankan semua test
pnpm run test:unit    # Jalankan unit test saja
pnpm run test:e2e     # Jalankan e2e test saja

# Database
pnpm run db:migrate   # Jalankan migrasi database
pnpm run db:seed      # Seed data awal
pnpm run db:reset     # Reset database
```

> Package manager yang digunakan: **pnpm**
>
> Never use npm or yarn — always use pnpm.

---

## 4. Project Structure

* **Architecture** : By Feature (simple feature-based structure)

```txt
root/
  src/
    app/                # Routing, page, layout, API route
    features/           # Semua fitur utama aplikasi (trip, expense, settlement, auth, dll)
    components/         # Komponen UI reusable/global
    lib/                # Helper, utility, konfigurasi, database, formatter
    types/              # Semua TypeScript types dan interface
    hooks/              # Custom React hooks
    styles/             # Global styling tambahan
  public/               # Static assets yang bisa diakses publik
  prisma/               # Schema dan migration database Prisma

  next.config.ts        # Konfigurasi Next.js
  tailwind.config.ts    # Konfigurasi Tailwind
  tsconfig.json         # Konfigurasi TypeScript
  eslint.config.js      # Konfigurasi linting
  prettier.config.js    # Konfigurasi formatter
  package.json          # Dependencies dan scripts
```

Aturan penempatan file:

* Komponen UI baru selalu di `src/components`
* Logic bisnis selalu di `src/features`
* Tipe TypeScript selalu di `src/types`
* Helper dan utility selalu di `src/lib`
* Custom hook selalu di `src/hooks`
* Jangan buat folder baru tanpa konfirmasi terlebih dahulu


---

## 5. Naming Conventions

```
# File dan Folder
- Komponen      : PascalCase    contoh: TripCard.tsx
- Non-komponen  : camelCase     contoh: calculateBalance.ts, useTrip.ts
- Folder        : kebab-case    contoh: expense-history/
- Halaman       : page.tsx
- Layout        : layout.tsx

# Di dalam Kode
- Variabel      : camelCase     contoh: tripMembers, totalExpense
- Konstanta     : UPPER_SNAKE   contoh: MAX_MEMBER, DEFAULT_CURRENCY
- Fungsi        : camelCase     contoh: createTrip, calculateSettlement
- Tipe/Interface: PascalCase    contoh: TripMember, ExpenseItem
- Enum          : PascalCase    contoh: TripStatus, SplitType
- CSS Class     : kebab-case    contoh: trip-card, expense-item

# Git Branch
- Fitur baru    : [FEAT] nama-fitur
- Bug fix       : [FIX] nama-bug
- Refactor      : [REF] nama
```


---

## 6. Code Conventions

```
# Pendekatan Coding
- Terapkan prinsip Clean Code, DRY, dan SOLID
- Fokus utama: kode mudah dibaca, mudah diubah, dan mudah dikembangkan
- Gunakan pemilihan kata dalam penamaan yang mudah dimengerti oleh orang awam
- Hindari function atau component yang terlalu besar
- Satu file sebaiknya memiliki satu tanggung jawab utama
- Hindari duplikasi kode, jadikan reusable function atau reusable component jika dipakai lebih dari sekali
- Utamakan kejelasan kode dibanding penulisan yang terlalu singkat atau kompleks
- Gunakan penamaan yang jelas dan deskriptif
- Jangan mencampur UI, business logic, dan data access dalam satu file

# SOLID Principles
- Single Responsibility Principle (SRP)
  Satu function/component hanya memiliki satu tanggung jawab

- Open/Closed Principle (OCP)
  Buat kode yang mudah ditambah tanpa harus mengubah logic lama

- Liskov Substitution Principle (LSP)
  Gunakan abstraction/interface yang konsisten agar implementasi bisa saling menggantikan

- Interface Segregation Principle (ISP)
  Hindari interface yang terlalu besar dan berisi banyak field yang tidak digunakan

- Dependency Inversion Principle (DIP)
  Business logic tidak boleh bergantung langsung ke database atau framework tertentu

# TypeScript
- Gunakan strict mode
- Tidak boleh menggunakan tipe 'any'
- Selalu tulis tipe return function secara eksplisit
- Gunakan interface untuk object
- Gunakan type untuk union atau intersection
- Gunakan enum hanya jika benar-benar dibutuhkan
- Hindari type assertion berlebihan
- Validasi data external sebelum digunakan

# Urutan Import
1. Library eksternal (react, next, zod, dll)
2. Internal absolut (@/components, @/features, dll)
3. Internal relatif (./utils, ../hooks)
4. Types dan interfaces
5. Assets dan styles

# Export Pattern
- Gunakan named export untuk komponen, hooks, helper, dan function
- Gunakan default export hanya untuk page.tsx dan layout.tsx
- Hindari export default pada file selain routing Next.js

# Error Handling
- Selalu gunakan try-catch untuk async function
- Jangan biarkan error tanpa handling
- Gunakan pesan error yang jelas dan spesifik
- Pisahkan error untuk user dan error untuk developer/log
- Jangan tampilkan raw error database atau server ke user
- Gunakan early return untuk mengurangi nested condition

# Function Rules
- Function maksimal fokus pada satu tujuan
- Hindari function lebih dari ±30-40 baris jika memungkinkan
- Hindari nested condition terlalu dalam
- Gunakan helper function jika logic mulai kompleks
- Gunakan nama function berbentuk aksi
  contoh:
  - createTrip
  - calculateBalance
  - generateSettlement

# Component Rules
- Component UI tidak boleh memiliki business logic yang kompleks
- Business logic dipindahkan ke hooks atau features
- Pisahkan reusable component dan feature-specific component
- Hindari prop drilling terlalu dalam

# Database & Data Access
- Query database tidak boleh langsung dipanggil dari UI component
- Semua akses database harus melalui layer feature/service
- Validasi input sebelum simpan ke database
- Jangan percaya data dari client sepenuhnya

# Comment Rules
- Hindari komentar yang menjelaskan hal obvious
- Jangan menggunakan komentar apapun
- Hapus komentar yang sudah tidak relevan
```


---

## 7. Component Rules

```
# Urutan Penulisan dalam Satu Komponen
1. Import
2. Types atau interface props
3. Constants (jika ada)
4. Definisi component
5. Hooks (useState, useEffect, useMemo, dll)
6. Derived state / computed value
7. Handler dan function lokal
8. Early return / loading / error state
9. Return JSX
10. Export

# Aturan Props
- Selalu tulis tipe props secara eksplisit
- Gunakan interface untuk props object
- Gunakan default value untuk props yang optional
- Maksimal 7 props per component
- Jika props terlalu banyak, gunakan object grouping atau pecah component
- Hindari props drilling terlalu dalam
- Gunakan nama props yang jelas dan deskriptif

# Server vs Client Component (Next.js)
- Default: gunakan Server Component
- Gunakan 'use client' hanya jika benar-benar diperlukan

Gunakan 'use client' jika membutuhkan:
- useState
- useEffect
- useRef
- custom hooks client-side
- event handler (onClick, onChange, dll)
- browser API (window, localStorage, navigator, dll)
- library yang tidak support SSR

- Jangan tambahkan 'use client' di level atas tanpa alasan jelas
- Pisahkan component interaktif dan non-interaktif jika memungkinkan
- Usahakan page tetap Server Component dan interaction dipindahkan ke child component

# Komponen Kecil
- Pisah ke file sendiri jika:
  - dipakai lebih dari satu tempat
  - logic mulai kompleks
  - JSX mulai panjang
  - reusable

- Boleh digabung dalam satu file jika:
  - hanya dipakai satu component
  - sangat kecil
  - purely presentational

# Component Rules
- Satu component hanya punya satu tanggung jawab utama
- Hindari component lebih dari ±200 baris jika memungkinkan
- Hindari nested JSX terlalu dalam
- Gunakan helper component jika UI mulai kompleks
- Jangan campur business logic berat di component UI
- Gunakan custom hook untuk logic reusable
- Gunakan memoization hanya jika memang dibutuhkan

# JSX Rules
- Gunakan conditional rendering yang mudah dibaca
- Hindari ternary bertingkat
- Gunakan early return untuk loading/error state
- Jangan tulis logic kompleks langsung di JSX
- Gunakan semantic HTML jika memungkinkan

# Form Rules
- Gunakan controlled input
- Validasi input sebelum submit
- Pisahkan validation logic dari UI jika mulai kompleks
- Gunakan reusable form field component jika dipakai berulang

# Styling Rules
- Gunakan Tailwind utility class langsung di component
- Hindari class terlalu panjang dalam satu line
- Gunakan helper/class merge jika styling conditional mulai kompleks
- Jangan gunakan inline style kecuali benar-benar diperlukan
```


---

## 8. Styling Rules

```
# Pendekatan Styling
- Gunakan Tailwind CSS sebagai styling utama
- Fokus utama design system: mobile-first web application
- Design harus dioptimalkan terlebih dahulu untuk layar mobile
- Desktop adalah enhancement, bukan prioritas utama
- Jangan gunakan inline style kecuali untuk value yang benar-benar dinamis
- Jangan gunakan !important
- Hindari custom CSS jika masih bisa diselesaikan dengan utility Tailwind

# Tailwind CSS
- Gunakan utility class langsung di JSX
- Gunakan cn() atau clsx untuk conditional class
- Ekstrak menjadi reusable component jika class yang sama dipakai berulang
- Hindari class duplication
- Gunakan variant utility jika styling mulai kompleks

# Urutan Class Tailwind
1. Layout
2. Position
3. Flex/Grid
4. Spacing
5. Sizing
6. Border
7. Background/Color
8. Typography
9. Effect
10. Animation
11. State

Contoh:
flex items-center gap-2 p-4 w-full rounded-xl bg-background text-sm font-medium hover:bg-muted

# Responsive Design
- Pendekatan wajib: mobile-first
- Design awal dibuat untuk ukuran mobile terlebih dahulu
- Tambahkan responsive breakpoint hanya jika memang dibutuhkan
- Hindari membuat desktop layout terlebih dahulu

# Breakpoint
- sm : 640px
- md : 768px
- lg : 1024px
- xl : 1280px

# Responsive Rules
- Default class = mobile
- Gunakan md:, lg:, xl: hanya untuk override tampilan lebih besar
- Hindari penggunaan breakpoint berlebihan
- Pastikan semua halaman nyaman digunakan dengan satu tangan di mobile
- Prioritaskan:
  - thumb friendly spacing
  - bottom interaction
  - large tap area
  - readable text size

# Mobile UI Rules
- Minimal tap area: 44px
- Gunakan spacing yang lega
- Hindari modal besar di mobile
- Prioritaskan bottom sheet dibanding popup desktop-style
- Gunakan sticky bottom action untuk CTA penting
- Hindari table horizontal jika memungkinkan
- Gunakan card layout untuk data list

# Dark Mode
- Gunakan dark: prefix dari Tailwind
- Semua komponen wajib support dark mode
- Selalu test light mode dan dark mode setelah membuat component baru
- Hindari hardcoded white/black color
- Gunakan semantic color token

# Design Tokens
- Gunakan CSS variables untuk:
  - color
  - spacing
  - radius
  - typography
  - shadow

- Jangan hardcode warna langsung di component
- Gunakan token yang sudah didefinisikan di:
  - src/styles/globals.css
  - tailwind.config.ts

# Color Rules
- Gunakan semantic naming:
  - background
  - foreground
  - primary
  - secondary
  - muted
  - destructive
  - border
  - card

- Hindari penggunaan:
  - text-red-500
  - bg-blue-500
  secara langsung untuk UI utama

# Typography Rules
- Prioritaskan readability di mobile
- Gunakan line-height yang lega
- Hindari text terlalu kecil
- Minimal ukuran text utama: text-sm
- Gunakan hierarchy typography yang konsisten

# Component Styling Rules
- Gunakan rounded dan spacing yang konsisten
- Gunakan shadow seperlunya
- Hindari UI terlalu padat
- Prioritaskan simplicity dan clarity
- Satu screen sebaiknya fokus pada satu tujuan utama

# Animation Rules
- Gunakan animasi ringan dan cepat
- Hindari animasi berlebihan
- Prioritaskan feedback interaction:
  - hover
  - active
  - loading
  - transition

- Gunakan duration singkat:
  - 150ms
  - 200ms
  - 300ms maksimal
```


---

## 9. API & Data Fetching Rules

```
# Kapan Pakai Server vs Client Fetch

# Server Fetch
Gunakan server-side fetching untuk:
- Data halaman awal
- Data yang tidak membutuhkan interaksi langsung user
- SEO content
- Initial dashboard data
- Authentication check
- Data yang relatif stabil

Contoh:
- detail trip
- daftar member
- ringkasan balance

Gunakan:
- async Server Component
- server action
- fetch di server

# Client Fetch
Gunakan client-side fetching untuk:
- Data yang berubah setelah interaksi user
- Realtime update ringan
- Filter/search
- Infinite scroll
- Form submit state
- Refresh sebagian data

Contoh:
- tambah expense
- refresh settlement
- search member
- update balance setelah action

# Data Fetching Library
- Gunakan React Query untuk client-side data fetching
- Jangan gunakan useEffect untuk fetching data
- Gunakan React Query untuk:
  - caching
  - loading state
  - mutation
  - retry
  - invalidation
  - optimistic update

# Fetching Rules
- Pisahkan fetch logic dari component
- Component hanya menerima data dan menampilkan UI
- Jangan fetch langsung di JSX
- Hindari duplicate request
- Gunakan loading dan error state yang konsisten

# Format Response API
Semua endpoint wajib menggunakan format response yang konsisten:

{
  success: boolean,
  data: T | null,
  message: string
}

# Contoh Success Response
{
  success: true,
  data: {...},
  message: "Trip berhasil dibuat"
}

# Contoh Error Response
{
  success: false,
  data: null,
  message: "Trip tidak ditemukan"
}

# Error Handling di API
- Selalu gunakan try-catch
- Jangan biarkan unhandled error
- Gunakan status code yang sesuai

# Status Code
- 200 : success
- 201 : created
- 400 : bad request
- 401 : unauthorized
- 403 : forbidden
- 404 : not found
- 409 : conflict
- 422 : validation error
- 500 : internal server error

# Error Rules
- Jangan expose raw database error ke client
- Jangan expose stack trace di production
- Gunakan pesan error yang jelas dan aman
- Pisahkan validation error dan server error
- Log internal error untuk debugging developer

# Lokasi Fetch Function
Semua fetch function disimpan di:

- src/lib/api

Contoh:
- src/lib/api/trip/getTripById.ts
- src/lib/api/expense/createExpense.ts

# Rules
- Jangan tulis fetch function langsung di component
- Jangan tulis business logic di API route
- API route hanya menerima request dan memanggil service
- Semua validasi dilakukan sebelum query database

# API Structure
- Satu endpoint fokus pada satu tujuan
- Hindari endpoint yang terlalu generic
- Gunakan naming yang jelas

Contoh:
- POST /api/trips
- GET /api/trips/[id]
- POST /api/expenses
- GET /api/settlements/[tripId]

# Validation
- Gunakan Zod untuk validation
- Validasi semua request body
- Validasi query params
- Validasi response jika diperlukan
- Jangan percaya data dari client

# React Query Rules
- Gunakan query key yang konsisten
- Pisahkan query dan mutation
- Gunakan invalidateQueries setelah mutation berhasil
- Gunakan optimistic update hanya jika benar-benar diperlukan
- Hindari refetch berlebihan

# Environment
- Semua URL, API key, dan secret wajib menggunakan environment variable
- Jangan hardcode:
  - API URL
  - database URL
  - auth secret
  - token
  - credential

# Environment Files
- .env
- .env.local
- .env.production

# Environment Rules
- Jangan commit file .env
- Gunakan NEXT_PUBLIC_ hanya untuk variable client-side
- Secret server tidak boleh diakses client
- Gunakan helper untuk membaca env agar type-safe

# Security Rules
- Validasi authorization di server
- Jangan percaya role dari client
- Semua protected endpoint wajib check auth
- Sanitize input jika diperlukan
- Rate limit endpoint penting jika diperlukan di masa depan
```


---

## 10. State Management Rules

```
# Hierarki State
Gunakan state management dari yang paling sederhana terlebih dahulu.

1. Local State (useState)
Digunakan jika:
- hanya dipakai 1 komponen
- state sederhana
- state UI kecil

Contoh:
- modal open/close
- input form
- active tab
- loading button

2. Lifted State
Digunakan jika:
- dipakai 2-3 komponen yang berdekatan
- masih dalam satu feature/page

Contoh:
- filter expense
- selected member
- form multi-step

Gunakan:
- parent component state
- props
- callback handler

3. Global State
Digunakan jika:
- dipakai banyak komponen
- dipakai lintas halaman
- perlu persist
- sulit di-manage dengan prop drilling

Contoh:
- auth user
- active trip
- app settings
- theme

# State Management Library
Gunakan Zustand sebagai global state management utama.

Alasan:
- simple
- ringan
- minimal boilerplate
- mudah dipelajari
- cocok untuk project skala kecil sampai menengah

# Kapan Pakai Global State
Gunakan global state hanya jika benar-benar diperlukan.

Contoh valid:
- auth/session user
- current active trip
- global modal
- dark mode
- layout state
- onboarding state

Jangan gunakan global state untuk:
- input form lokal
- hover state
- modal lokal
- loading component kecil

# Aturan Zustand
- Buat store per domain/fitur
- Jangan membuat satu store besar untuk semua state

Contoh:
- useAuthStore
- useTripStore
- useExpenseStore
- useUiStore

# Struktur Store
Store hanya berisi:
- state
- action
- minimal logic sederhana

Business logic kompleks tetap di:
- services
- features
- helper

# Zustand Rules
- Gunakan selector untuk mengambil state spesifik
- Hindari subscribe seluruh store
- Jangan simpan derived/computed data yang bisa dihitung ulang
- Hindari nested object terlalu dalam
- Gunakan immutable update
- Pisahkan persistent dan non-persistent state
- Gunakan persist middleware hanya jika benar-benar diperlukan

# Data yang Tidak Perlu Disimpan di Store
Jangan simpan:
- hasil filtering
- total calculation sederhana
- formatted value
- derived state

Gunakan:
- helper function
- useMemo
- selector

# Context Rules
Gunakan React Context hanya untuk:
- theme
- locale/language
- config global
- auth provider wrapper
- third-party provider

Jangan gunakan Context untuk:
- frequently changing state
- realtime state
- form besar
- complex shared state

# React Query vs Zustand
Gunakan React Query untuk:
- server state
- data dari API
- caching
- fetching
- mutation

Gunakan Zustand untuk:
- UI state
- client state
- temporary state
- app state

# Jangan Campur Responsibility
- React Query = server data
- Zustand = client/global UI state

Jangan duplicate data API ke Zustand tanpa alasan jelas.

# State Rules
- Simpan state sesedikit mungkin
- Semakin kecil scope state semakin baik
- Hindari over-engineering state management
- Jangan membuat abstraction terlalu cepat
- Prioritaskan readability dibanding architecture yang terlalu kompleks

# Persist Rules
Gunakan persistence hanya untuk:
- auth session
- theme
- onboarding state
- last active trip jika diperlukan

Jangan persist:
- temporary form
- loading state
- fetched list cache

# Naming Convention
- Store : useTripStore
- Action : setTrip, clearTrip, updateExpense
- Selector : selectCurrentUser

# Folder Placement
Global store disimpan di:
- src/features/[feature]/stores

Jangan membuat store di dalam component
```


---

## 11. Performance Rules

```
# Performance Rules

# Prinsip Utama
- Prioritaskan performa mobile terlebih dahulu
- Hindari optimasi prematur
- Fokus pada:
  - loading cepat
  - interaksi responsif
  - bundle kecil
  - minim JavaScript di client

- Lakukan optimasi berdasarkan kebutuhan nyata dan profiling

# Code Splitting
- Gunakan dynamic import untuk:
  - modal besar
  - chart
  - heavy component
  - third-party library besar
  - halaman yang jarang diakses

Contoh:
- expense analytics
- trip statistics
- export PDF
- onboarding tutorial

# Lazy Loading
- Lazy load component yang tidak langsung terlihat
- Lazy load route yang jarang diakses
- Hindari load semua feature di initial render

# Dynamic Import Rules
- Gunakan next/dynamic untuk component client besar
- Gunakan suspense/loading state jika diperlukan
- Jangan dynamic import component kecil tanpa alasan

# Image Optimization
- Selalu gunakan next/image
- Jangan gunakan tag <img> biasa
- Semua image wajib memiliki:
  - width
  - height
  - alt

# Format Image
- Gunakan WebP atau AVIF untuk image baru
- Compress image sebelum upload
- Hindari image resolusi terlalu besar

# Image Rules
- Gunakan lazy loading default dari next/image
- Gunakan priority hanya untuk image hero/above the fold
- Hindari terlalu banyak image dalam satu screen mobile
- Gunakan placeholder/skeleton jika loading image lama

# Re-render Optimization
Gunakan optimization hanya jika memang diperlukan.

# Gunakan useMemo untuk:
- kalkulasi berat
- filtering besar
- grouping data
- settlement calculation

# Gunakan useCallback untuk:
- function yang dikirim ke child component
- dependency hook yang sensitif

# Jangan Over Optimize
- Jangan gunakan memo/useMemo/useCallback di semua tempat
- Hindari optimization tanpa profiling
- Readability lebih penting daripada micro optimization

# React Rendering Rules
- Hindari state global berlebihan
- Pisahkan component besar menjadi kecil
- Hindari passing object/function inline terus-menerus
- Gunakan selector pada Zustand agar rerender lebih kecil

# Bundle Size
- Import hanya yang dibutuhkan

Benar:
import { debounce } from 'lodash'

Salah:
import _ from 'lodash'

# Bundle Rules
- Hindari library besar jika ada alternatif kecil
- Evaluasi dependency sebelum install package baru
- Jangan install package untuk utility sederhana
- Prioritaskan native browser API jika cukup

# Third-party Library Rules
Sebelum install package:
- cek ukuran bundle
- cek maintenance package
- cek apakah benar-benar diperlukan

# Next.js Rendering Strategy

# Default
- Gunakan Server Component sebagai default
- Kurangi penggunaan client component

# Server Component
Gunakan untuk:
- static content
- initial data
- layout
- non-interactive UI

# Client Component
Gunakan hanya jika membutuhkan:
- interaction
- hooks client
- browser API

# Static Generation (SSG)
Gunakan untuk:
- halaman statis
- halaman jarang berubah
- landing page
- documentation

# ISR (Incremental Static Regeneration)
Gunakan untuk:
- data yang berubah berkala
- statistik
- public trip preview jika ada

# SSR
Gunakan hanya jika:
- data harus selalu fresh
- personalized content
- auth-protected page

# Fetching Performance
- Hindari waterfall request
- Fetch paralel jika memungkinkan
- Cache data yang jarang berubah
- Gunakan React Query cache untuk client-side

# Mobile Performance Rules
- Prioritaskan fast first render
- Hindari animation berat
- Hindari layout shift
- Minimalkan JavaScript di mobile
- Pastikan usable di koneksi lambat

# Loading UX
- Gunakan skeleton loading
- Hindari blank screen
- Gunakan optimistic UI seperlunya
- Loading state harus konsisten

# List Rendering
- Gunakan pagination atau infinite scroll untuk list besar
- Hindari render data terlalu banyak sekaligus
- Gunakan virtualization jika data sangat besar di masa depan

# Form Performance
- Hindari rerender seluruh form
- Pisahkan form section jika kompleks
- Debounce input search/filter jika diperlukan

# Monitoring
- Gunakan Lighthouse untuk audit performance
- Monitor:
  - bundle size
  - hydration
  - largest contentful paint
  - interaction delay

# Target Performance
- Mobile-first optimization
- Fast 3G masih usable
- Initial load ringan
- Interaction terasa instan di mobile modern
```


---

## 12. Git Rules

```
# Git Rules

# Workflow Utama
- Setiap selesai membuat perubahan atau penambahan kode:
  - wajib commit terlebih dahulu sebelum lanjut task berikutnya
- Tujuan:
  - mempermudah tracking perubahan
  - mempermudah compare code lama dan baru
  - mempermudah rollback jika terjadi masalah
  - menjaga history project tetap rapi

# Aturan Commit
- Satu commit hanya untuk satu perubahan spesifik
- Jangan gabungkan banyak perubahan berbeda dalam satu commit
- Commit message wajib jelas dan deskriptif
- Hindari commit message seperti:
  - update
  - fix bug
  - revise
  - wip

# Format Commit Message

ADD     : fitur baru
FIX     : perbaikan bug
REF     : refactor kode
IMP-STYLE : styling atau formatting
DOCS    : dokumentasi

# Contoh Commit Message
[ADD]: add create trip feature
[ADD]: implement expense split calculation
[FIX]: resolve incorrect balance calculation
[FIX]: prevent duplicate member join
[REF]: extract settlement logic into service
[IMP-STYLE]: improve mobile bottom navigation spacing
[DOCS]: update project setup documentation

# Branch Rules
- Setiap fitur baru dibuat di branch terpisah
- Jangan langsung develop di main/master

# Format Branch
- feat/[nama-fitur]
- fix/[nama-bug]
- hotfix/[nama]
- refactor/[nama]

# Contoh Branch
- feat/create-trip
- feat/add-expense
- fix/balance-calculation
- refactor/trip-service

# Pull Request Rules
- Satu PR fokus pada satu tujuan
- PR wajib memiliki:
  - tujuan perubahan
  - ringkasan perubahan
  - screenshot jika ada perubahan UI
  - cara testing

# File Rules
- Jangan commit:
  - .env
  - credential
  - API key
  - token
  - secret file
  - local config machine

# Wajib Tambahkan ke .gitignore
- .env
- .env.local
- node_modules
- .next
- dist
- coverage

# Commit Quality Rules
Sebelum commit:
- pastikan project bisa build
- pastikan lint tidak error
- pastikan tidak ada console.log yang tidak diperlukan
- pastikan tidak ada dead code
- pastikan format code sudah rapi

# Code Review Mindset
Setiap commit harus:
- mudah dipahami
- mudah direview
- mudah dirollback
- tidak terlalu besar

# Refactor Rules
- Jangan campur refactor dengan fitur baru
- Refactor harus memiliki commit terpisah
- Hindari perubahan besar tanpa alasan jelas

# Emergency Rules
Jika ada bug production:
- gunakan branch hotfix/
- fokus hanya memperbaiki bug tersebut
- jangan selipkan improvement lain

# Git History Rules
- Gunakan history commit yang bersih dan konsisten
- Prioritaskan readability commit history
- Commit kecil dan jelas lebih baik daripada commit besar campur aduk
```


---

## 13. Features

```
# Sudah selesai dan berjalan
- [ ] Belum ada fitur yang selesai

# Sedang dikerjakan — jangan diubah tanpa konfirmasi
- [ ] Belum ada fitur yang sedang dikerjakan

# Belum dimulai
- [ ] Authentication dan onboarding user
- [ ] Create trip / room
- [ ] Invite member via kode atau QR
- [ ] Join trip
- [ ] Pair / group member
- [ ] Add expense
- [ ] Split expense logic
- [ ] Expense history
- [ ] Balance calculation
- [ ] Settlement calculation
- [ ] Mark settlement as paid
- [ ] Trip summary
- [ ] User profile
- [ ] Responsive mobile layout
- [ ] Empty state dan loading state
- [ ] Error handling UI
- [ ] Notification system
- [ ] Receipt upload
- [ ] Currency formatting
- [ ] Analytics / trip statistics
- [ ] Deployment setup
```


---

## 14. Do Not

```txt id="d0n0t1"
# Klarifikasi Sebelum Coding
- Jika instruksi ambigu atau tidak jelas:
  - wajib bertanya terlebih dahulu
  - jangan berasumsi sendiri
  - jangan langsung implementasi tanpa konfirmasi

# Struktur dan File
- Jangan buat folder baru tanpa konfirmasi
- Jangan hapus file tanpa konfirmasi
- Jangan pindahkan file tanpa konfirmasi
- Jangan ubah struktur folder yang sudah ada tanpa izin
- Jangan rename file atau folder tanpa konfirmasi

# Kode
- Jangan gunakan tipe 'any' di TypeScript
- Jangan gunakan @ts-ignore tanpa alasan yang jelas
- Jangan hardcode value yang seharusnya menggunakan environment variable
- Jangan commit file .env atau file yang berisi secret
- Jangan install package baru tanpa konfirmasi
- Jangan ubah fitur yang sudah berjalan tanpa instruksi jelas
- Jangan hapus kode lama tanpa memahami dampaknya
- Jangan membuat abstraction berlebihan terlalu awal

# Pattern yang Dilarang
- Jangan gunakan useEffect untuk data fetching
- Jangan gunakan inline style untuk styling yang bisa menggunakan Tailwind utility
- Jangan gunakan global state untuk state lokal sederhana
- Jangan gunakan satu store besar untuk semua state
- Jangan gunakan default export selain untuk page.tsx dan layout.tsx
- Jangan gunakan nested ternary yang sulit dibaca
- Jangan gunakan magic number atau hardcoded constant langsung di component

# Package yang Tidak Boleh Digunakan
- Jangan gunakan Redux
- Jangan gunakan jQuery
- Jangan gunakan styled-components
- Jangan gunakan Moment.js
- Jangan gunakan lodash seluruh package import
- Jangan gunakan UI library selain shadcn/ui tanpa konfirmasi

# Database
- Jangan jalankan query destructive tanpa konfirmasi
- Jangan hapus data production
- Jangan reset database tanpa konfirmasi
- Jangan buat migrasi database tanpa konfirmasi
- Jangan expose credential database ke client
- Jangan query database langsung dari component UI

# API dan Fetching
- Jangan fetch data langsung di component menggunakan useEffect
- Jangan skip validation request
- Jangan expose internal server error ke client
- Jangan percaya data dari client tanpa validasi
- Jangan hardcode API URL

# Security
- Jangan expose API key atau secret ke client
- Jangan bypass authentication atau authorization
- Jangan skip error handling di API routes
- Jangan simpan secret di repository
- Jangan render sensitive data tanpa permission check
- Jangan percaya role atau permission dari frontend saja


# Performance
- Jangan gunakan 'use client' tanpa alasan jelas
- Jangan import seluruh library jika hanya butuh sebagian kecil
- Jangan optimize prematur tanpa profiling
- Jangan render data besar sekaligus tanpa pagination/lazy loading

# Styling
- Jangan gunakan !important
- Jangan hardcode warna langsung di component
- Jangan membuat desktop-first layout
- Jangan abaikan dark mode
- Jangan gunakan ukuran tap area kecil di mobile

# Testing dan Quality
- Jangan merge code yang belum dites
- Jangan biarkan lint error
- Jangan biarkan dead code menumpuk
- Jangan biarkan TODO tanpa context yang jelas
```


---

## 16. Environment Variables

```
# Setup
- Copy .env.example ke .env.local untuk development lokal
- Jangan pernah commit file .env atau .env.local ke repository
- Semua environment variable wajib didefinisikan di .env.example
- Gunakan helper validation untuk memastikan env tersedia saat aplikasi dijalankan

# Public Variables — aman dipakai di sisi client
NEXT_PUBLIC_APP_NAME              # Nama aplikasi
NEXT_PUBLIC_APP_URL               # Base URL aplikasi untuk client
NEXT_PUBLIC_API_BASE_URL          # Base URL API public
NEXT_PUBLIC_ENABLE_DEBUG          # Flag untuk debug mode client
NEXT_PUBLIC_DEFAULT_CURRENCY      # Mata uang default aplikasi

# Server-only Variables — JANGAN pernah expose ke client
DATABASE_URL                      # Connection string PostgreSQL database
BETTER_AUTH_SECRET                # Secret utama authentication
BETTER_AUTH_URL                   # Base URL auth server
GOOGLE_CLIENT_ID                  # Google OAuth client ID
GOOGLE_CLIENT_SECRET              # Google OAuth client secret
GITHUB_CLIENT_ID                  # GitHub OAuth client ID
GITHUB_CLIENT_SECRET              # GitHub OAuth client secret
UPLOADTHING_SECRET                # Secret upload service
UPLOADTHING_APP_ID                # Upload service app ID
RESEND_API_KEY                    # API key email service
SMTP_HOST                         # SMTP host email service
SMTP_PORT                         # SMTP port email service
SMTP_USER                         # SMTP username
SMTP_PASSWORD                     # SMTP password
REDIS_URL                         # Redis connection URL jika digunakan
CRON_SECRET                       # Secret untuk internal cron job

# Auth Variables
BETTER_AUTH_SECRET                # Secret untuk session dan token signing
BETTER_AUTH_URL                   # Base URL aplikasi auth
GOOGLE_CLIENT_ID                  # Google OAuth client ID
GOOGLE_CLIENT_SECRET              # Google OAuth client secret — server only
GITHUB_CLIENT_ID                  # GitHub OAuth client ID
GITHUB_CLIENT_SECRET              # GitHub OAuth client secret — server only

# Environment Rules
- Semua secret hanya boleh diakses di server
- Jangan gunakan NEXT_PUBLIC_ untuk data sensitif
- Jangan hardcode credential di source code
- Jangan log environment variable sensitif
- Jangan expose database URL ke client
- Gunakan NEXT_PUBLIC_ hanya jika benar-benar dibutuhkan di frontend

# Environment Files
- .env.example      # Template environment variable
- .env.local        # Development lokal
- .env.production   # Production server
- .env.test         # Testing environment

# Validation Rules
- Validasi semua environment variable saat aplikasi startup
- Aplikasi harus gagal start jika env penting tidak tersedia
- Gunakan helper validation yang type-safe

# Naming Convention
- Gunakan UPPER_SNAKE_CASE
- Gunakan prefix NEXT_PUBLIC_ hanya untuk client-side variable
- Gunakan nama yang jelas dan deskriptif
```


---
