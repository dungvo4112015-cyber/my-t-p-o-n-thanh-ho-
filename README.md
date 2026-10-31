# EduSmart PRO – Quản Lý Lớp Học Thông Minh

Nền tảng quản lý lớp học số và sổ liên lạc điện tử toàn diện dành cho **Nhà trường (Admin)**, **Giáo viên**, **Học sinh** và **Phụ huynh**, chuẩn chương trình giáo dục phổ thông GDPT 2018.

---

## 🌟 1. Tổng quan & Mục tiêu sản phẩm

EduSmart PRO giải quyết bài toán chuyển đổi số học đường thông minh:
* **Giáo viên:** Quản lý lớp học, hồ sơ học sinh 360°, điểm danh chạm thông minh (mobile-first), sổ điểm điện tử spreadsheet tương tác, giao và chấm bài tập, tạo quiz trắc nghiệm, quản lý học liệu và tương tác trực tiếp với phụ huynh.
* **Học sinh:** Bàn học trực tuyến, làm bài tập về nhà, làm bài kiểm tra có bấm giờ tự động chấm điểm, theo dõi bảng điểm cá nhân và sưu tập huy hiệu thành tích.
* **Phụ huynh:** Sổ liên lạc điện tử theo dõi chuyên cần, xem nhận xét sư phạm của thầy cô, gửi đơn xin nghỉ phép trực tuyến và trao đổi trực tiếp với giáo viên chủ nhiệm.
* **Quản trị viên (Admin):** Quản lý toàn trường, phân quyền vai trò RBAC ma trận chi tiết, nhật ký kiểm toán (Audit Trail) ghi vết an toàn dữ liệu, sao lưu và phục hồi dữ liệu.
* **Bộ công cụ lớp học trực tiếp:** Vòng quay may mắn (Lucky Wheel có pháo hoa & âm thanh), bốc thăm tránh trùng lặp, chia nhóm cân bằng giới tính, đồng hồ bấm giờ hẹn giờ và khảo sát nhanh tức thời.
* **Trợ lý Sư phạm AI:** Ứng dụng Gemini AI hỗ trợ soạn đề kiểm tra, phiếu bài tập, kế hoạch bài dạy (Công văn 5512) và gợi ý nhận xét học sinh có kiểm duyệt (*Human-in-the-loop: Bắt buộc giáo viên duyệt trước khi công bố*).

---

## 🚀 2. Tài khoản Demo có sẵn

Hệ thống tích hợp sẵn nút chuyển vai trò thử nghiệm nhanh (Quick Role Switcher) tại thanh Header hoặc đăng nhập bằng danh sách tài khoản:

| Vai trò (Role) | Họ và tên | Email đăng nhập | Mật khẩu | Phạm vi truy cập |
| :--- | :--- | :--- | :--- | :--- |
| **TEACHER** (Mặc định) | Thầy Nguyễn Văn An | `teacher.an@edusmart.edu.vn` | `123456` | GVCN Lớp 9A1 & Bộ môn Toán |
| **STUDENT** | Lê Hải Đăng | `student.dang@edusmart.edu.vn` | `123456` | Học sinh lớp 9A1 (HS240901) |
| **PARENT** | Trần Thị Mai | `parent.mai@edusmart.edu.vn` | `123456` | Phụ huynh em Lê Hải Đăng |
| **ADMIN** | Lê Thanh Tùng | `admin@edusmart.edu.vn` | `123456` | Quản trị viên Toàn trường |

---

## 🛠️ 3. Tech Stack

* **Frontend:** React 19 + TypeScript + Vite 8
* **Styling & Design System:** Tailwind CSS v4 + Modern Education SaaS Palette (Primary `#2563EB`, Violet `#7C3AED`, Emerald `#16A34A`, Amber `#F59E0B`, Rose `#EF4444`)
* **Routing & Protection:** React Router v7 + RoleGuard (403 Forbidden chặn truy cập trái phép)
* **Icons & Animation:** Lucide React + Canvas Confetti
* **AI Engine:** Google Gemini API SDK (`@google/genai`) tích hợp mô hình `gemini-2.5-flash`
* **Data & Persistence Layer:**
  * Client abstraction repository với LocalStorage tự động lưu & đồng bộ
  * SQL PostgreSQL / Supabase Schema hoàn chỉnh với Row Level Security (`/src/db/schema.sql`) sẵn sàng triển khai Backend thật.

---

## 📁 4. Cấu trúc thư mục

