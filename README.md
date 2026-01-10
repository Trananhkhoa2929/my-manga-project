# MangaHub - Community Manga Localization Platform

<div align="center">

![MangaHub](https://img.shields.io/badge/MangaHub-Community%20Platform-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

**A professional web-based manga translation and localization platform**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Documentation](#documentation)

</div>

---

## 🎯 Overview

MangaHub is a community-driven platform that streamlines the manga localization workflow:

1. **Upload** raw manga pages
2. **AI Processing** - OCR text detection + automatic bubble cleaning
3. **Professional Editor** - Konva-based canvas with typesetting tools
4. **Collaboration** - Teams, roles, and credit attribution
5. **Publish** - Share with the community

---

## ✨ Features

### 📝 Professional Web Editor
- **React-Konva** canvas with 4-layer system
- **Vertical text** support (縦書き) for Japanese typography
- **Brush/Pen tool** for manual cleaning
- **Shape tools** (Rectangle, Ellipse) for covering text
- **Transformer** for drag, resize, and rotate
- **Keyboard shortcuts** (V, T, B, E, R, O)

### 🤖 AI-Powered Translation
- **PaddleOCR** integration for text detection
- **Multi-language** support (JP, KR, CN, EN, VI)
- **Auto-translation** with fallback APIs
- **LaMa inpainting** for text removal

### 👥 Community Features
- **Scanlation Teams** - Form groups and collaborate
- **Project Workflow** - Draft → In Progress → Published
- **Credit System** - Automatic attribution page generation
- **User Roles** - Reader, Translator, Editor, Admin

---

## 🚀 Demo

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Manga reading platform |
| Editor | `/editor` | Professional canvas editor |
| Projects | `/projects` | Translation project dashboard |
| Teams | `/teams` | Scanlation team management |
| Translator | `/dich-truyen` | AI translation tool |

---

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd my-manga-project

# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```env
# Optional: AI Backend URL
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000

# Optional: Supabase (for production)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19 + Tailwind CSS 4 |
| **Canvas** | React-Konva |
| **State** | Zustand |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **AI Backend** | Python FastAPI |

---

## 📁 Project Structure

```
my-manga-project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Main layout routes
│   │   │   ├── editor/        # Canvas editor page
│   │   │   ├── projects/      # Projects dashboard
│   │   │   ├── teams/         # Teams management
│   │   │   ├── dich-truyen/   # Translator tool
│   │   │   └── truyen/        # Manga reading
│   │   ├── (reader)/          # Reader layout routes
│   │   └── api/               # API routes
│   │       ├── editor/        # Editor APIs
│   │       │   ├── pages/     # Page CRUD
│   │       │   ├── projects/  # Project CRUD
│   │       │   ├── chapters/  # Chapter CRUD
│   │       │   ├── groups/    # Teams API
│   │       │   └── credits/   # Attribution API
│   │       └── translator/    # Translation APIs
│   │
│   ├── components/
│   │   ├── features/          # Feature components
│   │   │   ├── editor/        # MangaEditor, CreditGenerator
│   │   │   ├── translator/    # TranslatorTool, Preview
│   │   │   ├── comic/         # Comic cards, lists
│   │   │   ├── reader/        # Reader components
│   │   │   └── comment/       # Comment system
│   │   ├── layout/            # Header, Footer, etc.
│   │   ├── ui/                # Reusable UI components
│   │   └── skeletons/         # Loading skeletons
│   │
│   ├── lib/
│   │   ├── api/               # API clients
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript interfaces
│   │   ├── constants/         # App constants
│   │   ├── services/          # Business logic
│   │   └── utils.ts           # Utility functions
│   │
│   ├── hooks/                 # Custom React hooks
│   └── styles/                # Global styles
│
├── supabase/
│   └── schema.sql             # Database schema
│
├── docs/
│   └── backend-ai-integration.md  # AI backend docs
│
└── public/                    # Static assets
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Database Schema](./supabase/schema.sql) | PostgreSQL tables (users, groups, projects, pages) |
| [AI Backend Guide](./docs/backend-ai-integration.md) | Python FastAPI with PaddleOCR & LaMa |

---

## 🎨 Key Components

### MangaEditor
```tsx
import { MangaEditor } from '@/components/features/editor'

<MangaEditor
  imageUrl="/path/to/manga-page.jpg"
  initialCanvasData={savedData}
  onSave={(data) => saveToDatabase(data)}
  width={1200}
  height={800}
/>
```

### TranslatorTool
```tsx
import { TranslatorTool } from '@/components/features/translator'

<TranslatorTool />
```

---

## 🗄️ Database Schema

```
users ──────┬──> groups ──> group_members
            │
            └──> series ──> projects ──> chapters ──> pages
                                             │
                                             └──> credits
```

**Key Tables:**
- `pages.canvas_data` - JSONB storing editor state
- `credits` - Chapter attribution tracking
- `group_members` - Team roles (owner, translator, editor)

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/editor/pages/:id` | GET/PUT | Page CRUD |
| `/api/editor/pages/:id/canvas` | GET/PUT | Canvas data |
| `/api/editor/projects` | GET/POST | Projects |
| `/api/editor/chapters` | GET/POST | Chapters |
| `/api/editor/groups` | GET/POST | Teams |
| `/api/editor/credits` | GET/POST | Credits |
| `/api/translator/ocr` | POST | OCR detection |
| `/api/translator/translate` | POST | Translation |

---

## 📜 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
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

</div>
