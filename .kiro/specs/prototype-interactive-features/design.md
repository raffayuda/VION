# Design Document: Prototype Interactive Features

## Overview

Fitur ini mengubah seluruh halaman Finova dari tampilan statis (data dari `dummy.ts`) menjadi prototype interaktif penuh. Tidak ada backend — semua state disimpan in-memory menggunakan Svelte stores dan dipersist ke localStorage.

Pendekatan utama:
- **Centralized store** (`appStore.ts`) sebagai single source of truth
- **Reusable UI primitives** (Modal, Toast, ConfirmDialog) yang konsisten di semua halaman
- **Per-page form modals** untuk operasi CRUD
- **Derived stores** untuk kalkulasi otomatis (totalSaldo, totalPemasukan, dll.)

Semua halaman yang sudah ada UI-nya hanya perlu di-*wire* ke store — tidak ada perombakan layout.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │  localStorage │◄──►│         appStore.ts              │  │
│  │ finova_state  │    │  (writable + derived stores)     │  │
│  └──────────────┘    └──────────┬───────────────────────┘  │
│                                 │ reactive subscriptions    │
│  ┌──────────────────────────────▼───────────────────────┐  │
│  │                    SvelteKit Pages                    │  │
│  │  /  /transaksi  /anggaran  /tujuan  /ocr  /insight   │  │
│  │  /laporan  /investasi  /rekening  /pengaturan         │  │
│  │  /bantuan                                             │  │
│  └──────────────────────────────┬───────────────────────┘  │
│                                 │ uses                      │
│  ┌──────────────────────────────▼───────────────────────┐  │
│  │              Shared UI Components                     │  │
│  │  Modal  ConfirmDialog  Toast  ToastContainer          │  │
│  │  (+ per-page form modals)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action
    │
    ▼
Page Component (e.g., /transaksi)
    │  calls store action
    ▼
appStore.ts
    ├── mutates writable store
    ├── derived stores recalculate automatically
    ├── persists to localStorage (via $effect / subscribe)
    └── triggers toast notification
         │
         ▼
    ToastContainer (in +layout.svelte)
         │
         ▼
    Toast displayed to user
```

### Store Initialization Flow

```
App Load
    │
    ▼
appStore.ts initializes
    │
    ├── Try: JSON.parse(localStorage.getItem('finova_state'))
    │       │
    │       ├── Success → rehydrate stores from saved state
    │       └── Fail (corrupt/missing) → use dummy.ts defaults
    │                                    + console.warn
    │
    └── Set up $effect to persist on every state change
```

---

## Components and Interfaces

### 1. `src/lib/stores/appStore.ts`

Store terpusat. Mengekspos writable stores, derived stores, dan action functions.

```typescript
// Writable stores
export const transactions: Writable<Transaction[]>
export const budgetCategories: Writable<BudgetCategory[]>
export const financialGoals: Writable<FinancialGoal[]>
export const investments: Writable<Investment[]>
export const wallets: Writable<Wallet[]>
export const insights: Writable<Insight[]>
export const userProfile: Writable<UserProfile>

// Derived stores
export const totalSaldo: Readable<number>       // sum(wallets.balance)
export const totalPemasukan: Readable<number>   // sum(income transactions)
export const totalPengeluaran: Readable<number> // sum(expense transactions)
export const sisaBudget: Readable<number>       // totalPemasukan - totalPengeluaran

// Action functions (pure mutations + toast trigger)
export function addTransaction(tx: Omit<Transaction, 'id'>): void
export function updateTransaction(id: number, tx: Partial<Transaction>): void
export function deleteTransaction(id: number): void

export function addBudget(b: Omit<BudgetCategory, 'id'>): void
export function updateBudget(id: number, b: Partial<BudgetCategory>): void
export function deleteBudget(id: number): void

export function addGoal(g: Omit<FinancialGoal, 'id'>): void
export function updateGoal(id: number, g: Partial<FinancialGoal>): void
export function deleteGoal(id: number): void
export function addFundsToGoal(id: number, amount: number): void

export function addInvestment(inv: Omit<Investment, 'id'>): void
export function updateInvestment(id: number, inv: Partial<Investment>): void
export function deleteInvestment(id: number): void

export function addWallet(w: Omit<Wallet, 'id'>): void
export function updateWallet(id: number, w: Partial<Wallet>): void
export function deleteWallet(id: number): void

