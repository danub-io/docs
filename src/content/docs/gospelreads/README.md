---
title: "GospelReads — The Intellectual Archive"
---



Blog de conteúdo teológico e reflexões cristãs, construído com **Astro 6**, **React 19** e **Tailwind CSS v4**. Hospedado no **Firebase Hosting**.

## 🚀 Tecnologias

- **Framework:** Astro 6+ (SSG)
- **UI Interativa:** React 19
- **Estilização:** Tailwind CSS v4 + Typography
- **Conteúdo:** Content Collections (MDX)
- **Hospedagem:** Firebase Hosting
- **Fontes:** Google Fonts via CSS

## 📄 Estrutura de Conteúdo

```
src/content/
├── posts/          # Artigos do blog (MD)
├── authors/        # Perfis de autores
└── pages/          # Páginas estáticas
```

## 🛠️ Comandos

```bash
pnpm install          # Instalar dependências
pnpm dev              # Servidor local (localhost:4321)
pnpm build            # Build de produção
pnpm preview          # Preview do build
```

## ☁️ Deploy (Firebase)

```bash
pnpm build
firebase deploy
```

O build gera os arquivos em `dist/`, que são servidos pelo Firebase Hosting com cache agressivo (1 ano para assets estáticos).
