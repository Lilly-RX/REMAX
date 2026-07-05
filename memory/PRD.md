# PRD — RE/MAX Active Broker

## Original Problem Statement
Modern, professional Czech-language website for the real estate agency "RE/MAX Active Broker"
(office: Náměstí Republiky 751, 347 01 Tachov). Sections: Homepage with CTA, About Us, Our Team
(5 agents), Property Listings grid, Contact (form + map + opening hours). Clean minimalist design
in official RE/MAX brand colors (Royal Blue #003DA5, Vibrant Red #DC1C2E, white/light gray, black text).

## User Choices
- Language: Czech only
- Contact form: save to DB AND send email (both)
- Property data: managed via admin panel (CRUD)
- Assets: user will upload own photos (admin image upload via object storage)
- Auth: simple JWT login

## Architecture
- Backend: FastAPI + MongoDB (motor). Cookie-based JWT auth (httpOnly, samesite=none, secure).
  Emergent object storage for image uploads. Resend for contact email (graceful no-op if no key).
- Frontend: React 19 + react-router-dom 7 + Tailwind, sonner toasts. Public site + /admin dashboard.
- Fonts: Cabinet Grotesk (display) + Manrope (body).

## Personas
- Visitor: browses listings, views agents, submits inquiries.
- Agency admin: logs in, manages properties/agents, reads contact messages.

## Core Requirements (static)
- 5 sections public site, property filtering, property detail with inquiry, admin CRUD, contact->DB+email.

## Implemented (2026-06-26)
- Public: Home (hero, stats, featured), About (bento), Team (5 agents), Properties (grid + filters),
  Property detail (gallery + agent + inquiry form), Contact (form + Google map iframe + hours).
- Admin: JWT login, dashboard overview stats, Properties CRUD + image upload, Agents CRUD + photo upload,
  Messages (list/mark-read/delete).
- Backend: full /api routes, seeded 5 agents + 6 properties, object storage upload/serve, stats.
- Tested: 22/22 backend pytest + full frontend Playwright flows green.

## Backlog
- P1: Email notifications — provide RESEND_API_KEY + verified sender/recipient to enable (currently no-op).
- P1: Replace placeholder photos/bios/logo with real agency assets (admin upload ready).
- P2: Property search by keyword, price range slider, pagination.
- P2: Multi-language toggle (CZ/EN), SEO meta tags, sitemap.
- P2: Rate-limiting / brute-force protection on /auth/login.

## Next Tasks
- Reviews (2026-07-01): client reviews with 1-5 stars, target office or specific agent, admin moderation/approval, admin replies; shown on /recenze, per-agent rating on /tym, testimonials on homepage.
- Also added earlier: Sell/rent form (/prodej), Properties search (location + price range) + pagination, 73 real properties imported from remax-czech.cz, real agents (4) + logo + team hero.
1. Collect & wire Resend key to activate contact email.
2. User uploads real branding (logo image) and agent/property photos.
