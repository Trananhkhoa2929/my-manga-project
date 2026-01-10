"""
MangaHub Backend - Python FastAPI
AI-powered manga localization services
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting MangaHub AI Backend...")
    logger.info("📦 Loading OCR models...")
    # Models will be loaded lazily on first request
    yield
    # Shutdown
    logger.info("👋 Shutting down MangaHub AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="MangaHub AI Backend",
    description="AI-powered OCR, translation, and inpainting services for manga localization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "http://127.0.0.1:3000",
        "https://mangahub.com",   # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routers import ocr, inpainting, translation

app.include_router(ocr.router)
app.include_router(inpainting.router)
app.include_router(translation.router)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "MangaHub AI Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
