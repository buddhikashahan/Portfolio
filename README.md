# Buddhika.dev

Portfolio, resume and blog for Buddhika Shahan, with a built-in admin dashboard.
Built on Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion and Prisma 7.

Everything on the public site — projects, posts, services, skills, experience,
education, certificates, testimonials and the profile itself — lives in the
database and is edited from `/admin`. Nothing needs a redeploy to change.

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values below
npm run db:deploy         # create the schema from migrations
npm run db:seed           # admin account + starter content
npm run dev
```

The site runs at http://localhost:3000 and the dashboard at `/admin`. Sign in with
the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then change the password under
**Profile → Account security**.

### Environment variables

| Variable               | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`         | Postgres connection string.                                      |
| `AUTH_SECRET`          | Signs the session JWT. **At least 32 characters.**               |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Encrypts Server Action reference IDs. Must stay fixed across builds/replicas — see [Deploying](#deploying). |
| `ADMIN_EMAIL`          | Email for the seeded dashboard account.                          |
| `ADMIN_PASSWORD`       | Initial password for that account.                               |
| `ADMIN_NAME`           | Display name for that account.                                   |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata, Open Graph and the sitemap.       |

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Generate `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` with:

```bash
openssl rand -base64 32
```

## Scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Dev server (Turbopack)                          |
| `npm run build`      | `prisma generate`, then a production build      |
| `npm run start`      | Serve the production build                      |
| `npm run lint`       | ESLint                                          |
| `npm run typecheck`  | `tsc --noEmit`                                  |
| `npm run db:migrate`        | Create and apply a migration (interactive)         |
| `npm run db:deploy`         | Apply existing migrations (CI, production)         |
| `npm run db:seed`           | Seed the admin account and sample content (fresh local DBs) |
| `npm run db:seed-admin`     | Create/update just the admin account, no sample content |
| `npm run db:import-content` | Import `prisma/content-export.json` (real content) |
| `npm run db:studio`         | Browse the database in Prisma Studio               |
| `npm run db:reset`          | Drop, re-migrate and re-seed                       |

## Routes

| Path                  | What it is                                                         |
| --------------------- | ------------------------------------------------------------------ |
| `/`                   | Home: hero, stack, services, selected work, track record, blog     |
| `/about`              | Bio, services, experience, education, certificates, full stack     |
| `/projects`           | Filterable, searchable, paginated project index                    |
| `/projects/[slug]`    | Case study                                                         |
| `/blog`               | Featured post, topic filters, search, pagination                   |
| `/blog/[slug]`        | Post                                                               |
| `/contact`            | Contact form                                                       |
| `/admin`              | Dashboard (sign-in required)                                       |
| `/uploads/[...path]`  | Files uploaded from the dashboard                                  |

`/resume` 308-redirects to `/about`, which now holds both.

Listing pages keep their state in the URL (`/projects?category=Web&sort=az&page=2`),
so filtered views are shareable, the back button works, and everything functions
without JavaScript.

## Project structure

```
prisma/
  schema.prisma          Content model
  migrations/            Versioned schema history
  seed.ts                Admin account + starter content
prisma.config.ts         Prisma 7 config (datasource URL, seed command)
src/
  app/
    (site)/              Public site (shared header, footer, backdrop)
    admin/               Dashboard, guarded by requireAdmin()
    login/               Sign-in
    uploads/[...path]/   Serves uploaded files
    icon.tsx, apple-icon.tsx, opengraph-image.tsx
    sitemap.ts, robots.ts
  components/
    ui/                  Design-system primitives (Button, Field, Select, Pagination…)
    motion/              Reveal, Stagger, Typewriter, ScrollProgress
    layout/              Header, footer, backdrop, theme toggle
    site/                Public sections (hero, cards, slider…)
    admin/               Dashboard shell, editors, upload field, managers
  hooks/                 useFormAction, useMounted
  lib/
    actions/             Server Actions (all writes)
    queries/             Read-side data access for the public site
    validations/         Zod schemas shared by forms and actions
    auth/                Sessions, password hashing, access guard
    storage.ts           Upload persistence (the only file that knows where files live)
    rate-limit.ts        Login and contact-form throttling
    pagination.ts        Paging maths and URL helpers
  proxy.ts               Optimistic route guard for /admin
storage/uploads/         Uploaded files (git-ignored)
```

## How it fits together

- **Reads** go through `lib/queries`. Single-value lookups are wrapped in React
  `cache` so a page and its `generateMetadata` share one query.
- **Writes** are Server Actions in `lib/actions`. Each one checks the session,
  validates with Zod, writes, then revalidates the affected paths.
- **Auth** is a signed JWT in an httpOnly cookie. `proxy.ts` only checks the
  cookie exists, to avoid flashing the dashboard shell; the real check is in the
  data-access layer, because Server Actions can be called by direct POST. Proxy
  guards `/admin` only — bouncing `/login` on cookie *presence* would lock anyone
  with an expired cookie into a redirect loop, so that check lives on the login
  page, where the session is actually verified.
- **Forms** use `useFormAction`, which dispatches from `onSubmit` instead of
  relying on `<form action>` alone. React resets uncontrolled fields after every
  form action, including a failed one, so without this a single validation error
  would wipe everything the user typed.

## The dashboard

- **Projects & Blog** — two-column editors: title with an auto-generated slug,
  a markdown editor with live preview, cover image upload, publishing controls.
  The lists have status tabs with counts, search, and pagination.
- **Services, Skills, Experience, Education, Certificates, Testimonials** —
  inline add/edit on one screen. Skills use a brand-logo picker.
- **Inbox** — contact-form messages with unread/archived views, search,
  pagination and bulk mark-as-read.
- **Profile** — identity, portrait and CV uploads, location and timezone, social
  links, and the hero highlight figures.

Long editors have a sticky save bar, so the Save button and the result of the
last save are always in view.

### Uploads

Images (JPG, PNG, WebP, GIF, AVIF — up to 5 MB) and CV PDFs (up to 8 MB) upload
the moment they are chosen, and the form then submits the resulting URL.

- The file type is read from the file's own leading bytes, not its name or the
  browser's claimed MIME type. SVG is refused, since it can carry script.
- Files get random UUID names and are served with a one-year immutable cache.
- Replacing or removing an image deletes the old file when the record is
  **saved** — a cancelled edit or a failed save never deletes an image still in use.
- Files uploaded and then abandoned (picked, but the form never saved) remain
  on disk. They are harmless; clear `storage/uploads/` of unreferenced files if
  it ever matters.

Files are written to `storage/uploads/` rather than `public/`, which is a
build-time asset folder. All storage logic is in `lib/storage.ts`, so moving to
S3, Cloudflare R2 or Vercel Blob means reimplementing that one module.

## Security notes

- Passwords are hashed with bcrypt (cost 12); unknown emails still run a hash,
  so response timing does not reveal which accounts exist.
- Sign-in is throttled to 5 attempts per 15 minutes **per IP and per account**,
  so neither a single IP spraying accounts nor many IPs guessing one account get
  far. The contact form is limited to 3 messages per 10 minutes and has a
  honeypot field.
- The limiter is in-memory: it resets on restart and is not shared between
  instances. For a multi-instance or serverless deployment, back
  `lib/rate-limit.ts` with Redis (e.g. Upstash). The per-IP key trusts
  `X-Forwarded-For`, which is only reliable behind a proxy that sets it — the
  per-account limit is what protects the account regardless.
- `?next=` redirects accept same-origin paths only.
- Markdown is rendered without raw HTML, and JSON-LD is escaped so content cannot
  break out of its `<script>` tag.

## Design system

Near-monochrome by intent: a neutral zinc scale for the interface and a single
blue accent reserved for interactive affordances. Colour otherwise comes only
from brand logos.

- **No proficiency bars** — a self-assigned "React 95%" is unverifiable. The
  stack is shown as grouped brand logos; the case studies carry the evidence.
- **No native `<select>`** — `components/ui/select.tsx` is an accessible listbox
  (keyboard navigation, type-ahead, `aria-activedescendant`) that mirrors its
  value into a hidden input.
- **Brand logos** come from `simple-icons`, imported by name so unused marks are
  tree-shaken. Brands without an entry (Java, AWS, OpenAI) render as monograms.
- **3D is CSS, not WebGL** — the hero portrait tilts via CSS custom properties,
  with no per-frame React renders, and stays still under reduced motion.

Both themes are CSS custom properties in `app/globals.css`; change `--accent` in
the two theme blocks to re-skin the site.

## Deploying

The database is Postgres (via the `pg` driver adapter — see `src/lib/prisma.ts`).
The `Dockerfile` builds and serves the app; on Coolify, point it at this repo
and it auto-detects the Dockerfile.

An internal/private database hostname (Coolify's default for a database it
manages) only resolves from inside that host's own network — never from
outside it. That has one consequence worth knowing before the first deploy:
several pages query the database at **build time** (`generateStaticParams` on
the project/post detail pages, the Open Graph image), so `DATABASE_URL` has to
be reachable, and already migrated, *during the Docker build itself* — not
just at runtime.

Environment variables to set in Coolify:

- `DATABASE_URL`, `AUTH_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`,
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `NEXT_PUBLIC_SITE_URL` — as
  normal runtime variables.
- `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` and
  `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` **also** need "Available at Buildtime"
  turned on (Coolify passes those through as Docker build args — see the
  `ARG`/`ENV` lines in the builder stage of the `Dockerfile`).
  `NEXT_PUBLIC_*` values are inlined into the client bundle at build time
  regardless of platform, so that part isn't Coolify-specific.
  `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` must additionally stay **identical
  across every build and every replica** — Next.js generates a random one
  per build otherwise, and a page rendered by one build can't call actions
  verified against another's key, which surfaces as "Server Reference ID
  did not match the expected format" in the logs. Generate one with
  `openssl rand -base64 32` and keep it fixed once set.

First deploy, in order:

1. Provision the Postgres database and make sure `DATABASE_URL` is reachable
   and already migrated *before* the first build — a build against an
   unmigrated (tables don't exist yet) or unreachable database fails, since
   the pages above query it while building. Run migrations from wherever can
   currently reach the database (a temporary public connection string works
   fine for this one-time step, even if the app itself only ever gets the
   private one):
   ```bash
   npm run db:deploy
   ```
2. Build and deploy the app in Coolify.
3. Once it's running, create the admin account and load the real content —
   from Coolify's terminal for the app (or a post-deployment command):
   ```bash
   npm run db:seed-admin       # creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
   npm run db:import-content   # loads prisma/content-export.json (the real site content)
   ```

Don't run `npm run db:seed` in production — it inserts generic sample content
(placeholder projects, posts, etc.) instead of what's in `content-export.json`.
`db:deploy` and `db:import-content` are both safe to re-run.

Two things are local by default and need a persistent volume (or object storage)
on a platform whose filesystem doesn't survive redeploys:

1. **Uploads** — `storage/uploads/` (see `lib/storage.ts`). Mount a persistent
   volume at `/app/storage` in Coolify (that's the Dockerfile's `WORKDIR`), and
   copy over anything already in the local `storage/uploads/` folder — content
   already imported with `db:import-content` references those files by name
   (e.g. `coverImage: "/uploads/<uuid>.png"`).
2. **Rate limiting** — `lib/rate-limit.ts` is in-memory; fine for a single
   container, resets on restart. Back it with Redis for multiple instances.
