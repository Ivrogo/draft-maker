# 03-validation — Misión: scaffold

Fecha de validación: 2026-06-28
Validador: claude-sonnet-4-6
Raíz: /Users/ivrogo/Workspace/Proyectos Personales/Draft Maker
Todos los comandos ejecutados desde la raíz del repo.

---

## T1 — Esqueleto monorepo (pnpm + Turborepo)

### Criterio 1: scripts en package.json y `private: true`
```
node -e "const p=require('./package.json'); const r=['dev','build','test','test:e2e','lint','format','typecheck','db:generate','db:migrate','db:push']; const m=r.filter(s=>!(p.scripts&&p.scripts[s])); if(m.length){console.error(m);process.exit(1)}; if(!p.private)process.exit(1)"
```
exit: 0

### Criterio 2: turbo.json tasks build/lint/typecheck/test
```
node -e "const t=require('./turbo.json'); const k=t.tasks||t.pipeline; ['build','lint','typecheck','test'].forEach(x=>{if(!k||!k[x])process.exit(1)})"
```
exit: 0

### Criterio 3: pnpm-workspace.yaml cubre apps/* y packages/*
```
grep -q "apps/\*" pnpm-workspace.yaml && grep -q "packages/\*" pnpm-workspace.yaml
```
exit: 0

**T1: PASS**

---

## T2 — `packages/config` (config compartida)

### Criterio 1: nombre del paquete = @draft-maker/config
```
node -e "const p=require('./packages/config/package.json'); if(p.name!=='@draft-maker/config')process.exit(1)"
```
exit: 0

### Criterio 2: tsconfig.base.json con strict: true (criterio corregido en 01-plan.md)
```
grep -Eq '"strict"[[:space:]]*:[[:space:]]*true' packages/config/tsconfig.base.json
```
exit: 0

### Criterio 3: eslint.config existe
```
ls packages/config/eslint.config.*   ->  packages/config/eslint.config.js
```
exit: 0

**T2: PASS**

---

## T3 — `packages/db` (schema + cliente + drizzle.config)

### Criterio 1: nombre del paquete = @draft-maker/db — exit 0
### Criterio 2: schema.ts contiene los 7 campos y pgTable('drafts') — exit 0
### Criterio 3: schema.ts contiene uuid(), primaryKey, .array(), timestamp(), defaultNow() — exit 0
### Criterio 4: client.ts referencia DATABASE_URL — exit 0
### Criterio 5: drizzle.config.ts tiene schema y postgres — exit 0

**T3: PASS**

---

## T4 — Migración Drizzle generada

```
pnpm db:generate
> drizzle-kit generate
Reading config file '.../packages/db/drizzle.config.ts'
1 tables — drafts 7 columns 0 indexes 0 fks
No schema changes, nothing to migrate
```
exit: 0
- `packages/db/drizzle/0000_good_maria_hill.sql` existe (CREATE TABLE "drafts") — exit 0

**T4: PASS**

---

## T5 — Stub `apps/web` (Next.js que compila)

- page.tsx existe, package.json existe — exit 0
- `pnpm --filter ./apps/web run typecheck` (tsc --noEmit) — exit 0
- `pnpm --filter ./apps/web run build` → Next.js 16.2.9, ✓ Compiled successfully, rutas ○ / y ○ /_not-found — exit 0

**T5: PASS**

---

## T6 — Stub `apps/mcp` (TS que compila)

- src/index.ts existe, package.json existe — exit 0
- `pnpm --filter ./apps/mcp run typecheck` (tsc --noEmit) — exit 0
- `pnpm --filter ./apps/mcp run build` (tsc) — exit 0

**T6: PASS**

---

## T7 — Test Vitest trivial

```
pnpm test  ->  @draft-maker/db:test: vitest run
 ✓ test/smoke.test.ts (2 tests)
 Test Files  1 passed (1) | Tests  2 passed (2)
```
exit: 0
- `packages/db/test/smoke.test.ts` existe — exit 0

**T7: PASS**

---

## T8 — `.env.example`

- `.env.example` existe — exit 0
- DATABASE_URL presente — exit 0
- TOKEN presente — exit 0
- `.env` NO existe — exit 0

**T8: PASS**

---

## T9 — Verificación integral

| Comando | exit |
|---------|------|
| `pnpm install` | 0 |
| `pnpm lint` (3 paquetes, eslint sin errores) | 0 |
| `pnpm typecheck` (3 paquetes, tsc) | 0 |
| `pnpm build` (db/mcp tsc, web next build ✓) | 0 |
| `pnpm test` (vitest 2 passed) | 0 |
| `pnpm db:generate` (1 tabla drafts, 7 columnas) | 0 |
| dirs apps/web apps/mcp packages/db packages/config | 0 |
| `pnpm -r list --depth -1` (5 paquetes PRIVATE) | 0 |

**T9: PASS**

---

## Resumen por tarea

| Tarea | Resultado |
|-------|-----------|
| T1    | PASS      |
| T2    | PASS      |
| T3    | PASS      |
| T4    | PASS      |
| T5    | PASS      |
| T6    | PASS      |
| T7    | PASS      |
| T8    | PASS      |
| T9    | PASS      |

PASS global
