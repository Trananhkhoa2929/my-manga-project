# Hướng Dẫn Setup MangaHub

Hướng dẫn cài đặt và cấu hình MangaHub từ đầu, bao gồm Database, Storage và Add Data.

## 1. Cài đặt Docker Desktop

1. Download Docker Desktop tại: https://docker.com/products/docker-desktop
2. Cài đặt và khởi động Docker Desktop
3. Đảm bảo Docker đang chạy (icon Docker màu xanh ở taskbar)

## 2. Khởi động PostgreSQL

Mở terminal tại thư mục gốc project và chạy:

```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Kiểm tra PostgreSQL đã chạy

```bash
docker ps
```

Sẽ thấy container `mangahub-postgres` với STATUS `Up`.

## 3. Setup Database với Prisma

Chạy các lệnh sau để tạo tables trong database:

```bash
npx prisma db push
npx prisma generate
```

## 4. Cấu hình Environment

File `.env` cần có các biến sau:

```env
# Database
DATABASE_URL=postgresql://mangahub:mangahub_dev_password@127.0.0.1:5432/mangahub?schema=public

# Cloudflare R2 Storage
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=mangahub
R2_PUBLIC_URL=https://pub-YOUR_ID.r2.dev
```

> **Lưu ý**: DATABASE_URL đã được cấu hình sẵn để match với docker-compose.dev.yml, không cần thay đổi.

## 5. Thêm Manga Data

### Option A: Seed Script (Recommended)

1. Mở file `prisma/seed.ts`
2. Chỉnh sửa `seriesList` với truyện của bạn:

```typescript
const seriesList = [
  {
    title: 'Tên Truyện',
    slug: 'ten-truyen',
    type: SeriesType.MANHWA,
    status: SeriesStatus.ONGOING,
    author: 'Tên Tác Giả',
    description: 'Mô tả truyện...',
    coverUrl: 'https://your-r2-url/cover.jpg',
    genres: ['action', 'fantasy'],
    chapters: [
      { number: 1, title: 'Chapter 1', pages: 20 },
    ],
  },
];
```

3. Chạy seed:

```bash
npx prisma db seed
```

### Option B: Prisma Studio (GUI)

1. Mở Prisma Studio:

```bash
npx prisma studio
```

2. Truy cập `http://localhost:5555` trong trình duyệt

3. Thêm data theo thứ tự:
   - **Genre**: Thêm các thể loại (Action, Fantasy, Romance...)
   - **Series**: Thêm bộ truyện
   - **SeriesStats**: Thêm thống kê cho mỗi series
   - **Chapter**: Thêm chapters cho series
   - **Page**: Thêm pages cho chapters

## 6. Chạy App

```bash
npm run dev
```

Truy cập `http://localhost:3000` để xem kết quả.

## Quick Start Summary

```bash
# 1. Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# 2. Setup database
npx prisma db push
npx prisma generate

# 3. Add sample data
npx prisma db seed

# 4. Start app
npm run dev
```
