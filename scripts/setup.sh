#!/bin/bash
# Project setup script
set -e

echo "=== Project Setup ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker required. Install it first."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js required. Install it first."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 required. Install it first."; exit 1; }

# Copy env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created .env from .env.example — fill in your values"
else
    echo "[OK] .env already exists"
fi

# Backend setup
echo "Setting up Backend..."
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
echo "[OK] Backend ready"

# Frontend setup
echo "Setting up Frontend..."
cd Frontend
npm install
cd ..
echo "[OK] Frontend ready"

# Docker
echo "Starting services with Docker Compose..."
docker compose up -d

echo ""
echo "=== Setup complete ==="
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  Health:   http://localhost:8000/health"
