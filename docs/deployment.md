# Deployment Checklist

Deployment checklist for Metacord - Your Personal Discord Server Directory.

## Branch strategy

- `main` is production
- `develop` is dev environment
- `feature/*`, `fix/*`, `chore/*` branches merge into `develop`
- Periodic PR from `develop` to `main`
- Tag semantic versions on `main` (example: `v1.4.2`)

## Cloudflare Pages

Shared settings:
- Build command: `pnpm run build`
- Output directory: `dist`
- Env vars: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `SESSION_SECRET`, `DISCORD_REDIRECT_URI`
- Bind KV namespace: `SESSIONS`

Dev project:
- Project: Metacord Dev
- Production branch: `develop`
- Custom domain: `dev.metacord.app`
- Update Discord app redirect URL for dev

Prod project:
- Project: Metacord
- Production branch: `main`
- Custom domain: `metacord.app`
- Update Discord app redirect URL for prod

## Branch protection

`main`:
- Require PRs
- Require status checks
- Require linear history
- Block force pushes and deletions

`develop`:
- Require PRs
- Require status checks
- Allow squash merges