export function updateUserProfile(profile: Partial<UserProfile>): void
export function dismissInsight(id: number): void
export function markInsightRead(id: number): void
```

**localStorage persistence** menggunakan `$effect` (Svelte 5 runes) yang subscribe ke semua writable stores dan menyimpan snapshot ke `finova_state`.

### 2. `src/lib/stores/toastStore.ts`

```typescript
export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration?: number // default 3000ms
}

export const toasts: Writable<ToastItem[]>

export function showToast(message: string, type?: ToastType): void
export function dismissToast(id: number): void
```

### 3. `src/lib/components/Modal.svelte`

Props:
```typescript
interface Props {
  open: boolean
  title: string
  onclose: () => void
  size?: 'sm' | 'md' | 'lg'  // default 'md'
}
```

Behavior:
- Glassmorphism overlay: `backdrop-blur-sm`, `rgba(0,0,0,0.4)` background
- Border radius 32px, sesuai design system
- Focus trap: saat open, Tab key hanya berpindah di dalam modal
- Escape key menutup modal
- Klik backdrop menutup modal
- `overflow-y: auto` untuk konten panjang
- Mencegah scroll background (`document.body.style.overflow = 'hidden'`)

### 4. `src/lib/components/ConfirmDialog.svelte`

Props:
```typescript
interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string  // default 'Hapus'
  onconfirm: () => void
  oncancel: () => void
}
```

Menggunakan Modal.svelte sebagai base. Tombol konfirmasi berwarna merah/destructive.

### 5. `src/lib/components/Toast.svelte` + `ToastContainer.svelte`

`ToastContainer.svelte` di-mount di `+layout.svelte`, posisi `fixed top-4 right-4 z-50`.

Setiap `Toast.svelte`:
- Slide-in dari kanan dengan CSS transition
- Auto-dismiss setelah `duration` ms
- Klik untuk dismiss manual
- Warna: success=hijau, error=merah, info=orange (primary)

### 6. Per-Page Form Modals

Setiap halaman memiliki form modal-nya sendiri (inline di page atau komponen terpisah):

| Modal | Halaman | Fields |
|-------|---------|--------|
| `TransaksiFormModal` | /transaksi | merchant, amount, category, date, type, walletId, notes |
| `AnggaranFormModal` | /anggaran | name, budget, icon, color |
| `TujuanFormModal` | /tujuan | name, target, current, deadline, icon, color |
| `AddFundsModal` | /tujuan | amount |
| `InvestasiFormModal` | /investasi | product, provider, value, profit, roi, color |
| `WalletFormModal` | /rekening | name, type, balance, icon, color |
| `ProfileEditModal` | /pengaturan | name, email, phone |
| `ContactFormModal` | /bantuan | name, email, subject, message |

Semua form modal mengikuti pola:
1. Validasi inline (error message di bawah field)
2. Submit → call store action → close modal → show toast
3. Mode add vs edit ditentukan oleh prop `editData?: T | null`

---

## Data Models

### Transaction

```typescript
interface Transaction {
  id: number
  merchant: string        // non-empty
  category: string
  date: string            // ISO date string 'YYYY-MM-DD'
  amount: number          // absolute value, > 0
  type: 'income' | 'expense'
  icon?: string
  walletId?: number
  notes?: string
}
```

### BudgetCategory

```typescript
interface BudgetCategory {
  id: number
  name: string            // non-empty
  budget: number          // > 0
  used: number            // >= 0
  color: string
  icon: string
}
```

### FinancialGoal

```typescript
interface FinancialGoal {
  id: number
  name: string            // non-empty
  target: number          // > 0
  current: number         // 0 <= current <= target
  deadline: string        // ISO date string
  icon: string
  color: string
}
```

### Investment

```typescript
interface Investment {
  id: number
  product: string         // non-empty
  provider: string
  value: number           // > 0
  profit: number          // can be negative
  roi: number             // percentage
  color: string
}
```

### Wallet

```typescript
interface Wallet {
  id: number
  name: string            // non-empty
  type: 'Bank' | 'E-Wallet' | 'Tunai'
  balance: number         // >= 0
  icon: string
  color: string
}
```

### Insight

```typescript
interface Insight {
  id: number
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  color: string
  dismissed: boolean      // default false
  read: boolean           // default false
}
```

### UserProfile

```typescript
interface UserProfile {
  name: string            // non-empty
  email: string           // valid email format
  phone?: string
  avatar: string | null
  plan: 'free' | 'premium'
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'id' | 'en'
    currency: string
    notifications: {
      billReminder: boolean
      overBudgetAlert: boolean
      weeklyReport: boolean
      promoUpdate: boolean
    }
  }
}
```

### AppState (localStorage shape)

```typescript
interface AppState {
  transactions: Transaction[]
  budgetCategories: BudgetCategory[]
  financialGoals: FinancialGoal[]
  investments: Investment[]
  wallets: Wallet[]
  insights: Insight[]
  userProfile: UserProfile
  version: number  // untuk future migrations
}
```

---

## Per-Page Interaction Design

### Dashboard (`/`)

- Summary cards subscribe ke `$totalSaldo`, `$totalPemasukan`, `$totalPengeluaran`, `$sisaBudget`
- Eye icon pada Total Saldo card: toggle `saldoVisible` state lokal → tampilkan `Rp ••••••`
- Quick Action buttons: navigasi ke halaman terkait via `goto()`
- Recent transactions: subscribe ke `$transactions` (slice 5 terbaru)
- Budget progress bars: subscribe ke `$budgetCategories`
- Goal progress bars: subscribe ke `$financialGoals`

### Transaksi (`/transaksi`)

- List subscribe ke `$transactions` dengan filter reaktif (tab, search, kategori)
- Search: debounce 300ms menggunakan `$state` + `$derived`
- Tab filter: `$state('Semua')` → filter by `type`
- Category filter: dropdown → filter by `category`
- "Tambah Transaksi" → buka `TransaksiFormModal` (mode add)
- CircleEllipsis → dropdown menu "Edit" / "Hapus"
- Edit → buka `TransaksiFormModal` (mode edit, pre-filled)
- Hapus → buka `ConfirmDialog` → konfirmasi → `deleteTransaction(id)`

### Anggaran (`/anggaran`)

- Summary cards: derived dari `$budgetCategories`
- Budget rows: subscribe ke `$budgetCategories`
- Warning indicator: `pct >= 85` → warna merah pada progress bar dan label
- "Buat Anggaran Baru" → `AnggaranFormModal`
- CircleEllipsis → "Edit" / "Hapus"

### Tujuan (`/tujuan`)

- Goal cards: subscribe ke `$financialGoals`
- Summary cards: derived dari `$financialGoals`
- CircleEllipsis → "Edit" / "Tambah Dana" / "Hapus"
- "Tambah Dana" → `AddFundsModal` → `addFundsToGoal(id, amount)` (capped at target)
- Goal `current === target` → tampilkan badge "Tercapai!"

### OCR (`/ocr`)

- Simulasi OCR sudah ada (progress bar, timer) — tinggal wire ke store
- "Simpan Transaksi" button: disabled saat `processing === true`
- Klik "Simpan Transaksi" (saat `progress === 100`):
  1. `addTransaction({ merchant: ocrResult.merchant, amount: totalBelanja, category, date, type: 'expense', notes })`
  2. Show toast "Transaksi OCR berhasil disimpan"
  3. Reset state: `resetPreview()`

### Insight (`/insight`)

- Insight list: subscribe ke `$insights`, filter `!dismissed`
- "Detail" button: toggle `expandedId` state lokal → tampilkan full description
- "Tandai Sudah Dibaca": `markInsightRead(id)` → visual read state
- "×" dismiss: `dismissInsight(id)` → fade-out animation → hilang dari list
- Empty state saat semua dismissed
- Period filter (select): update `selectedPeriod` state lokal → simulated loading 500ms

### Laporan (`/laporan`)

- Stats cards: derived dari `$transactions` filtered by date range
- Date range button → `DateRangePicker` (simple modal dengan 2 date inputs)
- "Export PDF/Excel" → dropdown → `showToast("Mengunduh...", 'info')` → setTimeout 1500ms → `showToast("Berhasil diunduh (simulasi)", 'success')`
- "Filter" → `FilterPanel` (modal/drawer dengan category, type, min/max amount)

### Investasi (`/investasi`)

- Table subscribe ke `$investments`
- Summary cards: derived dari `$investments`
- "Tambah Investasi" → `InvestasiFormModal`
- Row click → action menu "Edit" / "Hapus"

### Rekening (`/rekening`)

- Halaman baru yang perlu dibuat (belum ada di existing pages)
- Wallet cards: subscribe ke `$wallets`
- Total saldo: subscribe ke `$totalSaldo`
- "Tambah Rekening" → `WalletFormModal`
- Action menu per wallet: "Edit" / "Hapus"

### Pengaturan (`/pengaturan`)

- Profile card: subscribe ke `$userProfile`
- "Edit Profil" → `ProfileEditModal`
- Notification toggles: `updateUserProfile({ preferences: { notifications: { ... } } })`
- Theme/language select: `updateUserProfile({ preferences: { theme/language } })`
- Settings items (Ubah Password, PIN, dll.): buka informational modal

### Bantuan (`/bantuan`)

- FAQ accordion: sudah ada `openFaq` state, hanya perlu memastikan single-open behavior (sudah benar)
- "Live Chat" / "Email Support" → `ContactFormModal`
- "Panduan Pengguna" → expand inline panel atau modal dengan daftar fitur

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: localStorage Round-Trip

*For any* sequence of mutations to the app store (add/update/delete on any entity), serializing the state to localStorage and then re-initializing the store from that localStorage value should produce a store state that is deeply equal to the state before serialization.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: totalSaldo Invariant

*For any* set of wallets in the store, the derived `totalSaldo` value must always equal the arithmetic sum of all wallet `balance` fields.

**Validates: Requirements 1.5, 9.9**

---

### Property 3: Derived Financial Totals Invariant

*For any* set of transactions in the store, `totalPemasukan` must equal the sum of `amount` for all transactions with `type === 'income'`, and `totalPengeluaran` must equal the sum of `amount` for all transactions with `type === 'expense'`, and `sisaBudget` must equal `totalPemasukan - totalPengeluaran`.

**Validates: Requirements 1.5, 2.12**

---

### Property 4: Transaction Validation Rejection

*For any* transaction input where `amount <= 0` or `merchant` is an empty/whitespace-only string, calling `addTransaction` should leave the transactions list unchanged (no new entry added).

**Validates: Requirements 2.3**

---

### Property 5: Transaction Add Round-Trip

*For any* valid transaction data (amount > 0, non-empty merchant), after calling `addTransaction`, the resulting transactions list should contain an entry whose `merchant`, `amount`, `type`, and `category` match the input data.

**Validates: Requirements 2.2**

---

### Property 6: Transaction Filter Correctness

*For any* filter state (search string, category, tab type), all transactions in the filtered result set must satisfy every active filter condition simultaneously: merchant/category contains the search string (case-insensitive), category matches the selected category filter, and type matches the selected tab.

**Validates: Requirements 2.9, 2.10, 2.11**

---

### Property 7: Budget Validation Rejection

*For any* budget input where `budget <= 0` or `name` is empty/whitespace-only, calling `addBudget` should leave the budgetCategories list unchanged.

**Validates: Requirements 3.3**

---

### Property 8: Budget Warning Threshold Invariant

*For any* budget category, the warning indicator (visual flag) should be shown if and only if `used / budget >= 0.85`. This must hold for all budget categories regardless of their absolute values.

**Validates: Requirements 3.8**

---

### Property 9: Budget Summary Invariant

*For any* set of budget categories, the computed summary values must satisfy: `totalBudget = sum(budget)`, `totalUsed = sum(used)`, `totalLeft = totalBudget - totalUsed`, and `usedPct = round(totalUsed / totalBudget * 100)`.

**Validates: Requirements 3.9**

---

### Property 10: Goal Funds Cap Invariant

*For any* financial goal and any positive `amount` passed to `addFundsToGoal`, the resulting `current` value must equal `min(goal.current + amount, goal.target)`. The `current` value must never exceed `target`.

**Validates: Requirements 4.6**

---

### Property 11: Goal Completion Invariant

*For any* financial goal where `current === target`, the goal should be flagged as completed (the "Tercapai!" badge condition evaluates to true). For any goal where `current < target`, the condition must evaluate to false.

**Validates: Requirements 4.10**

---

### Property 12: Goal Summary Invariant

*For any* set of financial goals, the computed summary values must satisfy: `totalGoals = goals.length`, `totalCurrent = sum(current)`, `totalTarget = sum(target)`, and `avgProgress = round(totalCurrent / totalTarget * 100)`.

**Validates: Requirements 4.11**

---

### Property 13: Dismissed Insights Filter Invariant

*For any* set of insights, the visible insight list (insights shown to the user) must contain only insights where `dismissed === false`. If all insights have `dismissed === true`, the visible list must be empty.

**Validates: Requirements 6.3, 6.4**

---

### Property 14: Investment Validation Rejection

*For any* investment input where `value <= 0` or `product` is empty/whitespace-only, calling `addInvestment` should leave the investments list unchanged.

**Validates: Requirements 8.3**

---

### Property 15: Investment Summary Invariant

*For any* set of investments, the computed summary values must satisfy: `totalValue = sum(value)`, `totalProfit = sum(profit)`, and `count = investments.length`.

**Validates: Requirements 8.8**

---

### Property 16: Wallet Validation Rejection

*For any* wallet input where `name` is empty/whitespace-only or `balance < 0`, calling `addWallet` should leave the wallets list unchanged.

**Validates: Requirements 9.4**

---

### Property 17: FAQ Single-Open Invariant

*For any* sequence of FAQ accordion interactions (open/close/switch), at most one FAQ item should have `isOpen === true` at any point in time. Opening a new item must close the previously open one.

**Validates: Requirements 11.3**

---

### Property 18: Toast Queue No-Overlap Invariant

*For any* sequence of `showToast` calls, all active toasts in the queue must have unique `id` values. No two toasts should share the same id at any point in time.

**Validates: Requirements 12.4**

---

### Property 19: Saldo Visibility Toggle Round-Trip

*For any* initial visibility state of the saldo display, toggling the Eye icon twice (hide then show) must return the display to its original state, showing the actual numeric value.

**Validates: Requirements 14.5**

---

## Error Handling

### localStorage Errors

- **Corrupt data**: `JSON.parse` failure → catch error → `console.warn('finova_state corrupt, using defaults')` → initialize from `dummy.ts`
- **Storage quota exceeded**: `localStorage.setItem` failure → catch error → `console.warn('localStorage quota exceeded')` → continue in-memory only (no crash)
- **Private browsing / disabled storage**: Same as quota exceeded — graceful degradation

### Form Validation Errors

Semua form modal menggunakan inline validation (tidak menggunakan browser native validation):

```typescript
// Pattern untuk semua form
let errors = $state<Record<string, string>>({})

