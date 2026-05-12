---
title: "Editora Web — Web Interface"
---



Modern web interface for Editora, built with Next.js, Tailwind CSS, and shadcn/ui.

## Technologies

- **Next.js 16** — Full-stack React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Accessible components
- **Tiptap** — Rich text editor
- **Zustand** — State management
- **Drizzle ORM** — Database (SQLite)

## Installation

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Production build
pnpm build

# Start production
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   └── utils.ts            # Utilities
├── stores/
│   └── projectStore.ts     # Zustand store
└── types/
    └── index.ts            # TypeScript types
```

## Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#64748B)
- **Background**: White/Light gray
- **Text**: Dark gray

### Typography
- **Interface**: Inter (sans-serif)
- **Editor**: Georgia (serif)

## Features

- **Project management** — Create, edit, and organize book projects
- **Chapter editor** — Rich editor with Tiptap, formatting toolbar, and chapter list
- **Narrative tools** — Character database, locations, timeline, and notes
- **Integrated AI** — Editing, proofreading, and suggestions via Python backend
- **Export** — PDF and EPUB generation

## Backend Integration

The interface communicates with the Python backend via REST API:

```typescript
// Example call
const response = await fetch('/api/ai/edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: content,
    mode: 'light',
  }),
});
```

## License

MIT
