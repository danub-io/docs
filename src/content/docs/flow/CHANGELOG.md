---
title: "Flow Changelog"
---

# Changelog — Flow

## 1.0.0 (2026-05-24)

### Added
- Visual node-based pipeline editor with React Flow
- Agent nodes with 29+ icon types and distinct colors
- Blackboard nodes for shared memory with access control
- Version history with undo/redo (up to 50 versions per flow)
- Auto-save with 1.5s debounce and idle snapshot (2s)
- YAML disk persistence as source of truth
- Vite save/load endpoints (`POST /__save`, `GET /__load`)
- Load dialog with backup browser (sorted by node count)
- Hamburger menu (New, Save, Load, Add Node/Blackboard)
- VS Code Dark theme
- Agent configuration modal (Planner/Executor/Custom)
- Blackboard configuration modal (readers, writers, content)

### Changed
- System prompts moved from Turbo's `system/` to Flow's `agents/` directory
- Project structure established as dual-purpose (visual builder + flowcraft resources)

### Removed
- Simulated modules (`pi-agent.ts`, `planner.ts`, `executor.ts`, `agents.ts`) — they only had mock implementations
- `PipelineStatePanel.tsx` — not imported anywhere
