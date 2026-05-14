---
title: "Security"
---

## Process Group Isolation

Every bash subprocess is executed with `setsid` + `killpg` to ensure child processes are cleaned up.

## Blocked Commands

Commands that block the terminal or run indefinitely cannot be executed (38 patterns):

| Category | Commands |
|----------|----------|
| Dev servers | `npm run dev`, `npm run watch`, `npm start`, `yarn dev/watch/start`, `pnpm dev/watch/start`, `bun dev`, `bun run dev` |
| Build watchers | `vite dev`, `vite build --watch`, `webpack --watch` |
| File watchers | `tail -f`, `tailf`, `inotifywait`, `fswatch`, `nodemon`, `tsx watch`, `ts-node-dev` |
| Log viewers | `less`, `more`, `top`, `htop`, `btop` |
| Web servers | `fastapi dev`, `uvicorn`, `gunicorn`, `python -m http.server`, `python3 -m http.server`, `php -S`, `rails server` |
| Docker | `docker compose up`, `docker-compose up`, `docker run` |
| Kubernetes | `kubectl port-forward`, `kubectl proxy` |
| Network listeners | `ssh`, `nc -l`, `ncat -l`, `socat` |

## Destructive Patterns

Destructive patterns require user confirmation via AskUserModal (12 patterns):

| Pattern | Description |
|---------|-------------|
| `rm -rf /`, `rm -rf ~` | Recursive root deletion |
| `dd` | Raw disk write |
| `mkfs`, `mkswap` | Filesystem creation |
| `fdisk`, `parted` | Disk partitioning |
| `format` | Format command |
| `> /dev/`, `:> /dev/`, `echo ... > /dev/` | Overwriting block devices |
| `chmod -R 000` | Mass permission removal |
| `chown -R` | Mass ownership change |
| `git push --force` | Force push (destructive to history) |
| `git reset --hard` | Hard reset (data loss) |
| `git clean -fd` | Force clean (data loss) |

## Circuit Breaker

In Code mode, after 3 consecutive tool failures, the circuit breaker blocks execution until the user runs `/code-reset`.

## Command Injection Prevention

Tools like `grep` and `find` use `spawnSync` with an argument array (no intermediate shell) to prevent command injection.
