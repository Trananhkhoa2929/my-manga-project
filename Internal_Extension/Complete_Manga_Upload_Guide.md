# Hướng Dẫn Chi Tiết: Thêm Truyện Vào MangaHub

Hướng dẫn từng bước từ A-Z để thêm một bộ truyện hoàn chỉnh vào hệ thống MangaHub.

---

## PHẦN 1: SETUP CLOUDFLARE R2 (Lưu Trữ Ảnh)

### Bước 1.1: Tạo tài khoản Cloudflare

1. Truy cập: https://dash.cloudflare.com/sign-up
2. Nhập email và mật khẩu
3. Xác nhận email

### Bước 1.2: Vào R2 Object Storage

1. Đăng nhập Cloudflare Dashboard
2. Menu bên trái → Click **"R2 Object Storage"**
3. Nếu lần đầu, click **"Get started"** hoặc **"Enable R2"**

### Bước 1.3: Tạo Bucket

1. Click **"Create bucket"**
2. Đặt tên bucket: `mangahub`
3. Location: **Automatic** (hoặc chọn Asia nếu có)
4. Click **"Create bucket"**

### Bước 1.4: Bật Public Access

1. Click vào bucket `mangahub` vừa tạo
2. Tab **"Settings"**
3. Tìm mục **"R2.dev subdomain"**
4. Click **"Allow Access"**
5. Copy **Public Bucket URL** (dạng: `https://pub-xxx.r2.dev`)

### Bước 1.5: Tạo API Token

1. Quay lại trang R2 chính
2. Click **"Manage R2 API Tokens"** (góc phải)
3. Click **"Create API Token"**
4. Đặt tên: `mangahub-upload`
5. Permissions: **Object Read & Write**
6. Specify bucket: Chọn `mangahub`
7. Click **"Create API Token"**
8. **QUAN TRỌNG**: Copy và lưu lại:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint` (trong trang R2 overview, dạng: `https://xxx.r2.cloudflarestorage.com`)

### Bước 1.6: Cập nhật file .env

Mở file `.env` trong project và điền:

```env
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=access_key_bạn_vừa_copy
R2_SECRET_ACCESS_KEY=secret_key_bạn_vừa_copy
R2_BUCKET_NAME=mangahub
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## PHẦN 2: SETUP DATABASE (PostgreSQL)

### Bước 2.1: Cài Docker Desktop

1. Download: https://docker.com/products/docker-desktop
2. Chạy installer, Next > Next > Install
3. Khởi động Docker Desktop
4. Đợi đến khi icon Docker ở taskbar chuyển màu xanh

### Bước 2.2: Chạy PostgreSQL

Mở PowerShell/Terminal tại folder project:

```powershell
cd d:\my-manga-project
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Bước 2.3: Kiểm tra PostgreSQL

```powershell
docker ps
```

Phải thấy dòng có `mangahub-postgres` và STATUS là `Up`.

### Bước 2.4: Tạo Database Tables

```powershell
npx prisma db push
npx prisma generate
```

---

## PHẦN 3: THÊM TRUYỆN - CÁCH 1 (Prisma Studio - GUI)

### Bước 3.1: Mở Prisma Studio

```powershell
npx prisma studio
```

Tự động mở trình duyệt tại `http://localhost:5555`

### Bước 3.2: Thêm Thể Loại (Genre)

1. Click **"Genre"** trong danh sách bên trái
2. Click **"Add record"**
3. Điền:
   - `name`: `Action`
   - `slug`: `action`
   - `description`: `Truyện hành động`
4. Click **"Save 1 change"**
5. Lặp lại để thêm thể loại khác (Fantasy, Romance, Comedy...)

### Bước 3.3: Thêm Bộ Truyện (Series)

1. Click **"Series"** trong danh sách
2. Click **"Add record"**
3. Điền các field:
   - `title`: `Solo Leveling` (tên truyện)
   - `slug`: `solo-leveling` (URL-friendly, không dấu, dùng dấu gạch ngang)
   - `type`: Chọn `MANHWA`
   - `status`: Chọn `ONGOING`
   - `country`: `KR` (Korea)
   - `author`: `Chugong`
   - `artist`: `DUBU`
   - `description`: `Mô tả truyện...`
   - `coverUrl`: Tạm để trống (sẽ upload sau)
   - `visibility`: Chọn `PUBLIC`
4. Click **"Save 1 change"**
5. **Copy lại `id`** của series vừa tạo (dạng UUID: `abc123-...`)

### Bước 3.4: Thêm Thống Kê (SeriesStats)

1. Click **"SeriesStats"**
2. Click **"Add record"**
3. Điền:
   - `seriesId`: Paste ID series từ bước 3.3
   - `totalViews`: `0`
   - `weeklyViews`: `0`
   - `monthlyViews`: `0`
   - `followersCount`: `0`
   - `chaptersCount`: `0`
   - `ratingAvg`: `0`
   - `ratingCount`: `0`
4. Click **"Save 1 change"**

### Bước 3.5: Liên kết Thể Loại (SeriesGenre)

1. Click **"SeriesGenre"**
2. Click **"Add record"**
3. Điền:
   - `seriesId`: ID của series
   - `genreId`: ID của genre (Action = 1, Fantasy = 2...)
4. Click **"Save 1 change"**
5. Lặp lại để thêm nhiều thể loại cho 1 truyện

