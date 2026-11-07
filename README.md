# ✈️ DỰ ÁN WEBSITE DU LỊCH VIETJET (ANTIGRAVITY SPECIFICATIONS)

Chào mừng bạn đến với bộ tài liệu thiết kế và đặc tả kỹ thuật cho dự án **Website Du Lịch Vietjet**. Bộ tài liệu này được cấu trúc chuyên biệt để **Antigravity** có thể đọc hiểu trọn vẹn và tạo ra mã nguồn chính xác 100% theo đúng yêu cầu của bạn.

---

## 📌 THÔNG TIN TỔNG QUAN

* **Tên thương hiệu:** Vietjet
* **Lĩnh vực:** Đặt vé máy bay trực tuyến & Tour du lịch
* **Công nghệ cốt lõi:** HTML5, CSS3, JavaScript thuần (Vanilla JS, không framework nặng, không backend server)
* **Cơ sở dữ liệu:** **SQLite** chạy trực tiếp trên trình duyệt bằng WebAssembly (`sql.js`) kết hợp lưu trữ `localStorage`
* **Phong cách giao diện:** Tone màu sáng, nền trắng tinh khôi, màu sắc chủ đạo là màu đỏ Vietjet (**`#ee1d23`**), điểm nhấn vàng tươi (**`#ffc709`**)

---

## 📂 DANH MỤC CÁC FILE TÀI LIỆU `.MD` ĐÃ ĐƯỢC TẠO

| STT | File Tài Liệu | Mục Đích & Nội Dung Chính |
| :---: | :--- | :--- |
| 1 | [**`PRD.md`**](./PRD.md) | **Tài liệu yêu cầu sản phẩm chi tiết**: Mô tả từng tính năng, thành phần giao diện của Trang chủ, Chuyến bay, Chi tiết chuyến bay, Danh sách tour, Chi tiết tour và Giỏ hàng / Đăng ký đặt chỗ. |
| 2 | [**`DATABASE_SCHEMA.md`**](./DATABASE_SCHEMA.md) | **Thiết kế cơ sở dữ liệu SQLite**: Cấu trúc 6 bảng (`airlines`, `airports`, `flights`, `tours`, `cart`, `bookings`), kịch bản dữ liệu mẫu (Seed Data) và giải pháp tích hợp `sql.js` (WebAssembly) trên trình duyệt. |
| 3 | [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) | **Kiến trúc hệ thống & Thiết kế**: Sơ đồ cấu trúc thư mục, luồng tương tác giữa các trang (Data Flow), hệ thống màu sắc (CSS Variables) và các quy chuẩn giao diện người dùng. |
| 4 | [**`TASK_LIST.md`**](./TASK_LIST.md) | **Danh sách công việc & Checklist**: Phân rã 8 giai đoạn thực hiện với các tiêu chí nghiệm thu (Acceptance Criteria) rõ ràng cho Antigravity. |
| 5 | [**`PROMPTS.md`**](./PROMPTS.md) | **Bộ câu lệnh mẫu**: Cung cấp Master Prompt (thực hiện tất cả chỉ bằng 1 câu lệnh) và Prompt theo từng giai đoạn để bạn tương tác với Antigravity. |

---

## 🎯 CÁC TÍNH NĂNG ĐƯỢC ĐẶC TẢ CHI TIẾT

1. **Trang Chủ (`index.html`):**
   * Widget tìm kiếm vé máy bay: Điểm xuất phát, điểm đến, ngày đi, ngày về, vé khứ hồi / một chiều $\rightarrow$ Dẫn sang trang Chuyến Bay kèm bộ lọc.
   * Danh sách **8 tour du lịch nổi bật**: Ảnh thumbnail chuẩn 600x400 px, hãng du lịch tổ chức, số ngày/đêm, giá tiền $\rightarrow$ Dẫn sang trang Chi tiết tour.
   * Khối đối tác hàng không: Logo VietJet Air, Vietnam Airlines, Singapore Airlines, Bamboo Airways... $\rightarrow$ Click logo tự động lọc chuyến bay của hãng.

2. **Trang Chuyến Bay (`flights.html`):**
   * **Cột trái:** Bộ lọc sắp xếp giá tăng/giảm, loại vé khứ hồi/một chiều, bay thẳng/nhiều chặng, hãng hàng không, khung giờ cất cánh, hạng dịch vụ (Phổ thông/Thương gia).
   * **Cột phải:** Danh sách các chuyến bay lọc động từ SQLite, hiển thị giờ cất cánh, thời gian bay, giá tiền, dịch vụ đi kèm.
   * Click chọn chuyến bay $\rightarrow$ Dẫn sang trang Chi tiết chuyến bay.

3. **Trang Chi Tiết Chuyến Bay (`flight-detail.html`):**
   * Chi tiết hành trình, điểm đi/đến, thời gian, hãng bay, loại máy bay (Boeing, Airbus...).
   * Khối chọn vé: **Hạng Phổ Thông** và **Hạng Thương Gia** với quyền lợi và giá vé chi tiết.
   * Nút chọn vé $\rightarrow$ Tự động lưu vào **Giỏ Hàng** (SQLite/LocalStorage).

4. **Trang Danh Sách Tour (`tours.html`):**
   * **Cột trái:** Bộ lọc giá tour tăng/giảm, hãng hàng không vận chuyển, thời gian khởi hành.
   * **Cột phải:** Danh sách tour du lịch, hãng bay, ngày cất cánh, thời gian, giá tiền, dịch vụ.
   * Click chọn tour $\rightarrow$ Dẫn sang trang Chi tiết tour.

5. **Trang Chi Tiết Tour (`tour-detail.html`):**
   * Điểm đi, điểm đến, thời gian, hãng bay, loại máy bay (Boeing, Airbus...).
   * Lịch trình chi tiết từng ngày (Timeline các hoạt động).
   * Nút chọn tour $\rightarrow$ Tự động lưu vào **Giỏ Hàng**.

6. **Trang Giỏ Hàng & Đăng Ký (`cart.html`):**
   * Xem lại tất cả chuyến bay và tour đã chọn. Hỗ trợ xóa từng mục hoặc làm trống giỏ hàng.
   * Form điền thông tin cá nhân khách hàng.
   * Nút "Đăng ký" $\rightarrow$ Lưu đơn hàng vào cơ sở dữ liệu SQLite và hiển thị Modal thông báo đặt chỗ hoàn thành với mã đặt chỗ (PNR).

---

## 🚀 HƯỚNG DẪN BẮT ĐẦU VỚI ANTIGRAVITY

Để bắt đầu cho Antigravity sinh mã nguồn cho toàn bộ dự án, bạn chỉ cần mở file [**`PROMPTS.md`**](./PROMPTS.md), sao chép phần **"CÂU LỆNH TỔNG THỂ (ALL-IN-ONE MASTER PROMPT)"** và gửi cho Antigravity ngay trong cửa sổ chat này hoặc bất kỳ phiên làm việc nào!
