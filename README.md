# AI-Powered Project Collaboration Platform

Final-year CSE mini project — MERN stack team collaboration tool with an AI task-breakdown assistant, real-time Kanban board, and file attachments.

## Tech Stack
- **Frontend:** React, React Router DOM, Axios, Tailwind CSS, DnD Kit, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcrypt, Multer, Cloudinary, Socket.IO
- **AI:** One LLM API — used ONLY to convert a project description into structured task JSON

## Folder Structure

```
ai-project-collab/
├── backend/
│   ├── controllers/      # Route handler logic (auth, team, project, task, ai, dashboard)
│   ├── routes/            # Express route definitions
│   ├── models/            # Mongoose schemas: User, Team, Project, Task, AILog
│   ├── middlewares/        # JWT auth guard, error handler, file validation
│   ├── config/             # DB connection, Cloudinary config
│   ├── services/          # AI service, Cloudinary service
│   ├── socket/             # Socket.IO event handlers
│   ├── uploads/            # Local temp storage before Cloudinary upload (gitkept)
│   ├── server.js           # App entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/       # Login/Register forms
    │   │   ├── team/       # Team creation, invite, member list
    │   │   ├── project/    # Project workspace views
    │   │   ├── task/       # Task cards, task modal/form
    │   │   ├── kanban/     # Drag-and-drop board (DnD Kit)
    │   │   ├── dashboard/  # Stat cards, charts
    │   │   ├── ai/         # AI Task Assistant UI (review/edit/save)
    │   │   └── layout/     # Sidebar, Navbar, PageWrapper
    │   ├── pages/          # Route-level pages
    │   ├── hooks/          # Custom hooks (useAuth, useSocket, useProjects...)
    │   ├── context/        # AuthContext, SocketContext
    │   ├── services/       # Axios API modules
    │   ├── utils/          # Helpers, constants, validators
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env.example
```

## Build Roadmap (generated module-by-module)

1. ✅ Folder structure
2. ✅ Backend setup (server.js, DB connection, base middleware)
3. ✅ Frontend setup (routing, layout shell, Tailwind theme)
4. ✅ MongoDB models (User, Team, Project, Task, AILog)
5. ✅ Authentication (register/login, JWT, protected routes)
6. ✅ Team Module
7. ✅ Project Module
8. ✅ Task Module (+ Kanban drag-and-drop)
9. ✅ Socket.IO real-time updates
10. ✅ Cloudinary file upload
11. ✅ AI Task Assistant integration
12. ✅ Dashboard & charts
13. ✅ Deployment guide — see [`DEPLOYMENT.md`](./DEPLOYMENT.md)

All 13 modules are complete. See `DEPLOYMENT.md` for taking this from local to a live URL (Render/Railway + Vercel/Netlify + MongoDB Atlas + Cloudinary).

## Setup (once modules are generated)

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```
