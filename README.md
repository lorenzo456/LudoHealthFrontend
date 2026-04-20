# LudoHealth Frontend

## What is this project?

LudoHealth is a gamified health platform that encourages healthy habits by rewarding players with points for completing wellness challenges. This repository contains the frontend web application, built with Vue 3, TypeScript, and Element Plus.

The backend API lives in a separate repository ([LudoHealthBackend](../LudoHealthBackend)).

## What does it do?

- **Activity feed** — players see a live feed of their logged health activities
- **Challenges** — players join groups and complete tiered challenges (physical, cognitive, social) to earn points
- **Points** — a score is maintained per player; points are awarded for completing challenges and can be spent in connected games
- **Google Fit integration** — step data is synced from Google Fit and evaluated against walking challenges automatically
- **Game integration** — external games (e.g. GodotJump) can post game events and deduct points via the REST API using a Bearer token
- **Profile** — players can view their score, completed challenges, and connected integrations

## Installation

Requires **Node.js v20.19.0 or higher**.

```sh
npm install
```

## Running the project

Start the backend API first (see the backend README), then run the frontend dev server:

```sh
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other commands

| Command | Description |
|---|---|
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run lint` | Lint and auto-fix with ESLint + oxlint |
| `npm run format` | Format source files with Prettier |
