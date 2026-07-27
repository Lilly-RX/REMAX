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

## Implemented (2026-07-22) — Premium redesign + Sell form
- Home.jsx full "award-worthy" redesign: kinetic dark hero (#05070E) with masked line-by-line
  reveal + parallax team cutout, editorial marquee, animated stat counters, services tiles
  (odhad/prodej/pronajem/konzultace linking to /prodej?typ=...), numbered manifesto, featured
  properties, review cards, Facebook + sell CTA. Uses framer-motion + lenis smooth scroll.
- Shared components/motion.jsx (PageHero [data-testid=page-hero] + Reveal). Applied unified dark-hero
  premium style across ALL public pages (About, Team, Contact, Reviews, Properties, PropertyDetail, Legal, Sell).
- PublicLayout.jsx initializes Lenis smooth scroll; `?nolenis=1` query param disables it (needed for
  Playwright/automation scrolling). window.__lenis exposed for programmatic scroll.
- Sell form (/prodej): added "Odhad nemovitosti" interest option (local INTEREST map, NOT in shared
  DEAL_TYPES). Reads ?typ=prodej|pronajem|odhad to preselect (with useEffect sync on in-app nav).
- Contact page: added office e-mail activebroker@re-max.cz (alongside info@remaxactivebroker.cz).
- Navbar CTA changed to red pill for brand consistency.
- Tested: testing_agent iteration_3.json — 100% frontend flows pass. Deployment health check: PASS.
- Deployed to production: https://remax-active.emergent.host

## Feature (2026-07-22) — Favorites (Oblíbené)
- Anonymous client-side favorites via localStorage (key 'remax_favorites'). FavoritesContext provider
  (toggleFavorite/isFavorite/count). Heart button (FavoriteButton) on property cards + detail gallery.
- Navbar heart icon with count badge (data-testid nav-favorites / nav-favorites-count) → /oblibene page
  (Favorites.jsx) listing saved properties (filters GET /api/properties by saved ids) + empty state.
- Verified 100% by testing_agent (iteration_5): add/remove, badge, /oblibene list, persistence on reload,
  detail-page heart. No bugs.
- Note (non-blocking): cookie accept button testid is 'cookie-accept'; use ?nolenis=1 in automation.

## Feature (2026-07-22) — Sorting on Properties page
- Added sort dropdown (data-testid=properties-sort) in the results header on /nemovitosti:
  Nejnovější / Nejstarší (by created_at) and Cena od nejnižší / od nejvyšší (by price).
- Client-side sort of the filtered list before pagination; page resets to 1 on sort change.
- Comparator logic verified deterministically (Node) across all 4 modes; UI control renders & wired to state.

## Feature (2026-07-22) — Home quick property search
- Added a quick-search bar overlapping the bottom of the Home hero (data-testid=home-quick-search):
  Nabídka (deal), Typ nemovitosti (type), Lokalita (location) + "Hledat nemovitosti" button.
- On submit navigates to /nemovitosti with query params (deal, type, location, pmax).
- Properties.jsx now initializes filters from URL params (deal/type/location/pmin/pmax) via useSearchParams.
- Verified: /nemovitosti?deal=prodej&type=byt&location=Tachov activates PRODEJ+BYT chips, pre-fills
  location, shows "Zobrazeno 4 z 4 nemovitostí". Quick-search UI renders correctly below hero.

## Updates (2026-07-22 pt.4)
- Resend domain remaxactivebroker.cz VERIFIED by user. Email tested from preview: POST /api/contact 200,
  no "domain not verified" error → sending works. Sender "RE/MAX Active Broker <noreply@remaxactivebroker.cz>",
  recipient activebroker@re-max.cz. Production sends after REDEPLOY (prod .env updated at deploy).
- Added 3 real approved office reviews from firmy.cz (Bouda/Ryšavý/Otavová, all 5★) via insert_reviews.py;
  seed_data.json now includes reviews; startup seeds reviews when db.reviews empty. Shows on /recenze + Home.
- Google reviews URL was a dynamic local-pack link (not reliably scrapeable) — skipped; can add if user pastes texts.
- Pending: MAXIS XML feed URL (user will provide ~tomorrow) → build auto-sync then.

## Fix (2026-07-22 pt.3) — Production sort via idempotent migration
- Production DB persists across redeploys & is non-empty, so seed-on-empty never re-ran → stale inverted
  created_at remained. Added startup migration `fix_created_at_v1` (marker in db['_migrations']): matches
  each property by id and sets created_at to corrected bundle value. Idempotent; runs once per DB.
- Verified in preview (updated 0, no-op since already correct; marker set). Needs production REDEPLOY.
- NOTE: use db['_migrations'] (motor forbids underscore attribute access).

## Fixes (2026-07-22 pt.2)
- Sorting bug: all 73 properties imported in one batch (created_at = scrape order, inverse of source
  newest-first). Reversed created_at across existing properties (fix_dates.py) so "Nejnovější" (created_at
  desc) = truly newest; semantics stay correct for future additions. Re-exported seed_data.json.
- Logo: removed baked-in white background from /public/remax-logo.png non-destructively via edge
  flood-fill (PIL) → transparent bg, black text + colored balloon preserved (corners alpha=0, text alpha=255).
- Startup hardened: index creation, admin seed, data seed, and storage init each wrapped in try/except
  so no single failure aborts startup (prevents "all APIs empty" symptom). Added seed-check log line.

## Fix (2026-07-22) — Production empty DB self-seeding
- Problem: Deployed production showed EMPTY properties/team — production has its own fresh MongoDB
  and the real data (4 agents + 73 imported properties) lived only in the preview DB (not migrated on deploy).
- Fix: Exported real data (agents, properties, and the `files` collection needed by /api/files image
  serving) to /app/backend/seed_data.json (~940KB, 2272 file records). server.py startup now seeds any
  EMPTY collection from this bundle (independent per-collection counts); placeholder SEED_* kept only as
  fallback when bundle missing. Images are in shared Emergent object storage (init via EMERGENT_LLM_KEY).
- Verified: scratch fresh-DB insert of the full bundle succeeds; image storage_path resolves to file records.
- ACTION REQUIRED BY USER: redeploy so production picks up the seed logic + bundle and self-populates.
- Helper: /app/backend/export_seed.py (one-off re-export if data changes).

## Backlog / Open items
- Auto-import of office listings from RE/MAX MAXIS (Poski REAL) via XML export feed. WAITING on user
  to obtain office-wide XML feed URL from franchisee / podpora@poski.com (export.poskireal.cz). Once
  provided: build scheduled sync (APScheduler) + admin "Synchronizovat teď" button. Fallback: periodic
  scrape of their remax-czech.cz office page.
- Resend still sandbox-limited (OFFICE_EMAIL routes only to verified address) — needs domain verification.

## Feature (2026-06-27) — Automatická synchronizace nabídek z MAXIS (FTP XML)
- Nový modul `/app/backend/maxis_sync.py`: přes FTP stahuje `XMLNEW/nabidky.xml` (86 nabídek)
  a `XMLNEW/makleri.xml`, mapuje `id_uzivatel` → e-mail makléře → interní agent_id, upsertuje
  nemovitosti podle `source_id`. MAXIS = zdroj pravdy (volba 1a): nabídky ve feedu se přidají/aktualizují,
  source-managed nabídky mimo feed se smažou (manuální bez source_id se nikdy nemažou). Nejnovějších 6 = featured.
- Fotky se odkazují přímo z `https://mlsf.remax-czech.cz/data` + `<soubor>` (bez nahrávání, vždy aktuální).
- Makléř Josef Havlíček: PŮVODNĚ nepřidán (volba 2b), 2026-06-27 uživatel změnil názor → PŘIDÁN jako
  5. makléř do týmu (migrace `add_havlicek_agent_v1`, id 11148000-..., foto z mlsf, order 5). Jeho 25
  zahraničních nabídek se páruje na jeho agent_id. Texty „4 makléři/čtyř/čtveřice" změněny na 5/pět/pětice
  (Home.jsx hero + stat + badge, About.jsx, Team.jsx). Recenze z feedu (volba 3a): NEimportují se.
- Ceny: měna se přebírá přímo z feedu (`nemovitost_mena`) — zahraniční nabídky (Rakousko/Chorvatsko)
  zůstávají v € (27 nabídek), tuzemské v Kč (59). ŽÁDNÝ přepočet (dle přání uživatele 2026-06-27).
- Filtr makléře na /nemovitosti: chipy s makléři z /api/agents + „Ostatní / zahraniční" (agent_id=null,
  Havlíčkovy zahraniční nabídky). Backend `GET /api/properties?agent_id=...`. Filtruje se client-side.
