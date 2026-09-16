# 00-spec — Misión: scaffold

## Objetivo

Crear el esqueleto del monorepo TypeScript de **Draft Maker** con la
configuración base de tooling y el paquete de base de datos (esquema Drizzle
de `drafts` + migración generada). Las apps `web` y `mcp` quedan como stubs
mínimos que compilan. Sin Docker, sin CI (misiones posteriores).

Referencia de stack y convenciones: `PROJECT.md`.

## Alcance (IN)

1. **Monorepo:** pnpm workspaces + Turborepo.
   - `package.json` raíz con scripts: `dev`, `build`, `test`, `test:e2e`,
     `lint`, `format`, `typecheck`, `db:generate`, `db:migrate`, `db:push`.
   - `pnpm-workspace.yaml` cubriendo `apps/*` y `packages/*`.
   - `turbo.json` con pipeline (`build`, `lint`, `typecheck`, `test`).
2. **Config compartida:** `packages/config`
   - `tsconfig` base (strict), config ESLint, config Prettier reutilizables.
3. **packages/db:** Drizzle + Postgres.
   - Esquema `drafts`: `id` (uuid pk), `title` (text), `body` (text/markdown),
     `project` (text), `tags` (text[]), `createdAt` (timestamptz default now),
     `updatedAt` (timestamptz default now). Ver tabla en `PROJECT.md §4`.
   - Cliente Drizzle (lee `DATABASE_URL` de entorno).
   - `drizzle.config.ts` + una migración generada en `drizzle/`.
   - Export del schema y client vía alias `@draft-maker/db`.
4. **apps/web:** stub Next.js (App Router) mínimo que **compila** (`build`
   y `typecheck` pasan). No requiere UI real ni rutas API funcionales.
5. **apps/mcp:** stub de paquete TS (entrypoint que compila y typechea).
   No requiere servidor MCP funcional todavía.
6. **Entorno:** `.env.example` con `DATABASE_URL` (y placeholder de token MCP).
7. **Tests:** al menos un test Vitest trivial que pase, para verificar que el
   runner está cableado en el pipeline.

## Fuera de alcance (OUT)

- Dockerfiles / configuración de Coolify (misión `deploy`).
- GitHub Actions / CI (misión propia).
- Lógica real de la web (UI, rutas API, auth).
- Servidor MCP funcional (tools, transporte HTTP, auth por token).
- Seed de datos / conexión real a una DB en CI.

## Criterios de aceptación

- `pnpm install` instala sin errores.
- `pnpm lint` pasa (sin errores) en todo el workspace.
- `pnpm typecheck` pasa en todos los paquetes (`tsc --noEmit`, strict).
- `pnpm build` construye `apps/web`, `apps/mcp`, `packages/db`, `packages/config`.
- `pnpm test` ejecuta Vitest y el test trivial pasa.
- `pnpm db:generate` produce/valida la migración del esquema `drafts` sin error
  (no requiere DB viva; valida el esquema y genera SQL).
- Existe `.env.example` con `DATABASE_URL`.
- El esquema `drafts` coincide con `PROJECT.md §4` (todos los campos y tipos).
- Estructura de carpetas: `apps/web`, `apps/mcp`, `packages/db`,
  `packages/config` presentes y enlazadas en el workspace.

## Notas

- TypeScript strict en todo el repo.
- Alias de workspace: `@draft-maker/db`, `@draft-maker/config`.
- Node 20 LTS+.
- Sin secretos commiteados; solo `.env.example`.