```text
/src
  /components
    /classroom          # 5 công cụ lớp học (LuckyWheel, RandomPicker, GroupMaker, Timer, QuickQuiz)
    /common             # AppLayout, Header, Sidebar, DataTable, Modal, ConfirmDialog, StatusChip, Toast...
    /student            # Hồ sơ 360° học sinh, Wizard Import Excel/CSV 6 bước
  /contexts             # AuthContext (Role & RBAC), AppContext (Live state & Audit log dispatch)
  /data                 # Mock dataset chuẩn trường THCS Việt Nam (Lớp 9A1, 9A2, 8B, 7A...)
  /db                   # PostgreSQL / Supabase schema (Tables, RLS, Triggers, Indexes)
  /pages
    /admin              # Dashboard, Users, Classes, Permissions RBAC, Audit Logs, Backup, Settings
    /auth               # Đăng nhập & Chọn tài khoản demo
    /error              # 403 Forbidden, 404 Not Found
    /parent             # Dashboard phụ huynh, Đơn xin nghỉ học, Hộp thư trao đổi
    /student            # Bàn học, Làm bài tập, Kiểm tra Quiz, Bảng điểm, Huy hiệu
    /teacher            # Dashboard, Lớp học, Học sinh, Điểm danh, Sổ điểm, Bài tập, Chấm bài, AI Studio...
  /services             # storage.ts (CRUD & persistence), aiService.ts (Gemini & pedagogical generator)
  /types                # TypeScript definitions, Enums, Models
```

---

## 💻 5. Cài đặt & Chạy ứng dụng

### Yêu cầu môi trường
* Node.js >= 18.0.0
* npm >= 9.0.0

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Khởi chạy môi trường phát triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại cổng `http://localhost:3000`.

### Bước 3: Build sản phẩm (Production)
```bash
npm run build
```

---

## 🔑 6. Cấu hình biến môi trường (`.env`)

Sao chép từ file `.env.example`:
```env
# GEMINI_API_KEY: Dùng cho tính năng Trợ lý AI Giáo viên soạn đề & giáo án
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# SUPABASE_URL & ANON_KEY: Dùng khi chuyển từ Local Storage sang Supabase Backend
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 🗄️ 7. Triển khai Cơ sở dữ liệu Supabase (PostgreSQL)

Hệ thống được thiết kế theo mô hình **Repository Pattern**. Toàn bộ mã nguồn SQL DDL, quan hệ khóa ngoại (Foreign Keys), phân quyền dòng (RLS Policies) và bảng kiểm toán `audit_logs` đã được định nghĩa tại `/src/db/schema.sql`.

### Các bước kết nối Supabase thật:
1. Tạo một project mới trên [Supabase Dashboard](https://supabase.com).
2. Vào **SQL Editor**, mở file `/src/db/schema.sql` trong dự án này, dán toàn bộ và nhấn **Run**.
3. Cài đặt `@supabase/supabase-js`:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Cập nhật file `/src/services/storage.ts` để gọi trực tiếp `supabase.from('classes').select('*')` thay thế các phương thức đọc `localStorage`. Do UI hoàn toàn tách biệt với data layer, toàn bộ giao diện sẽ hoạt động mượt mà không cần sửa đổi component!

---

## 🌐 8. Triển khai Production (Deploy Vercel / Netlify)

1. **Vercel:**
   * Import repository GitHub vào Vercel.
   * Framework Preset: `Vite`.
   * Build Command: `npm run build`.
   * Output Directory: `dist`.
   * Đặt biến môi trường `VITE_GEMINI_API_KEY` nếu có.
2. **Netlify:**
   * Thêm file `_redirects` với nội dung `/* /index.html 200` để hỗ trợ Single Page Application (SPA) routing.

---

## 🛡️ 9. An toàn & Bảo mật thông tin

1. **Kiểm soát phân quyền chặt chẽ:** Quyền truy cập được xác thực ở cả `AuthContext` và `RoleGuard`. Nếu người dùng cố ý nhập URL `/admin/*` khi đang đăng nhập quyền Học sinh hoặc Phụ huynh, hệ thống tự động chặn và trả về trang **403 Forbidden**.
2. **Audit Log ghi vết:** Mọi thao tác sửa đổi điểm số, điểm danh, tạo bài tập, xóa học sinh đều được ghi nhận vào bảng `audit_logs` kèm địa chỉ IP và dấu thời gian.
3. **An toàn sư phạm đối với AI:** Trợ lý AI chỉ tạo bản nháp. Giáo viên bắt buộc phải thẩm định và nhấn "Duyệt & Giao thành bài tập" mới được công bố.
