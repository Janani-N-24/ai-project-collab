# Deployment Guide

This guide takes the AI-Powered Project Collaboration Platform from your local machine to a live, shareable URL — useful for your project demo/evaluation.

**Stack:** Backend (Node/Express/Socket.IO) on **Render** or **Railway** · Frontend (React/Vite) on **Vercel** or **Netlify** · Database on **MongoDB Atlas** · File storage on **Cloudinary**.

---

## 1. Prerequisites

Create free accounts on:
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — database
- [Cloudinary](https://cloudinary.com) — file storage
- [Render](https://render.com) or [Railway](https://railway.app) — backend hosting
- [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — frontend hosting
- An API key for your chosen LLM provider (OpenAI, or any OpenAI-compatible chat-completions endpoint)
- Push this project to a GitHub repository — all four hosting providers deploy directly from GitHub

---

## 2. MongoDB Atlas Setup

1. Create a free **M0 cluster**.
2. **Database Access** → add a database user with a username/password (save these).
3. **Network Access** → add IP `0.0.0.0/0` (allow access from anywhere) so your hosted backend can connect. For a real production app you'd restrict this, but it's fine for a college project demo.
4. **Connect** → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-project-collab?retryWrites=true&w=majority
   ```
   This is your `MONGO_URI`.

---

## 3. Cloudinary Setup

1. Sign up, go to the **Dashboard**.
2. Copy your **Cloud Name**, **API Key**, and **API Secret** — these map directly to `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## 4. Deploy the Backend

### Option A: Render

1. **New** → **Web Service** → connect your GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Instance Type:** Free is fine for a demo.
6. Add all environment variables from `backend/.env.example` under **Environment**:

   | Key | Value |
   |---|---|
   | `PORT` | `5000` (Render sets its own `PORT`, this is just a fallback) |
   | `CLIENT_URL` | your deployed frontend URL, e.g. `https://your-app.vercel.app` |
   | `MONGO_URI` | from Atlas |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
   | `AI_API_KEY` | your LLM provider key |
   | `AI_API_URL` | your provider's chat-completions endpoint |
   | `AI_MODEL` | e.g. `gpt-4o-mini` |

7. Deploy. Render gives you a URL like `https://your-backend.onrender.com`.
8. Sanity check: visit `https://your-backend.onrender.com/api/health` — you should see `{"success":true,"message":"API is running"}`.

### Option B: Railway

Same environment variables as above. Railway auto-detects Node projects; set the **Root Directory** to `backend` and the **Start Command** to `node server.js` under Settings if it isn't inferred automatically.

> Both platforms support WebSockets out of the box, so Socket.IO works without extra configuration.

---

## 5. Deploy the Frontend

### Option A: Vercel

1. **Add New Project** → import your GitHub repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite (auto-detected)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Add environment variables:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |

7. Deploy. `vercel.json` (already included) handles the SPA fallback so React Router routes work on refresh.

### Option B: Netlify

Same env vars. `netlify.toml` (already included) sets the build command, publish directory, and SPA redirect automatically — Netlify will pick it up with no extra configuration.

---

## 6. Connect the Two

Once both are deployed:

1. Go back to your **backend's** environment variables and set `CLIENT_URL` to your real frontend URL (e.g. `https://your-app.vercel.app`). You can pass multiple comma-separated origins if you also want local dev to keep working, e.g.:
   ```
   CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
   ```
2. Redeploy the backend so the new CORS/Socket.IO origin takes effect.
3. Re-check `VITE_API_URL` / `VITE_SOCKET_URL` on the frontend point at the backend's real URL, and redeploy the frontend if you changed them after the first deploy.

---

## 7. Post-Deployment Checklist

- [ ] `/api/health` on the backend returns success
- [ ] Register + log in from the deployed frontend
- [ ] Create a team, invite a second (test) account by email
- [ ] Create a project, generate tasks with the AI Task Assistant, edit and save them
- [ ] Drag a task between Kanban columns and confirm it persists after a refresh
- [ ] Open the same project in two browser windows and confirm real-time sync (Socket.IO)
- [ ] Attach a file to a task and confirm it opens from its Cloudinary URL
- [ ] Check the Dashboard renders stats/charts for a project with tasks

---

## 8. Common Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| Frontend loads but API calls fail with CORS errors | `CLIENT_URL` on the backend doesn't match the frontend's actual URL | Update `CLIENT_URL`, redeploy backend |
| Socket.IO doesn't connect / no real-time updates | `VITE_SOCKET_URL` wrong, or backend host doesn't support WebSockets | Double check the URL; both Render and Railway support WS by default |
| 401 errors right after login | Clock skew or wrong `JWT_SECRET` between deploys | Make sure `JWT_SECRET` hasn't changed since the token was issued |
| File upload fails | Cloudinary env vars missing/incorrect | Re-check `CLOUDINARY_*` values on the backend host |
| AI Task Assistant returns "temporarily unavailable" | `AI_API_KEY`/`AI_API_URL` missing, wrong, or the model's response wasn't valid JSON | Check the backend logs; the raw response is stored in the `AILog` collection for debugging |
| MongoDB connection refused | Atlas Network Access doesn't allow the backend host's IP | Confirm `0.0.0.0/0` is allowed under Network Access |

---

## 9. Local Development Reminder

For local dev, none of the above is needed — just:

```bash
# Backend
cd backend && npm install && cp .env.example .env   # fill in real values
npm run dev

# Frontend
cd frontend && npm install && cp .env.example .env
npm run dev
```

The frontend's Vite dev server proxies `/api` and `/socket.io` straight to `http://localhost:5000` (see `vite.config.js`), so the default `.env.example` values work together out of the box.
