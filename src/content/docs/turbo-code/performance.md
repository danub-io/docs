---
title: Performance Guidelines
description: Principles and guidelines for performance optimization in Turbo Code
---

Turbo Code is a local-first, single-machine tool. Performance matters, but within the bounds of practicality and maintainability.

## Core Philosophy

**Optimize for the bottleneck, then step away.**

The primary bottleneck in an LLM-powered application is _latency to the model provider_ — measured in seconds or tens of seconds. Micro-optimizations in the hot path rarely move the needle compared to reducing round-trips, pruning context effectively, or choosing a faster model.

## DO Optimize

These are high-ROI areas that directly impact user experience:

| Area | Why |
|------|-----|
| **Context pruning** | Fewer tokens = faster responses + lower cost. Aggressive but safe pruning yields the single biggest win. |
| **Semantic caching** | Repeated queries (same project, similar intent) skip the LLM entirely. |
| **Streaming** | Tokens rendered as they arrive feel instant, even when full response takes 10+s. |
| **Blocking I/O** | SQLite reads, filesystem operations — use sync where safe (SQLite WAL), avoid unnecessary stat/readdir calls. |
| **Startup time** | Lazy-load modules (skills, MCP tools) that aren't needed for every session. |
| **WebSocket message batching** | Send tokens in small batches instead of one-at-a-time when network latency is a factor. |

## DO NOT Optimize

These are **not worth the complexity** in a local-first LLM assistant:

| ❌ AVOID | Reason |
|----------|--------|
| **Micro-optimizations with no measurable impact** | Replacing `Array.map` with a `for` loop saves nanoseconds. The LLM call takes 5+ seconds. |
| **Premature optimization of cold paths** | `/memory search` runs once per session. Optimize hot paths (streaming, pruning) first. |
| **Optimizations that make code unreadable** | A cryptic one-liner that saves 2ms is tech debt. Write clear code; let V8 optimize it. |
| **Changes to critical algorithms without thorough testing** | Touching core pruning, caching, or orchestration logic without tests is how regressions hide. |

## Measuring Impact

Before optimizing anything:

1. **Measure** — Use `performance.now()` or a simple wrapper to time the actual bottleneck.
2. **Compare** — Optimize vs. baseline. If improvement < 5%, revert.
3. **Ship** — Only if the improvement is measurable and the code remains clean.

```typescript
// Simple timing wrapper
function timed<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  if (elapsed > 10) {
    logger.debug({ label, elapsedMs: Math.round(elapsed) }, 'timed operation');
  }
  return result;
}
```

## Key Constants

See [`src/constants.ts`](https://github.com/danub-io/turbo-code/blob/develop/src/constants.ts) for all tunable values:

| Constant | Value | Purpose |
|----------|-------|---------|
| `PRUNE_RATIO` | 0.4 | Prune when estimated tokens exceed 40% of context window |
| `MIN_ROUNDS_BETWEEN_PRUNES` | 2 | Minimum tool rounds between prune cycles |
| `KEEP_LAST_TOOL_ROUNDS` | 3 | Number of recent tool rounds preserved during prune |
| `SEMANTIC_CACHE_TTL_MS` | 600_000 (10min) | TTL for cached LLM responses |
| `EMBEDDING_CACHE_TTL_MS` | 3_600_000 (1h) | TTL for cached embedding vectors |
| `DESTRUCTIVE_PROMPT_CONFIRM` | true | Require user confirmation for destructive operations |

## Related

- [Context Pruning](compression.md) — How context pruning works
- [Memory](memory.md) — Semantic caching details
- [Providers](providers.md) — Model selection impacts latency and cost
