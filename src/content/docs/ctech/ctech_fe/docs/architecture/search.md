---
title: "Search Module"
---



The `search` module implements full-text search with filters, sorting, pagination, and facets.

## Overview

Search is **server-side** (SSR): the form submits query params to `/search`, and the Astro page queries the service to render results. No client-side JavaScript for the main search flow.

## Service

**File:** `src/modules/search/services/servicoBusca.ts`

### Interface

```typescript
interface SearchFilters {
  search: string;        // Search term (minimum 2 characters)
  sort?: 'rating' | 'name' | 'release';
  category?: string | null;
  page?: number;
}

interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;            // 24
  query: string;
  timeMs: number;             // Execution time in ms
  availableCategories: {      // Facets
    name: string;
    total: number;
  }[];
}
```

### Features

- **Full-text:** Searches by `product_name`, `brand`, and `category` (case-insensitive, LIKE)
- **Filters:** By category (via `category` query param)
- **Sorting:** By rating (`final_rating DESC`), name (`product_name ASC`), or release (`release_date DESC`)
- **Pagination:** 24 items per page
- **Facets:** Returns available categories with counts for filtering
- **Guard:** Minimum 2 characters to search
- **Error handling:** Returns an empty result on error (never breaks the page)

### Usage Example

```typescript
import { servicoBusca } from '@/modules/search/services/servicoBusca';

const result = await servicoBusca.search({
  search: 'notebook',
  sort: 'rating',
  category: 'Notebook',
  page: 1,
});
```

## Components

| Component | Description |
|-----------|-------------|
| `SearchBar.astro` | Search input with value controlled by query param |
| `SearchFilters.astro` | Category pills for filtering results |
| `ActiveFilter.astro` | Active filter tag with remove button |
| `ResultsGrid.astro` | Product card grid |
| `SearchPagination.astro` | Page navigation |
| `SearchResults.astro` | Container: title, count, grid, pagination |
| `HighlightTerm.astro` | Highlights the search term in text (wraps in `<mark>`) |
| `EmptySearch.astro` | Empty state when no results are found |

## Route

`/search` — Astro page that reads query params (`q`, `category`, `sort`, `page`), calls `servicoBusca.search()`, and renders the components.

## Example URLs

```
/search?q=notebook
/search?q=headphones&category=Headphone&sort=rating
/search?q=keyboard&page=2
```
