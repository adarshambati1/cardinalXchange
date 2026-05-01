# CardinalXchange

Stack Overflow for Stanford. One place to ask and answer anything about classes, research, recruiting, and campus life.

## The Problem

Stanford students help each other constantly, but the knowledge lives nowhere. It's spread across:

- Ed Discussion threads that die the moment the quarter ends
- Class GroupMes where the good answer scrolls off in an hour
- Random Discord servers you only find out about from your roommate
- That one Google Doc a junior made in 2022 that somehow still gets passed around
- Reddit posts from 2017 that may or may not still be accurate

Every quarter, the same questions get asked again. "Is CS 229 doable with 161?" "Who's a good thesis advisor in HCI?" "How do I sublet over the summer without getting scammed?" The answers exist. They're just trapped.

## The Solution

CardinalXchange is one Q&A platform for the entire Stanford community. Ask a question, get answers, upvote what's useful, and the good stuff sticks around for the next student who needs it.

Because it's tied to your Stanford identity, you know the person answering your CS 161 question actually took CS 161, and the person rating professors actually sat in their lectures.

## What Makes It Different

**vs. Stack Overflow**
- Stanford only. Login with your SUNet ID.
- Tags know about courses (CS 229, PHYSICS 43, SYMSYS 1) and stay consistent across quarters and years.
- Way broader than code. Research advice, prereq planning, professor recs, club questions, housing, recruiting.
- Reputation is tied to your real Stanford identity, not an anonymous handle.

**vs. Ed Discussion**
- Cross-course and cross-quarter. Knowledge accumulates instead of getting wiped every 10 weeks.
- Not run by the teaching team, so you can actually ask "is this class worth taking" without it being weird.
- Student-run, student-moderated.
- Covers all the non-academic stuff Ed was never meant for.

## Key Features

- **Ask & Answer** with markdown, code blocks, LaTeX, and image uploads
- **Upvotes & downvotes** on questions and answers, accepted answer marking
- **Course-aware tags** (CS 229, ECON 1, PSYCH 30) plus topic tags (research, recruiting, housing, dining)
- **Reputation** earned from upvotes, accepted answers, and helpful edits
- **Search** across the full archive, filterable by tag, course, or department
- **Course pages** that aggregate every Q&A tagged with a course across every quarter
- **SUNet SSO** so it stays Stanford only
- **Notifications** when someone answers your question or comments on your answer

## Tech Stack

This is a working draft. Subject to change once we actually start building.

**Frontend**
- Next.js (App Router) with React and TypeScript
- Tailwind CSS for styling
- shadcn/ui for components
- TanStack Query for data fetching
- MDX or react-markdown for rendering posts, KaTeX for math

**Backend**
- Next.js API routes / Route Handlers (or a separate FastAPI service if we end up needing more Python for ML stuff)
- PostgreSQL as the main database
- Prisma as the ORM
- Redis for caching hot pages and rate limiting
- Meilisearch or Postgres full-text search for the search bar

**Auth**
- Stanford SSO via SAML or OIDC through Stanford's identity provider
- Fallback to stanford.edu email magic links during early development
- NextAuth.js to wire it together

**Infra**
- Vercel for the frontend and API routes
- Supabase or Neon for managed Postgres
- Cloudflare R2 or S3 for image uploads
- Upstash Redis
- Sentry for error tracking, PostHog for product analytics

**Dev tooling**
- pnpm, ESLint, Prettier, Vitest, Playwright for E2E

## Getting Started

TBD. Setup instructions will go here once the stack is locked in.

```bash
# placeholder
pnpm install
pnpm dev
```

## Contributing

TBD. We'll add contribution guidelines, code style notes, and a PR template once the project is further along. For now, talk to one of us if you want to jump in.

## Team

- Kevin Wang
- Britney Bennett
- Aditya Iyengar
- Adarsh Ambati

## License

MIT. See [LICENSE](./LICENSE).
