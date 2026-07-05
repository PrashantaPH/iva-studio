# IVAS Console UI

Mini IVA Studio — a learning-grade chatbot / agent builder console.

Frontend built with **React 18 + TypeScript + Chakra UI + Vite**. The backend
is **mocked in-browser** with an in-memory database and a custom axios adapter,
so the app runs fully standalone (no server required).

## Features

- Auth: email + OTP (demo code `123456`) and "Continue with Google" (mock)
- Organizations and Workspaces
- Workspace shell: header with avatar menu, preferences, sign out; collapsible sidebar
- Integrations
  - Proxy Scripts: HTTP route + Monaco JS editor + run + debug terminal
  - Global Variables: Object / Function / String with editors
- Models: create + train (status lifecycle)
- Conversation Designer: Intents (+ alternates), Entities (+ values, regex + flags), Triggers
- Conversation Flows: React Flow canvas, draggable widget palette, node connections, save, train, debug panel
- Messenger: chat simulator with debug trace
- Workspace Settings
- Light / Dark mode (Chakra semantic tokens)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. Sign in with the prefilled `demo@iva.studio`
and OTP `123456`, or use "Continue with Google".

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` — TypeScript only
- `npm run preview` — preview the production build

## Mock backend

- `src/mocks/db.ts` — in-memory DB + seed data (persisted to `localStorage`)
- `src/mocks/handlers.ts` — route table (mirrors the future Spring Boot API)
- `src/core/api/client.ts` — axios instance whose adapter routes to the mock
- `src/core/api/services.ts` — typed API service functions per module

To swap to the real backend later, remove the custom `adapter` in
`client.ts`; the service function signatures stay the same.

To reset seeded data, clear the `iva-studio-mock-db` key in `localStorage`.
