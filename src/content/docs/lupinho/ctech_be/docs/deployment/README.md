---
title: "Deployment"
---

This folder contains guides and documentation related to deploying the CTECH Panel application.

## Contents

- `vercel.md` — Vercel deployment guide
- `docker.md` — Containerization and deployment with Docker
- `environment.md` — Environment variables configuration

## Quick Start

The project is configured for deployment on Vercel (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Required Environment Variables

See `.env.example` in the project root for the full list.
