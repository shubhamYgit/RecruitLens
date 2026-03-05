# Deployment Guide — Render + Supabase

## Overview

```
GitHub Repo → Render (Docker) → Supabase (PostgreSQL)
```

The Dockerfile does a **multi-stage build**:
1. Builds the React frontend (`npm run build`)
2. Builds the Spring Boot backend (`mvn package`)
3. Copies the React `dist/` into Spring Boot's `static/` folder
4. Produces a single fat JAR that serves both the API and the frontend

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Give it a name (e.g. `resumescreener`) and set a strong DB password — **save this password**
3. Wait for the project to be ready (~2 minutes)
4. Go to **Project Settings → Database**
5. Scroll to **Connection string** → choose **URI** tab
5. Copy the connection string — it looks like:
   ```
   postgresql://postgres.eunkvnuoxijeokgwgkpy:<YOUR-PASSWORD>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
   ```
6. Replace `<YOUR-PASSWORD>` with your actual DB password
7. Append `?sslmode=require` at the end — **Supabase requires SSL**:
   ```
   postgresql://postgres.eunkvnuoxijeokgwgkpy:<YOUR-PASSWORD>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

> ⚠️ Use **port 5432** (Session mode), NOT 6543 (Transaction mode).  
> Spring Boot / Hibernate needs session mode for DDL (`ddl-auto=update`).

---

## Step 2 — Push your code to GitHub

```bash
git init                         # if not already a git repo
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Make sure `.env` is in `.gitignore` (it already is — never commit secrets).

---

## Step 3 — Deploy on Render

### 3a. Create a new Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub account and select your repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `resumescreener` (or your choice) |
| **Region** | Closest to you |
| **Branch** | `main` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | Free (or Starter for better performance) |

### 3b. Set Environment Variables

In Render → your service → **Environment** tab, add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1 |
| `JWT_SECRET` | A random 64-char string (see tip below) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `JWT_EXPIRATION` | `86400000` |

> **Tip — generate a JWT secret:**
> ```bash
> # On Windows PowerShell:
> -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
> ```

### 3c. Deploy

Click **Deploy** — Render will:
1. Pull your code from GitHub
2. Build the Docker image (takes ~5–8 minutes first time)
3. Run the container
4. Your app is live at `https://resumescreener.onrender.com` (or similar)

---

## Step 4 — Verify the deployment

```bash
# Health check
curl https://<your-render-url>/actuator/health
# Expected: {"status":"UP"}

# Test auth
curl -X POST https://<your-render-url>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test1234!","role":"RECRUITER"}'
```

---

## Supabase SSL — Required ⚠️

Always append `?sslmode=require` to your `DATABASE_URL`. Without it, Supabase will reject the connection.

```
postgresql://postgres.eunkvnuoxijeokgwgkpy:<YOUR-PASSWORD>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## File Upload Warning ⚠️

Render's free tier has an **ephemeral filesystem** — uploaded PDF files will be deleted on each deploy or restart.

**For production**, use one of:
- **Supabase Storage** (free 1GB)
- **Cloudinary**
- **AWS S3**

For now (portfolio/demo), the ephemeral filesystem is fine.

---

## Local Development

```bash
# Copy .env.example and fill in your values
cp .env.example .env

# Run backend (from root)
./mvnw spring-boot:run

# Run frontend (from frontend/)
cd frontend
npm install
npm run dev
```

---

## Useful Render Settings

- **Auto-Deploy**: On (deploys on every push to main)
- **Health Check Path**: `/actuator/health`
- **Build Command**: *(leave empty — Docker handles it)*

