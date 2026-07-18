# Police FIR Management System

AI-powered Police FIR (First Information Report) Management System built with React, FastAPI, PostgreSQL, and Google Gemini.

## Tech Stack

| Layer        | Technology                            |
| ------------ | ------------------------------------- |
| Frontend     | React, Vite, TypeScript, Tailwind CSS |
| Backend      | FastAPI, SQLAlchemy                   |
| Database     | PostgreSQL                            |
| Auth         | JWT                                   |
| AI           | Google Gemini (via `google-genai`)    |
| Deployment   | Docker, Docker Compose                |

## Project Structure

```
Police-FIR-AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── chat.py        # POST /api/v1/chat
│   │   │       └── router.py
│   │   ├── core/
│   │   │   └── config.py          # Settings (reads .env)
│   │   ├── db/                    # SQLAlchemy base & session
│   │   ├── services/
│   │   │   └── ai/
│   │   │       └── gemini_service.py   # GeminiService
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **PostgreSQL** 16+ (or use Docker)
- **Docker & Docker Compose** (optional)
- **Google Gemini API key** — get one free at https://aistudio.google.com/

## Local Development Setup

### 1. Clone and configure environment

```bash
cd Police-FIR-AI
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set:

- `SECRET_KEY` — a secure random string
- `GEMINI_API_KEY` — your Gemini API key
- `GEMINI_MODEL` — model name (default: `gemini-2.0-flash`)
- `DATABASE_URL` — PostgreSQL connection string

### 2. Start PostgreSQL

**Option A — Docker:**

```bash
docker compose up db -d
```

**Option B — Local PostgreSQL:**

Create a database named `police_fir_db`.

### 3. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at **http://localhost:8000**

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/v1/health

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Docker (Full Stack)

```bash
GEMINI_API_KEY=your-key-here docker compose up --build
```

| Service  | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:8000      |
| API Docs | http://localhost:8000/docs |
| Database | localhost:5432             |

## Chat API

### `POST /api/v1/chat`

**Request:**
```json
{
  "message": "What is an FIR?",
  "system_prompt": "You are a legal expert.",
  "history": [
    { "role": "user",  "content": "Hello" },
    { "role": "model", "content": "Hi, how can I help?" }
  ]
}
```

**Response:**
```json
{
  "reply": "An FIR (First Information Report) is ...",
  "model": "gemini-2.0-flash"
}
```

The endpoint is stateless — the caller passes the full conversation history each turn.

## What's Included (Scaffold Only)

- FastAPI app with CORS, health endpoint, and modular API router
- `GeminiService` with full error handling (`google-genai` SDK)
- `/api/v1/chat` endpoint with typed request/response schemas
- SQLAlchemy database session setup
- JWT utility functions (password hashing, token creation)
- React + Vite + Tailwind CSS frontend shell
- Docker Compose with PostgreSQL, backend, and frontend

## Next Steps

- Define SQLAlchemy models (FIR, User, etc.)
- Implement authentication endpoints
- Build FIR CRUD and AI-assisted features
- Add frontend pages and API client layer