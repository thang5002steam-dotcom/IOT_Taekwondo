# Báo Cáo Chi Tiết: API Màn Check-in Trong Dự Án (Java vs Python)

**Ngày báo cáo:** 25/09/2026
**Dự án:** `ai-receptionist-web-fe`

---

## 📌 KẾT LUẬN CHÍNH

Tất cả các tính năng & màn hình Check-in trong dự án hiện tại **ĐỀU ĐANG CALL ĐẾN API CỦA JAVA** (`javaApi` – mặc định kết nối tới `http://localhost:8080/api/v1`).

Mặc dù hệ thống có định nghĩa sẵn instance `pythonApi` (`http://localhost:8000/api/v1`) trong file [`axiosInstance.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/lib/axiosInstance.ts#L235-L244), nhưng **Python API hiện không được gọi ở bất kỳ luồng check-in nào**.

---

## 🔍 CHI TIẾT THEO TỪNG MÀN HÌNH & LUỒNG XỬ LÝ

Dự án có 2 màn hình chính phục vụ công việc check-in & điểm danh:

### 1. Màn AI Check-In (`/check-in` hoặc `/ai-check-in`)

- **File giao diện:** [`AICheckIn.tsx`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/pages/AICheckIn/AICheckIn.tsx)
- Hỗ trợ 2 chế độ check-in: **Nhận diện khuôn mặt (AI Face Scan)** và **Quét mã QR/Barcode (Code Scan)**.

#### A. Nhận diện khuôn mặt (AI Face Scan)

- **Luồng xử lý:** Khi phát hiện khuôn mặt qua webcam (dùng MediaPipe ở Client), frontend gửi `FormData` chứa frame ảnh lên server.
- **API Endpoint:** `POST /api/v1/persons/face-check-in`
- **File định nghĩa API:** [`personAPI.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/features/person/api/personAPI.ts#L5-L19)
- **Client Instance:** `javaApi.post<FaceCheckInResponse>("/persons/face-check-in", formData)`
- **Backend tiếp nhận:** **Java Backend** (Phân loại tự động loại đối tượng `STUDENT` hoặc `COACH` và thực hiện điểm danh/chấm công).

#### B. Quét mã QR / Barcode (Code Scan)

- **Luồng xử lý:** Được quản lý tại [`submitScannedCheckInCode.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/features/checkIn/utils/submitScannedCheckInCode.ts#L36-L84).
- **Trường hợp 1: Mã Học viên (`VQ_...`)**
  - **API Endpoint:** `POST /api/v1/student-attendances/check-in`
  - **File định nghĩa API:** [`studentAttendanceAPI.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/features/studentAttendance/api/studentAttendanceAPI.ts#L60-L65)
  - **Client Instance:** `javaApi.post("/student-attendances/check-in", data)`
- **Trường hợp 2: Mã Huấn luyện viên (`VQT...`)**
  - **API Endpoint:** `POST /api/v1/coach-timesheets/check-in`
  - **File định nghĩa API:** [`coachTimesheetAPI.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/features/coach/api/coachTimesheetAPI.ts#L83-L88)
  - **Client Instance:** `javaApi.post("/coach-timesheets/check-in", request)`

---

### 2. Màn Điểm Danh Lớp Học (`AttendanceCheckin`)

- **File giao diện:** [`AttendanceCheckin.tsx`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/pages/AttendanceCheckin/AttendanceCheckin.tsx)
- Màn hình điểm danh danh sách học viên theo lớp/buổi học dành cho HLV và quản lý.
- **Các API Endpoint được gọi:**
  - Lấy danh sách điểm danh: `GET /api/v1/student-attendances` (via `javaApi`)
  - Cập nhật trạng thái điểm danh: `PATCH /api/v1/student-attendances/{id}/status` (via `javaApi`)
  - Cập nhật đánh giá học viên: `PATCH /api/v1/student-attendances/{id}/evaluation` (via `javaApi`)
  - Tạo bản ghi thủ công: `POST /api/v1/student-attendances` (via `javaApi`)

---

## ⚙️ BẢNG TỔNG HỢP API CHECK-IN DỰ ÁN

| Chức năng                | Endpoint                                  | Method  | Backend Service | Instance Gọi |
| :----------------------- | :---------------------------------------- | :-----: | :-------------: | :----------: |
| **Face Check-in (AI)**   | `/api/v1/persons/face-check-in`           | `POST`  |    **Java**     |  `javaApi`   |
| **Check-in Mã Học Viên** | `/api/v1/student-attendances/check-in`    | `POST`  |    **Java**     |  `javaApi`   |
| **Check-in Mã HLV**      | `/api/v1/coach-timesheets/check-in`       | `POST`  |    **Java**     |  `javaApi`   |
| **Danh Sách Điểm Danh**  | `/api/v1/student-attendances`             |  `GET`  |    **Java**     |  `javaApi`   |
| **Cập Nhật Trạng Thái**  | `/api/v1/student-attendances/{id}/status` | `PATCH` |    **Java**     |  `javaApi`   |

---

## 🔧 CẤU HÌNH BIẾN MÔI TRƯỜNG & AXIOS INSTANCE

- **File `.env`:**
  ```env
  VITE_API_URL_JAVA=http://localhost:8080/api/v1
  VITE_API_URL_PYTHON=http://localhost:8000/api/v1
  ```
- **File [`axiosInstance.ts`](file:///d:/TKD_Van_Quan/ai-receptionist-web-fe/src/lib/axiosInstance.ts):**
  - `javaApi`: Kết nối tới `VITE_API_URL_JAVA` (Port 8080).
  - `pythonApi`: Kết nối tới `VITE_API_URL_PYTHON` (Port 8000).

---

> **Tóm lại:** 100% các API liên quan tới nghiệp vụ Check-in & Điểm danh trong dự án này hiện tại đều được gửi tới **Java Backend**.
