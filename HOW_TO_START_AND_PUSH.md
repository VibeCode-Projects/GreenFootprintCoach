# How to Start, Run, and Push - Quick Reference Guide

This guide contains everything you need to configure, run, and push changes for the **AI-Powered Eco-Habit & Green Footprint Coach** project.

---

## 1. Environment Configuration (`.env.example`)

An example environment file is located at [`.env.example`](file://.env.example).

### Step 1: Create your server environment file
```bash
cp .env.example server/.env
```

### Step 2: Configure Keys (Optional)
The file `server/.env` contains the following settings:

| Variable | Description | Default / Recommended |
| :--- | :--- | :--- |
| `PORT` | Backend Express server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret key for signing user authentication tokens | `eco_habit_coach_super_secure_jwt_token_secret_key_2026` |
| `JWT_EXPIRES_IN`| Token validity period | `30d` |
| `MONGODB_URI` | MongoDB Connection String: <br>• **Leave Empty**: Runs zero-config in-memory MongoDB!<br>• **Or Atlas URI**: `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/eco_coach` | *(empty = in-memory)* |
| `GEMINI_API_KEY`| Google Gemini AI Key from [Google AI Studio](https://aistudio.google.com/):<br>• If set: Uses real Gemini 1.5 Flash.<br>• If empty: Uses built-in deterministic NLP engine. | *(optional)* |
| `GEMINI_MODEL` | AI model identifier | `gemini-1.5-flash` |
| `ALLOWED_ORIGINS`| CORS allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |

---

## 2. Quick One-Command Management (`manage.sh`)

An all-in-one executable script [`manage.sh`](file://manage.sh) is provided in the root directory:

```bash
# Make it executable (run once if needed)
chmod +x manage.sh

# 1. Start both Backend & Frontend in background:
./manage.sh start

# 2. Check server and client running status:
./manage.sh status

# 3. Stop both servers:
./manage.sh stop

# 4. Push changes to GitHub:
./manage.sh push "Your commit message here"

# 5. First-time setup (installs npm dependencies & copies .env):
./manage.sh setup
```

---

## 3. Starting Manually (Terminal Commands)

If you prefer starting each service manually in separate terminal windows:

### Terminal 1: Backend Server (Port 5001)
```bash
cd server
npm install        # (Only needed first time)
node server.js
```
*Backend runs at: `http://localhost:5001`*  
*Health Check: `http://localhost:5001/api/health`*

### Terminal 2: Frontend Client (Port 5173)
```bash
cd client
npm install        # (Only needed first time)
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 4. Default Demo Account

For testing and demonstration, a pre-seeded account is available immediately on startup:
- **Email**: `test@ecocoach.com`
- **Password**: `password123`
- **Pre-loaded with**: 4 days of activity logs, 185 Eco Points, Level 2 Sprout status, 3 badges, and active challenge progress.

You can also register any new account on the `/register` page.

---

## 5. How to Push Code to GitHub

The repository is linked to:
`https://github.com/VibeCode-Projects/GreenFootprintCoach.git` on branch `main`.

### Option A: Using the helper script
```bash
./manage.sh push "Describe the changes you made"
```

### Option B: Using standard Git commands
```bash
git add .
git commit -m "Describe the changes you made"
git push origin main
```

---

## 6. Project Architecture & Deliverables

- **Frontend Application**: `client/` (React 18, Vite 6, Tailwind CSS, Recharts)
- **Backend Application**: `server/` (Node.js, Express, Mongoose, Gemini NLP)
- **Academic Paper (LaTeX)**: [`main.tex`](file://main.tex)
- **Compiled Academic Report (PDF)**: [`main.pdf`](file://main.pdf) / [`Eco_Habit_Coach_Academic_Report.pdf`](file://Eco_Habit_Coach_Academic_Report.pdf)
- **Author**: Prince Jaiswal
- **Supervisor**: Dr. Ravindra Nath
