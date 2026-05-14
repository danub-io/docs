---
title: "Skills System"
---

Skills are reusable, domain-specific capabilities registered as tools with a `skill_` prefix. They can access other tools and provide structured knowledge to the LLM.

## Architecture

```
turbo-code/
└── src/modules/skills/
    ├── types.ts            # Skill, SkillDefinition interfaces
    ├── registry.ts         # SkillRegistry — stores and executes skills
    ├── adapter.ts          # skillToTool() — wraps Skill as a Tool
    └── builtin/
        └── shadcn.ts       # ShadcnSkill — shadcn/ui component reference
```

## Registration

Skills are registered in `src/server/index.ts`:

```ts
const skillRegistry = new SkillRegistry();
skillRegistry.register(ShadcnSkill);

// Convert skills to tools and register in ToolRegistry
const skillTools = skillRegistry.getAll().map((s) =>
  skillToTool(s, skillRegistry, registry)
);
for (const tool of skillTools) {
  registry.register(tool);
}
```

## Skill Interface

```ts
interface SkillDefinition {
  name: string;           // e.g. "shadcn"
  description: string;    // Purpose of the skill
  requiredTools: string[]; // Tools the skill needs to execute
}

interface Skill {
  readonly definition: SkillDefinition;
  execute(params, ctx): Promise<ToolResult>;
}
```

## Built-in Skills

### `skill_shadcn`

Accesses the shadcn/ui component library reference based on [ui.shadcn.com/docs](https://ui.shadcn.com/docs).

**Actions:**

| Action | Description |
|--------|-------------|
| `list` | List all 58 components + project setup details |
| `component` | API reference for a specific component |
| `install` | CLI command to add a component |
| `categories` | Components grouped by usage category |

**Required tools:** `bash`, `read`, `grep`

**Available in:** All 4 modes (Normal, Plan, Code, Ask)

### `skill_review-pr`

PR review guidelines and best practices.

## Adding a Custom Skill

1. Create a file in `src/modules/skills/builtin/` implementing the `Skill` interface
2. Define `requiredTools` — the tools your skill depends on
3. Register it in `src/server/index.ts` with `skillRegistry.register(YourSkill)`
4. Add it to the desired mode's tool list in `src/modules/agents/modes.ts`

## Validation

The `skillToTool()` adapter validates that all `requiredTools` are available in the ToolRegistry at registration time, and checks them again at runtime before execution. Missing tools produce a clear error message.
