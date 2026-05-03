---
title: "Editora Web - Interface Web"
---



Interface web moderna para a Editora, construída com Next.js, Tailwind CSS e shadcn/ui.

## 🚀 Tecnologias

- **Next.js 16** - Framework React full-stack
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis
- **Tiptap** - Editor de texto rico
- **Zustand** - Gerenciamento de estado
- **Drizzle ORM** - Banco de dados (SQLite)

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Iniciar produção
pnpm start
```

## 🏗️ Estrutura

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial
│   └── globals.css         # Estilos globais
├── components/
│   └── ui/                 # Componentes shadcn/ui
├── lib/
│   └── utils.ts            # Utilitários
├── stores/
│   └── projectStore.ts     # Zustand store
└── types/
    └── index.ts            # TypeScript types
```

## 🎨 Design System

### Cores
- **Primary**: Azul (#3B82F6)
- **Secondary**: Cinza (#64748B)
- **Background**: Branco/Cinza claro
- **Text**: Cinza escuro

### Tipografia
- **Interface**: Inter (sans-serif)
- **Editor**: Georgia (serif)

## 📱 Funcionalidades

- **Gerenciamento de projetos** — Criar, editar e organizar projetos de livros
- **Editor de capítulos** — Editor rico com Tiptap, barra de formatação e lista de capítulos
- **Ferramentas narrativas** — Banco de personagens, locais, timeline e anotações
- **IA integrada** — Edição, proofreading e sugestões via backend Python
- **Exportação** — Geração de PDF e EPUB

## 🔗 Integração com Backend

A interface se comunica com o backend Python através de API REST:

```typescript
// Exemplo de chamada
const response = await fetch('/api/ai/edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: content,
    mode: 'light',
  }),
});
```

## 📄 Licença

MIT