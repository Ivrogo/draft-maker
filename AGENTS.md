# AGENTS.md

Work this repo **cloud-agent first** on GitHub (Cursor Cloud Agents). Do not assume a local Mac checkout.

**Draft Maker** is a single-user personal draft manager (web UI + MCP) for Ivrogo projects. Spec: [`PROJECT.md`](PROJECT.md). Intended self-host: Coolify + Postgres on a VPS.

## Defaults

| | |
|---|---|
| Default branch | `main` |
| Hosting | Coolify (Docker) when deployed — `apps/web` and `apps/mcp` as independent services |
| Merge / deploy | **Never merge a PR or trigger a deploy** without explicit human OK |

Open a PR to `main`. Leave it unmerged.

## Status

`main` today is SDD config only (`PROJECT.md` + `.gitignore`). The TypeScript monorepo scaffold is in open PR #1 (`feat/scaffold`). Do not merge that PR unless a human asks.

## Stack (intended)

- TypeScript monorepo: **pnpm** workspaces + **Turborepo**
- **apps/web** — Next.js (App Router) UI + API
- **apps/mcp** — MCP server (Streamable HTTP, Bearer token)
- **packages/db** — Drizzle + PostgreSQL (shared draft schema)
- Vitest + Playwright; ESLint + Prettier
- Node.js 20+

## Commands (Linux / Cloud Agent)

After the scaffold exists on the working branch:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Until those scripts exist, skip them and say so. Do not use Mac-only tools.

## Env

Names only. Never commit values. Copy `.env.example` when present.

- `DATABASE_URL` — Postgres
- `MCP_API_TOKEN` — Bearer token for the MCP server

## Agent notes

- Prefer small, reviewable PRs. Do not push to `main`.
- Do not change Coolify config, secrets, or production unless a human asks.
- `PROJECT.md` is the SDD source of truth for product and stack until the app exists.
- Comments and new code in English; Spanish is OK in docs and PRs.