function validate(): boolean {
  errors = {}
  if (!merchant.trim()) errors.merchant = 'Nama merchant tidak boleh kosong'
  if (amount <= 0) errors.amount = 'Jumlah harus lebih dari 0'
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  // proceed with store action
}
```

Error message ditampilkan di bawah field dengan warna merah (`color: #EA580C`).

### Store Action Errors

Store actions tidak melempar exception — mereka silent-fail dengan validasi di dalam action:

```typescript
export function addTransaction(tx: Omit<Transaction, 'id'>): void {
  if (!tx.merchant?.trim() || tx.amount <= 0) return // silent reject
  transactions.update(list => [...list, { ...tx, id: generateId() }])
  showToast('Transaksi berhasil ditambahkan', 'success')
}
```

### OCR Errors

- Kamera tidak bisa diakses → `camState = 'error'` → tampilkan pesan error inline (sudah ada di kode)
- File upload invalid → tidak ada aksi (browser file picker sudah filter `accept="image/*"`)

---

## Testing Strategy

### Dual Testing Approach

Implementasi menggunakan dua lapisan testing yang saling melengkapi:

1. **Unit tests** (Vitest): Verifikasi contoh spesifik, edge cases, dan kondisi error
2. **Property-based tests** (fast-check): Verifikasi properti universal di semua input yang mungkin

