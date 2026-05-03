---
title: "ADR-003: Estrutura Modular para Desenvolvimento com IA"
---



**Data:** 2026-04-15
**Status:** Aceito

## Contexto

O projeto é desenvolvido com auxílio intensivo de IA (agentes de código). Precisávamos de uma estrutura que:
- Minimizasse o contexto necessário por tarefa
- Isolasse domínios para evitar efeitos colaterais
- Facilitasse a compreensão do código por IAs com janela de contexto limitada

## Decisão

Adotamos uma estrutura **modular (Vibecoding)** com separação clara entre `core/` (infraestrutura) e `modules/` (domínios de negócio). Cada módulo contém seus próprios componentes, serviços e testes.

## Estrutura

```
src/
├── core/       # Infraestrutura global (UI, lib, layouts, types, services globais)
├── modules/    # Domínios isolados (inicio, produto, guia, busca, comparar, comunidade)
└── pages/      # Camada fina de roteamento (apenas orquestra dados → componentes)
```

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|------------|-------------------|
| Flat (tudo em pastas por tipo) | Contexto muito grande para IAs, difícil isolar mudanças |
| Feature-Sliced Design | Muita cerimônia para o tamanho do projeto |
| Monolítico | Viola o princípio do vibecoding |

## Consequências

- Positivas: IA precisa de apenas 1-2 arquivos de contexto por tarefa
- Positivas: Mudanças em um módulo raramente afetam outros
- Negativas: Duplicação ocasional de tipos entre módulos
- Regra: `@core/*` raramente é alterado — mudanças ficam em `@modules/*`

## Referências

- `ctech_fe/ARCHITECTURE.md`
- `ctech_fe/AGENTS.md`
