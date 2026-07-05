# Agentic Productivity Assistant (Web)

A rebuilt, deployed version of the original CLI task manager. Add, view, and
remove tasks using structured input or natural language — parsed by GPT-4o —
with a live web UI instead of a terminal.

Originally a Python CLI script ([earlier version](https://github.com/ashad1010/agentic-productivity-assistant)).
This version is a full rebuild: React frontend, serverless backend, real
persistent storage, deployed on Netlify.

## Stack

- **Frontend:** React + Vite
- **Backend:** Netlify Functions (serverless)
- **Storage:** Netlify Blobs
- **AI parsing:** OpenAI GPT-4o (`gpt-4o-2024-08-06`)

## Features

- Add tasks via natural language ("Remind me to file taxes on 2026-07-15") or a manual form
- View and remove tasks
- Due-date awareness (overdue / due today / due tomorrow, highlighted)
- Daily motivational quote via GPT-4o
- Fully serverless — no server to manage, scales to zero

## Local development

```bash
npm install
npx netlify dev
```

This runs the Vite frontend and Netlify Functions together at `http://localhost:8888`,
with Netlify Blobs running in local sandbox mode (no account needed for local dev).

## Environment variables

Set in Netlify's dashboard (Site settings → Environment variables) or in a local `.env`:

```
OPENAI_API_KEY=your_key_here
```

## Deployment

Connected to Netlify via GitHub. Push to `main` to deploy. Build settings are
defined in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Roadmap

- **Google Calendar sync** — sync tasks to/from Google Calendar. Requires a
  Google Cloud project + OAuth consent screen setup; not yet implemented.
- Task editing (currently add/remove only)
- Multi-user support (currently single shared task list — fine for a demo,
  not for real multi-user use)

## Notes on the rebuild

The original CLI stored tasks in a local `tasks.json` file and ran in a
blocking terminal loop. Neither of those translate to a serverless/static
host, so this version replaces:

- `input()` loop → React UI
- local JSON file → Netlify Blobs
- direct OpenAI SDK calls → server-side Netlify Function (keeps the API key
  off the client)
