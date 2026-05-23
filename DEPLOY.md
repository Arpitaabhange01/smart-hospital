# Deployment Guide — Smart Hospital

## Architecture
```
Frontend (React)  ──►  Vercel
Backend (Express) ──►  Railway
Database (MongoDB)──►  MongoDB Atlas
```

## Prerequisites
- GitHub account
- [Vercel](https://vercel.com) account (free tier)
- [Railway](https://railway.app) account (free tier)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier)

---

## Step 1 — MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create a **free M0 cluster**
2. Under **Database Access** → Add a database user (username + password)
3. Under **Network Access** → Allow access from anywhere (`0.0.0.0/0`)
4. Click **Connect** → **Connect your application** → Copy the connection string
5. Replace `<user>`, `<password>`, and change `myFirstDatabase` to `smart-hospital`

## Step 2 — Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-hospital.git
git push -u origin main
```

## Step 3 — Deploy Backend on Railway

1. Go to [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo
3. **⚠️ CRITICAL**: In the **Root Directory** field, type or select `backend`
   (Your code is in a monorepo — backend code lives in `backend/`. Without this, Railway won't find `package.json`.)
4. Railway detects Node.js and starts deploying
5. Once deployed, go to the **Variables** tab and add:

| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A random 64-char string (`openssl rand -hex 32`) |
| `CLIENT_URL` | Your Vercel URL (add after step 5) |
| `EMAIL_USER` | Gmail address for sending OTPs |
| `EMAIL_PASS` | Gmail app password |
| `NODE_ENV` | `production` |

6. Once deployed, copy the **Generated Domain** (e.g. `https://smart-hospital-backend.up.railway.app`)

## Step 5 — Deploy Frontend on Vercel

### Option A — Auto-deploy from GitHub (recommended)
1. Go to [Vercel](https://vercel.com) → **Add New Project** → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | Your Railway backend URL (from step 4) |
| `REACT_APP_SOCKET_URL` | Same as above |

4. Click **Deploy** — Vercel auto-builds and deploys on every push

### Option B — Deploy via CLI
```bash
cd frontend
npx vercel --prod \
  --build-env REACT_APP_API_URL=https://your-backend.railway.app \
  --build-env REACT_APP_SOCKET_URL=https://your-backend.railway.app
```

## Step 6 — Update Railway Variable

Go back to Railway → **Variables** → Update `CLIENT_URL` to your Vercel URL.

## Step 7 — Seed the Database (One Time)

### Option A — Via Railway Web Shell (easiest)
1. Go to Railway dashboard → your project → **Shell** tab
2. Type: `node seed.js`
3. Press Enter

### Option B — Via Railway CLI
```bash
cd smart-hospital/backend
railway login
railway run node seed.js
```

### Option C — Local (if MongoDB is running locally)
```bash
cd smart-hospital/backend
node seed.js
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs automatically:

| Trigger | Action |
|---|---|
| Push to `main` | Lint → Build → Deploy to Vercel + Railway |
| PR to `main` | Lint → Build (no deploy) |

### Required GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → Add:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Generate from [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `RAILWAY_TOKEN` | Generate from Railway Dashboard → **Tokens** |
| `API_URL` | Your Railway backend URL |
| `SOCKET_URL` | Same as `API_URL` |

To generate a Railway token: `railway login` → `railway token create`

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env   # fill in your values
npm install
node seed.js           # one time
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```
