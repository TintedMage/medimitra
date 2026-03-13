# MediMitra

MediMitra is a multimodal healthcare orchestration MVP built with Next.js. It provides AI-assisted chat, prescription extraction and storage, and calendar-based medication scheduling using local inference via Ollama (`gemma3:4b`).

## Development Phase (MVP Scope)

This repository is the functional prototype built during the development phase.

Implemented MVP capabilities:

- AI chat assistant with streaming responses
- Threaded consultations with persisted message history
- Prescription drafting from chat output (structured JSON)
- Save-to-database prescription workflow
- Calendar/schedule view for day-wise medication routines
- Prescription management UI (list, add, delete)

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (vega style) + Base UI primitives
- Hugeicons (`@hugeicons/core-free-icons`, `@hugeicons/react`)
- Zustand (client state management)
- `next-themes` (theme support)

### AI / Inference

- Vercel AI SDK (`ai`, `@ai-sdk/react`)
- Ollama provider (`ai-sdk-ollama`)
- Local model: `gemma3:4b`
- Streaming generation (`streamText`) with model metadata

### Backend / Data

- Next.js Route Handlers (`/api/*`)
- SQLite (`better-sqlite3`)
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`)

### Tooling

- Node.js 20+
- npm
- Docker (for Ollama runtime)

### AI-assisted Development Tooling

- GitHub Copilot (agent-assisted implementation/documentation)
- skills.sh-managed skill set (locked in `skills-lock.json`):
  - `ai-sdk`
  - `frontend-design`
  - `shadcn`

---

## Project Architecture Overview

MediMitra follows a layered architecture:

1. **UI Layer (App Router + Components)**
   - Pages in `src/app/*` render chat, landing, and prescription views.
   - Reusable UI in `src/components/*` (chat modules + design-system primitives).

2. **State Layer (Client Store)**
   - Zustand store in `src/lib/store.ts` manages:
     - active thread + sidebar/calendar UI state
     - local prescription confirmation state
     - selected date and cached prescription data

3. **API Layer (Route Handlers)**
   - `src/app/api/chat/route.ts`: AI streaming + persistence hooks
   - `src/app/api/threads/*`: consultation thread lifecycle and messages
   - `src/app/api/prescriptions/*`: normalized prescription CRUD
   - `src/app/api/medications/*`: legacy medication CRUD

4. **Persistence Layer (SQLite + Drizzle)**
   - DB connection and table bootstrap in `src/lib/db/index.ts`
   - Schema in `src/lib/db/schema.ts`
   - Primary entities: `threads`, `messages`, `prescriptions`, `prescription_medications`, `medications`

5. **Inference Layer (Ollama Local LLM)**
   - Local Ollama endpoint is used through `ai-sdk-ollama`
   - System prompt enforces safe assistant behavior and prescription JSON shape for machine parsing

---

## Code & Functionalities

### 1) Chat + AI Consultation

- Users create/select threads and send text/files from chat UI.
- Responses stream from `/api/chat` using `streamText` and Ollama `gemma3:4b`.
- User + assistant messages are persisted in SQLite and reloaded by thread.

### 2) Prescription Structuring from AI Output

- Assistant is prompted to return prescription drafts inside fenced JSON blocks.
- Frontend parses these blocks, presents confirmation UI, and saves validated payloads.
- On save, data is persisted to prescription tables and reflected in UI.

### 3) Calendar & Scheduling

- Calendar panel maps selected date → day-of-week.
- Prescriptions/medications are filtered by active routine entries for that day.
- Scheduled medication times are rendered in compact cards.

### 4) Prescription Management

- Dedicated prescriptions page supports:
  - load/list prescriptions
  - create with medication routines
  - delete prescriptions
- API supports full CRUD including update endpoint at `/api/prescriptions/[id]`.

### 5) Thread Management

- Create/list/delete consultation threads.
- Auto-title behavior based on the first user message in a thread.

---

## Setup & Installation Guide

## Prerequisites

- Node.js 20+
- npm
- Docker

## 1) Start Ollama in Docker

CPU mode:

```bash
docker run -d \
	--name ollama \
	-p 11434:11434 \
	-v ollama:/root/.ollama \
	ollama/ollama
```

NVIDIA GPU mode (requires NVIDIA Container Toolkit):

```bash
docker run -d \
	--name ollama \
	--gpus=all \
	-p 11434:11434 \
	-v ollama:/root/.ollama \
	ollama/ollama
```

Pull model:

```bash
docker exec -it ollama ollama pull gemma3:4b
```

Health check:

```bash
curl http://localhost:11434/api/tags
```

## 2) Install Dependencies

```bash
npm install
```

## 3) Run Development Server

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## 4) Google Fit Sync (Simulated)

MediMitra includes a manual Google Fit sync flow for MVP telemetry grounding.

### How it works

- In chat, click **Sync Google Fit Data** (button above the prompt bar).
- The frontend sends a chat request with `action: "FETCH_GOOGLE_FIT_DATA"`.
- The chat backend (`/api/chat`) intercepts this action, fetches simulated data from `/api/google-fit`, and injects it into model context as a system message.
- The assistant then answers using the synced telemetry in the same response cycle.

### Simulated data API

- Endpoint: `GET /api/google-fit`
- Returns sample Google Fit-like telemetry:
  - steps
  - average heart rate
  - average SpO2
  - sleep hours
  - calories burned
  - sync timestamp + timezone metadata

Quick API check:

```bash
curl http://localhost:3000/api/google-fit
```

## Notes

- The chat API is configured to use model `gemma3:4b` via `ai-sdk-ollama`.
- Local data is stored in `medimitra.db` (SQLite) in the project root.
- Google Fit integration is currently a simulator (`/api/google-fit`) intended for MVP demos.
- Manual sync is user-controlled (no automatic background fetch) to keep the flow simple and deterministic.
- To stop Ollama:

```bash
docker stop ollama
```

---

## API Surface Summary

- `POST /api/chat` — stream AI response, persist user/assistant messages
- `GET|POST|DELETE /api/threads` — manage consultation threads
- `GET /api/threads/:threadId/messages` — fetch thread message history
- `GET|POST /api/prescriptions` — list/create prescriptions with medications
- `GET|PUT|DELETE /api/prescriptions/:id` — prescription details/update/delete
- `GET|POST /api/medications` — legacy medication list/create
- `PUT|DELETE /api/medications/:id` — legacy medication update/delete

---

## Repository

Source code repository:

https://github.com/TintedMage/medimitra

---

## Notes

- Local SQLite database file is created as `medimitra.db` in the project root.
- The current model configured in chat route is `gemma3:4b`.
- This MVP is intended for prototype/demo workflows and does not replace licensed medical diagnosis.
