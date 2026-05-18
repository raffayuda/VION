# Finova — Design System Documentation

---

# 1. Design Philosophy

Finova menggunakan kombinasi style:
- Neumorphism
- Bento Grid
- Soft Glassmorphism
- Warm Minimalism

Design dibuat agar:
- modern
- premium
- clean
- nyaman dilihat lama
- tidak terlihat AI Slop
- terasa human-centered

---

# 2. Design Keywords

## Main Keywords
- Warm
- Elegant
- Modern
- Soft
- Clean
- Premium
- Friendly
- Floating UI
- Minimal
- Organic

---

# 3. Design Direction

## Visual Goals
- Hindari cyberpunk
- Hindari warna terlalu neon
- Hindari UI terlalu ramai
- Fokus readability
- Fokus white space
- Gunakan soft shadow
- Gunakan floating card

---

# 4. Main Design Style

# 4.1 Neumorphism

Digunakan untuk:
- cards
- buttons
- navigation
- widget dashboard

## Characteristics
- soft shadow
- rounded corner besar
- floating effect
- subtle depth

---

# 4.2 Bento Grid

Digunakan pada:
- dashboard layout
- analytics section
- insight section
- budgeting section

## Characteristics
- modular layout
- dynamic grid
- responsive blocks
- visual hierarchy

---

# 4.3 Glassmorphism Accent

Digunakan secara subtle pada:
- modal
- floating action
- OCR overlay
- navbar

## Characteristics
- backdrop blur
- transparent layer
- soft border
- frosted glass effect

---

# 5. Layout Structure

# Main Dashboard Layout

```text
--------------------------------------------------
| Sidebar | Topbar/Search                        |
|         ---------------------------------------
|         | Summary Cards                        |
|         ---------------------------------------
|         | Chart Section | Quick Action         |
|         ---------------------------------------
|         | OCR Widget    | Transactions         |
|         ---------------------------------------
|         | Budgeting     | Financial Goals      |
--------------------------------------------------
```

---

# 6. Grid System

## Desktop
- 12 Column Grid

## Tablet
- 8 Column Grid

## Mobile
- 4 Column Grid

---

# 7. Color Palette

# Primary Colors

## Warm Orange
```css
#FF8A4C
```

## Peach
```css
#FFD6BF
```

## Soft Cream
```css
#FFF7F2
```

---

# Secondary Colors

## Soft Purple
```css
#A78BFA
```

## Mint Green
```css
#4ADE80
```

## Soft Red
```css
#FF6B6B
```

---

# Neutral Colors

## Background
```css
#F8F6F3
```

## Card Background
```css
rgba(255,255,255,0.72)
```

## Border
```css
rgba(255,255,255,0.35)
```

---

# 8. Typography

# Heading Font
Recommended:
- Satoshi
- General Sans
- Clash Display

## Heading Style
- bold
- large spacing
- modern geometric look

---

# Body Font
Recommended:
- Inter
- DM Sans

## Body Style
- clean
- readable
- simple

---

# 9. Font Size System

| Type | Size |
|---|---|
| Hero | 48px |
| H1 | 40px |
| H2 | 32px |
| H3 | 24px |
| Body | 16px |
| Small | 14px |
| Caption | 12px |

---

# 10. Border Radius

| Component | Radius |
|---|---|
| Card | 28px |
| Button | 999px |
| Modal | 32px |
| Input | 18px |
| Sidebar | 36px |

---

# 11. Shadow System

# Soft Neumorphism Shadow

```css
box-shadow:
8px 8px 20px rgba(0,0,0,0.08),
-8px -8px 20px rgba(255,255,255,0.9);
```

---

# Glass Shadow

```css
box-shadow:
0 8px 32px rgba(31, 38, 135, 0.12);
```

---

# 12. Glassmorphism Effect

```css
backdrop-filter: blur(18px);
background: rgba(255,255,255,0.25);
border: 1px solid rgba(255,255,255,0.3);
```

---

# 13. Spacing System

| Size | Value |
|---|---|
| XS | 4px |
| SM | 8px |
| MD | 16px |
| LG | 24px |
| XL | 32px |
| XXL | 48px |
| XXXL | 64px |

---

# 14. UI Components

# 14.1 Cards

## Characteristics
- floating look
- soft shadow
- rounded corners
- glass highlight

## Card Types
- balance card
- analytics card
- transaction card
- budgeting card
- AI insight card

---

# 14.2 Buttons

