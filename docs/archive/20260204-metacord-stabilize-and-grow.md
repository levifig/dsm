> Historical record: this approved legacy plan was created before the current Loaf state model. Its completed and future-looking sections are preserved for provenance, but `docs/VISION.md` and `docs/STRATEGY.md` now hold active product direction.

# Metacord: Stabilize, Harden, and Grow

**Created**: 2026-02-04
**Status**: APPROVED
**Approved**: 2026-02-04
**Notes**: Production worker name confirmed as `metacord-prod`. Phase 4 (Platform Decision) postponed to after all other phases complete.
**Approach**: Shape Up (appetite-based, flex scope)

---

## Context

Metacord is a personal Discord server directory at v0.1.0. The `dev` branch is 12 commits ahead of `main` with a major infrastructure migration (Pages → Workers) and UX overhaul. There are also uncommitted-but-complete changes implementing a Durable Object-based Discord rate limiter.

### Key Findings
- **Uncommitted rate limiter**: Complete and ready to commit
- **Config bug**: `wrangler.toml` production env has wrong worker name (`metacord-dev` instead of `metacord-prod`)
- **Tech debt**: Monolithic 1,337-line `main.ts`, no tests, no CI, empty `shared/` types, no CSP headers
- **Platform tension**: Session from Jan 22 decided on Fly.io migration for dedicated IPs, but uncommitted work doubles down on Cloudflare with DO rate limiter — needs a decision

---

## Phase 0: Stabilize & Ship
**Appetite**: 1 day | **Goal**: Clean state, merged to main, tagged

### Tasks

#### 0.1 — Commit Rate Limiter (Backend Dev)
- [ ] Stage all rate limiter files (`discord-rate-limiter.ts`, modified `[[route]].ts`, `types.ts`, `worker.ts`, `tsconfig.json`, `wrangler.toml`)
- [ ] Commit with message: `feat: add Durable Object-based Discord rate limiter for widget endpoint`
- [ ] Do NOT stage `localhost.har`

#### 0.2 — Fix Config & Cleanup (Backend Dev)
- [ ] Fix `wrangler.toml`: change `env.production.name` from `"metacord-dev"` to `"metacord-prod"`
- [ ] Add `*.har` to `.gitignore`
- [ ] Delete `localhost.har` from working directory
- [ ] Commit: `fix: correct production worker name and gitignore HAR files`

#### 0.3 — Fix Minor Code Concerns (Backend Dev + Frontend Dev)
- [ ] **Rate limiter queue drain**: Modify `processQueue()` to loop while `getEffectiveRemaining() > 0 && queue.length > 0` instead of draining one-at-a-time
- [ ] **Double `buildServerViews()` call**: Refactor `render()` in `main.ts` to call `buildServerViews()` once and reuse the result
- [ ] **OAuth cookie prefix**: Add `__Host-` prefix to `oauth_state` and `oauth_verifier` cookies on HTTPS (matching the session cookie pattern)
- [ ] Commit: `fix: improve rate limiter queue drain, deduplicate render, secure OAuth cookies`

#### 0.4 — Merge & Tag (PM)
- [ ] Verify `pnpm run build` succeeds
- [ ] Create PR: `dev` → `main`
- [ ] Merge with merge commit (`--no-ff`)
- [ ] Tag `v0.1.0` on main

### Acceptance Criteria
- `main` branch contains all current work including rate limiter
- Build passes
- Production worker name is correct
- No debug artifacts in repo

---

## Phase 1: Harden
**Appetite**: 1 week | **Goal**: Maintainable, secure codebase

### Tasks

