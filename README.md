# AI-Powered Eco-Habit & Green Footprint Coach 🌿

[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20+%20Vite%20+%20Gemini%20AI-166534?style=for-the-badge)](https://github.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-10B981?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![Project](https://img.shields.io/badge/Academic-BCA%20Final%20Year%20Project-0F172A?style=for-the-badge)](https://github.com)

A modern, production-grade, full-stack web application designed to help individuals measure, understand, and reduce their daily greenhouse gas emissions through conversational AI, scientific carbon accounting, and gamified habit building.

Built as a **BCA Final-Year Academic Capstone Project**.

---

## 🌟 Key Application Features

### 1. 🤖 AI-Powered Conversational Activity Logger
- Large natural-language input field where users can describe their day in plain English:  
  *e.g. "Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km."*
- Backend interfaces with **Google Gemini AI** to extract individual activities, categorize them, compute their emissions using documented conversion factors, and return structured JSON.
- **Scientifically Documented Factors**: Incorporates standard factors from **DEFRA (UK)**, **EPA (US)**, and **IPCC**.
- **Transparent Assumptions**: Clearly labels calculation assumptions (e.g. *Petrol car at 0.170 kg CO2e/km*), asks follow-up questions when critical variables are missing, and never treats unknown values as zero.
- **Fail-Safe Offline Mode**: Includes a deterministic NLP fallback engine so the application remains 100% testable and runnable even before an API key is entered.

### 2. 📊 Interactive Carbon Footprint Calculator
- Granular multi-category calculation across:
  - 🚗 **Transportation**: Petrol, Diesel, Hybrid, Electric cars, Public Bus, Metro/Train, Motorcycle, Bicycle, Walking (including passenger carpool division).
  - ⚡ **Electricity & Appliances**: AC (1.5kW), Space Heaters, Desktop PCs, Laptops, LED TVs, Water Heaters, and direct kWh inputs.
  - 🥗 **Food & Diet**: Beef/Red meat, Poultry/Chicken, Fish/Seafood, Vegetarian, Vegan, Fast Food.
  - 🛍️ **Shopping & Goods**: Cotton T-shirts, Denim Jeans, Footwear, Single-use plastic bottles, E-commerce packaging.
  - 💧 **Water Usage**: Warm showers (minutes-based), Full bath tubs, Municipal tap water.
  - ♻️ **Waste Management**: Landfill municipal waste, Recycled waste, Composted organics.
- Real-time calculation tray to stage and save items directly to MongoDB.

### 3. 📈 Deep Analytics & Recharts Visualizations
- **Daily Trend Area Chart**: Visualizes day-to-day carbon emissions in kg against the international **5.0 kg climate neutrality benchmark**.
- **Weekly Carbon Bar Chart**: Tracks 4-week comparative carbon intensity and weekly averages.
- **Category Donut / Pie Chart**: Displays percentage distribution across transport, energy, food, shopping, water, and waste.
- **Multi-Range Filtering**: Switch seamlessly between **7 Days**, **30 Days**, and **90 Days**.
- **Historical Activity Telemetry**: Searchable, filterable table with pagination and individual record deletion.

### 4. 💡 AI Green Recommendations Engine
- Evaluates user's historical telemetry in MongoDB over the past 30 days to diagnose major carbon sources.
- Generates high-impact, achievable recommendations with estimated CO2e savings (kg), priority, difficulty, and actionable checklists.
- Interactive status management (**Pending**, **In Progress**, **Completed**), awarding **+25 Eco Points** when adopted.

### 5. 🏆 Gamification, Eco Points & Community Leaderboard
- **Eco Points & User Levels**: Advance across 5 levels from **Seedling (Lvl 1)** to **Earth Champion (Lvl 5)**.
- **Daily Logging Streaks**: Consecutive activity logging tracking with flame counter.
- **Achievement Badges**: Milestone badges (e.g. *Green Pioneer*, *First Green Footprint*, *Consistency Scout*, *Climate Neutral Day*) with unlock timestamps.
- **Eco Challenges**: Active weekly habits (e.g. *Zero Plastic Week*, *Active Commuter*, *AC at 24°C*, *Meatless Lunch Week*) with daily progress tracking.
- **Community Leaderboard**: Transparent ranking with current user highlighted and demo peers clearly identified.

### 6. 🔒 Authentication & Data Security
- User registration and login protected with **BCrypt (10 salt rounds)** and **JSON Web Tokens (JWT)**.
- Protected client-side routes via React Router DOM.
- Persistent login sessions with automatic token verification and 401 session expiry handling.
- Strict multi-tenant data isolation per user in MongoDB.
- HTTP security headers powered by **Helmet** and rate limiting powered by **express-rate-limit**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Recharts, Lucide React, React Router DOM |
| **Backend** | Node.js (v18+ / v20+ / v24+), Express.js 4, RESTful Architecture |
| **Database** | MongoDB, Mongoose 8 (Object Data Modeling) |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`) |
| **Auth & Security** | JWT (jsonwebtoken), BCrypt.js, Helmet, Express-Rate-Limit, CORS |
| **Emission Standards** | DEFRA Conversion Factors, EPA GHG Calculator, IPCC Guidelines |

---

## 📁 Project Architecture & Folder Structure

```
Green_Footprint_Coach/
├── client/                               # Frontend Single Page Application (Vite + React)
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── assets/                       # Images and static media
│   │   ├── components/
│   │   │   ├── common/                   # Reusable UI components
│   │   │   │   ├── Badge.jsx             # Category & status pills
│   │   │   │   ├── EmptyState.jsx        # Illustrated empty states
│   │   │   │   ├── LoadingSkeleton.jsx   # Card & chart skeletons
│   │   │   │   ├── Modal.jsx             # Accessible backdrop modal
│   │   │   │   ├── Navbar.jsx            # Top sticky navigation bar
│   │   │   │   ├── Sidebar.jsx           # Collapsible SaaS sidebar
│   │   │   │   └── StatCard.jsx          # Statistics metric cards
│   │   │   ├── dashboard/                # Main dashboard widgets
│   │   │   │   ├── CategoryBreakdownChart.jsx # Recharts pie/donut chart
│   │   │   │   ├── EmissionTrendChart.jsx     # Recharts area trend chart
│   │   │   │   ├── ImpactSummary.jsx          # Real-world equivalents (trees/kms)
│   │   │   │   ├── QuickLogger.jsx            # Conversational quick logger
│   │   │   │   └── RecentActivities.jsx       # Activity feed widget
│   │   │   ├── activities/               # Activity logging components
│   │   │   │   ├── ActivityDetailModal.jsx    # JSON extraction breakdown
│   │   │   │   ├── ActivityHistoryTable.jsx   # Searchable paginated logs
│   │   │   │   └── NaturalLanguageLogger.jsx  # Conversational input & Gemini view
│   │   │   ├── calculator/               # Multi-category calculator
│   │   │   │   └── CarbonCalculator.jsx       # Interactive calculator & tray
│   │   │   └── challenges/               # Gamification components
│   │   │       ├── ChallengeCard.jsx          # Eco habit progress card
│   │   │       └── Leaderboard.jsx            # Community points ranking
│   │   ├── context/                      # React context providers
│   │   │   ├── AuthContext.jsx           # Authentication & user state
│   │   │   └── NotificationContext.jsx   # Toast notifications
│   │   ├── layouts/                      # App layout wrappers
│   │   │   ├── AuthLayout.jsx            # Centered authentication layout
│   │   │   └── DashboardLayout.jsx       # Sidebar + Navbar app layout
│   │   ├── pages/                        # Main route pages
│   │   │   ├── ActivitiesPage.jsx        # Dedicated NLP logger & history
│   │   │   ├── AnalyticsPage.jsx         # Deep-dive Recharts analytics
│   │   │   ├── CalculatorPage.jsx        # Multi-category calculator
│   │   │   ├── ChallengesPage.jsx        # Challenges & leaderboard
│   │   │   ├── DashboardPage.jsx         # Overview dashboard
│   │   │   ├── ForgotPasswordPage.jsx    # Password recovery
│   │   │   ├── LandingPage.jsx           # Public marketing landing page
│   │   │   ├── LoginPage.jsx             # User authentication
│   │   │   ├── NotFoundPage.jsx          # 404 handler
│   │   │   ├── ProfilePage.jsx           # Profile & achievements
│   │   │   ├── RecommendationsPage.jsx   # AI green habits & recommendations
│   │   │   └── RegisterPage.jsx          # Account registration
│   │   ├── services/                     # API client abstraction layer
│   │   │   ├── activityService.js        # Activity endpoints
│   │   │   ├── analyticsService.js       # Telemetry endpoints
│   │   │   ├── api.js                    # Fetch wrapper with JWT interceptor
│   │   │   ├── authService.js            # Auth endpoints
│   │   │   ├── challengeService.js       # Challenges & leaderboard
│   │   │   ├── recommendationService.js  # Recommendations endpoints
│   │   │   └── userService.js            # Profile & badges endpoints
│   │   ├── utils/                        # Utilities & constants
│   │   │   ├── constants.js              # Categories, prompts, levels
│   │   │   └── formatters.js             # Date, carbon, points formatters
│   │   ├── App.jsx                       # Routing & Protected routes
│   │   ├── index.css                     # Tailwind & custom scrollbars
│   │   └── main.jsx                      # Vite entry point
│   ├── index.html                        # HTML template
│   ├── package.json                      # Frontend dependencies
│   ├── postcss.config.js                 # PostCSS config
│   ├── tailwind.config.js                # Tailwind color palette & font
│   └── vite.config.js                    # Vite server & API proxy
│
├── server/                               # Backend REST API (Node.js + Express)
│   ├── config/
│   │   ├── constants.js                  # DEFRA/EPA/IPCC factors & levels
│   │   └── db.js                         # Mongoose connector with in-memory fallback
│   ├── controllers/
│   │   ├── activityController.js         # NL analysis & manual logging
│   │   ├── analyticsController.js        # Summary, daily, weekly, category
│   │   ├── authController.js             # Register, login, me, forgot
│   │   ├── challengeController.js        # Challenges & leaderboard
│   │   ├── recommendationController.js   # AI advice generation & status
│   │   └── userController.js             # Profile & badge unlocking
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT verification
│   │   ├── errorMiddleware.js            # Centralized error handler
│   │   └── rateLimiter.js                # Express rate limiting
│   ├── models/
│   │   ├── Achievement.js                # Badges earned
│   │   ├── Activity.js                   # Raw prompts & discrete activities
│   │   ├── CarbonRecord.js               # Normalized daily aggregates
│   │   ├── Challenge.js                  # Available challenges catalog
│   │   ├── Recommendation.js             # AI recommendations & status
│   │   ├── User.js                       # Account, level, points, streak
│   │   └── UserChallenge.js              # User challenge progress
│   ├── routes/
│   │   ├── activityRoutes.js             # /api/activities
│   │   ├── analyticsRoutes.js            # /api/analytics
│   │   ├── authRoutes.js                 # /api/auth
│   │   ├── challengeRoutes.js            # /api/challenges
│   │   ├── recommendationRoutes.js       # /api/recommendations
│   │   └── userRoutes.js                 # /api/users
│   ├── services/
│   │   ├── carbonCalculationService.js   # Scientific calculation engine
│   │   ├── gamificationService.js        # Streaks, points, badges
│   │   └── geminiService.js              # Google Gemini AI integration
│   ├── utils/
│   │   ├── dateUtils.js                  # Timezone-safe date normalizer
│   │   └── seedData.js                   # Auto-seed initial challenges
│   ├── .env.example                      # Server environment template
│   ├── package.json                      # Server dependencies
│   └── server.js                         # Express application entry
│
├── .env.example                          # Root environment template
├── .gitignore                            # Version control exclusion rules
├── package.json                          # Root runner scripts
└── README.md                             # Comprehensive project documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: version `v18.0.0` or higher (`node -v`)
- **npm**: version `9.0.0` or higher (`npm -v`)
- *(Optional)* **MongoDB**: Local MongoDB or free MongoDB Atlas account (the app includes an automatic in-memory MongoDB engine for zero-setup execution if external MongoDB is not installed).

---

## 🚀 Quick Start Guide

### Step 1: Clone or Navigate to Project

```bash
cd /home/satya/projects/Green_Footprint_Coach
```

### Step 2: Install Dependencies

You can install all dependencies for both `server` and `client` with a single command:

```bash
npm run install:all
```

*(Or individually:)*
```bash
cd server && npm install
cd ../client && npm install
```

---

## 🔑 Environment Configuration

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure the following variables:

```env
# Server Network Port
PORT=5001
NODE_ENV=development

# JWT Authentication
JWT_SECRET=eco_habit_coach_super_secure_jwt_token_secret_key_2026
JWT_EXPIRES_IN=30d

# MongoDB Database Connection
# Option A: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eco_coach?retryWrites=true&w=majority
#
# Option B: Local MongoDB Daemon
# MONGODB_URI=mongodb://127.0.0.1:27017/eco_coach
#
# Option C: Embedded In-Memory MongoDB (Leave empty!)
MONGODB_URI=

# Google Gemini AI Integration
# Obtain a free API key at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Frontend Allowed Origins (CORS)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

---

## 🗄️ MongoDB Connection Instructions

The project provides three database connectivity options:

### Option A: MongoDB Atlas (Recommended for Persistent Production Data)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Click **Create Cluster** and select the free **M0 Sandbox** tier.
3. Under **Security → Database Access**, create a database user (e.g. `ecouser` with a secure password).
4. Under **Security → Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect → Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://ecouser:<password>@cluster0.mongodb.net/eco_coach?retryWrites=true&w=majority
   ```
6. Paste this URI as `MONGODB_URI` in `server/.env`.

### Option B: Local MongoDB Daemon
If you have MongoDB installed locally:
```bash
sudo systemctl start mongod
```
Set in `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/eco_coach
```

### Option C: Zero-Config Embedded In-Memory Mode (Instant Evaluation without Docker)
- If `MONGODB_URI` is left blank, the server detects that no local daemon is running and automatically initializes an embedded in-memory MongoDB instance powered by `mongodb-memory-server`.
- This enables **100% full Mongoose ODM functionality** (indexes, sub-documents, validations, relationships) right out of the box with zero external configuration!

---

## 🤖 Google Gemini AI Setup Instructions

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the left sidebar.
4. Click **"Create API key"** (select or create a Google Cloud project).
5. Copy your generated key and paste it into `server/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```
6. The application uses the high-speed, cost-effective `gemini-1.5-flash` model with schema-enforced structured JSON output.
7. *Note*: If the key is left empty or invalid, the backend automatically engages its deterministic NLP rule engine so you can still test all application features without crashing.

---

## 🖥️ Running the Application

Open two terminal tabs:

### Terminal 1: Run Backend API Server
```bash
cd server
npm run dev
```
*(Backend runs on `http://localhost:5001` with API health endpoint at `http://localhost:5001/api/health`)*

### Terminal 2: Run Frontend Client
```bash
cd client
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 🧪 Testing and Verification

### 1. Ready-Made Academic Demo Credentials
You can log in immediately using the pre-configured academic demo credentials or register a new user:
- **Email**: `test@ecocoach.com`
- **Password**: `password123`
*(A convenient "Auto-Fill" button is provided on the Login page).*

### 2. Testing the Conversational AI Logger
Navigate to **AI Activity Logger** (`/activities`) and enter:
```
Today I travelled 15 km by car, used AC for 5 hours, ate chicken for lunch, and used public transport for 10 km.
```
- Click **"Analyze with Gemini AI"**.
- View the structured breakdown:
  - Transport: Car (Petrol 15 km) -> `2.55 kg`
  - Transport: Public Bus (10 km) -> `0.89 kg`
  - Energy: AC (5 hrs) -> `2.50 kg`
  - Food: Chicken meal (1 serving) -> `1.30 kg`
  - **Total**: `7.24 kg CO2e` | **Eco Score**: `68/100`
  - Points Earned: `+15 Eco Points`
  - Badges Unlocked: `First Green Footprint` (+25 pts)

### 3. API Endpoints Table

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Server uptime and Gemini configuration status | No |
| `POST` | `/api/auth/register` | Register new user (+50 welcome points) | No |
| `POST` | `/api/auth/login` | Login user and issue JWT token | No |
| `POST` | `/api/auth/forgot-password`| Request password reset | No |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Yes |
| `POST` | `/api/activities/analyze` | Natural-language AI activity parsing | Yes |
| `POST` | `/api/activities/manual` | Save structured multi-category calculation | Yes |
| `GET` | `/api/activities` | Paginated activity history with filters | Yes |
| `GET` | `/api/activities/:id` | Fetch single activity details | Yes |
| `DELETE`| `/api/activities/:id` | Delete activity and sync daily records | Yes |
| `GET` | `/api/analytics/summary` | Top stats cards (total, today, weekly, points)| Yes |
| `GET` | `/api/analytics/daily` | Daily emissions trend line (7d, 30d, 90d) | Yes |
| `GET` | `/api/analytics/weekly` | 4-week comparative bar chart data | Yes |
| `GET` | `/api/analytics/categories`| Category share breakdown for pie chart | Yes |
| `GET` | `/api/recommendations` | List personalized recommendations | Yes |
| `POST` | `/api/recommendations/generate`| Trigger Gemini historical advice analysis | Yes |
| `PATCH`| `/api/recommendations/:id`| Update recommendation status (earn +25 pts) | Yes |
| `GET` | `/api/challenges` | List active challenges with user progress | Yes |
| `POST` | `/api/challenges/join` | Join an eco habit challenge | Yes |
| `PATCH`| `/api/challenges/:id/progress`| Log daily check-in / complete challenge | Yes |
| `GET` | `/api/challenges/leaderboard` | Community leaderboard with user rank | Yes |
| `GET` | `/api/users/profile` | Full profile with stats and achievements | Yes |
| `PATCH`| `/api/users/profile` | Update profile information | Yes |
| `GET` | `/api/users/achievements` | Complete badges catalogue (unlocked vs locked)| Yes |

---

## 🚢 Deployment Instructions

### 1. Deploying the Backend (Render / Railway / VPS)
1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables in dashboard:
   - `PORT`: `5001` (or let provider assign `$PORT`)
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string*
   - `GEMINI_API_KEY`: *Your Google AI Studio API key*
   - `ALLOWED_ORIGINS`: *Your deployed frontend URL*

### 2. Deploying the Frontend (Vercel / Netlify)
1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In `client/vite.config.js`, configure the production API base URL or set proxy redirects via `vercel.json` / `_redirects`:
   ```
   /api/*  https://your-backend-api.onrender.com/api/:splat  200
   /*      /index.html                                       200
   ```

---

## 🎓 Academic Viva & Presentation Notes

When presenting this project for your BCA Final Year Viva:
1. **Highlight the AI Innovation**: Explain that instead of asking users to look up electricity bills or weigh fuel, Google Gemini interprets natural language prompts and maps them directly to DEFRA/IPCC coefficients.
2. **Database Normalization & Performance**: Emphasize how individual logs are stored in `Activity` while daily aggregates are pre-computed in `CarbonRecord` with compound indexing (`userId + dateString`), making multi-month Recharts queries instantaneous.
3. **Behavioral Psychology / Gamification**: Discuss how streaks, 5 user levels, badges, and challenge check-ins encourage sustained long-term habit formation rather than one-time calculations.
4. **Data Isolation**: Note that all Mongoose queries strictly enforce `userId: req.user.id`, ensuring private user information is secure.

---

## 📜 License & Acknowledgments
- Released under the **ISC License**.
- Conversion factors based on public data from **DEFRA (UK)**, **US EPA**, and **IPCC AR6 Reports**.
- Built with ❤️ for planet sustainability.
