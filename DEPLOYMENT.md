# Deployment Guide

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Render         │     │   Supabase      │
│   (Frontend)    │────▶│   (Backend API)  │────▶│   (PostgreSQL)  │
│   React + CRA   │     │   Express + JWT  │     │   + Auth        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Prerequisites

- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- [Supabase](https://supabase.com) account
- Node.js 18+
- MySQL database (for backend) OR Supabase PostgreSQL

---

## 1. Supabase Setup

See [supabase/setup-guide.md](supabase/setup-guide.md) for detailed instructions.

**Quick steps:**
1. Create Supabase project
2. Run `supabase/migrations/001_core_schema.sql` in SQL Editor
3. Run `supabase/migrations/002_seed_data.sql` in SQL Editor
4. Copy API keys from Project Settings → API

---

## 2. Frontend Deployment (Vercel)

Your project is already created on Vercel:  
https://vercel.com/irenentos-projects/smart-banking-powered-by-ai

### Connect Git Repository

1. Go to your Vercel project dashboard
2. Click **Connect Git Repository**
3. Select your Git provider and repository
4. Vercel will auto-detect the framework (Create React App)

### Configure Build Settings

Vercel should auto-detect the following from `web/vercel.json`:

| Setting | Value |
|---------|-------|
| **Framework** | Create React App |
| **Root Directory** | `web/` |
| **Build Command** | `craco build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install --legacy-peer-deps` |

> **Important:** Set the **Root Directory** to `web/` since the frontend is in the `web` subfolder.

### Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` |
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Deploy

1. Push your code to the connected Git branch
2. Vercel will automatically deploy
3. Your site will be live at `https://smart-banking-powered-by-ai.vercel.app`

---

## 3. Backend Deployment (Render)

### Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your Git repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `ai-banking-api` |
| **Root Directory** | `backend/` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (or paid for production) |

> **Important:** Set the **Root Directory** to `backend/` since the backend is in the `backend` subfolder.

### Environment Variables

Add these in Render Dashboard → Environment:

| Variable | Value | Secret? |
|----------|-------|---------|
| `NODE_ENV` | `production` | No |
| `PORT` | `5001` | No |
| `DB_HOST` | Your MySQL host | Yes |
| `DB_USER` | Your MySQL user | Yes |
| `DB_PASSWORD` | Your MySQL password | Yes |
| `DB_NAME` | Your MySQL database name | Yes |
| `JWT_SECRET` | Random secure string | Yes |
| `SUPABASE_URL` | Your Supabase URL | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service key | Yes |
| `AI_ENGINE_URL` | AI engine URL | No |
| `EMAIL_USER` | SMTP email | No |
| `EMAIL_PASS` | SMTP password | Yes |
| `PAYPACK_CLIENT_ID` | Paypack client ID | Yes |
| `PAYPACK_CLIENT_SECRET` | Paypack client secret | Yes |

### After Deployment

1. Copy the Render URL (e.g., `https://ai-banking-api.onrender.com`)
2. Update the frontend's `REACT_APP_API_URL` on Vercel to this URL
3. Re-deploy the frontend on Vercel

---

## 4. Environment Variables Summary

### Required Variables

| Variable | Where Used | Description |
|----------|-----------|-------------|
| `REACT_APP_API_URL` | Frontend (Vercel) | Backend API URL |
| `REACT_APP_SUPABASE_URL` | Frontend + Backend | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Render) | Supabase service role key (admin) |
| `JWT_SECRET` | Backend (Render) | Secret for signing JWT tokens |
| `DB_HOST` | Backend (Render) | MySQL database host |
| `DB_USER` | Backend (Render) | MySQL database user |
| `DB_PASSWORD` | Backend (Render) | MySQL database password |
| `DB_NAME` | Backend (Render) | MySQL database name |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Backend server port |
| `AI_ENGINE_URL` | `http://localhost:8000` | AI engine endpoint |
| `EMAIL_USER` | - | SMTP email for notifications |
| `EMAIL_PASS` | - | SMTP email password |
| `PAYPACK_CLIENT_ID` | - | Paypack integration ID |
| `PAYPACK_CLIENT_SECRET` | - | Paypack integration secret |
| `PAYPACK_BASE_URL` | Paypack API | Paypack API base URL |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth client secret |

---

## 5. Quick Deploy Checklist

- [ ] Supabase project created and migrations run
- [ ] Supabase API keys copied
- [ ] Storage bucket `profile-pictures` created
- [ ] Frontend environment variables set on Vercel
- [ ] Backend environment variables set on Render
- [ ] MySQL database accessible from Render (allow Render IPs)
- [ ] Backend Render URL updated in frontend env vars
- [ ] Frontend re-deployed after backend URL update

---

## 6. Updating After Changes

### Frontend
```bash
git push origin main  # Vercel auto-deploys
```

### Backend
```bash
git push origin main  # Render auto-deploys
```

### Database Migrations
Run new SQL files in Supabase SQL Editor whenever schema changes are needed.