## Characteristics
- pill shape
- soft glow
- hover elevation
- gradient accent

## Button Types
- primary
- secondary
- ghost
- glass button

---

# 14.3 Inputs

## Characteristics
- soft inset shadow
- rounded shape
- subtle border
- large padding

---

# 14.4 Sidebar

## Characteristics
- floating container
- glass effect
- active menu glow
- clean icons

---

# 14.5 Charts

## Characteristics
- smooth curves
- warm gradient
- minimal labels
- soft animation

---

# 15. Dashboard Sections

# Main Dashboard

Contains:
- balance summary
- expense summary
- income summary
- OCR shortcut
- analytics chart
- quick actions

---

# OCR Section

Contains:
- camera preview
- upload image
- OCR processing state
- extracted transaction data

---

# Transaction Section

Contains:
- recent transactions
- search
- category filter
- sorting

---

# Budgeting Section

Contains:
- category budget
- monthly budget
- progress bar
- overspending warning

---

# Financial Goals Section

Contains:
- savings goals
- progress tracker
- target deadline
- completion percentage

---

# AI Insight Section

Contains:
- spending insight
- saving recommendation
- financial summary
- smart alerts

---

# 16. Animation Guidelines

## Animation Style
- smooth
- elegant
- non aggressive
- soft transition

## Recommended Animation
- fade
- floating hover
- slide transition
- spring animation

---

# 17. Responsive Design

# Breakpoints

| Device | Width |
|---|---|
| Desktop XL | 1440px |
| Desktop | 1280px |
| Laptop | 1024px |
| Tablet | 768px |
| Mobile | 480px |

---

# 18. UX Principles

## Main Principles
- Simple first
- Visual clarity
- Comfortable interaction
- Easy navigation
- Minimal cognitive load

---

# 19. Suggested Frontend Libraries

## UI
- shadcn/ui

## Animation
- Framer Motion

## Chart
- Recharts

## Icons
- Lucide Icons

---

# 20. Landing Page Direction

## Hero Section
- floating dashboard mockup
- warm gradient background
- clean typography

## Features Section
- bento grid layout
- neumorphism cards

## OCR Demo Section
- interactive mockup
- scanning animation

## CTA Section
- premium glassmorphism card
- large rounded button

---

# 21. Mobile App Design Direction

## Style
- iOS inspired
- floating bottom navigation
- large touch targets
- soft card layout

---

# 22. Final Design Goal

