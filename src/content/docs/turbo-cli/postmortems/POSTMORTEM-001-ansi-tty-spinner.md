---
title: "Postmortem 001: Corrupted ANSI rendering and non-functional spinner"
---

# Postmortem 001: Corrupted ANSI rendering and non-functional spinner

## Summary

- **Date:** 2026-05-11
- **Component:** `turbo_cli/messages.py`, `turbo_cli/app.py`, `turbo_cli/cli.py`
- **Symptom:** `?` characters in the terminal, literal ANSI escapes in pipes, concurrent toolbar breaking layout, non-functional "Thinking..." spinner
- **Severity:** Medium — affected output readability and user experience
- **Root cause:** `force_terminal=True` + `color_system="truecolor"` forced in rich without checking real TTY; `footer_app` (second `prompt_toolkit` `Application`) running concurrently and interfering with the main loop

## Timeline

1. User reports `?` characters appearing in terminal colors during normal use
2. Investigation reveals that `_get_console()` in `messages.py` forces `force_terminal=True` and `color_system="truecolor"`, preventing rich from correctly detecting terminal capabilities
3. It is discovered that `_use_ansi()` does not check `sys.__stdout__.isatty()`, causing literal ANSI escapes in pipes
4. The `footer_app` (second `prompt_toolkit` `Application`) is found to run in parallel and corrupts the layout
5. `show_thinking_spinner()` was an empty placeholder; the original intent was to use the toolbar to show "THINKING..." but the concurrent implementation failed
6. Solution applied in 5 commits: rich auto-detection, TTY check, footer_app removal, real braille spinner

## Root Cause

**Rich layer:** `_get_console()` forced `force_terminal=True` and `color_system="truecolor"` to ensure colors, but this prevented rich from detecting when the terminal did not support truecolor or when stdout was not a TTY. `_use_ansi()` also did not check `sys.__stdout__.isatty()`.

**prompt_toolkit layer:** The `footer_app` was a second `prompt_toolkit` `Application` created to display a persistent "THINKING..." footer during tool dispatch. Since prompt_toolkit does not support two Applications in the same loop, the footer_app competed with the main loop, causing:
- Inconsistent redraws
- Input handling conflicts
- Corrupted layout (especially when switching modes)

**Spinner:** `show_thinking_spinner()` and `stop_thinking_spinner()` contained only `pass` — the spinner never worked.

## Solution

### 1. `_use_ansi()` — Add TTY detection
```python
def _use_ansi() -> bool:
    if os.environ.get("NO_COLOR"):
        return False
    if os.environ.get("TERM") == "dumb":
        return False
    if hasattr(sys, "__stdout__") and sys.__stdout__ and not sys.__stdout__.isatty():
        return False
    return True
```

### 2. `_get_console()` — Auto-detection
```python
def _get_console() -> Console:
    if not _use_ansi() or _plain_mode:
        return Console(file=sys.stdout, no_color=True, force_terminal=False, color_system=None)
    return Console(file=sys.stdout)
```

### 3. `app.py` — Remove `footer_app`
```python
state.set_thinking(True)
try:
    full_response = await _chat_completion_with_tools(...)
finally:
    state.set_thinking(False)
```

### 4. `messages.py` — Real braille spinner
```python
_SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

async def show_thinking_spinner() -> None:
    if is_plain():
        return
    i = 0
    try:
        while True:
            frame = _SPINNER_FRAMES[i % len(_SPINNER_FRAMES)]
            sys.stdout.write(f"\r\033[93m{frame} Thinking...\033[0m")
            sys.stdout.flush()
            i += 1
            await asyncio.sleep(0.1)
    except asyncio.CancelledError:
        sys.stdout.write("\r\033[K")
        sys.stdout.flush()
```

### 5. `cli.py` — Remove `--no-color`
The `--no-color` argument and the `no_color` parameter from `run()` and `configure_console()` were removed, since rich's auto-detection + TTY check eliminate the need for the manual flag.

## Files changed

- `turbo_cli/messages.py` — TTY detection in `_use_ansi()`, auto-detection in `_get_console()`, real braille spinner
- `turbo_cli/app.py` — Removal of `footer_app`, cleaned up imports (6 lines removed), simplified toolbar, Ctrl+C/V, /end and /new
- `turbo_cli/cli.py` — Removal of `--no-color` flag and `no_color` parameter

## Lessons learned

1. **Never force `force_terminal=True` or a fixed `color_system` in rich.** Let rich auto-detect — it handles TTY, pipes, redirection, and terminals without truecolor support correctly.
2. **prompt_toolkit does not support two concurrent Applications.** Any additional UI must be implemented within the same loop or via prompt_toolkit's own facilities (such as the `bottom_toolbar` callback).
3. **Always check `sys.__stdout__.isatty()`** before emitting manual ANSI codes. Rich does this automatically, but custom code needs the explicit check.
4. **Spinner via `\r` + ANSI is simple and effective** — no additional library needed. Cancellation via `asyncio.CancelledError` allows clean cleanup.

## Preventive actions

- Add to the contribution guide: "when modifying rich Console configuration, never force `force_terminal` or `color_system` — use auto-detection"
- Every new prompt_toolkit UI feature must be validated for conflicts with the main app loop
- Add a regression test for `_use_ansi()` that verifies behavior on TTY vs pipe
