# 📥 Hướng Dẫn Tải Models AI

Tài liệu này hướng dẫn các thành viên tải các model AI cần thiết để chạy MangaHub Backend.

---

## 📋 Danh Sách Models Cần Thiết

| Model | Mục đích | Kích thước | Nguồn |
|-------|----------|------------|-------|
| **manga-ocr** | OCR tiếng Nhật cho manga | ~400MB | Hugging Face (auto-download) |
| **YOLOv8 Bubble Detector** | Phát hiện bong bóng hội thoại | ~50MB | Hugging Face (auto-download) |
| **PyTorch** | Deep Learning framework | ~2GB | pip install |

---

## 🚀 Cài Đặt Nhanh (Tự Động)

Các model sẽ được **tự động tải** khi chạy backend lần đầu tiên:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> ⚠️ **Lưu ý**: Lần chạy đầu tiên có thể mất 5-10 phút để tải model.

---

## 📦 Tải Thủ Công (Khuyến Nghị)

### 1️⃣ Manga-OCR Model

Model `manga-ocr` sử dụng Transformers và sẽ tự động tải từ Hugging Face.

**Pre-download thủ công:**

```bash
# Trong Python environment
python -c "from manga_ocr import MangaOcr; MangaOcr()"
```

**Model sẽ được lưu tại:**
- Windows: `C:\Users\<username>\.cache\huggingface\hub\`
- Linux/Mac: `~/.cache/huggingface/hub/`

---

### 2️⃣ YOLOv8 Speech Bubble Detector

Model phát hiện bong bóng hội thoại từ Hugging Face.

**Thông tin model:**
- **Repo**: `ogkalu/comic-speech-bubble-detector-yolov8m`
- **File**: `comic-speech-bubble-detector.pt`
- **Accuracy**: 97.4% mAP

**Pre-download thủ công:**

```python
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(
    repo_id="ogkalu/comic-speech-bubble-detector-yolov8m",
    filename="comic-speech-bubble-detector.pt"
)
print(f"Model saved to: {model_path}")
```

**Hoặc sử dụng script:**

```bash
python -c "from app.services.bubble_detector_service import get_model_path; print(get_model_path())"
```

---

## 🖥️ Yêu Cầu Hệ Thống

### Tối Thiểu
- **RAM**: 4GB
- **Disk**: 5GB trống
- **Python**: 3.10+

### Khuyến Nghị (GPU)
- **GPU**: NVIDIA với CUDA 11.8+
- **VRAM**: 4GB+
- **RAM**: 8GB+

---

## ⚙️ Cài Đặt PyTorch với CUDA (GPU)

Nếu bạn có GPU NVIDIA, cài đặt PyTorch với hỗ trợ CUDA để tăng tốc:

```bash
# CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# CPU only (mặc định)
pip install torch torchvision
```

**Kiểm tra CUDA:**
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'N/A'}")
```

---

## 📁 Cấu Trúc Thư Mục Models

Sau khi tải, các model sẽ nằm ở:

```
backend/
└── app/
    └── services/
        └── models/
            └── hub/                    # YOLOv8 model cache
                └── ogkalu--comic-speech-bubble-detector-yolov8m/
                    └── comic-speech-bubble-detector.pt

~/.cache/huggingface/hub/              # Manga-OCR models
└── models--kha-white--manga-ocr-base/
    └── snapshots/
        └── <hash>/
            └── model files...
```

---

## 🔧 Script Tải Tất Cả Models

Chạy script sau để tải trước tất cả models:

```python
# download_models.py
import logging
logging.basicConfig(level=logging.INFO)

print("=" * 50)
print("📥 Downloading all required AI models...")
print("=" * 50)

# 1. Download Manga-OCR
print("\n[1/2] Downloading Manga-OCR model...")
try:
    from manga_ocr import MangaOcr
    mocr = MangaOcr()
    print("✅ Manga-OCR ready!")
except Exception as e:
    print(f"❌ Manga-OCR failed: {e}")

# 2. Download YOLOv8 Bubble Detector
print("\n[2/2] Downloading YOLOv8 Bubble Detector...")
try:
    from huggingface_hub import hf_hub_download
    path = hf_hub_download(
        repo_id="ogkalu/comic-speech-bubble-detector-yolov8m",
        filename="comic-speech-bubble-detector.pt"
    )
    print(f"✅ YOLOv8 model saved to: {path}")
except Exception as e:
    print(f"❌ YOLOv8 download failed: {e}")

print("\n" + "=" * 50)
print("🎉 All models downloaded successfully!")
print("=" * 50)
```

**Chạy:**
```bash
cd backend
python download_models.py
```

---

## ❓ Xử Lý Lỗi Thường Gặp

### 1. `ModuleNotFoundError: No module named 'manga_ocr'`
```bash
pip install manga-ocr
```

### 2. `huggingface_hub` connection error
```bash
# Kiểm tra kết nối internet
# Hoặc sử dụng proxy:
export HF_HUB_OFFLINE=1  # Sau khi đã tải model
```

### 3. CUDA out of memory
```bash
# Chạy trên CPU
export CUDA_VISIBLE_DEVICES=""
```

### 4. Model tải chậm
- Sử dụng VPN nếu kết nối đến Hugging Face chậm
- Tải offline và copy thủ công vào thư mục cache

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề khi tải model, liên hệ team qua:
- Discord: [Link Discord]
- Email: team@mangahub.vn

---

**Last updated**: January 2026
