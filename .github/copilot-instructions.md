# Copilot Instructions for this repository

- This is a small React + Express app written in TypeScript and bundled with Vite.
- The backend runs from `server.ts` and serves both the API and the Vite app in development.
- The frontend entry is `src/main.tsx`; the main app logic lives in `src/App.tsx`.
- `src/components/ResidentPortal.tsx` handles file upload / Gemini extraction and posts to `/api/extract`.
- `src/components/AdminDashboard.tsx` reads registration state and updates records via `/api/registrations`.
- Shared domain types live in `src/types.ts`; keep `Registration` aligned with server API payloads.

## Important behavior
- Data persistence is file-based in `registrations.json` via `server.ts`.
- `server.ts` also contains the AI extraction route `/api/extract` using `@google/genai`.
- If `GEMINI_API_KEY` is absent, `/api/extract` returns a mocked extraction payload.
- The UI assumes tower values are limited to `A` through `F`, and resident form validation enforces this.

## Workflow commands
- `npm install` to install dependencies.
- `npm run dev` starts the Express + Vite dev server.
- `npm run build` builds the frontend with Vite and bundles `server.ts` to `dist/server.cjs`.
- `npm run start` runs the production bundle.
- `npm run lint` runs `tsc --noEmit`.

## Agent guidance
- Avoid changing the Vite HMR config in `vite.config.ts`; it intentionally disables HMR when `DISABLE_HMR=true`.
- When adding or changing registration fields, update both `src/types.ts` and the form state in `src/components/ResidentPortal.tsx`.
- Keep API payload shape consistent with `server.ts` endpoints: GET `/api/registrations`, POST `/api/registrations`, PATCH `/api/registrations/:id`, DELETE `/api/registrations/:id`, POST `/api/extract`.
- Prefer small targeted edits over large refactors because the app is built around a simplified file-based JSON DB and a single full-stack process.

## Files to inspect for changes
- `server.ts` for backend routes, persistence, and Gemini integration.
- `src/App.tsx` for app state and parent component routing.
- `src/components/ResidentPortal.tsx` for upload/extraction/form flow.
- `src/components/AdminDashboard.tsx` for admin review and status updates.
- `src/presets.ts` for sample document presets and mocked extraction data.
