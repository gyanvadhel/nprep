# NPrep Daily

A responsive, free study-companion prototype for NORCET aspirants.

The visual direction is an NPrep study journal: chapter covers, numbered lesson cards, warm paper tones, forest-green accents, and restrained motion. Staged learning and rewards support this identity; future screens should follow this direction rather than reproduce another learning app's interface.

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

- An NPrep study-journal layout for Anatomy, Blood, and Respiration, with numbered lesson cards and five stages per unit: learning cards, matching, practice, recall, and a checkpoint.
- Sequential stage unlocking, resumable lessons, freely replayable completed stages, unit badges, and 20 study points per unique completed stage.
- Checkpoints require two of three correct answers; retries are unlimited. Points and badges describe sample-unit activity, not exam readiness.
- Path question attempts feed the existing revision and progress systems without replacing an unfinished free-practice session. Existing saved data receives path defaults automatically.
- Desktop dashboard and mobile bottom navigation.
- Daily practice, topic sessions, searchable sample question library.
- Confidence ratings, explanations with source links, bookmarks.
- Answer autosave and session recovery after reload.
- Revision scheduling after mistakes or uncertain answers; confident reviews move to 3 then 7 days before leaving the queue.
- Progress and weekly activity derived from actual attempts, using India dates.
- Local profile and daily goals; keyboard-accessible dialogs and reduced-motion support.
- Locally hosted fonts; no third-party font requests.
- GSAP chapter entrances and scroll-triggered lesson reveals, plus Lenis smooth wheel scrolling on desktop. Touch input remains native, modal scrolling is isolated, and reduced-motion preferences are honored, including changes during a visit.
- Adapted React Bits SpotlightCard and CountUp effects for pointer lighting and study-point updates. Source attribution and the upstream license are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- An on-demand Three.js body-plane explorer in the Anatomy visual lab, with drag and button rotation, three plane selections, and a usable SVG fallback when WebGL is unavailable. The simplified schematic is not a clinical model.

## Content and data boundaries

The nine original sample questions reference OpenStax Anatomy and Physiology 2e. Learning cards and matching activities reinforce the same concepts; practice and checkpoints reuse these questions. They are labelled preview material and have not been reviewed by NPrep faculty. This is not an official NORCET question bank or a readiness predictor.

There is no backend, login, cross-device sync, or production question feed yet. Learning data is stored in this browser under `nprep.learning.v1`. Clearing site data removes it. Storage failures are surfaced in the interface. Full offline installation/download support is not implemented.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, custom shadcn-style components using Radix, GSAP + @gsap/react, Lenis, adapted React Bits components, Three.js, Motion, Lucide, Recharts, Zod. Server-data caching and an IndexedDB/service-worker layer can be added when APIs and offline scope are defined.

The Three.js bundle is requested only when the visual lab opens. Its renderer draws on interaction and resize instead of running an idle animation loop; closing the explorer disposes GPU resources. Decorative motion never gates lesson completion or hides study content.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests expect the app running on http://127.0.0.1:3000. Set `PLAYWRIGHT_BASE_URL` to test another deployment (include its trailing slash and base path, such as `https://gyanvadhel.github.io/nprep/`). Tests cover desktop and mobile journeys, stage unlocking, checkpoint retries, reward deduplication, resume, scoring, revision, bookmarks, filters, preferences, storage failures, and automated accessibility. Screenshots and accessibility reports are saved in `artifacts/`.

## Next integration work

1. Map NPrep branding and faculty-approved content to the question model.
2. Connect existing authentication and content APIs.
3. Persist progress on the server, with an explicit local-to-account merge strategy.
4. Add downloadable practice packs and robust reconnect syncing.
5. Validate content, analytics, privacy, and infrastructure with the NPrep team before launch.

## Dependency audit

The runtime dependency audit is clean at the time of setup. The development lint chain reports an upstream `braces` advisory (GHSA-vfj7-8cjw-p6xm) through Next's ESLint plugin. npm currently proposes a breaking downgrade of `eslint-config-next`; that downgrade has not been applied. Recheck for an upstream fix before adopting this setup in CI.
