# MediMitra

MediMitra is a Next.js healthcare assistant that uses local Ollama inference with the `gemma3:4b` model.

## Prerequisites

- Node.js 20+ and npm
- Docker

## 1) Run Ollama in Docker

Start Ollama container (CPU):

```bash
docker run -d \
	--name ollama \
	-p 11434:11434 \
	-v ollama:/root/.ollama \
	ollama/ollama
```

If you have NVIDIA GPU + NVIDIA Container Toolkit, use:

```bash
docker run -d \
	--name ollama \
	--gpus=all \
	-p 11434:11434 \
	-v ollama:/root/.ollama \
	ollama/ollama
```

Pull the model used by this project:

```bash
docker exec -it ollama ollama pull gemma3:4b
```

Quick health check:

```bash
curl http://localhost:11434/api/tags
```

## 2) Install project dependencies

From the project root:

```bash
npm install
```

## 3) Run the app

Start development server:

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
