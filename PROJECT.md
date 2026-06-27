# PROJECT.md — Draft Maker

> Configuración base del sistema SDD. La leen Planner, Reviewer y Validator
> antes de actuar. Generado por Genesis (`/init-sdd`).

## 1. Qué es

**Draft Maker** es un gestor personal de borradores ("drafts") para todos los
proyectos del usuario. Dos vías de acceso:

1. **Web app** — UI para crear, editar, organizar y buscar borradores.
2. **MCP server** — expone los borradores a clientes MCP (p. ej. Claude) para
   leer y escribir borradores mediante herramientas.

Self-hosted en **Coolify** sobre un VPS propio. Usuario único.

## 2. Stack

- **Lenguaje:** TypeScript en todo el stack.
- **Monorepo:** pnpm workspaces + **Turborepo** (pipeline de tareas cacheado).
- **Frontend + API:** Next.js (App Router) — UI web y rutas API.
- **MCP server:** TypeScript con `@modelcontextprotocol/sdk`. Transporte
  **Streamable HTTP** (acceso remoto desde el VPS), autenticado por API token.
- **Base de datos:** PostgreSQL.
- **ORM:** **Drizzle** (`drizzle-orm` + `drizzle-kit`).
- **Auth:** usuario único. Web por sesión/contraseña simple; MCP por **API token**
  (Bearer). El token NUNCA se commitea; vive en variables de entorno.
- **Tests:** **Vitest** (unit/integración) + **Playwright** (e2e de flujos web).
- **Lint/format:** **ESLint** (reglas) + **Prettier** (formato).
- **Runtime:** Node.js 20 LTS o superior.
- **Deploy:** Docker en Coolify (VPS). Postgres provisionado por Coolify.

## 3. Layout del monorepo

```
draft-maker/
  apps/
    web/          # Next.js (UI web + rutas API)
    mcp/          # Servidor MCP (Streamable HTTP, API token)
  packages/
    db/           # Esquema Drizzle + cliente Postgres (compartido)
    config/       # Config compartida: eslint, tsconfig, prettier
  PROJECT.md
  missions/       # Estado SDD por misión
```

`apps/web` y `apps/mcp` consumen `packages/db`. Una sola fuente de verdad para
el esquema de borradores.

## 4. Modelo de datos — Draft

Cada borrador:

| Campo       | Tipo                     | Notas                                  |
|-------------|--------------------------|----------------------------------------|
| `id`        | uuid (pk)                | Generado por DB.                       |
| `title`     | text                     | Título del borrador.                   |
| `body`      | text (markdown)          | Contenido en Markdown.                 |
| `project`   | text                     | Proyecto al que pertenece (tag único). |
| `tags`      | text[]                   | Etiquetas libres.                      |
| `createdAt` | timestamptz              | Default now().                         |
| `updatedAt` | timestamptz              | Se actualiza en cada edición.          |

## 5. Comandos (raíz del monorepo)

> Vía Turborepo salvo que se indique. El Validator ejecuta ESTOS comandos y
> reporta su output real.

| Acción       | Comando               |
|--------------|-----------------------|
| Install      | `pnpm install`        |
| Dev          | `pnpm dev`            |
| Build        | `pnpm build`          |
| Test (unit)  | `pnpm test`           |
| Test e2e     | `pnpm test:e2e`       |
| Lint         | `pnpm lint`           |
| Format       | `pnpm format`         |
| Typecheck    | `pnpm typecheck`      |
| DB generate  | `pnpm db:generate`    |
| DB migrate   | `pnpm db:migrate`     |
| DB push      | `pnpm db:push`        |

> Nota: el scaffold del monorepo aún no existe. La primera misión debe crear la
> estructura y estos scripts en el `package.json` raíz / `turbo.json`. Hasta
> entonces, el Validator marca como N/A los comandos no presentes y lo reporta.

## 6. Convenciones

- **TypeScript estricto** (`strict: true`). Sin `any` salvo justificación.
- **Imports:** rutas absolutas vía alias de workspace (`@draft-maker/db`, etc.).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`...).
- **Branches:** `feat/<misión>` o `fix/<misión>` desde `main` actualizada.
  Nunca commitear directo a `main` salvo el commit inicial.
- **Secrets:** solo en `.env` (gitignored). `.env.example` documenta las claves.
- **Validación de entrada:** schemas (zod) en límites de API y herramientas MCP.
- **Errores:** nunca tragar errores en silencio; loguear con contexto.
- **Tests:** cada tarea con criterio de aceptación verificable por test o por
  comando ejecutable. TDD donde aplique.

## 7. Routing de modelos (SDD)

Fijado en el frontmatter de cada subagente en `~/.claude/agents/`. No cambiar
sobre la marcha.

| Fase                         | Agente    | Modelo  |
|------------------------------|-----------|---------|
| Planificación / arquitectura | planner   | opus    |
| Implementación mecánica      | coder     | sonnet  |
| Review calidad/arq/seguridad | reviewer  | opus    |
| Validación (ejecutar+report) | validator | sonnet  |

## 8. Git / despliegue

- **Remoto:** `git@github-personal:Ivrogo/draft-maker.git`
- Flujo: feature branch → `PASS global` → commit → `git push -u origin <branch>`
  → `gh pr create` contra `main`. Claude NUNCA mergea; lo hace el usuario.
- **Deploy:** Coolify construye desde Dockerfile(s) en el repo. `apps/web` y
  `apps/mcp` son servicios desplegables independientes.
