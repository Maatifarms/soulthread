# SoulThread — Working Agreement for Claude Code

## What this project is
SoulThread is a mental healthcare platform: patient web/mobile app (React + Vite +
Capacitor), a guide (psychologist) dashboard, an admin panel, and a marketing site.
Stack observed in the repo: React, React Router, Zustand (state), Firebase (auth/data),
Capacitor (native wrapper), lazy-loaded routes, a service/repository layer
(`src/services`, `src/repositories`), CSS modules/global CSS (no Tailwind config found
yet, though a `tailwind-utilities.css` file exists — confirm before assuming Tailwind
is wired up).

## Priority order (work in this sequence, don't jump ahead)
1. **Patient web app — Discover + Book Care flow only.** Everything else (community,
   self-care, guide dashboard, admin) is paused until this is clean and working end to end.
2. Only after (1) is solid: guide dashboard basics.
3. Everything else later.

## Code style — write like a careful senior engineer, not a code generator
- No dead code, no commented-out blocks, no leftover console.logs in committed code.
- No speculative abstractions ("future-proofing" for features that don't exist yet).
  Build for what's needed now; refactor later when a second use case actually appears.
- Match the existing patterns already in the repo (service layer calling `apiClient`,
  Zustand stores, lazy route imports) instead of introducing a new pattern per file.
- Every function/component should do one clear thing. If a component file is doing
  data-fetching + business logic + rendering + formatting, split it.
- Real error handling, not silent catches. Loading and error states for every async UI.
- Meaningful names. No `data2`, `tempVal`, `handleClick1`.
- Comments explain *why*, not *what* — only where the reasoning isn't obvious from the code.
- Consistent formatting: run Prettier/ESLint if configured; if not configured, ask me
  before adding config rather than guessing.

## Before touching a file
- Read the file fully first. Don't guess at what a function does from its name.
- Check for existing usages elsewhere in the repo before changing a shared
  service/store/component's public shape (props, exported function signatures).
- If a file references something missing (e.g., no `package.json`, no `.env`,
  no Firebase config in this export), flag it — don't invent fake config.

## Workflow for this cleanup pass
1. Start with `src/App.jsx` and the Discover + Book Care route tree — map what pages/
   components/services are actually involved in that flow.
2. List concrete issues found (duplication, inconsistent patterns, unused imports,
   missing error/loading states, mixed responsibilities) before changing anything.
   Get my go-ahead on the list if it's large.
3. Fix in small, reviewable batches — one feature area at a time, not a repo-wide
   sweep in one shot.
4. After each batch: tell me what changed and why, in plain language, not a diff dump.
5. Don't add new features while "cleaning" unless I explicitly ask — cleanup and
   new-feature work are different tasks and shouldn't be mixed silently.

## Things to flag immediately, don't just fix silently
- Any hardcoded secrets, API keys, or credentials in source.
- Any place patient data (journal entries, clinical notes, mood data) is logged,
  cached, or sent somewhere without clear justification — this is health data.
- Payment logic that isn't going through a proper server-side flow.

## Definition of done for the Discover + Book Care slice
- A user can land on Discover, search/filter psychologists (by specialization,
  language, city, online/offline), view a profile, and complete a booking
  (select time → pay → confirmation) without console errors.
- Loading states, empty states, and error states all exist and look intentional,
  not default browser text.
- No unused imports/components left from the lazy-load list in App.jsx.
