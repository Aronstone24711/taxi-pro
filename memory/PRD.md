# TaxMaster Pro — PRD

## Original Problem Statement
User provided a single-page HTML prototype ("TaxMaster Pro") for a competition and asked to:
- Convert to a full-stack React + FastAPI + MongoDB app that looks professional (not amateur, not flashy)
- Use curated data for tax info; skip live-Google-Sheet, add admin panel to edit
- Add: user accounts + progress, leaderboard + streak achievements, PDF/report export, AI Tax Assistant, more countries with quizzes
- Keep the existing blue corporate look, but polished

## User Personas
- **Learners / Students** — want to master Indian & global tax basics through quizzes
- **Freelancers / Expats** — need country-by-country tax knowledge and saving strategies
- **Admins / Educators** — curate country data and quiz banks

## Core Requirements (Static)
- JWT auth (email + password), admin role
- MongoDB persistence for users, countries, quiz attempts, chat history
- Backend endpoints prefixed with `/api`
- Frontend uses `REACT_APP_BACKEND_URL`
- Professional design: Chivo (headings), Inter (body), IBM Plex Mono (numbers), #2563eb primary
- No purple gradients or flashy motion; corporate flat-card aesthetic
- Data is educational; every screen shows a "consult a professional" reminder

## Architecture / What's Been Implemented (2026-02)
- **Backend** (`/app/backend/server.py`, `auth.py`, `tax_data.py`, `chat_service.py`)
  - JWT (bcrypt + PyJWT) auth: register, login, logout, me, refresh
  - Admin seeded on startup (admin@taxmaster.pro / Admin@123)
  - Countries CRUD (48 countries seeded) with admin RBAC
  - `/api/quiz/indian` (15 questions), `/api/quiz/country/{key}`
  - `/api/quiz/submit` — updates user score/streak, unlocks achievements
  - `/api/leaderboard` — ranked users
  - `/api/user/history` — recent quiz attempts
  - `/api/chat/stream` — Claude Sonnet 4.5 via `emergentintegrations` (SSE)
- **Frontend** (`/app/frontend/src`)
  - Routes: `/`, `/login`, `/register`, `/dashboard`, `/quiz`, `/explorer`, `/save-smart`, `/leaderboard`, `/admin`
  - Sidebar + top-bar layout (`components/Layout.jsx`, `Sidebar.jsx`)
  - Floating Chatbot widget (`components/Chatbot.jsx`) streaming Claude
  - Dashboard with 4 stat cards, quick actions, achievements, recent history
  - Indian Quiz (continuous), World Explorer (search + region filter + per-country quiz)
  - Save Smart (India + generic calculator, tips, copy checklist, download report)
  - Leaderboard (top 20 with medals)
  - Admin Panel (CRUD countries + quiz questions)
- **Testing**: 21/21 backend pytest pass, all frontend flows verified end-to-end

## Prioritized Backlog (Post-MVP)
- **P0** — none blocking
- **P1**
  - Password reset flow (endpoints scaffolded in playbook, UI not built)
  - True PDF export (currently `.txt` report; add jsPDF/pdfmake)
  - Weekly leaderboard reset + monthly badges
  - Country comparison view (side-by-side)
- **P2**
  - OAuth / Google social login
  - i18n (Hindi first)
  - Chat history sidebar
  - CSV import in Admin Panel
  - Referral / share achievements to socials

## Test Credentials
See `/app/memory/test_credentials.md`.
