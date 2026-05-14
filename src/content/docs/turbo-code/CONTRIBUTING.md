---
title: "Contributing"
---

## Development

```bash
git clone https://github.com/danub-io/turbo-code.git
cd turbo-code
npm install && cd web && npm install && cd ..
npm run build
```

## Code Standards

- TypeScript strict mode
- ESM modules (`"type": "module"`)
- ES2022 target, NodeNext module resolution
- `.js` extension in all imports (ESM convention, e.g. `from "../store.js"`)
- No comments in code (unless necessary)
- All code is in American English

## Tests

```bash
npm test            # Run tests
npm run test:watch  # Watch mode
```

Always run tests before opening a PR.

## Pull Requests

1. Fork the repository
2. Create a descriptive branch
3. Make your changes
4. Ensure `npm test` passes
5. Open a PR with a clear description
