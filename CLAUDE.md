# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A collection of one-off data-maintenance scripts for the JMU university databases (students, groups, marks, specialties, psych tests, etc.), exposed as HTTP endpoints of a single Express server so each script can be triggered on demand (e.g. via Postman/curl). Comments, log messages and many file names are in Russian.

## Commands

- `npm run dev` — run with nodemon (auto-restart; ignores `./data` and `result`)
- `npm start` — run once with node
- `npx eslint .` — lint (ESLint flat config with Prettier and `simple-import-sort` as errors)
- `npx prettier --write .` — format (100 cols, single quotes, trailing commas)

There are no tests and no build step. The project is ESM (`"type": "module"`), so imports need explicit `.js` extensions, and JSON is imported with `import x from './file.json' with { type: 'json' }`.

Server listens on port 5000 and on startup checks all three DB connections, logging ✅/❌ for each. Trigger a script with e.g. `curl -X POST localhost:5000/parseEios`.

## Architecture

- [src/index.js](src/index.js) — every script is one route. Pattern: route handler calls the module's exported async function, returns `200 'Ok'` (or the function's result) and `500` with the error message on failure. Some routes accept a file upload via multer (`upload.single('file')` / `upload.array('files')`). Parameters for a run are often hardcoded in the route or module and edited between runs (e.g. the `groups` array in `/transferGroup`, the year in `parseEios`); commented-out entries are past runs kept for reference.
- [src/database/knexfile.js](src/database/knexfile.js) — three knex instances configured from `.env` (see `.env.example`):
  - `jmuConnection` — main JMU PostgreSQL, `searchPath: ['education', 'pers', 'psyho']`, so unqualified table names resolve against those schemas.
  - `jmuLocalConnection` — same DB credentials on `JMU_LOCAL_HOST` (a local copy for testing).
  - `abtConnection` — MySQL admissions (abiturient) DB.
- [src/modules/](src/modules/) — one folder per script. Modules typically import both JMU connections and pick one with `const connection = jmuConnection;` at the top — switch this to `jmuLocalConnection` to run against the local copy. Writes are done inside a knex transaction (`connection.transaction()`, commit/rollback). Module-local input data (JSON, xlsx templates, reference lists) lives next to the module.
- [src/utils/excel.fileGenerator.js](src/utils/excel.fileGenerator.js) — `ExcelTable` wrapper around exceljs (create sheets, fill headers, `saveTable(path)` which creates the directory). Shared cell styles are in [src/utils/excel.styles.js](src/utils/excel.styles.js).

## Outputs

Generated files go to `./data/<module>/` (e.g. `data/marks`, `data/military`, `data/gir`, `data/student`) or to a `result` folder/`result.json` inside the module. These, `.env` and `data.json` are git-ignored.
