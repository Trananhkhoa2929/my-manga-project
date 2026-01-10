# MangaHub AI Backend

Python FastAPI backend for AI-powered manga localization services.

## Features

- 🔍 **OCR (Text Detection)** - PaddleOCR integration for Japanese, Korean, Chinese, English, Vietnamese
- 🧹 **Inpainting (Text Removal)** - OpenCV TELEA/Navier-Stokes + optional LaMa deep learning
- 🌐 **Translation** - Multi-language translation with MyMemory API

## Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
# Basic dependencies (no OCR)
pip install -r requirements.txt

# With PaddleOCR (recommended)
pip install paddlepaddle paddleocr
```

### 3. Run Server

```bash
# Development mode
uvicorn app.main:app --reload --port 8000

# Or
python -m app.main
```

### 4. Access API

- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### OCR
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/detect` | Detect text from image |
| GET | `/api/ocr/languages` | Get supported languages |

### Inpainting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inpaint/clean` | Remove text from specified regions |
| POST | `/api/inpaint/clean-auto` | Auto-detect and remove text |
| GET | `/api/inpaint/methods` | Get available methods |

### Translation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translate/batch` | Translate multiple texts |
| POST | `/api/translate/single` | Translate single text |
| GET | `/api/translate/languages` | Get supported languages |

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   └── routers/
│       ├── __init__.py
│       ├── ocr.py           # PaddleOCR integration
│       ├── inpainting.py    # OpenCV/LaMa inpainting
│       └── translation.py   # Translation service
├── requirements.txt
├── Dockerfile
└── README.md
```

## Docker

```bash
# Build
docker build -t mangahub-backend .

# Run
docker run -p 8000:8000 mangahub-backend
```

## Frontend Integration

Update the frontend `.env.local`:

```env
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000
```

## License

MIT
