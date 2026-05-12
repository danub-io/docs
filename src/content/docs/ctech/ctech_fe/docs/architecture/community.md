---
title: "Community Module"
---

## Overview

The **Community** module groups all social interaction features of the site:
- **Auth** — Login/registration, Google OAuth, 2FA, session management
- **User reviews** — Creation and display of user reviews on products
- **Feed** — Community page with recent reviews

## Feature Flag

Controlled by the env var `COMMUNITY_ENABLED`:

- `false` (default): module disabled — routes return 404, middleware does not load currentUser
- `true`: module enabled — features operate normally

The flag is read by the `COMMUNITY_ENABLED()` function in `src/modules/community/feature.ts`.

## Structure

```
src/modules/community/
├── auth/
│   ├── components/
│   │   ├── LoginDialog.tsx          # Login/registration modal
│   │   ├── UserMenu.tsx             # Authenticated user menu
│   │   └── DashboardPanel.tsx       # Dashboard panel
│   ├── services/
│   │   ├── authService.ts           # Authentication (JWT, OAuth, 2FA)
│   │   ├── rateLimitService.ts      # Rate limiting
│   │   └── cryptographyService.ts   # TOTP cryptography
│   └── schemas/
│       ├── index.ts                 # Schema barrel
│       └── *.schema.ts              # Individual Zod schemas
├── reviews/
│   ├── components/
│   │   ├── WriteReviewButton.tsx             # "Write a review" button
│   │   ├── ProductUserReviews.astro          # Review section on product page
│   │   └── CollapsibleReviewCard.tsx          # Review card with expand/collapse
│   └── services/
│       └── reviewsService.ts        # User review CRUD
├── feed/
│   ├── components/
│   │   ├── ReviewsFeed.astro     # Recent reviews feed
│   │   └── CommunityHeader.astro # Community page header
│   └── services/
│       └── communityService.ts     # Feed queries
├── index.ts                         # Public barrel
├── feature.ts                       # COMMUNITY_ENABLED() function
└── __tests__/                       # Module tests
```

## How to Enable

```bash
# Local development
echo "COMMUNITY_ENABLED=true" >> .env
echo "COMMUNITY_ENABLED=true" >> .dev.vars

# Production (Cloudflare Workers)
pnpm wrangler secret put COMMUNITY_ENABLED
# Type: true
```

## Dependencies

- **DB**: Uses the same Turso connection (`@/core/lib/db`) as the rest of the site
- **Middleware**: `src/middleware.ts` imports `COMMUNITY_ENABLED` to control rate limiting, CSRF, and currentUser
- **Components**: `WriteReviewButton` and `ProductUserReviews` are conditionally rendered in `[slug].astro`
- **Cache**: `reviewsService.ts` has its own cache independent of `productService.ts`

## UI States

| Component | Disabled | Enabled (not logged in) | Enabled (logged in) |
|-----------|----------|------------------------|---------------------|
| `LoginDialog` | Not rendered | "Sign in" button visible | Hidden |
| `UserMenu` | Not rendered | Hidden | User name/avatar |
| `DashboardPanel` | Page redirects to 404 | Redirects to /?login=required | Functional dashboard |
| `WriteReviewButton` | Not rendered | "Sign in" button (opens LoginDialog) | Review form |
| `ProductUserReviews` | Not rendered | Cards only (no button) | Cards + button |
| `/community` | Redirects 404 | Review feed | Feed + actions |
| `/api/auth/*` | Returns 404 | Functional | Functional |
| `/api/reviews/*` | Returns 404 | Returns 401 (no token) | Functional |

## Migration

The original locations (`src/modules/auth/`, `src/core/ui/reviews/CollapsibleReviewCard.tsx`, `src/modules/product/components/WriteReviewButton.tsx`) keep re-exports pointing to the community module to avoid breaking existing imports. They can be removed once all imports have been updated.
