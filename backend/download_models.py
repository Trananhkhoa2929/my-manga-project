"""
Script tải trước tất cả AI models cần thiết cho MangaHub Backend.
Chạy script này trước khi khởi động server lần đầu.

Usage:
    cd backend
    python download_models.py
"""

import logging
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def download_manga_ocr():
    """Download Manga-OCR model from Hugging Face"""
    print("\n" + "=" * 50)
    print("📥 [1/2] Downloading Manga-OCR model...")
    print("=" * 50)
    
    try:
        from manga_ocr import MangaOcr
        
        print("⏳ Loading manga-ocr (this may take a few minutes)...")
        mocr = MangaOcr()
        
        print("✅ Manga-OCR model downloaded and ready!")
        return True
        
    except ImportError:
        print("❌ manga-ocr not installed!")
        print("   Run: pip install manga-ocr")
        return False
        
    except Exception as e:
        print(f"❌ Failed to download Manga-OCR: {e}")
        return False


def download_yolov8_bubble_detector():
    """Download YOLOv8 speech bubble detector from Hugging Face"""
    print("\n" + "=" * 50)
    print("📥 [2/2] Downloading YOLOv8 Bubble Detector...")
    print("=" * 50)
    
    try:
        from huggingface_hub import hf_hub_download
        from pathlib import Path
        
        print("⏳ Downloading from ogkalu/comic-speech-bubble-detector-yolov8m...")
        
        model_path = hf_hub_download(
            repo_id="ogkalu/comic-speech-bubble-detector-yolov8m",
            filename="comic-speech-bubble-detector.pt",
            cache_dir=Path(__file__).parent / "app" / "services" / "models"
        )
        
        print(f"✅ YOLOv8 model downloaded to: {model_path}")
        
        # Verify model loads correctly
        print("⏳ Verifying model...")
        from ultralytics import YOLO
        model = YOLO(model_path)
        print("✅ YOLOv8 model verified and ready!")
        
        return True
        
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("   Run: pip install huggingface_hub ultralytics")
        return False
        
    except Exception as e:
        print(f"❌ Failed to download YOLOv8: {e}")
        return False


def check_pytorch():
    """Check PyTorch installation and CUDA availability"""
    print("\n" + "=" * 50)
    print("🔍 Checking PyTorch installation...")
    print("=" * 50)
    
    try:
        import torch
        
        print(f"✅ PyTorch version: {torch.__version__}")
        
        if torch.cuda.is_available():
            print(f"✅ CUDA available: {torch.cuda.get_device_name(0)}")
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        else:
            print("⚠️  CUDA not available - running on CPU")
            print("   (GPU acceleration recommended for faster processing)")
        
        return True
        
    except ImportError:
        print("❌ PyTorch not installed!")
        print("   Run: pip install torch torchvision")
        return False


def main():
    print("\n" + "=" * 60)
    print("🎯 MangaHub AI Models Downloader")
    print("=" * 60)
    print("This script will download all required AI models.")
    print("Internet connection required.")
    print("=" * 60)
    
    results = {
        "pytorch": check_pytorch(),
        "manga_ocr": download_manga_ocr(),
        "yolov8": download_yolov8_bubble_detector()
    }
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 DOWNLOAD SUMMARY")
    print("=" * 60)
    
    all_success = True
    for name, success in results.items():
        status = "✅ Ready" if success else "❌ Failed"
        print(f"   {name}: {status}")
        if not success:
            all_success = False
    
    print("=" * 60)
    
    if all_success:
        print("🎉 All models downloaded successfully!")
        print("   You can now start the backend server:")
        print("   uvicorn app.main:app --reload --port 8000")
    else:
        print("⚠️  Some downloads failed. Check errors above.")
        print("   Fix issues and run this script again.")
        sys.exit(1)
    
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