#### 1.1 — Modularize Frontend (Frontend Dev)
Break `src/main.ts` (1,337 lines) into focused modules:
- [ ] `src/lib/state.ts` — AppState type, state management, initialization
- [ ] `src/lib/render.ts` — Section rendering, server views, DOM updates
- [ ] `src/lib/events.ts` — Event binding, filter/search handlers
- [ ] `src/lib/fetch-orchestrator.ts` — Widget fetch batching, progress, cooldown
- [ ] `src/lib/demo.ts` — Demo mode logic and file loading
- [ ] `src/main.ts` — Slim orchestrator (~100 lines) that imports and wires modules
- [ ] Preserve all existing behavior — this is a pure refactor

#### 1.2 — Shared Types (Backend Dev)
- [ ] Move overlapping types from `src/lib/api.ts` and `functions/lib/types.ts` into `shared/types.ts`
- [ ] Types to share: `ApiUser/DiscordUser`, `ApiGuild/DiscordGuild`, `ApiGuildMember/DiscordMember`, `ApiWidget`
- [ ] Update imports in both frontend and backend
- [ ] Remove duplicate type definitions

#### 1.3 — Security Headers (Backend Dev)
- [ ] Add CSP middleware to Hono router:
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com`
  - `img-src 'self' https://cdn.discordapp.com data:`
  - `connect-src 'self'`
