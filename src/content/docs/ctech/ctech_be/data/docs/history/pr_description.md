---
title: "pr_description"
---

🧪 Add tests for worker failure path

🎯 **What:** The testing gap addressed
The failure path in `src/app/actions/worker.ts` was missing test coverage. Specifically, the fallback logic that updates the job's retry count or marks it as an error when an unknown task or inner exception is thrown wasn't verified.

📊 **Coverage:** What scenarios are now tested
1.  **Retries < 3:** The test verifies that `db.execute` is correctly called to increment the `retries` count and update the status to `'pendente'`.
2.  **Retries >= 3:** The test verifies that `db.execute` is called to set the status to `'erro'` when the retry limit is met.

✨ **Result:** The improvement in test coverage
Increased confidence in the system's background job processor by assuring that failing tasks correctly queue for retry or appropriately log an error state, preventing silent failures.
