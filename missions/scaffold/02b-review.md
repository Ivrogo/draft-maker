# 02b-review — Misión: scaffold

## Resumen
Scaffold coherente con la spec y el plan. El esquema `drafts` coincide con PROJECT.md §4, TypeScript strict está activo, no hay secretos commiteados ni elementos fuera de alcance. Sin hallazgos bloqueantes.

## Hallazgos

### BLOQUEANTE
Ninguno.

### Menor
- **`apps/web/tsconfig.json`**: no extiende `packages/config/tsconfig.base.json` como pedía el plan T5 ("extends base"). Es un tsconfig autónomo de Next.js. No bloquea porque `strict: true` está presente y `build`/`typecheck` pasan; pero rompe la "única fuente de verdad" de config TS. Sugerencia: extender la base o documentar por qué Next.js requiere config propia.
- **`packages/db/drizzle.config.ts`**: no define `dbCredentials`/`DATABASE_URL`. Correcto para `db:generate` (no necesita DB), pero `db:migrate`/`db:push` fallarán sin credenciales. Aceptable: esos comandos están explícitamente fuera de alcance. Conviene anotarlo para la misión que los active.

### Nota
- **`packages/db/src/schema.ts`**: se añaden `.notNull()` en todas las columnas y `default([])` en `tags`. PROJECT.md §4 no especifica nullabilidad; las restricciones son razonables y no contradicen la tabla. Sin acción.
- **`apps/mcp/src/index.ts`**: usa `console.log` en el stub. Aceptable para un stub; al implementar el server real aplicar la convención de logging con contexto (PROJECT.md §6).
- **`packages/config/eslint.config.js`** ignora `**/*.config.ts`, por lo que `drizzle.config.ts`/`vitest.config.ts` no se lintean. Decisión consciente y razonable; sin acción.

## Verificaciones clave
- Esquema `drafts` vs PROJECT.md §4: 7 columnas exactas. SQL generado (`0000_good_maria_hill.sql`) confirma `uuid PK gen_random_uuid()`, `text NOT NULL` (title/body/project), `text[]` (tags), `timestamp with time zone DEFAULT now()` en `created_at`/`updated_at`. CORRECTO.
- TypeScript strict: `tsconfig.base.json` con `strict:true`; db y mcp lo extienden; web lo tiene en su propio tsconfig. CORRECTO.
- Alcance: sin Docker, sin CI, web es página estática, mcp es stub sin servidor/HTTP/token, `db:migrate`/`db:push` solo cableados sin ejecutar. DENTRO DE ALCANCE.
- Seguridad: `.env.example` solo placeholders; `.env` no existe (verificado por glob); `.gitignore` ignora `.env`/`.env.*` salvo `.env.example`; `client.ts` lee `DATABASE_URL` de entorno con init perezoso, sin credenciales hardcodeadas. CORRECTO.
- Scripts raíz: los 10 requeridos presentes y coherentes con el plan; `turbo.json` con tasks `build` (con `^build`), `lint`, `typecheck`, `test`. CORRECTO.

## Veredicto
REVIEW OK