- Endpointy: `POST /api/admin/maxis/sync` (manuální), `GET /api/admin/maxis/status` (obojí auth). Stav v
  kolekci `sync_status`. Plánovač APScheduler: automaticky každé pondělí 04:00 (Europe/Prague) + startup
  „catch-up" běh pokud poslední sync > 6 dní / nikdy (populuje čerstvou produkční DB při prvním nasazení).
- Admin panel (Přehled): karta „Synchronizace nabídek (MAXIS)" s tlačítkem „Synchronizovat teď" (data-testid
  maxis-sync-btn) + čas poslední synchronizace (maxis-last-sync).
- .env: přidány `MAXIS_FTP_HOST`, `MAXIS_FTP_USER`, `MAXIS_FTP_PASS`. requirements.txt: `APScheduler`.
- Ověřeno: testing_agent iteration_6.json — 52/52 backend testů + kompletní frontend flow PASS (fotky se
  vykreslují, párování makléřů 42/14/3/2/25=null, auth vynucen, admin tlačítko + toast funguje). Měna Kč
  ověřena curl (všech 86 v Kč, EUR převedeno).
- POZOR pro nasazení: FTP údaje musí být v produkčním .env; sync se pak spustí sám při prvním startu.

## Update (2026-06-27) — Reply-To na notifikačních e-mailech
- send_notification_email nyní přidává `reply_to` = e-mail klienta (msg.email), takže odpověď z kanceláře
  jde přímo klientovi, ne na noreply@remaxactivebroker.cz. Ověřeno curl POST /api/contact → 200, bez chyby v logu.
- Google recenze: uživatel potvrdil, že přidávat NETŘEBA (zrušeno z backlogu).
- MAXIS XML feed URL: uživatel dodá v pondělí 27.7.2026 → pak postavit auto-sync parser.
- Uživatel schválil nové nasazení (redeploy) přes platformu.

## Next Tasks
- Reviews (2026-07-01): client reviews with 1-5 stars, target office or specific agent, admin moderation/approval, admin replies; shown on /recenze, per-agent rating on /tym, testimonials on homepage.
- Also added earlier: Sell/rent form (/prodej), Properties search (location + price range) + pagination, 73 real properties imported from remax-czech.cz, real agents (4) + logo + team hero.
1. Collect & wire Resend key to activate contact email.
2. User uploads real branding (logo image) and agent/property photos.