Library PBT yang dipilih: **fast-check** (tersedia di ekosistem npm, kompatibel dengan Vitest, TypeScript-first).

```bash
npm install --save-dev fast-check
```

### Unit Tests

Fokus pada:
- Inisialisasi store dari `dummy.ts` (Requirement 1.1)
- Fallback ke defaults saat localStorage corrupt (Requirement 1.6, edge case)
- OCR save button disabled saat processing (Requirement 5.7)
- Toast auto-dismiss setelah 3 detik (Requirement 12.2)
- Navigasi quick actions di dashboard (Requirement 14.2, 14.3, 14.4)

Contoh:
```typescript
// src/lib/stores/appStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'

describe('appStore initialization', () => {
  it('initializes from dummy.ts when localStorage is empty', () => {
    localStorage.clear()
    // re-import store to trigger initialization
    const { transactions } = await import('./appStore')
    expect(get(transactions)).toHaveLength(dummyTransactions.length)
  })

  it('falls back to defaults when localStorage is corrupt', () => {
    localStorage.setItem('finova_state', 'not-valid-json{{{')
    const { transactions } = await import('./appStore')
    expect(get(transactions)).toHaveLength(dummyTransactions.length)
  })
})
```

### Property-Based Tests

Setiap property test harus:
- Menjalankan minimum **100 iterasi** (fast-check default: 100)
- Memiliki komentar tag yang mereferensikan property di design document
- Menggunakan arbitrary generators yang sesuai

