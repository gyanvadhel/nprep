# NPrep Daily

A responsive, free study-companion prototype for NORCET aspirants.

## Run locally

From the repository directory:

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Hosting

The public preview is hosted at https://gyanvadhel.github.io/nprep/.

Pushes to `main` run the checks and publish through `.github/workflows/deploy.yml`. GitHub Pages must use **GitHub Actions** as its publishing source. The deployment builds with `GITHUB_PAGES=true`, which exports the app to `out/` with the `/nprep` base path. Normal local builds retain the standard Next.js server setup.

This deployment contains the sample question bank and browser-local progress described below.

## Implemented

- Desktop dashboard and mobile bottom navigation.
- Daily practice, topic sessions, searchable sample question library.
- Confidence ratings, explanations with source links, bookmarks.
- Answer autosave and session recovery after reload.
- Revision scheduling after mistakes or uncertain answers; confident reviews move to 3 then 7 days before leaving the queue.
- Progress and weekly activity derived from actual attempts, using India dates.
- Local profile and daily goals; keyboard-accessible dialogs and reduced-motion support.
- Locally hosted fonts; no third-party font requests.

## Content and data boundaries

The nine original sample questions reference OpenStax Anatomy and Physiology 2e. They are labelled preview material and have not been reviewed by NPrep faculty. This is not an official NORCET question bank or a readiness predictor.

There is no backend, login, cross-device sync, or production question feed yet. Learning data is stored in this browser under `nprep.learning.v1`. Clearing site data removes it. Storage failures are surfaced in the interface. Full offline installation/download support is not implemented.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, custom shadcn-style components using Radix, Motion, Lucide, Recharts, Zod. Server-data caching and an IndexedDB/service-worker layer can be added when APIs and offline scope are defined.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests expect the app running on http://127.0.0.1:3000. Tests cover desktop and mobile journeys, resume, scoring, revision, bookmarks, filters, preferences, storage failures, and automated accessibility. Screenshots and accessibility reports are saved in `artifacts/`.

## Next integration work

1. Map NPrep branding and faculty-approved content to the question model.
2. Connect existing authentication and content APIs.
3. Persist progress on the server, with an explicit local-to-account merge strategy.
4. Add downloadable practice packs and robust reconnect syncing.
5. Validate content, analytics, privacy, and infrastructure with the NPrep team before launch.

## Dependency audit

The runtime dependency audit is clean at the time of setup. The development lint chain reports an upstream `braces` advisory (GHSA-vfj7-8cjw-p6xm) through Next's ESLint plugin. npm currently proposes a breaking downgrade of `eslint-config-next`; that downgrade has not been applied. Recheck for an upstream fix before adopting this setup in CI.
