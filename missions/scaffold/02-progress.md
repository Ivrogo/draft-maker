# 02-progress — Misión: scaffold

## Estado por tarea (T1..T9)

| Tarea | Estado | Notas |
|-------|--------|-------|
| T1 — Esqueleto monorepo | COMPLETO | package.json raíz, pnpm-workspace.yaml, turbo.json ya existían y pasan criterios |
| T2 — packages/config | COMPLETO | tsconfig.base.json (strict:true), eslint.config.js (flat config TS), prettier.config.js presentes |
| T3 — packages/db | COMPLETO | schema.ts con tabla drafts (7 cols), client.ts (lazy DB_URL), index.ts, drizzle.config.ts |
| T4 — Migración Drizzle | COMPLETO | packages/db/drizzle/0000_good_maria_hill.sql generado con CREATE TABLE drafts |
| T5 — apps/web stub | COMPLETO | Next.js 16.2.9, App Router (layout.tsx + page.tsx), build y typecheck pasan |
| T6 — apps/mcp stub | COMPLETO | src/index.ts exporta createServer(), tsc build y typecheck pasan |
| T7 — Test Vitest | COMPLETO | packages/db/test/smoke.test.ts — 2 tests pasan |
| T8 — .env.example | COMPLETO | DATABASE_URL y MCP_API_TOKEN presentes, .env no existe |
| T9 — Verificación integral | PENDIENTE DE VALIDACION | todos los comandos de la batería pasan (ver abajo) |

## Qué se arregló en esta ronda

### Problema: `pnpm lint` fallaba — `eslint: command not found` en 3 paquetes

**Causa raíz:** pnpm usa aislamiento estricto. El binario `eslint` estaba
instalado como dependencia de `@draft-maker/config`, pero los paquetes
consumidores (`packages/db`, `apps/web`, `apps/mcp`) no lo declaraban como
dependencia propia, así que el binario no estaba disponible en su
`node_modules/.bin/`.

**Fix aplicado:** Se añadió `"eslint": "^9.30.1"` a `devDependencies` en:
- `packages/db/package.json`
- `apps/web/package.json`
- `apps/mcp/package.json`

Luego se ejecutó `pnpm install` para materializar el enlace del binario en
cada paquete.

### Tarea: generar migración Drizzle (T4)

Se ejecutó `pnpm db:generate` que invocó `drizzle-kit generate` en
`packages/db`. Generó:
- `packages/db/drizzle/0000_good_maria_hill.sql` — CREATE TABLE drafts con
  7 columnas (id uuid pk, title text, body text, project text, tags text[],
  created_at timestamptz, updated_at timestamptz)
- `packages/db/drizzle/meta/0000_snapshot.json`
- `packages/db/drizzle/meta/_journal.json`

## Output real de la batería completa (exit codes)

```
pnpm install      → EXIT 0  (Already up to date, 212ms)
pnpm lint         → EXIT 0  (3 successful, 3 total — db, mcp, web)
pnpm typecheck    → EXIT 0  (3 successful, 3 total — db, mcp, web)
pnpm build        → EXIT 0  (3 successful — mcp:tsc, db:tsc, web:next build 16.2.9 con Turbopack)
pnpm test         → EXIT 0  (1 successful — packages/db: 2 tests passed via vitest)
pnpm db:generate  → EXIT 0  (1 table, 7 columns — "No schema changes" en segunda ejecución)
```

### Detalle de pnpm build

- `@draft-maker/mcp` — `tsc` OK
- `@draft-maker/db` — `tsc` OK
- `@draft-maker/web` — `next build` OK (Next.js 16.2.9 Turbopack, ruta `/` static prerendered)

### Criterios de aceptación T1-T8 verificados manualmente

- T1: scripts raíz completos (dev/build/test/test:e2e/lint/format/typecheck/db:generate/db:migrate/db:push), turbo tasks (build/lint/typecheck/test), workspace (apps/* + packages/*)
- T2: @draft-maker/config, strict:true en tsconfig.base.json, eslint.config.js presente
- T3: @draft-maker/db, campos id/title/body/project/tags/createdAt/updatedAt, uuid()/primaryKey/.array()/timestamp()/defaultNow(), DATABASE_URL en client.ts
- T4: packages/db/drizzle/0000_good_maria_hill.sql existe, contiene CREATE TABLE + "drafts"
- T5: apps/web/src/app/page.tsx existe, typecheck OK, build OK
- T6: apps/mcp/src/index.ts existe, typecheck OK, build OK
- T7: pnpm test → 2/2 passed
- T8: .env.example con DATABASE_URL y TOKEN, .env no existe

## Tareas pendientes

Ninguna tarea de implementación pendiente. T9 (verificación integral) es
responsabilidad del Validator, no del Coder.