### Bước 3.6: Thêm Chapter

1. Click **"Chapter"**
2. Click **"Add record"**
3. Điền:
   - `seriesId`: ID của series
   - `number`: `1` (số chapter)
   - `title`: `The Weakest Hunter` (tên chapter, có thể để trống)
   - `slug`: `chap-1`
   - `language`: `vi`
   - `pagesCount`: `0` (sẽ update sau khi upload ảnh)
   - `isPublished`: `true`
   - `publishedAt`: Click chọn ngày hiện tại
4. Click **"Save 1 change"**
5. **Copy lại `id`** của chapter vừa tạo

---

## PHẦN 4: UPLOAD ẢNH CHAPTER

### Bước 4.1: Chuẩn bị ảnh

1. Tạo folder chứa ảnh chapter, ví dụ: `D:\Downloads\Chapter1`
2. Đặt các file ảnh vào (jpg, png, webp đều được)
3. **Không cần đổi tên** - hệ thống sẽ tự xử lý

### Bước 4.2: Xử lý ảnh (Optimize)

Dùng script process-chapter để tối ưu:

```powershell
npx ts-node scripts/process-chapter.ts "D:/Downloads/Chapter1" "D:/Downloads/Chapter1_Clean"
```

Kết quả: Folder `Chapter1_Clean` chứa các file `001.webp`, `002.webp`...

### Bước 4.3: Upload ảnh lên R2

**Cách 1: Upload thủ công qua Cloudflare Dashboard**

1. Vào Cloudflare Dashboard > R2 > Bucket `mangahub`
2. Tạo folder structure: `series/{seriesId}/chapters/{chapterId}/`
3. Upload các file webp vào

**Cách 2: Upload qua API (trong code)**

```typescript
// Trong frontend hoặc Postman
const formData = new FormData();
formData.append('chapterId', 'chapter-uuid-bạn-copy-ở-bước-3.6');
formData.append('files', file1); // File ảnh 001.webp
formData.append('files', file2); // File ảnh 002.webp
// ... thêm các file khác

await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData,
});
```

### Bước 4.4: Thêm Pages vào Database

Nếu upload thủ công lên R2, cần thêm Pages trong Prisma Studio:

1. Click **"Page"**
2. Click **"Add record"**
3. Điền:
   - `chapterId`: ID của chapter
   - `pageNumber`: `1`
   - `imagePath`: `series/{seriesId}/chapters/{chapterId}/001.webp`
   - `width`: `800`
   - `height`: `1200`
   - `status`: `FINAL`
4. Lặp lại cho mỗi trang

**Giải thích cách hệ thống hoạt động:**
```
Database lưu:    imagePath = "series/abc123/chapters/xyz456/001.webp"
                            ↓
.env có:         R2_PUBLIC_URL = "https://pub-xxx.r2.dev"
                            ↓
API tự động ghép: "https://pub-xxx.r2.dev/series/abc123/chapters/xyz456/001.webp"
                            ↓
Frontend nhận:   Full URL để hiển thị ảnh
```

> **Lưu ý**: Chỉ cần lưu path tương đối trong database. API sẽ tự động ghép với `R2_PUBLIC_URL` khi trả về cho frontend.

---

## PHẦN 5: TEST

### Bước 5.1: Chạy App

```powershell
npm run dev
```

### Bước 5.2: Kiểm tra trang chủ

1. Mở trình duyệt: `http://localhost:3000`
2. Truyện bạn thêm sẽ hiện ở:
   - Section "Truyện Mới Cập Nhật"
   - Bảng xếp hạng (nếu có views)

### Bước 5.3: Kiểm tra trang chi tiết

1. Truy cập: `http://localhost:3000/truyen/solo-leveling` (thay bằng slug của bạn)
2. Phải thấy:
   - Ảnh cover
   - Thông tin truyện
   - Danh sách chapters

### Bước 5.4: Kiểm tra đọc truyện

1. Click vào Chapter 1
2. URL: `http://localhost:3000/truyen/solo-leveling/chap/chap-1`
3. Phải thấy các trang ảnh hiển thị

---

## XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Can't reach database server"
→ PostgreSQL chưa chạy. Chạy: `docker-compose -f docker-compose.dev.yml up -d postgres`

### Lỗi: "R2_PUBLIC_URL chưa được cấu hình"
→ Kiểm tra file `.env` có đủ R2 config không

### Lỗi: Ảnh không hiển thị
→ Kiểm tra:
1. R2 bucket đã bật Public Access chưa
2. imagePath trong database có đúng không
3. File có tồn tại trong R2 không

### Lỗi: Truyện không hiện trên trang chủ
→ Kiểm tra:
1. Series có `visibility = PUBLIC` không
2. Đã tạo SeriesStats chưa
3. Đã có ít nhất 1 chapter với `isPublished = true` chưa

---

## TÓM TẮT WORKFLOW

```
1. Setup R2 (1 lần duy nhất)
   └── Tạo bucket → Bật public → Tạo API token → Cập nhật .env

2. Setup Database (1 lần duy nhất)
   └── Chạy Docker → prisma db push

3. Thêm truyện mới (mỗi lần thêm truyện)
   └── Genre → Series → SeriesStats → SeriesGenre

4. Thêm chapter (mỗi lần ra chap mới)
   └── Chapter → Upload ảnh → Pages

5. Test
   └── npm run dev → Kiểm tra trên web
```
