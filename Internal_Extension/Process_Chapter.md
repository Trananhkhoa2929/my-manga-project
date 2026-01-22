# Hướng Dẫn Sử Dụng Tool Process Chapter

Script này giúp tự động tối ưu hóa và chuẩn hóa tên file ảnh cho truyện tranh, chuẩn bị sẵn sàng để upload lên Cloudflare R2 hoặc các storage khác.

## Chức năng
1. **Đổi tên file chuẩn**: Tự động chuyển tên file lộn xộn (ví dụ `imgi_4_...`) thành dạng số thứ tự chuẩn `001.webp`, `002.webp`...
2. **Tối ưu hóa ảnh**: Chuyển đổi ảnh sang định dạng **WebP** (giảm dung lượng ~40% nhưng giữ nguyên chất lượng).
3. **Sắp xếp**: Đảm bảo ảnh được sắp xếp đúng thứ tự trang.

## Cách sử dụng

Mở terminal tại thư mục gốc của project và chạy lệnh sau:

```bash
npx ts-node scripts/process-chapter.ts "<Thư_mục_gốc_chứa_ảnh>" "<Thư_mục_đich_xuất_file>"
```

### Ví dụ minh họa

Giả sử bạn có:
- Folder ảnh gốc tải về tại: `C:\Downloads\Chapter1`
- Muốn xuất file đã xử lý ra: `C:\Downloads\Chapter1_Clean`

Bạn chạy lệnh:

```bash
npx ts-node scripts/process-chapter.ts "C:/Downloads/Chapter1" "C:/Downloads/Chapter1_Clean"
```

> **Lưu ý**: Hãy dùng dấu ngoặc kép `""` bao quanh đường dẫn thư mục để tránh lỗi nếu tên thư mục có khoảng trắng.

## Kết quả
Sau khi chạy xong, trong thư mục đích sẽ có các file:
- `001.webp`
- `002.webp`
- `003.webp`
- ...

Bạn có thể upload toàn bộ folder này lên Storage.
