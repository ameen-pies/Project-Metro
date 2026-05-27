# Project Name

## What this is
[TODO: One sentence. What does this project do?]

## Architecture
- **Backend:** Python / FastAPI
- **Frontend:** Next.js / React / TypeScript
- **Database:** [TODO: PostgreSQL / MongoDB / etc.]
- **AI:** [TODO: LangGraph / LangChain / none]
- **Deployment:** Docker Compose

## Running locally
```bash
cp .env.example .env  # fill in values
docker compose up -d  # starts all services
```

## Key directories
```
Backend/
  main.py          — FastAPI entry point
  config.py        — env vars, settings
  prompts/         — LLM prompt templates
  services/        — business logic
  routes/          — API endpoints
  tests/           — pytest tests
Frontend/
  src/app/         — Next.js app router pages
  src/components/  — React components
  src/lib/         — utilities, API clients
  src/locales/     — i18n translation files
scripts/           — setup, deploy, utility scripts
docs/              — documentation
```

## Conventions
- No hardcoded paths, URLs, or secrets
- All user-facing strings use i18n keys
- New features as separate files, don't bloat existing ones
- Backend tests in `Backend/tests/`, run with `pytest`
- Frontend lint: `npm run lint`

## Before committing
- No `.env` files
- No `node_modules` or `__pycache__`
- Run tests: `cd Backend && pytest`
- Run lint: `cd Frontend && npm run lint`
