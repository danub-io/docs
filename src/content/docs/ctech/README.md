---
title: "CTECH — Ecossistema de Curadoria Técnica de Hardware"
---

Bem-vindo ao **CTECH** (TechReveal), um ecossistema automatizado para análise, comparação e curadoria de hardware. Este projeto utiliza Inteligência Artificial e automação web para transformar dados brutos em insights comerciais valiosos.

## Estrutura do Projeto

O ecossistema é dividido em dois repositórios principais que compartilham o mesmo banco de dados **Turso (SQLite)**.

| Repositório | Tecnologia | Papel no Ecossistema |
| :--- | :--- | :--- |
| [**ctech_be**](./ctech_be) | Next.js 16+, Turso, Pino | **Backend / Painel:** Automação (M1-M6), Scrapers e Processamento de IA |
| [**ctech_fe**](./ctech_fe) | Astro 6+, React 19, Tailwind v4 | **Frontend / Público:** Interface de alta performance otimizada para SEO |

## Fluxo de Dados

```
ctech_be (Server Actions) → Turso DB (SQLite) ← ctech_fe (Astro SSR)
```

O **Backend** injeta dados processados (reviews, preços, imagens). O **Frontend** lê esses dados em tempo real via Server-side Rendering (SSR).

## ADRs (Architecture Decision Records)

- **ADR-001:** Escolha do Turso (SQLite distribuído) como banco de dados
- **ADR-002:** Adoção de Astro Islands para o frontend
- **ADR-003:** Estrutura modular (Vibecoding) para desenvolvimento com IA
- **ADR-004:** Cache em memória com proteção contra stampede

## Documentação

| Projeto | Documentos |
|---------|-----------|
| **ctech_fe** | [README](./ctech_fe/README.md), [ARCHITECTURE](./ctech_fe/ARCHITECTURE.md), [CONTRIBUTING](./ctech_fe/CONTRIBUTING.md), [DATA_LAYER](./ctech_fe/DATA_LAYER.md), [CHANGELOG](./ctech_fe/CHANGELOG.md) |
| **ctech_be** | [README](./ctech_be/README.md), [ARCHITECTURE](./ctech_be/ARCHITECTURE.md), [CONTRIBUTING](./ctech_be/CONTRIBUTING.md), [API](./ctech_be/API.md), [CHANGELOG](./ctech_be/CHANGELOG.md) |
