---
title: "Islands Architecture"
---



O Astro usa o conceito de **Islands** — componentes interativos ilhados em HTML estático. Isso minimiza o JavaScript enviado ao cliente.

## Diretrizes

### Prefira Astro para Conteúdo Estático

Componentes que apenas exibem dados (listas, grids, headers) **devem ser Astro**. Eles geram HTML puro sem JavaScript.

### Use React Apenas para Interatividade

Reserve componentes React para:
- Estado local e eventos (`useState`, `useEffect`)
- Hooks e contextos
- Integração com bibliotecas de terceiros

### Estratégia de Hidratação

| Diretiva | Quando usar | Impacto |
|----------|------------|---------|
| `client:load` | Imediatamente necessário (crítico) | Carrega JS na carga inicial |
| `client:visible` | Abaixo da dobra (padrão recomendado) | Carrega quando entra no viewport |
| `client:idle` | Não urgente | Carrega quando o navegador está ocioso |
| `client:media` | Responsivo | Carrega apenas em certos breakpoints |
| `client:only` | SPA-like | Sem SSR, apenas cliente |

### Boas Práticas

```astro
<!-- Mau: React Island para conteúdo estático -->
<ProductList client:load />   ← JS desnecessário

<!-- Bom: Astro nativo, zero JS -->
<ProductList />

<!-- Bom: React apenas quando necessário -->
<SearchFilters client:visible />
<PriceChart client:idle />
```

## Estado Atual

Atualmente, o projeto usa majoritariamente componentes **Astro** estáticos. Componentes React UI (Badge, Button, Card, Progress) são usados principalmente em SSR, com potencial para hidratação cliente em funcionalidades futuras (filtros interativos, busca ao vivo, gráficos).
