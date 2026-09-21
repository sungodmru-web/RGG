# Reclaiming the Green Gold

Ultra-luxury institutional website for the book "Reclaiming the Green Gold: Cannabis at the Crossroads of Health, Justice and Sustainable Development" by Dr Sunil Sweenarain & Sunny Sweenarain.

## Run & Operate

- `pnpm --filter @workspace/rgg-website run dev` — run the website (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all Replit workspace packages
- `npm run build` — Hostinger production build for the API and website
- `pnpm run build:all` — production build plus the Replit mockup sandbox
- `PORT=3000 npm start` — run the complete production app through Express

## Stack

- npm Hostinger production workspaces plus the retained pnpm Replit workspace,
  Node.js 22, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion
- API: Express 5 (minimal, no DB needed for this site)
- Fonts: Playfair Display (serif headings), Inter (body)

## Where things live

- `artifacts/rgg-website/` — the main website (React + Vite)
- `artifacts/rgg-website/src/index.css` — design tokens, palette, typography
- `artifacts/rgg-website/src/App.tsx` — router and layout shell
- `artifacts/rgg-website/src/pages/` — page components
- `artifacts/rgg-website/src/components/` — reusable UI components
- `artifacts/api-server/` — Express API server (health check only)

## Architecture decisions

- Presentation-first: single-page scrolling site, no backend required
- No OpenAPI/codegen: static content only, no dynamic data
- Framer Motion for all scroll-triggered reveals and hero animations
- CSS-only 3D book mockup (perspective transform, no external image)
- Google Fonts loaded via @import in index.css (Playfair Display)

## Product

A cinematic, ultra-luxury institutional website that sells the book in three formats (Hardcover, Paperback, Ebook). Ten sections: Hero, Global Governance Transition, Book Structure (5 Parts), Seven Governance Layers, Why This Work Matters, Practical Toolkit, Book Editions, Authors, Journal, Advisory, Newsletter, Footer.

## Design System

- Background: #0B0B0B (matte black)
- Deep Emerald: #0D3B2E
- Gold: #C8A96B (primary accent)
- Bright Gold: #EDD99A (display headings)
- Ivory: #F4F1EA (body text)
- Charcoal: #161616
- Headings: Playfair Display (serif, italic for "Green Gold")
- Body: Inter

## User preferences

- Ultra-luxury, cinematic, institutional aesthetic
- NOT a cannabis dispensary or lifestyle brand — luxury publishing / governance think tank feel
- No marijuana leaf icons, no neon green, no smoke effects
- Massive whitespace, slow premium motion, editorial layout

## Gotchas

- The website preview path is "/" (root) — any other artifact must use a sub-path
- Framer Motion useInView requires `once: true, margin: "-100px"` for reliable scroll reveals
- Google Fonts must be loaded in index.css via @import before Tailwind directives
