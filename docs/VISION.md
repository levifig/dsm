# Vision

## Problem

Discord's native interface is optimized for participating in active servers, not for understanding and curating a large personal history of memberships. A power user who joins many communities lacks a trustworthy private directory for finding servers, remembering why they matter, preserving personal context and rejoin information, and reviewing that footprint without unsafe token handling or brittle manual exports. Metacord exists to make that personal Discord landscape legible and controllable.

## Target users

Metacord is personal-first: it initially serves its builder as a technically capable Discord power user with enough memberships that Discord's own navigation no longer provides useful overview or memory. The later audience is other individual power users with the same need for private organization and recall. Team collaboration, community administration, and general social discovery are not target use cases.

## Purpose

When I am managing many Discord memberships or deciding where to stay, return, or disengage, I want one fast, trustworthy directory that combines Discord membership data with my own private context, so I can understand and act on my community footprint without surrendering ownership of my notes or handling raw user tokens. Metacord should feel like a personal index, not a second Discord client.

## Success criteria

Metacord succeeds first when it is dependable for the builder's real Discord footprint: memberships and personal context remain understandable, export/import round-trips do not lose supported data, authentication keeps raw Discord tokens off the client, and ordinary use makes servers easier to find, remember, and revisit. Readiness for broader power users comes only after that workflow is trusted in repeated use.

Development claims must be backed by reproducible install, generated-type, typecheck, build, test, and named smoke evidence. Numeric user-experience or reliability targets remain hypotheses until measured.

## Non-goals

- Discord server administration for roles, channels, moderation, or settings.
- A social network, public profile, shared directory, or team workspace.
- Multi-account support within the current product boundary.
- Native mobile or desktop clients; the product remains web-first.
- A real-time mirror of Discord state.
- Cloud-first storage for personal notes and organization; local ownership remains the default.
- A framework or hosting migration pursued without a separate evidence-backed decision and shaped Change.
