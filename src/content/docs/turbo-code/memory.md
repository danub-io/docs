---
title: "Persistent Memory"
---

`MemoryStore` stores memories in a JSON file (`~/.config/turbo/memory.json`).

## Memory Types

| Type | Description |
|------|-------------|
| `semantic` | Facts about the project, user preferences |
| `episodic` | Events, fixed bugs, decisions made |

## Commands

| Command | Description |
|---------|-------------|
| `/memory list` | Lists memories for the current project |
| `/memory search <q>` | Searches by keyword |
| `/forget <id>` | Removes entry |
| `/dream` | Extracts memories from the conversation via LLM |

## Auto-Dream

When `autoDream` is enabled (default: `true`), the system autonomously consolidates memories in background after each interaction:

- **Trigger conditions**: Normal or Code mode, at least 10 new messages since last dream, minimum 30s cooldown
- **Execution**: Fire-and-forget — does not block the response. Uses a snapshot of the conversation and the configured `cheapModel`
- **Config**: Toggle via Settings → Advanced Settings → Auto-Dream, or `POST /api/config` with `autoDream: false`
- **Scope**: Only active in Normal and Code modes (modes that execute tasks)

## TF-IDF Search

The `/memory search <q>` command uses TF-IDF weighted search to find relevant memories by keyword relevance.

## RAG Injection

Relevant memories are injected into the context in a `### Memories` markdown section as a user message (optimized for Prefix Caching). The system prompts in Normal and Code modes contain instructions telling the LLM to use these memories to inform decisions.