- [ ] Add `X-Content-Type-Options: nosniff`
- [ ] Add `X-Frame-Options: DENY`
- [ ] Add `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Document in ADR-002

#### 1.4 — Error Boundary (Frontend Dev)
- [ ] Add top-level `try/catch` around `hydrateApp()` with user-visible error state
- [ ] Add `window.onerror` / `window.onunhandledrejection` handlers
- [ ] Show a recovery UI ("Something went wrong. Reload?") instead of white screen

### Acceptance Criteria
- `main.ts` is < 150 lines
- No duplicate type definitions between frontend and backend
- CSP headers present on all responses
- App degrades gracefully on uncaught errors
- Build passes, no behavioral regressions

---

## Phase 2: Test & CI
**Appetite**: 1 week | **Goal**: Confidence in changes, automated quality gates

### Tasks

#### 2.1 — Test Infrastructure (QA)
- [ ] Add Vitest as dev dependency
- [ ] Configure `vitest.config.ts` for both `src/` and `functions/` code
- [ ] Add `test` and `test:watch` scripts to `package.json`
- [ ] Set up test utilities for mocking Workers KV, fetch, crypto

#### 2.2 — Unit Tests (QA)
Priority order by risk:
- [ ] `functions/lib/crypto.ts` — AES-GCM encrypt/decrypt, PKCE generation
- [ ] `functions/lib/session.ts` — Session lifecycle, token refresh logic
- [ ] `functions/lib/cache.ts` — Cache key building, response handling
- [ ] `src/lib/storage.ts` — localStorage operations, defensive parsing, import/export
- [ ] `src/lib/utils.ts` — Formatting, CDN URLs, cooldown calculations
- [ ] `functions/lib/discord-rate-limiter.ts` — Slot acquisition, queue management, rate limit tracking
- [ ] Target: >80% coverage on `functions/lib/` and `src/lib/`

#### 2.3 — Fix TypeScript Errors (Backend Dev)
- [ ] Fix the 15 pre-existing TypeScript errors (Cloudflare Workers type mismatches)
- [ ] Ensure `pnpm exec tsc --noEmit` passes cleanly
- [ ] Add typecheck to CI

#### 2.4 — GitHub Actions CI (DevOps)
- [ ] Create `.github/workflows/ci.yml`:
  - Trigger on push/PR to `main` and `dev`
  - Steps: install (pnpm), typecheck (`tsc --noEmit`), lint (if added), test (`vitest run`), build (`vite build`)
- [ ] Add branch protection rules requiring CI pass
- [ ] Add status badges to README

### Acceptance Criteria
- `pnpm test` runs and passes
- CI pipeline runs on every push/PR
- TypeScript compiles with no errors
- >80% test coverage on library code

---

## Phase 3: P1 Features
**Appetite**: 2 weeks | **Goal**: Enhanced UX for power users

### Tasks

#### 3.1 — Sorting Options (Frontend Dev)
- [ ] Add sort dropdown/chips: Name (A-Z/Z-A), Join Date (newest/oldest), Member Count (high/low), Online Count (high/low)
- [ ] Persist sort preference in localStorage
- [ ] Sort applies within each section (Favorites, Owned, Public, Private)

#### 3.2 — Filter Refinement (Frontend Dev)
- [ ] Audit current AND-based multi-filter logic for edge cases
- [ ] Add filter count badge showing "X of Y servers"
- [ ] Add "clear all filters" action
- [ ] Ensure filters + sort compose correctly

#### 3.3 — Accessibility Audit (Design)
- [ ] Full WCAG 2.1 AA audit against the design brief requirements
- [ ] Verify all contrast ratios (4.5:1+ text, 3:1+ UI elements)
- [ ] Test keyboard navigation end-to-end (Tab order, Enter/Space activation, Escape)
- [ ] Test with VoiceOver/NVDA
- [ ] Verify `prefers-reduced-motion` disables all animations
- [ ] Fix any findings

### Acceptance Criteria
- Users can sort servers by 4 criteria
- Sort + filter compose correctly
- WCAG 2.1 AA compliance verified
- No accessibility regressions

---

## Phase 4: P2 Features
**Appetite**: 2 weeks | **Goal**: Organization power tools

### Tasks

#### 5.1 — Bulk Actions (Frontend Dev)
- [ ] Multi-select mode with checkboxes on server cards
- [ ] Bulk favorite/unfavorite
- [ ] Select all / deselect all
- [ ] Visual indicator for selection count

#### 5.2 — Server Categories (Frontend Dev + Backend Dev)
- [ ] Custom user-defined categories beyond Favorites
- [ ] Category CRUD in details modal or dedicated UI
- [ ] Drag-to-reorder categories
- [ ] Persist in localStorage user data (schema migration v1 → v2)

#### 5.3 — Role Information (Backend Dev + Frontend Dev)
- [ ] Fetch and display user's roles per server (requires `guilds.members.read` scope — already granted)
- [ ] Show role badges with colors in server details modal
- [ ] Cache role data appropriately

### Acceptance Criteria
- Users can bulk-select and favorite/unfavorite
- Custom categories work with persistence
- Role information displays correctly
- Export/import handles new data (backwards compatible)

---

## Phase 5: Platform Decision (ON HOLD)
**Appetite**: 1 week (research only) | **Goal**: Decide Cloudflare vs Fly.io
**Status**: POSTPONED — to be revisited after all other phases complete.

### Context
A Jan 22 session decided to migrate to Fly.io for dedicated IPs (Discord rate limiting concern). Since then, a Durable Object-based rate limiter was implemented as a Cloudflare-native mitigation. These approaches are in tension. The DO rate limiter may be sufficient for current usage patterns.

### Tasks (when unblocked)
- Convene decision council
- Evaluate: Is DO rate limiter sufficient? Cost comparison? Migration effort? What do we lose?
- Write ADR-003 with decision and rationale

---

## Agent Assignment Summary

| Phase | Primary Agent(s) | Supporting |
|-------|-------------------|------------|
| 0: Stabilize | Backend Dev | PM (merge/tag) |
| 1: Harden | Frontend Dev, Backend Dev | — |
| 2: Test & CI | QA, DevOps | Backend Dev (TS fixes) |
| 3: P1 Features | Frontend Dev | Design (a11y audit) |
| 4: P2 Features | Frontend Dev, Backend Dev | — |
| 5: Platform Decision | Council (5-7 agents) | PM (on hold) |

---

## Resolved Questions

1. ✅ Production worker name: `metacord-prod`
2. ✅ `main.ts` split: by concern (state/render/events/fetch/demo) — accepted
3. ✅ Platform decision: postponed to after all other phases
4. ✅ Focus on this plan, collect new items as they arise
