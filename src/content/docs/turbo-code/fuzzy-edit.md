---
title: "Fuzzy Edit"
---

The `edit` tool supports **fuzzy block matching** when exact string replacement fails. This makes the tool more resilient to minor indentation differences, whitespace changes, or slightly modified code.

## Matching Strategies

The edit tool tries three strategies in order:

1. **Line-based**: `startLine` + `endLine` + `replaceBlock` — exact line range replacement
2. **Exact string**: `oldString` → `newString` — direct literal match
3. **Fuzzy block**: If exact match fails, uses line similarity scoring to find the closest block

## Fuzzy Matching Algorithm

```ts
const SIMILARITY_THRESHOLD = 0.7;  // 70% minimum similarity

function lineSimilarity(aLines, bLines): number {
  // Count matching lines (trimmed) divided by max length
  return matches / maxLen;
}

function findBestBlockMatch(fileLines, searchLines):
  // Slide through file, find the block with highest similarity score
  // Return match if score >= 0.7
```

The algorithm slides through the file content, comparing each block of equal length to the search text using trimmed line equality. If a match is found with similarity >= 70%, it replaces the matched block.

## Diff Output

When a successful edit is made (exact or fuzzy), the tool computes and returns a unified diff:

```diff
--- a/src/file.ts
+++ b/src/file.ts
@@ -10,3 +10,3 @@
  const oldCode = "foo";
-const oldLine = "bar";
+const newLine = "baz";
  const context = "keep";
```

The diff is rendered in the frontend's `DiffViewer` component (`web/src/features/chat/DiffViewer.tsx`).

## Error Handling

If no match is found (exact or fuzzy), the tool returns a clear error:
```
old_string not found in <file>. Provide more surrounding context
or ensure exact indentation matches.
```
