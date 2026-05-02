---
title: "CTECH — Ecossistema de Curadoria Técnica de Hardware"
---



Bem-vindo ao **CTECH** (TechReveal), um ecossistema automatizado para análise, comparação e curadoria de hardware. Este projeto utiliza Inteligência Artificial e automação web para transformar dados brutos em insights comerciais valiosos.

## 🏗️ Estrutura do Projeto

O ecossistema é dividido em dois repositórios principais que compartilham o mesmo banco de dados **Turso (SQLite)**.

| Repositório | Tecnologia | Papel no Ecossistema |
| :--- | :--- | :--- |
| [**ctech_be**](./ctech_be) | Next.js 16+, Turso, Pino | **Backend / Painel:** Automação (M1-M6), Scrapers e Processamento de IA. |
| [**ctech_fe**](./ctech_fe) | Astro 6+, React 19, Tailwind v4 | **Frontend / Público:** Interface de alta performance otimizada para SEO. |

## 🚀 Como Começar (Quick Start)

### Pré-requisitos
- **Node.js** v18 ou superior.
- **pnpm** (Gerenciador de pacotes obrigatório).
- **Turso CLI** (Para gerenciamento de banco de dados).

### Configuração Inicial
1. Instale as dependências em ambos os diretórios:
   ```bash
   cd ctech_be && pnpm install
   cd ../ctech_fe && pnpm install
   ```
2. Configure as variáveis de ambiente baseadas nos arquivos `.env.example` de cada pasta.

## 🛠️ Arquitetura de Dados

O banco de dados **Turso** é o "Coração" do sistema, servindo como ponto de sincronização:
- O **Backend** injeta dados processados (reviews, preços, imagens).
- O **Frontend** lê esses dados em tempo real via Server-side Rendering (SSR).

## 📄 Documentação Detalhada

- **Backend:** Veja [ctech_be/README.md](./ctech_be/README.md) e [ctech_be/ARCHITECTURE.md](./ctech_be/ARCHITECTURE.md).
- **Frontend:** Veja [ctech_fe/README.md](./ctech_fe/README.md).
- **Instruções para IA:** Consulte os arquivos `GEMINI.md` em cada diretório para regras específicas de desenvolvimento assistido.

---
*CTECH v2026.4 — Focado em Desempenho e Automação.*
