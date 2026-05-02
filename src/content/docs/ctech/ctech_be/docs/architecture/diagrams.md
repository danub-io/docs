---
title: "Diagramas de Arquitetura - CTECH Painel"
---



## Pipeline Principal (M1 → M7)

```
Texto Bruto (Usuário)
       │
       ▼
┌──────────────┐
│   M1: ENTRADA │  IA extrai: marca, nome, specs, tier
│  (Ingestão)   │  Detecta duplicidade semântica (SQL + IA)
└──────┬────────┘
       │ Produtos validados
       ▼
┌──────────────┐
│   M2: DESCOBERTA │  Busca links de reviews (Google)
│   (Reviews)      │  IA filtra: ignora lojas/fóruns
└──────┬──────────┘
       │ Links aprovados
       ▼
┌──────────────┐
│   M3: EXTRAÇÃO │  Scraping → Markdown → IA analisa
│   (Análise)    │  Output: nota (0-10), pros, contras, mini_review
└──────┬────────┘
       │ Reviews curadas
       ▼
┌──────────────┐
│  M4: CONSOLIDAÇÃO │  Agrega até 8 reviews
│  (Consolidação)   │  Nota Bayesiana + Fator de Defasagem
│                   │  IA sintetiza veredito final
└──────┬────────────┘
       │ Produto pronto (M4 aprovado)
       ▼
┌──────────────┐
│   M5: PREÇOS    │  Busca preços (Google Shopping)
│  (Comercial)    │  IA valida: é o modelo correto?
│                  │  Monitora variação > R$ 5,00
└──────┬──────────┘
       │ Links afiliados validados
       ▼
┌──────────────┐
│  M6: CONFERÊNCIA │  Auditoria final do link
│  (Auditoria)     │  Scraping: preço PIX/Boleto + estoque
│                  │  Marca status_erro se sem estoque
└──────┬───────────┘
       │ Produto auditado
       ▼
┌──────────────┐
│   M7: CMS       │  Catálogo público (CRUD)
│  (Catálogo)     │  Interface para listagem e edição
└─────────────────┘
```

## Sistema de Filas (Worker)

```
┌─────────────┐     CLAIM     ┌─────────────────┐
│  fila_      │ ◄──────────── │   Worker        │
│  processamento│             │ (worker.ts)     │
│              │ ────────►    │                 │
│ Status:      │  RESULTADO  │ processNextJob() │
│ - pendente   │             │ runWorkerBatch() │
│ - processando│             └─────────────────┘
│ - concluido  │
│ - erro       │    Após 3 falhas:
│ - falha_     │    ──────────► DLQ (Dead Letter Queue)
│   critica    │
└─────────────┘
```

## Cascata de Resiliência (AI/Scraping)

```
Tier 1 (Primário)
    │ falha
    ▼
Tier 2 (Reserva 1)
    │ falha
    ▼
Tier 3 (Reserva 2)
    │ falha
    ▼
Tier 4 (Reserva 3)
    │ falha
    ▼
Tier 5 (Fallback Final)
```

## Banco de Dados (Turso SQLite)

```
┌────────────────┐
│   Produtos     │ ◄────┐
│ (catálogo)     │      │
└────────────────┘      │
       │                │
       ▼                │
┌────────────────┐      │
│   Reviews      │      │ (1:N)
│ (análises M3)  │      │
└────────────────┘      │
       │                │
       ▼                │
┌────────────────┐      │
│   Afiliados    │      │ (1:N)
│ (lojas M5/M6)  │      │
└────────────────┘      │
                       │
┌────────────────┐      │
│ config_ai_     │      │
│ models         │      │ (config M8)
└────────────────┘      │
                       │
┌────────────────┐      │
│ config_scraping│      │
│ _services      │      │ (config M8)
└────────────────┘      │
                       │
┌────────────────┐      │
│ fila_          │      │
│ processamento  │      │ (worker)
└────────────────┘      │
                       │
┌────────────────┐      │
│ logs_entrada   │      │ (auditoria)
└────────────────┘      │
                       │
┌────────────────┐      │
│ historico_     │      │
│ precos         │      │ (90 dias)
└────────────────┘      │
```

## Fluxo de Dados M9 (Documentação)

```
/src/app/docs/
     │
     ├── page.tsx (UI: Sidebar + Reader)
     │
     ├── Leitura de arquivos .md:
     │   ├── README.md (raiz)
     │   ├── API.md
     │   ├── ARCHITECTURE.md
     │   ├── CONTRIBUTING.md
     │   ├── CHANGELOG.md
     │   └── docs/**/*.md
     │
     └── Renderização: react-markdown + remark-gfm
```
