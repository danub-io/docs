---
title: "Postmortem 004: Edit tool convertendo self-closing JSX tag em closing tag inválida"
---

## Sumário

- **Data:** 2026-05-07
- **Componente:** `ComparadorInteractive.tsx` (página de comparação)
- **Sintoma:** Build falhava com `Expected ">" but found "<"` após edição automatizada que trocou `/>` por `</SpecRowMobile>` sem fechar a tag de abertura
- **Severidade:** Média — Bloqueava o build, mas apenas na página de comparação
- **Root cause:** O edit tool substituiu `/>` por `</SpecRowMobile>` mas não adicionou `>` para fechar a tag de abertura `<SpecRowMobile`

## Timeline

1. Foi solicitado aumentar o tamanho das badges `NotaBadge` na página de comparação (`ComparadorInteractive.tsx`)
2. Primeira edição (desktop): `size="md"` → `size="lg"` — bem-sucedida
3. Segunda edição (mobile): `size="sm"` → `size="md"` — reportada como bem-sucedida
4. Build falha com `Expected ">" but found "<"` em `ComparadorInteractive.tsx:370:14`
5. Investigação revelou: a tag self-closing `/>` do primeiro `<SpecRowMobile>` foi substituída por `</SpecRowMobile>`, mas a tag de abertura `<SpecRowMobile` continuou sem `>`

## Sintomas

- Build falha com erro do esbuild: `Expected ">" but found "<"`
- TypeScript reporta: `Identifier expected`, `Expected corresponding JSX closing tag for 'div'`
- O código parecia sintaticamente correto ao ler linha a linha
- Apenas a página de comparação era afetada

## Root Cause

O `edit` tool foi chamado com um `oldString` que continha `</SpecRowMobile>`. O arquivo original tinha `/>` (self-closing). Apesar disso, o tool reportou sucesso, mas substituiu incorretamente:

**Original (válido):**
```tsx
<SpecRowMobile
  label="Crítico"
  values={produtosSlice.map((p) => (
    <NotaBadge key={p.id} score={p.nota_final} size="sm" />
  ))}
/>
```

**Após edição (inválido):**
```tsx
<SpecRowMobile
  label="Crítico"
  values={produtosSlice.map((p) => (
    <NotaBadge key={p.id} score={p.nota_final} size="md" />
  ))}
</SpecRowMobile>
```

O problema: a tag de abertura `<SpecRowMobile` **nunca foi fechada** — faltou `>` após o fechamento do prop `values`. No original, `/>` servia tanto para fechar a abertura quanto marcar self-closing. A edição trocou `/>` por `</SpecRowMobile>` mas esqueceu de adicionar `>` para fechar a tag de abertura.

## Por Que Foi Difícil de Encontrar

| Razão | Explicação |
|-------|-----------|
| **Código parece correto visualmente** | `<SpecRowMobile>...</SpecRowMobile>` parece um par válido para o olho humano |
| **Edit tool reportou sucesso** | Não houve indicação de falha na edição |
| **Erro do esbuild é enigmático** | `Expected ">" but found "<"` não diz explicitamente que uma tag de abertura não foi fechada |

## Solução Aplicada

Reverter `</SpecRowMobile>` para `/>` (self-closing), mantendo apenas a mudança de `size`:

```diff
-              </SpecRowMobile>
+              />
```

## Verificação

```bash
pnpm build
# Deve completar sem erros
```

## Lições Aprendidas

### 1. Sempre verificar o diff após edições automatizadas

Após cada edição com ferramentas automatizadas, revisar o diff (`git diff`) antes de prosseguir. Isso teria capturado imediatamente que `/>` foi substituído por `</SpecRowMobile>`.

### 2. Self-closing vs explicit closing em JSX

Componentes React sem children **devem** usar self-closing `/>`. Trocar para `<Tag>...</Tag>` requer adicionar `>` na tag de abertura — não é uma substituição direta de `/>` por `</Tag>`.

### 3. Build como gate de segurança

Sempre rodar `pnpm build` (ou `pnpm lint`) após edições para capturar erros de sintaxe antes de deploy.

## Arquivos alterados

- `ComparadorInteractive.tsx` — revertido `</SpecRowMobile>` para `/>`

## Ações preventivas

- Após edições automatizadas, revisar `git diff` antes de confirmar
- Desconfiar de edições que mudam a estrutura de tags (self-closing → explícito)
- Rodar build após qualquer edição em JSX
