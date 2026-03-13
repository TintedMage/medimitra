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

## Notes

- The chat API is configured to use model `gemma3:4b` via `ai-sdk-ollama`.
- Local data is stored in `medimitra.db` (SQLite) in the project root.
- To stop Ollama:

```bash
docker stop ollama
```
