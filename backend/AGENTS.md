# Antigravity Agent Guidelines for Hubmi Backend (HackYeah 2026)

## Project Context
This is a fast-paced **hackathon project** (HackYeah 2026). The goal is building a working, accessible demo product quickly and cleanly.

## Key Rules & Constraints

### 1. Consult the User First
- **Always ask questions** on how to approach tasks before jumping into assumptions or complex architectures.
- Confirm preferences on domain models, flows, and API design.

### 2. No Production Overhead (Hackathon Scope)
Keep the codebase lean and focused on core demo features. Specifically, **DO NOT** add:
- **No Docker**: Do not create or use Dockerfiles or Docker Compose. Everything runs locally (`backend/.venv` for Django, `npm run dev` for Next.js).
- **No Email Verification**: Do not implement email confirmation, activation tokens, or mailer setups.
- **No Account Deletion Flows**: Skip account deletion, GDPR exports, and soft-delete architectures.
- **No Data Backups / Archival**: Do not spend time setting up backup automation or dump routines.
- **Database**: Use local SQLite (`db.sqlite3`) for simplicity and speed.

### 3. Tech Stack
- **Backend**: Python 3.12, Django 6.1+, Django REST Framework 3.18+, SQLite, `drf-spectacular`.
- **Frontend**: Next.js (React, Tailwind CSS, TypeScript), WCAG 2.2 AA accessibility focus.