Contoh:
```typescript
// src/lib/stores/appStore.pbt.spec.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { get } from 'svelte/store'

// Feature: prototype-interactive-features, Property 2: totalSaldo Invariant
it('totalSaldo always equals sum of wallet balances', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        id: fc.integer({ min: 1 }),
        name: fc.string({ minLength: 1 }),
        type: fc.constantFrom('Bank', 'E-Wallet', 'Tunai'),
        balance: fc.integer({ min: 0, max: 100_000_000 }),
        icon: fc.string(),
        color: fc.string()
      }), { minLength: 0, maxLength: 10 }),
      (walletList) => {
        wallets.set(walletList)
        const expected = walletList.reduce((sum, w) => sum + w.balance, 0)
        expect(get(totalSaldo)).toBe(expected)
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: prototype-interactive-features, Property 4: Transaction Validation Rejection
it('addTransaction rejects invalid inputs', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.record({ merchant: fc.constant(''), amount: fc.integer({ min: 1 }) }),
        fc.record({ merchant: fc.string({ minLength: 1 }), amount: fc.integer({ max: 0 }) }),
        fc.record({ merchant: fc.stringOf(fc.constant(' ')), amount: fc.integer({ min: 1 }) })
      ),
      (invalidTx) => {
        const before = get(transactions).length
        addTransaction({ ...invalidTx, category: 'Test', date: '2026-01-01', type: 'expense' })
        expect(get(transactions).length).toBe(before)
      }
    ),
    { numRuns: 100 }
  )
})

// Feature: prototype-interactive-features, Property 10: Goal Funds Cap Invariant
it('addFundsToGoal never exceeds target', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 1_000_000 }),  // current
      fc.integer({ min: 1, max: 1_000_000 }),  // target (>= current)
      fc.integer({ min: 1, max: 1_000_000 }),  // amount to add
      (current, targetOffset, amount) => {
        const target = current + targetOffset
        const goal = { id: 1, name: 'Test', target, current, deadline: '2027-01-01', icon: '🎯', color: '#FF8A4C' }
        financialGoals.set([goal])
        addFundsToGoal(1, amount)
        const updated = get(financialGoals).find(g => g.id === 1)!
        expect(updated.current).toBeLessThanOrEqual(updated.target)
        expect(updated.current).toBe(Math.min(current + amount, target))
      }
    ),
    { numRuns: 100 }
  )
})
```

### Test File Structure

```
src/lib/stores/
  appStore.spec.ts          # unit tests untuk store
  appStore.pbt.spec.ts      # property-based tests untuk store

src/lib/components/
  Modal.spec.ts             # unit tests untuk Modal (focus trap, Escape, backdrop)
  Toast.spec.ts             # unit tests untuk Toast (auto-dismiss, manual dismiss)
  ConfirmDialog.spec.ts     # unit tests untuk ConfirmDialog

src/routes/
  transaksi/
    TransaksiFormModal.spec.ts  # validation unit tests
  anggaran/
    AnggaranFormModal.spec.ts
  tujuan/
    TujuanFormModal.spec.ts
  bantuan/
    faq.spec.ts             # single-open invariant test
```

### Property Test Tag Format

Setiap property test harus memiliki komentar:
```
// Feature: prototype-interactive-features, Property {N}: {property_title}
```

Contoh:
```typescript
// Feature: prototype-interactive-features, Property 8: Budget Warning Threshold Invariant
```
