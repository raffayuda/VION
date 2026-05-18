# Finova — Smart Finance Tracker with AI OCR

Version: 1.0  
Author: Raffa Yuda Pratama  
Platform: Web Application  
Tech Stack: Laravel 13, MySQL, React/Inertia, TailwindCSS

---

# 1. Overview

Finova adalah aplikasi pencatatan keuangan modern dengan fitur AI OCR yang memungkinkan pengguna memfoto struk belanja dan secara otomatis mengubahnya menjadi data transaksi.

Aplikasi ini dirancang agar pencatatan keuangan menjadi lebih cepat, modern, dan nyaman digunakan, dengan tampilan premium menggunakan kombinasi style:
- Neumorphism
- Bento Grid
- Glassmorphism
- Warm Minimal Design

Selain fitur OCR, aplikasi juga memiliki budgeting, financial goals, AI insight, analytics dashboard, dan laporan keuangan interaktif.

---

# 2. Problem Statement

Banyak pengguna mengalami kesulitan dalam:
- Mencatat pengeluaran secara konsisten
- Mengetahui uang habis untuk apa
- Mengatur budget bulanan
- Membuat laporan keuangan sederhana
- Input transaksi manual yang memakan waktu

---

# 3. Goals

## Primary Goals
- Mempermudah pencatatan keuangan harian
- Mengurangi input manual menggunakan OCR AI
- Membantu pengguna memahami pola pengeluaran
- Membantu budgeting secara visual

## Secondary Goals
- Membuat finance app yang modern dan tidak membosankan
- Memberikan pengalaman UI premium
- Menyediakan insight finansial berbasis AI

---

# 4. Target Users

## Primary Users
- Mahasiswa
- Freelancer
- Karyawan
- Content Creator
- UMKM kecil

## User Pain Points
- Malas input transaksi manual
- Tidak tahu pengeluaran terbesar
- Sulit mengontrol budget
- Tidak punya financial tracking

---

# 5. Core Features

# 5.1 AI OCR Receipt Scanner

Fitur utama aplikasi.

## Main Function
User dapat memfoto struk belanja dan sistem akan:
- Membaca teks struk
- Mengambil total harga
- Mengambil nama merchant
- Mengambil tanggal transaksi
- Mengambil item belanja
- Membuat transaksi otomatis

## OCR Flow
1. User membuka halaman Scan Struk
2. Kamera aktif
3. User mengambil foto struk
4. AI OCR memproses gambar
5. Sistem menghasilkan data transaksi
6. User melakukan konfirmasi
7. Transaksi tersimpan

## OCR Data Result Example

```json
{
  "merchant": "Indomaret",
  "date": "2026-05-18",
  "items": [
    {
      "name": "Indomie",
      "price": 3500
    }
  ],
  "total": 15000,
  "category": "Makanan"
}
```

---

# 5.2 Dashboard Analytics

Dashboard menampilkan overview kondisi finansial pengguna.

## Components
- Total saldo
- Total pemasukan
- Total pengeluaran
- Sisa budget
- Grafik pemasukan vs pengeluaran
- Budget progress
- Financial goals
- AI insight
- Recent transactions

---

# 5.3 Transaction Management

## Features
- Tambah transaksi manual
- Edit transaksi
- Hapus transaksi
- Upload bukti transaksi
- Filter transaksi
- Search transaksi
- Sort transaksi

---

# 5.4 Budgeting System

## Features
- Budget bulanan
- Budget per kategori
- Warning over budget
- Progress penggunaan budget
- Monthly budgeting analytics

---

# 5.5 Financial Goals

## Features
- Membuat target tabungan
- Menentukan nominal target
- Menentukan deadline
- Progress tracking

## Example Goals
- Dana darurat
- Liburan Jepang
- Beli laptop
- Beli motor

---

# 5.6 AI Financial Insight

Sistem AI memberikan insight sederhana berdasarkan kebiasaan pengeluaran pengguna.

## Example Insights
- "Pengeluaran makanan meningkat 25% minggu ini"
- "Transportasi menjadi kategori terbesar bulan ini"
- "Kamu bisa menghemat Rp200.000 jika mengurangi coffee spending"

---

# 5.7 Recurring Transactions

## Features
- Subscription tracker
- Reminder tagihan
- Transaksi otomatis bulanan
- Payment reminder

---

# 5.8 Wallet & Bank Tracking

## Features
- Multi wallet support
- Cash tracking
- E-wallet tracking
- Bank account tracking

## Supported Wallet
- BCA
- OVO
- GoPay
- Dana
- ShopeePay

---

# 5.9 Reports

## Report Types
- Monthly report
- Category report
- Income vs expense report
- Export PDF
- Export Excel

---

# 6. User Roles

# User
- Mengelola transaksi
- Menggunakan OCR
- Membuat budget
- Melihat laporan

# Admin
- Manage users
- Monitor OCR usage
- Analytics dashboard
- Subscription management

---

# 7. Monetization

## Free Plan
- Limited OCR scans
- Basic analytics
- Standard reports

## Premium Plan
- Unlimited OCR
- Advanced AI insight
- Export reports
- Cloud sync
- Advanced analytics

---

# 8. Tech Stack

## Frontend
- React
- Inertia.js
- TailwindCSS
- Framer Motion

## Backend
- Laravel 13
- Laravel Sanctum
- REST API

## Database
- MySQL

## OCR & AI
Recommended:
- Gemini Vision API
- Groq Vision Model
- OpenAI Vision

---

# 9. Design Direction

## Design Style
- Neumorphism
- Bento Grid
- Soft Glassmorphism
- Warm Minimalism

## Design Goals
- Tidak AI Slop
- Clean modern
- Premium feel
- Soft shadow
- Human-centered UI

---

# 10. Color Palette

## Primary Colors
- Warm Orange — #FF8A4C
- Peach — #FFD6BF
- Cream — #FFF7F2

## Secondary Colors
- Soft Purple — #A78BFA
- Soft Green — #4ADE80

## Background
- #F8F6F3

---

# 11. Future Features

## Planned Features
- AI chatbot financial assistant
- Split bills
- Family finance
- Investment tracker
- Crypto tracker
- Voice transaction input
- Smart saving recommendation

---

# 12. Success Metrics

## KPI
- Daily active users
- OCR usage frequency
- Monthly retention
- Average transaction logged
- Premium conversion rate

---

# 13. Competitive Advantage

## Unique Selling Point
- AI OCR finance tracker dengan UI modern
- Pencatatan transaksi otomatis
- Tampilan premium dan nyaman digunakan
- Insight finansial berbasis AI
- Tidak terlihat seperti aplikasi finance tradisional

```