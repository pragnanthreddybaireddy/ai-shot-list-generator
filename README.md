# 🎬 AI Shot List Generator

A full-stack web application that uses AI to generate professional shot lists from scene descriptions. Built for filmmakers, directors, and cinematographers.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![AI](https://img.shields.io/badge/AI-Claude%20%7C%20GPT--4o-purple) ![DB](https://img.shields.io/badge/Database-SQLite-orange)

---

## ✨ Features

- **AI Generation** — Claude (Anthropic) or GPT-4o generates professional shot lists
- **Rich Input Form** — Scene description, production requirements, camera angles, lens, coverage
- **Detailed Output** — Shot list table, director notes, production notes, lighting concept, equipment
- **Export Options** — Copy JSON, Download TXT, Download PDF
- **History System** — Every generation saved with pagination and detail view
- **Feedback & Ratings** — Rate outputs 1–5 stars with comments
- **Analytics Dashboard** — Charts for generations, ratings, quality trends
- **Templates** — Pre-built scene templates to get started fast
- **Dark / Light Mode** — Cinematic dark theme by default
- **Responsive** — Mobile-friendly throughout

---

## 🏗️ Project Structure

```
ai-shot-list/
├── backend/
│   ├── config/
│   │   └── database.js        # SQLite init + schema
│   ├── controllers/
│   │   ├── generationController.js
│   │   ├── feedbackController.js
│   │   └── templateController.js
│   ├── routes/
│   │   └── api.js             # All API routes
│   ├── utils/
│   │   ├── aiService.js       # Anthropic + OpenAI integration
│   │   └── logger.js          # Winston logger
│   ├── server.js              # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── InputForm.jsx
│   │   │   ├── OutputDisplay.jsx
│   │   │   └── ClapperLoader.jsx
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── GeneratePage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── HistoryDetailPage.jsx
│   │   │   └── AnalyticsPage.jsx
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── export.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json               # Root monorepo scripts
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd ai-shot-list
npm run install:all
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# Choose one AI provider:
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OR
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

DATABASE_PATH=./data/shotlist.db
FRONTEND_URL=http://localhost:3000
```

### 3. Run Development Servers

From the root directory:

```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend (port 5000)
npm run dev:backend

# Terminal 2 - Frontend (port 3000)  
npm run dev:frontend
```

Open `http://localhost:3000`

---

## 🔌 API Reference

### `POST /api/generate`
Generate a shot list from scene inputs.

**Request:**
```json
{
  "scene_description": "Two detectives interrogate a suspect...",
  "production_requirements": "Practical lighting, 2-camera setup",
  "camera_angles": "Low angle for power dynamics",
  "lens_suggestions": "50mm and 85mm",
  "coverage_notes": "Full coverage, prioritize reactions"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid",
  "model": "claude-sonnet-4-20250514",
  "data": {
    "scene_summary": "...",
    "shots": [...],
    "director_notes": "...",
    "production_notes": "...",
    "lighting_concept": "...",
    "equipment_list": [...]
  }
}
```

### `GET /api/history?page=1&limit=10`
List past generations.

### `GET /api/history/:id`
Get a specific generation with full AI response.

### `DELETE /api/history/:id`
Delete a generation.

### `POST /api/feedback`
Submit a rating for a generation.
```json
{ "generation_id": "uuid", "rating": 4, "comment": "Great shots!" }
```

### `GET /api/analytics`
Get usage analytics and quality metrics.

### `GET /api/templates`
Get pre-built scene templates.

### `GET /api/health`
Health check endpoint.

---

## 🗄️ Database Schema

```sql
-- Stores every AI generation
CREATE TABLE generations (
  id TEXT PRIMARY KEY,
  scene_description TEXT NOT NULL,
  production_requirements TEXT,
  camera_angles TEXT,
  lens_suggestions TEXT,
  coverage_notes TEXT,
  ai_response TEXT NOT NULL,    -- Full JSON from AI
  model_used TEXT,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User ratings and comments
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generation_id) REFERENCES generations(id)
);

-- Scene templates
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  scene_description TEXT,
  production_requirements TEXT,
  camera_angles TEXT,
  lens_suggestions TEXT,
  coverage_notes TEXT,
  is_public INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Set `REACT_APP_API_URL` to your backend URL
4. Deploy

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** at [render.com](https://render.com)
3. Set environment variables:
   - `AI_PROVIDER`, `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)
   - `FRONTEND_URL` = your Vercel URL
   - `NODE_ENV=production`
4. Build command: `npm install`
5. Start command: `node server.js`
6. For SQLite persistence, use a **Render Disk** mounted at `/data`
   - Set `DATABASE_PATH=/data/shotlist.db`

### Alternative: PostgreSQL for Production

Replace `better-sqlite3` with `pg` and update `database.js`:

```bash
npm install pg
```

Set `DATABASE_URL=postgresql://user:pass@host/dbname`

---

## 🔒 Security Features

- **Rate limiting** — 100 req/15min globally, 10 generations/min
- **Input validation** — express-validator on all inputs  
- **CORS protection** — Whitelist frontend URL only
- **Payload limit** — 10KB max request size
- **Error handling** — No stack traces exposed in production

---

## 🤖 AI Integration

Supports two providers — configure via `AI_PROVIDER` env var:

| Provider | Model | Env Var |
|---|---|---|
| Anthropic (default) | claude-sonnet-4-20250514 | `ANTHROPIC_API_KEY` |
| OpenAI | gpt-4o | `OPENAI_API_KEY` |

---

## 📄 License

MIT
