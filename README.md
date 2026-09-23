# Ridge — Allegheny Gear Co. support agent

Next.js + AI SDK v7 chat agent using Google Gemini (`gemini-3.5-flash`).

## Run

```bash
cp .env.local.example .env.local   # then paste your key into GOOGLE_GENERATIVE_AI_API_KEY
npm install
npm run dev                         # http://localhost:3000
```

## Layout

- `app/api/chat/route.ts` — server route: Gemini model, system prompt + remembered facts, tools, 5-step limit
- `lib/tools.ts` — the five tools (server only)
- `lib/data.ts` — orders, products, policies, ticket routing
- `lib/prompt.ts` — Ridge's instructions
- `lib/storage.ts` — localStorage for remembered facts and tickets
- `app/page.tsx`, `components/ToolCard.tsx` — chat UI, tool-call cards, sidebar
