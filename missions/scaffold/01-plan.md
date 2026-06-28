# 01-plan — Misión: scaffold

## Convenciones
- Raíz del repo: `/Users/ivrogo/Workspace/Proyectos Personales/Draft Maker`. Todos los comandos se ejecutan desde la raíz salvo indicación.
- Alcance: solo lo IN del spec. NO Docker, NO CI, NO lógica real web/MCP, NO DB viva.
- Cada criterio de aceptación es un comando con exit code 0 (pasa) o ≠0 (no pasa).
- TypeScript strict en todos los `tsconfig`. Node 20 LTS+.

## Grafo de dependencias
```
T1 (raíz monorepo)
 └─ T2 (packages/config)
     ├─ T3 (packages/db) ─ T4 (migración)
     ├─ T5 (apps/web)
     ├─ T6 (apps/mcp)
     └─ T7 (test Vitest)
T8 (.env.example)  [independiente]
T9 (verificación integral)  [depende de T1..T8]
```
Orden: T1 → T2 → T3 → T4 → (T5, T6, T7) → T8 → T9.

## T1 — Esqueleto monorepo (pnpm + Turborepo)
Archivos: `package.json` raíz (`private:true`, `packageManager`, scripts `dev/build/test/test:e2e/lint/format/typecheck/db:generate/db:migrate/db:push`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` (tasks `build/lint/typecheck/test`, `build` con `^build`). Crear dirs `apps/` y `packages/`. Sin Docker/CI.
Aceptación:
```bash
node -e "const p=require('./package.json'); const r=['dev','build','test','test:e2e','lint','format','typecheck','db:generate','db:migrate','db:push']; const m=r.filter(s=>!(p.scripts&&p.scripts[s])); if(m.length){console.error(m);process.exit(1)}; if(!p.private)process.exit(1)"
node -e "const t=require('./turbo.json'); const k=t.tasks||t.pipeline; ['build','lint','typecheck','test'].forEach(x=>{if(!k||!k[x])process.exit(1)})"
grep -q "apps/\*" pnpm-workspace.yaml && grep -q "packages/\*" pnpm-workspace.yaml
```
Depende de: —

## T2 — `packages/config` (config compartida)
Archivos: `packages/config/package.json` (nombre `@draft-maker/config`, `private:true`), `tsconfig.base.json` (`strict:true`, resolución moderna, target Node 20), `eslint.config.*` (flat config TS), `prettier.config.*`. Alias `@draft-maker/config`.
Aceptación:
```bash
node -e "const p=require('./packages/config/package.json'); if(p.name!=='@draft-maker/config')process.exit(1)"
# Nota: tsconfig.base.json es JSONC (incluye "$schema" con URL); no usar un strip de // que rompe la URL. Comprobación robusta:
grep -Eq '"strict"[[:space:]]*:[[:space:]]*true' packages/config/tsconfig.base.json
ls packages/config/eslint.config.* >/dev/null
```
Depende de: T1

## T3 — `packages/db` (schema + cliente + drizzle.config)
Archivos: `packages/db/package.json` (`@draft-maker/db`, deps `drizzle-orm`+`postgres`, dev `drizzle-kit`, scripts `db:generate/db:migrate/db:push`, exports schema+client), `tsconfig.json` (extends base, strict), `src/schema.ts` (tabla `drafts` exacta a PROJECT.md §4: `id` uuid pk `defaultRandom()`, `title` text, `body` text, `project` text, `tags` text[] `.array()`, `createdAt` timestamptz `defaultNow()`, `updatedAt` timestamptz `defaultNow()`), `src/client.ts` (lee `DATABASE_URL`, conexión perezosa — no conecta en build), `src/index.ts` (reexporta), `drizzle.config.ts` (`dialect:'postgresql'`, schema→`src/schema.ts`, `out:'./drizzle'`).
Aceptación:
```bash
node -e "if(require('./packages/db/package.json').name!=='@draft-maker/db')process.exit(1)"
node -e "const s=require('fs').readFileSync('packages/db/src/schema.ts','utf8');['id','title','body','project','tags','createdAt','updatedAt'].forEach(f=>{if(!s.includes(f))process.exit(1)});if(!/pgTable\(\s*['\"]drafts['\"]/.test(s))process.exit(1)"
node -e "const s=require('fs').readFileSync('packages/db/src/schema.ts','utf8');[/uuid\(/,/primaryKey/,/\.array\(\)/,/timestamp\(/,/defaultNow\(\)/].forEach(r=>{if(!r.test(s))process.exit(1)})"
grep -q "DATABASE_URL" packages/db/src/client.ts
node -e "const c=require('fs').readFileSync('packages/db/drizzle.config.ts','utf8');if(!/schema/.test(c)||!/postgres/i.test(c))process.exit(1)"
```
Depende de: T2

## T4 — Migración Drizzle generada
Generar migración inicial con `pnpm db:generate` (SQL en `packages/db/drizzle/`, meta en `drizzle/meta/`). NO ejecutar migrate/push. Asegurar que la migración no queda gitignorada (el `.gitignore` solo ignora `drizzle/.snapshot/`).
Aceptación:
```bash
pnpm db:generate
ls packages/db/drizzle/*.sql >/dev/null
grep -riq "create table" packages/db/drizzle/ && grep -riq "drafts" packages/db/drizzle/
```
Depende de: T3 (y T1 para el script raíz; ejecutar tras `pnpm install`).

## T5 — Stub `apps/web` (Next.js que compila)
Archivos: `apps/web/package.json` (deps `next/react/react-dom`, scripts `dev/build/lint/typecheck`), `tsconfig.json` (extends base, strict, jsx/next), `next.config.*`, `src/app/layout.tsx` + `src/app/page.tsx` (App Router mínimo, texto estático). Sin auth/API real, sin Dockerfile.
Aceptación:
```bash
test -f apps/web/src/app/page.tsx -o -f apps/web/app/page.tsx
test -f apps/web/package.json
pnpm --filter ./apps/web run typecheck
pnpm --filter ./apps/web run build
```
Depende de: T2 (opcionalmente T3).

## T6 — Stub `apps/mcp` (TS que compila)
Archivos: `apps/mcp/package.json` (`@draft-maker/mcp`, scripts `build/lint/typecheck`), `tsconfig.json` (extends base, `outDir:dist`, strict), `src/index.ts` (entrypoint mínimo que compila, sin arrancar servidor). Sin servidor MCP funcional / HTTP / token.
Aceptación:
```bash
test -f apps/mcp/src/index.ts
test -f apps/mcp/package.json
pnpm --filter ./apps/mcp run typecheck
pnpm --filter ./apps/mcp run build
```
Depende de: T2 (opcionalmente T3).

## T7 — Test Vitest trivial
Archivos: test trivial que pase (recomendado en `packages/db`, p. ej. `test/smoke.test.ts`), `vitest.config.ts`, script `test` cableado al pipeline.
Aceptación:
```bash
pnpm test
ls packages/**/*.test.ts >/dev/null 2>&1 || ls packages/**/test/*.test.ts >/dev/null 2>&1
```
Depende de: T1 (recomendado tras T3).

## T8 — `.env.example`
Archivo raíz `.env.example` con `DATABASE_URL` (placeholder) y `MCP_API_TOKEN=` (placeholder). No crear `.env` ni commitear secretos.
Aceptación:
```bash
test -f .env.example
grep -q "DATABASE_URL" .env.example
grep -Eiq "TOKEN" .env.example
test ! -f .env
```
Depende de: —

## T9 — Verificación integral (puerta de la misión)
Ejecutar la batería completa del spec sobre el workspace completo.
Aceptación:
```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm db:generate
test -d apps/web && test -d apps/mcp && test -d packages/db && test -d packages/config
pnpm -r list --depth -1 >/dev/null
```
Depende de: T1..T8.

## Fuera de alcance (NO implementar)
Dockerfiles/Coolify, GitHub Actions/CI, UI/API/auth real, servidor MCP funcional (tools/HTTP/token), seed y `db:migrate`/`db:push` contra DB viva.
