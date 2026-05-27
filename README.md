# [TODO: Project Name]

[TODO: One sentence description]

## Quick start

```bash
# Clone and setup
git clone [TODO: repo-url]
cd [TODO: project-name]
cp .env.example .env  # edit with your values

# Docker (recommended)
docker compose up -d

# Or manual
./scripts/setup.sh
```

**Backend:** http://localhost:8000
**Frontend:** http://localhost:3000
**Health:** http://localhost:8000/health

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI |
| Database | [TODO] |
| AI | [TODO] |
| Deploy | Docker Compose |

## Structure

```
Backend/
  main.py          — FastAPI entry point
  config.py        — settings from .env
  prompts/         — LLM prompt templates
  services/        — business logic
  routes/          — API endpoints
  tests/           — pytest tests
Frontend/
  src/app/         — Next.js pages
  src/components/  — React components
  src/lib/         — utilities, API client
  src/locales/     — i18n translations
scripts/           — setup, deploy utilities
docs/              — documentation
```

## Development

```bash
# Backend
cd Backend && source .venv/bin/activate
uvicorn main:app --reload

# Frontend
cd Frontend && npm run dev

# Tests
cd Backend && pytest
cd Frontend && npm run lint
```

## License

[TODO]
