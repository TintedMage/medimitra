# Copilot Instructions for MediMitra

MediMitra is a multimodal healthcare orchestration engine built on Next.js, Tailwind v4, and Shadcn UI (vega style), utilizing Gemma 3:4b for medical reasoning and VLM-based analysis.

## Architecture & Data Flow
- **Inference Engine**: Interfaces with local **Ollama** (Gemma 3) via Axios. It uses VLM reasoning to extract hierarchical medical entities (Dosage, RxNorm) from images without intermediate OCR layers.
- **State Management**: **Zustand** ([src/lib/store.ts](src/lib/store.ts)) coordinates chat threads, clinical vitals, and UI state (sidebar/calendar).
- **Contextual Grounding**: A lightweight RAG pipeline using a structured JSON vector-store allows user queries to be augmented with simulated JSON telemetry (Heart Rate, SpO2).
- **IoT Action Hooks**: Emits schema-validated JSON payloads for smart home/MQTT integration based on model-derived intent.

## Frontend & Styling
- **Framework**: Next.js App Router with Tailwind CSS v4.
- **UI Components**: Shadcn UI (vega style) utilizing `@base-ui/react`.
- **Icons**: Exclusively uses `@hugeicons/core-free-icons` via `HugeiconsIcon`. Do NOT use `lucide-react`.
- **Layout**: Universal header ([src/components/header.tsx](src/components/header.tsx)). Pages must account for 56px height (`pt-14`).

## Critical Coding Patterns
- **Base UI Composition**: Use the `render` prop on triggers (e.g., `TooltipTrigger`, `DropdownMenuTrigger`) to avoid nested `<button>` hydration errors.
  - *Correct*: `<TooltipTrigger render={<Button ... />}>...</TooltipTrigger>`
- **Styling**: Use semantic tokens only (`bg-background`, `text-primary`). Avoid OKLCH/Hex raw values.
- **Components**: Prefer small, reusable components with `data-slot` attributes for consistency with the vega style.

## Key Workflows
- `npm run dev`: Start development server.
- `npx shadcn@latest add <component>`: Add new components (always verify `render` prop usage after adding).
