---
title: "Postmortem 002: Vite proxy WebSocket ECONNRESET + infinite page reload"
---

# Postmortem 002: Vite proxy WebSocket ECONNRESET + infinite page reload

## Summary

- **Date:** 2026-05-13
- **Component:** `web/vite.config.ts`, `web/src/hooks/useWebSocket.ts`, `web/src/main.tsx`
- **Symptom:** `npm run dev` caused an infinite page reload loop at `http://localhost:5173/`. The terminal displayed: `[web] [vite] ws proxy error: Error: read ECONNRESET`
- **Severity:** High — dev environment unusable
- **Root Cause:** React 19 StrictMode double-mount + Vite WebSocket proxy (`ws: true`) created two simultaneous WebSocket connections; the abrupt close of the first connection caused ECONNRESET in the proxy, which confused Vite HMR and triggered full page reloads in an infinite loop.

## Timeline

1. `npm run dev` started successfully but the browser entered an infinite reload loop
2. Backend at `http://localhost:3001/` was working normally
3. Terminal showed repeated `[web] [vite] ws proxy error: Error: read ECONNRESET`
4. Investigation revealed React 19 StrictMode double-mount caused two WebSocket connections through the Vite proxy
5. The first connection was abruptly closed on StrictMode cleanup → ECONNRESET
6. The ECONNRESET combined with the second active connection confused Vite HMR → full page reload → loop

## Root Cause

React 19 StrictMode mounts → unmounts → remounts components in development. This caused `useWebSocket` to fire `useEffect` twice, creating two simultaneous WebSocket connections through the Vite proxy (`ws: true`). The first connection was abruptly closed during StrictMode cleanup, triggering an ECONNRESET in the proxy. The combination of the ECONNRESET and the second active connection confused Vite's HMR system, which performed a full page reload instead of hot module replacement, creating an infinite loop.

## Solution

### 1. Remove StrictMode (root cause)

**File:** `web/src/main.tsx`

Removed `<StrictMode>` — with a single mount, only one WebSocket connection is created with no abrupt close.

### 2. Vite proxy error handling

**File:** `web/vite.config.ts`

Proxy `/ws` and `/api` maintained. ECONNRESET/EPIPE errors are silently handled (expected when the client closes a tab):

```ts
'/ws': {
  target: 'ws://localhost:3001',
  ws: true,
  configure: (proxy) => {
    proxy.on('error', (err) => {
      if (err.code === 'ECONNRESET' || err.code === 'EPIPE') return;
      console.error('WS proxy error:', err.message);
    });
  },
},
```

### 3. WebSocket uses window.location.host

**File:** `web/src/hooks/useWebSocket.ts`

Uses `window.location.host` — works in dev via the proxy (`:5173`) and in production (same origin).

### 4. API fetch uses relative route

**File:** `web/src/App.tsx`

`fetch("/api/config")` — the Vite proxy forwards to `:3001` in dev, same origin in production.

### 5. Clear Vite cache

`rm -rf web/node_modules/.vite`

## Files Changed

- `web/src/main.tsx` — removed `<StrictMode>`
- `web/vite.config.ts` — added error handling for ECONNRESET/EPIPE on WebSocket proxy
- `web/src/hooks/useWebSocket.ts` — use `window.location.host` for WebSocket URL
- `web/src/App.tsx` — use relative path for API fetch

## Lessons Learned

1. Vite's WebSocket proxy works well — as long as there are no **two simultaneous connections**. StrictMode + initialization connections is a problematic combination.
2. Prefer removing StrictMode or deferring WebSocket connection to after the first mount.
3. ECONNRESET is expected when a WebSocket client disconnects abruptly — the proxy should silently handle these rather than propagating errors.

## Preventive Actions

- [ ] When using Vite proxy with `ws: true`, ensure the WebSocket connection is established outside StrictMode effects
- [ ] Add console.error suppression for expected WebSocket errors (ECONNRESET, EPIPE) in proxy configuration from the start
- [ ] Test dev server startup after any changes to WebSocket or StrictMode configuration
