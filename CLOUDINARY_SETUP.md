# 🌐 Hướng dẫn Setup Cloudinary

## Bước 1: Đăng ký Cloudinary (Miễn phí)

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (có thể dùng Google/GitHub)
3. Sau khi đăng ký xong, bạn sẽ được chuyển đến Dashboard

## Bước 2: Lấy thông tin API

1. Vào **Dashboard** của Cloudinary
2. Ở phần **Product Environment Credentials**, bạn sẽ thấy:
   - **Cloud Name**: `dxxxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz` (Click "Show" để xem)

## Bước 3: Cập nhật file `.env`

Mở file `.env` và điền thông tin vừa lấy được:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

⚠️ **LƯU Ý**: 
- Thay `dxxxxxxxx`, `123456789012345`, `abcdefghijklmnopqrstuvwxyz` bằng giá trị thực tế của bạn
- File `.env` đã được thêm vào `.gitignore` nên không lo bị commit lên GitHub

## Bước 4: Restart Server

```bash
# Dừng server hiện tại (Ctrl + C)
npm run dev
```

## Bước 5: Test Upload

1. Đăng nhập vào website
2. Vào trang **Community** (Cộng đồng)
3. Tạo bài viết mới và thử upload ảnh
4. Hoặc vào **Admin > Apartments** và upload ảnh căn hộ

## ✅ Kết quả

Sau khi upload thành công, ảnh sẽ:
- ✅ Được lưu trên Cloudinary (không còn lưu trong `/public/uploads`)
- ✅ Có URL dạng: `https://res.cloudinary.com/dxxxxxxxx/image/upload/v1234567890/stayease/...`
- ✅ Tự động tối ưu kích thước và chất lượng
- ✅ Load nhanh từ CDN toàn cầu
- ✅ Hiển thị được khi deploy lên Vercel/Production

## 📊 Giới hạn miễn phí của Cloudinary

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/tháng
- **Transformations**: 25,000/tháng
- **Video**: 0.5 GB storage, 1 GB bandwidth/tháng

Với dự án nhỏ/vừa, mức miễn phí này là **quá đủ**! 🎉

## 🔍 Kiểm tra ảnh trên Cloudinary

1. Vào Dashboard Cloudinary
2. Click **Media Library** ở menu bên trái
3. Bạn sẽ thấy thư mục `stayease/` với các ảnh đã upload

## 🗂️ Cấu trúc thư mục trên Cloudinary

```
stayease/
├── posts/           # Ảnh bài viết community
├── apartments/      # Ảnh căn hộ
├── amenities/       # Ảnh tiện ích
├── avatars/         # Ảnh đại diện
├── service-requests/ # Ảnh yêu cầu bảo trì
└── general/         # Ảnh khác
```

## 🚀 Tính năng đã tích hợp

- ✅ Upload ảnh cho **Community Posts**
- ✅ Upload ảnh cho **Apartments**
- ✅ Upload ảnh cho **Amenities**
- ✅ Upload ảnh cho **Service Requests**
- ✅ Upload avatar cho **Users**
- ✅ Tự động resize & optimize
- ✅ Tự động convert sang format tốt nhất (WebP khi browser hỗ trợ)
- ✅ Delete ảnh từ Cloudinary khi không dùng nữa

## 💡 Tips

1. Không cần xóa thư mục `/public/uploads` cũ - nó đã được thêm vào `.gitignore`
2. Ảnh cũ trong `/public/uploads` vẫn hoạt động bình thường (localhost)
3. Từ giờ mọi ảnh mới sẽ tự động lưu lên Cloudinary
4. Khi deploy production, ảnh cũ sẽ không hiển thị (chỉ ảnh Cloudinary mới hiển thị)

## ❓ Troubleshooting

### Lỗi: "Invalid credentials"
- Kiểm tra lại thông tin trong `.env`
- Đảm bảo không có khoảng trắng thừa
- Restart lại server

### Lỗi: "Upload failed"
- Kiểm tra kết nối internet
- Kiểm tra file size (max 5MB)
- Kiểm tra định dạng file (chỉ hỗ trợ JPG, PNG, GIF, WebP)

### Ảnh không hiển thị
- Kiểm tra console log để xem URL
- Kiểm tra Cloudinary Dashboard xem ảnh đã upload chưa
- Clear cache browser và reload lại

## 🎯 Next Steps

Bạn có thể:
1. Tùy chỉnh transformation (width, height, quality) trong file `app/api/upload/route.ts`
2. Thêm watermark cho ảnh
3. Tạo thumbnail tự động
4. Upload video (nếu cần)

---

**Chúc bạn setup thành công!** 🎉
