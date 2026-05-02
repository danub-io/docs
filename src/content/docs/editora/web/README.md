---
title: "Editora Web - Interface Web"
---



Interface web moderna para a Editora, construída com Next.js, Tailwind CSS e shadcn/ui.

## 🚀 Tecnologias

- **Next.js 14** - Framework React full-stack
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis
- **Tiptap** - Editor de texto rico
- **Zustand** - Gerenciamento de estado
- **Drizzle ORM** - Banco de dados (SQLite)

## 📦 Instalação

```bash
# Instalar dependências
npm install
# ou
pnpm install

# Rodar em desenvolvimento
npm run dev
# ou
pnpm dev

# Build de produção
npm run build
# ou
pnpm build

# Iniciar produção
npm run start
# ou
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

### MVP (Fase 1)
- [x] Setup do projeto
- [x] Página inicial com lista de projetos
- [x] CRUD de projetos
- [ ] Editor de capítulos
- [ ] Salvamento automático

### Editor Rico (Fase 2)
- [ ] Tiptap integrado
- [ ] Barra de formatação
- [ ] Lista de capítulos arrastável
- [ ] Contador de palavras

### Ferramentas (Fase 3)
- [ ] Banco de personagens
- [ ] Banco de locais
- [ ] Timeline
- [ ] Anotações

### IA e Exportação (Fase 4)
- [ ] Integração com backend Python
- [ ] Edição com IA
- [ ] Proofreading
- [ ] Exportação PDF/EPUB

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