# 🚀 Hướng Dẫn Deploy Web Yêu Thương Lên Vercel & Neon (Miễn Phí 100%)

Tài liệu này hướng dẫn chi tiết cách đưa app lên mạng để hai bạn có thể dùng chung trên điện thoại/máy tính 24/7 mà không tốn 1 đồng nào.

---

## 📌 Tổng quan kiến trúc
- **Frontend & Backend:** [Vercel](https://vercel.com) (Serverless, CDN toàn cầu, miễn phí, tự động cấp HTTPS).
- **Database:** [Neon.tech](https://neon.tech) (PostgreSQL Serverless, miễn phí vĩnh viễn 0.5GB - đủ cho 2 người dùng hàng chục năm).
- **Mã nguồn:** GitHub (Private Repository để bảo mật 100%).

---

## 🛠 BƯỚC 1: Tạo Database PostgreSQL Miễn Phí (Neon.tech)

1. Truy cập [https://neon.tech](https://neon.tech) và chọn **Sign up** (đăng nhập bằng Google hoặc GitHub).
2. Bấm **Create a project**:
   - Name: `yeuthuong`
   - Region: Chọn `Singapore (ap-southeast-1)` (để tốc độ về Việt Nam nhanh nhất).
3. Sau khi tạo xong, màn hình sẽ hiện **Connection string**:
   - Chọn tab **Prisma** hoặc **Connection string**.
   - Copy chuỗi kết nối dạng:
     ```
     postgresql://neondb_owner:npg_xxxx@ep-cool-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. **Tại máy tính của bạn:**
   - Mở file `.env` và dán chuỗi vừa copy vào:
     ```env
     DATABASE_URL="postgresql://neondb_owner:npg_xxxx@ep-cool-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
     ```
   - Chạy lệnh sau trong terminal để đẩy cấu trúc bảng lên Neon:
     ```bash
     npm run db:push
     ```
   *(Lệnh này sẽ tự động tạo đủ tất cả bảng: User, Space, Chat, Photos, Goals, Games... trên Neon)*.

---

## 🛠 BƯỚC 2: Đẩy Code Lên GitHub

> ⚠️ File `.env` và file database SQLite cũ đã được cấu hình trong `.gitignore`, bạn yên tâm push code lên GitHub mà không sợ lộ bất kỳ thông tin nào.

1. Khởi tạo và commit code:
   ```bash
   git add .
   git commit -m "feat: complete step 1 and cloud db configuration"
   ```
2. Đẩy code lên GitHub repository của bạn (khuyên bạn nên để chế độ **Private**):
   ```bash
   git push origin main
   ```

---

## 🛠 BƯỚC 3: Deploy Lên Vercel (1 Phút)

1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **Add New...** ➔ **Project**.
3. Chọn repository `yeuthuong` của bạn và bấm **Import**.
4. Ở phần **Environment Variables**:
   - **Key:** `DATABASE_URL`
   - **Value:** *(Dán chuỗi kết nối Neon ở Bước 1 vào)*
5. Bấm **Deploy**.
6. Đợi khoảng 1-2 phút, Vercel sẽ cấp cho bạn một tên miền miễn phí dạng:
   👉 `https://yeuthuong-xxxx.vercel.app`

---

## 📱 BƯỚC 4: Trải Nghiệm & Cài Lên Điện Thoại

1. Bạn truy cập vào trang web trên trình duyệt điện thoại hoặc máy tính.
2. Đăng ký tài khoản đầu tiên (tạo Space).
3. Vào mục **Shared Space** (`/space`), bấm **"Sao chép Link mời trực tiếp"** và gửi link qua Messenger/Zalo cho bạn gái.
4. Bạn gái bấm link ➔ Chỉ cần gõ Tên & Mật khẩu là tự động vào chung không gian yêu thương của hai người!
5. **Cài app PWA:**
   - **iPhone:** Mở Safari ➔ Bấm nút Chia sẻ (icon ô vuông có mũi tên lên) ➔ Chọn **"Thêm vào MH chính"**.
   - **Android:** Mở Chrome ➔ Bấm dấu 3 chấm góc phải ➔ Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
