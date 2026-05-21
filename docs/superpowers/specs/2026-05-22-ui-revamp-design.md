# Engineering Hub — UI Revamp Design Spec
**Date:** 2026-05-22  
**Approach:** Option C — Vercel Docs Minimal

---

## Color System
- Base: `#0a0a0b`
- Surface (cards/nav): `#111113`
- Border: `rgba(255,255,255,0.07)`
- Text primary: `#f1f1f1`
- Text muted: `#888`
- Domain accents: Frontend `#4285f4` | Backend `#f9ab00` | DevOps `#34a853` | System Design `#9b72cb`

## Typography
- Font: system stack (`-apple-system, 'Inter', sans-serif`)
- Scale: 13 / 15 / 18 / 24 / 36 / 52px
- Weights: 400 body / 600 labels / 800 headings

## Navigation
- Sticky top bar, 56px, `backdrop-blur` + 80% opacity background
- Breadcrumb trail on right: `Domains › Frontend › JavaScript` — each segment clickable
- Reading progress bar: 2px line at bottom of nav, fills on scroll (Reader view only)

## Layouts

| Level | Layout | Detail |
|---|---|---|
| Domains | 2-col bento grid | Left-border accent, glow on hover |
| Modules | 2-col grid | Version badge, card count |
| Topics | Vertical timeline | Step numbers in accent, connecting line |
| Reader | Single col, 680px max | Large heading, 2rem section spacing |

## Animations
- Page transition: `opacity 0→1 + translateY 12→0px`, 280ms ease-out
- Card hover: `translateY(-2px)` + border-color, 150ms
- Timeline: staggered entrance, 50ms delay per item
- Progress bar: smooth `width` on scroll

## Tech
- React + Vite + TypeScript + Tailwind v4 + Lucide-react
- All data from `DOMAINS`, `MODULES`, `CONTENT_DB` — no hardcoding
- CSS variables for domain theming via inline style props
- Single `App.tsx` with sub-components, `index.css` for globals
