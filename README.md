<div align="center">

# 🎌 MangaHub

### Community-Driven Manga Localization Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)

**A professional web-based platform for community manga translation and localization**

[Features](#-features) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [API Reference](#-api-reference)

</div>

---

## 📖 Overview

MangaHub is an all-in-one platform for manga scanlation teams:

1. **📤 Upload** - Raw manga pages
2. **🔍 AI OCR** - Automatic text detection with PaddleOCR  
3. **🧹 Clean** - AI-powered text removal with OpenCV/LaMa
4. **✏️ Edit** - Professional canvas editor with React-Konva
5. **🌐 Translate** - Multi-language translation support
6. **👥 Collaborate** - Team management and attribution
7. **📚 Publish** - Share with the community

---

## ✨ Features

### 🎨 Professional Editor
- **React-Konva** canvas with multi-layer system
- **Vertical text** support (縦書き) for Japanese
- **Brush/Pen tool** for manual cleaning
- **Shape tools** (Rectangle, Ellipse) for covering text
- **Transformer** for drag, resize, rotate
- **Keyboard shortcuts** (V, T, B, E, R, O)
- **Undo/Redo** history

### 🤖 AI-Powered Tools
- **PaddleOCR** - Japanese, Korean, Chinese, English, Vietnamese
- **OpenCV Inpainting** - TELEA, Navier-Stokes algorithms
- **LaMa** - Deep learning inpainting (optional)
- **Auto-translation** with MyMemory API

### 👥 Community Features
- **Scanlation Teams** - Create and manage groups
- **Project Workflow** - Draft → In Progress → Published
- **Attribution System** - Auto-generated credit pages
- **User Roles** - Reader, Translator, Editor, Admin

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Git**

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd my-manga-project
```

### 2️⃣ Setup Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend: http://localhost:3000

### 3️⃣ Setup Backend (Optional - for AI features)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Optional: Install PaddleOCR
pip install paddlepaddle paddleocr

# Run server
uvicorn app.main:app --reload --port 8000
```

Backend API: http://localhost:8000/docs

---

## 📁 Project Structure

```
my-manga-project/
│
├── 📂 backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   └── routers/
│   │       ├── ocr.py         # PaddleOCR integration
│   │       ├── inpainting.py  # OpenCV/LaMa
│   │       └── translation.py # Translation API
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── 📂 src/                     # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── (main)/           # Main layout
│   │   │   ├── page.tsx      # Homepage
│   │   │   ├── editor/       # Canvas editor
│   │   │   ├── projects/     # Project dashboard
│   │   │   ├── teams/        # Team management
│   │   │   └── dich-truyen/  # Translator tool
│   │   └── api/              # API routes
│   │       ├── editor/       # Editor APIs
│   │       └── translator/   # Translation APIs
│   │
│   ├── components/
│   │   ├── features/         # Feature components
│   │   │   ├── editor/       # MangaEditor, CreditGenerator
│   │   │   ├── translator/   # TranslatorTool
│   │   │   └── comic/        # Comic cards, lists
│   │   ├── layout/           # Header, Footer, Sidebar
│   │   └── ui/               # Reusable UI components
│   │
│   └── lib/
│       ├── api/              # API clients
│       ├── stores/           # Zustand stores
│       ├── types/            # TypeScript interfaces
│       └── utils.ts          # Utilities
│
├── 📂 supabase/               # Database
│   └── schema.sql            # PostgreSQL schema
│
├── 📂 docs/                   # Documentation
│   └── backend-ai-integration.md
│
└── 📂 public/                 # Static assets
```

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured manga |
| `/editor` | Professional canvas editor |
| `/projects` | Translation projects dashboard |
| `/teams` | Scanlation team management |
| `/dich-truyen` | AI OCR + Translation tool |
| `/truyen/:slug` | Manga detail page |
| `/bang-xep-hang` | Rankings |

---

## 🔌 API Reference

### Frontend API Routes (Next.js)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/editor/pages/:id` | GET/PUT | Page CRUD |
| `/api/editor/pages/:id/canvas` | GET/PUT | Save canvas data |
| `/api/editor/projects` | GET/POST | Projects |
| `/api/editor/chapters` | GET/POST | Chapters |
| `/api/editor/groups` | GET/POST | Teams |
| `/api/editor/credits` | GET/POST | Credits |

### Backend API (Python FastAPI)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ocr/detect` | POST | OCR text detection |
| `/api/inpaint/clean` | POST | Text removal |
| `/api/inpaint/clean-auto` | POST | Auto-detect & remove |
| `/api/translate/batch` | POST | Batch translation |

📚 **Full API Docs**: http://localhost:8000/docs

---

## 🗄️ Database Schema

```
users ────┬───→ groups ───→ group_members
          │
          └───→ series ───→ projects ───→ chapters ───→ pages
                                              │
                                              └───→ credits
```

**Key Table**: `pages.canvas_data` stores editor state as JSONB

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Canvas** | React-Konva |
| **State** | Zustand |
| **Backend** | Python FastAPI |
| **OCR** | PaddleOCR |
| **Inpainting** | OpenCV, LaMa |
| **Database** | Supabase (PostgreSQL) |

---

## 📜 Scripts

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check

# Backend
uvicorn app.main:app --reload    # Dev server
uvicorn app.main:app             # Production
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

<div align="center">

**Built with ❤️ for the manga community**

[Report Bug](issues) • [Request Feature](issues)

</div>
