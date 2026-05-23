# VibeForge — Claude Code Context

> This file is the primary context source for Claude Code working in this repository.
> Keep it up to date as the architecture evolves.

## What this project is

VibeForge is a **low-code platform template** being built in Phase 1. The output is a GitHub template repository that vibe coders fork to build their own data-driven applications using Claude Code as the IDE.

We are building the platform itself — not an app on top of it.

## Essential reading (read before doing anything)

- [`docs/IDEA.md`](./docs/IDEA.md) — full vision, architecture, and design decisions
- [`docs/PHASE1.md`](./docs/PHASE1.md) — Phase 1 scope, tech stack, JSON UI spec, component catalog, and task index

## Current phase

**Phase 1 — Scaffolding & Runtime Foundation** (`🟡 Designing`)

Task index: [`docs/PHASE1.md#tasks`](./docs/PHASE1.md#tasks)

Recommended execution order: TASK-01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12

## What we are building toward

At the end of Phase 1 this repo becomes a GitHub template. A vibe coder forks it, runs `pnpm setup && pnpm dev`, and uses Claude Code to generate screens, behaviours, schemas, and hooks for their own application.

The platform infrastructure (renderer, component library, API client, behaviour loader, router) lives in `frontend/`. The vibe coder's application files live in `app/`. These must stay cleanly separated.