Membuat aplikasi finance yang:
- terlihat modern
- premium
- nyaman digunakan
- unik
- memiliki identitas visual kuat
- tidak terlihat generik
- tidak terlihat AI Slop
- berbeda dari aplikasi finance biasa
```

# 23. Icon System

# Icon Style Direction

Finova menggunakan icon style yang:
- rounded
- minimal
- modern
- soft
- clean
- tidak terlalu outline tipis
- tidak terlalu skeuomorphic
- konsisten

---

# Recommended Icon Library

## Primary
- Lucide Icons

## Alternative
- Phosphor Icons
- Hugeicons
- Iconoir

---

# Icon Characteristics

## Rules
- gunakan stroke medium
- hindari icon terlalu detail
- gunakan rounded edges
- gunakan icon konsisten
- gunakan warna soft

---

# Icon Container Style

## Design
- rounded square
- neumorphism background
- soft shadow
- floating effect

## Example
```css
width: 48px;
height: 48px;
border-radius: 18px;
background: rgba(255,255,255,0.65);
box-shadow:
6px 6px 16px rgba(0,0,0,0.06),
-6px -6px 16px rgba(255,255,255,0.9);
```

---

# Icon Color System

| Type | Color |
|---|---|
| Income | #4ADE80 |
| Expense | #FF6B6B |
| Budget | #F59E0B |
| Wallet | #60A5FA |
| OCR | #FF8A4C |
| Goals | #A78BFA |
| Insight | #14B8A6 |

---

# Suggested Icons

| Feature | Icon |
|---|---|
| Dashboard | LayoutDashboard |
| Transactions | ReceiptText |
| OCR Scan | ScanLine |
| Budget | PieChart |
| Wallet | Wallet |
| Goals | Target |
| Reports | BarChart3 |
| Insights | Sparkles |
| Settings | Settings |
| Notifications | Bell |
| Premium | Crown |

---

# 24. Navigation Design

# Sidebar Style

## Characteristics
- floating sidebar
- large padding
- rounded corner besar
- subtle glass effect
- active menu highlight

---

# Active Menu Style

## Characteristics
- warm orange glow
- soft neumorphism
- icon slightly brighter
- pill shape container

## Example
```css
background: #FFF1E8;
color: #FF8A4C;
border-radius: 18px;
```

---

# Sidebar Spacing

| Element | Spacing |
|---|---|
| Menu Gap | 10px |
| Section Gap | 32px |
| Sidebar Padding | 24px |

---

# 25. Dashboard Card Design

# Card Style

## Characteristics
- floating
- soft shadow
- smooth gradient
- layered depth
- large border radius

---

# Card Hover Effect

## Behavior
- slightly lift up
- shadow becomes softer
- smooth transition
- subtle scale

## Example
```css
transform: translateY(-4px);
transition: all 0.3s ease;
```

---

# Card Types

## Small Card
Used for:
- balance
- budget
- income
- expense

## Medium Card
Used for:
- transaction list
- budgeting
- analytics

## Large Card
Used for:
- main chart
- OCR section
- dashboard overview

---

# 26. OCR Page Design

# OCR Camera UI

## Characteristics
- cinematic framing
- scan overlay
- warm ambient background
- clean camera controls

---

# OCR Scan Overlay

## Elements
- corner scanner frame
- animated scan line
- capture button
- flash button
- upload image button

---

# OCR Result Card

## Characteristics
- editable result
- categorized items
- confidence level
- clean list layout

---

# OCR Animation

## Suggested Animation
- scanning line movement
- pulsing capture button
- loading shimmer
- smooth transition

---

# 27. Mobile Design Direction

# Mobile UI Style

## Characteristics
- iOS inspired
- floating bottom navbar
- card-based layout
- large touch targets
- swipe-friendly

---

# Bottom Navigation

## Menu
- Home
- Transactions
- Scan
- Budget
- Profile

## Style
- floating navbar
- glassmorphism background
- center scan button highlighted

---

# Mobile Card Design

## Characteristics
- stacked layout
- larger padding
- rounded 24px
- simplified content

---

# 28. Empty State Design

# Style

## Characteristics
- friendly illustration
- minimal text
- warm accent
- CTA button

---

# Example Empty States

## No Transactions
Illustration:
- wallet
- coins
- receipt

Text:
"Belum ada transaksi"

---

# No Budget
Illustration:
- pie chart
- target

Text:
"Mulai atur budget pertamamu"

---

# 29. Illustration Style

# Illustration Characteristics

## Style
- soft 3D
- pastel colors
- warm lighting
- rounded shapes

---

# Avoid
- AI slop illustration
- cyberpunk
- terlalu neon
- illustration terlalu realistis
- visual terlalu ramai

---

# 30. Micro Interaction

# Hover Interaction

## Behavior
- subtle lift
- smooth scale
- soft glow

---

# Button Interaction

## Behavior
- slight compression
- warm glow
- smooth bounce

---

# Loading State

## Recommended
- shimmer loading
- skeleton card
- animated dots

---

# 31. Notification Design

# Toast Notification

## Characteristics
- rounded pill
- floating
- glass effect
- subtle shadow

---

# Notification Colors

| Type | Color |
|---|---|
| Success | #4ADE80 |
| Error | #FF6B6B |
| Warning | #F59E0B |
| Info | #60A5FA |

---

# 32. Modal Design

# Modal Characteristics

## Style
- glassmorphism layer
- backdrop blur
- floating container
- soft shadow

---

# Modal Radius
```css
border-radius: 32px;
```

---

# Modal Padding
```css
padding: 32px;
```

---

# 33. Accessibility

# Accessibility Rules

## Typography
- minimum 14px text
- high readability

## Contrast
- jangan terlalu low contrast
- tetap readable walaupun soft

## Touch Target
- minimum 44px

---

# 34. Design Consistency Rules

# Rules

## DO
- gunakan white space besar
- gunakan shadow soft
- gunakan radius konsisten
- gunakan warm colors

## DON'T
- jangan gunakan glow berlebihan
- jangan gunakan border terlalu keras
- jangan gunakan terlalu banyak gradient
- jangan gunakan icon random style
- jangan gunakan warna terlalu neon

---

# 35. Final UI Feeling

Finova harus terasa seperti:
- modern startup product
- clean fintech app
- premium productivity app
- calm financial assistant

Bukan seperti:
- dashboard admin template biasa
- aplikasi finance jadul
- AI generated random UI
- cyberpunk UI
- crypto dashboard generic
```