# 🤖 BỘ CÂU LỆNH PROMPT DÀNH CHO ANTIGRAVITY (PROMPTS GUIDE)

Bạn có thể sử dụng các câu lệnh (prompts) dưới đây để yêu cầu Antigravity xây dựng dự án một cách tự động và chuẩn xác. Bạn có thể chọn thực hiện **Tất cả trong một lần (One-shot Prompt)** hoặc **Theo từng giai đoạn (Step-by-step Prompts)**.

---

## 🚀 CÁCH 1: CÂU LỆNH TỔNG THỂ (ALL-IN-ONE MASTER PROMPT)

> *Hãy copy toàn bộ nội dung trong khung bên dưới và gửi trực tiếp cho Antigravity:*

```text
Dựa vào các file đặc tả dự án đã chuẩn bị sẵn trong thư mục hiện tại:
- PRD.md (Yêu cầu tính năng và sản phẩm)
- DATABASE_SCHEMA.md (Thiết kế SQLite, dữ liệu mẫu seed data và sql.js)
- ARCHITECTURE.md (Kiến trúc hệ thống, cấu trúc thư mục, CSS design system)
- TASK_LIST.md (Checklist các hạng mục công việc)

Hãy giúp tôi xây dựng hoàn chỉnh toàn bộ website du lịch Vietjet theo đúng các yêu cầu sau:
1. Công nghệ: HTML, CSS, JavaScript thuần (Vanilla JS), không dùng backend, cơ sở dữ liệu SQLite chạy trực tiếp trên trình duyệt bằng sql.js (WebAssembly) và đồng bộ vào localStorage.
2. Giao diện: Tone màu sáng, nền trắng tinh tế, màu chủ đạo là đỏ Vietjet (#ee1d23) và điểm nhấn vàng (#ffc709). Đảm bảo giao diện hiện đại, sạch đẹp, responsive trên cả Mobile và Desktop.
3. Tạo đầy đủ các trang và file mã nguồn:
   - css/variables.css, css/style.css, css/components.css, css/responsive.css
   - js/db.js (Khởi tạo SQLite, tạo bảng, seed data, hàm truy vấn), js/main.js
   - index.html & js/home.js (Tìm kiếm vé, 8 tour nổi bật ảnh 600x400, logo đối tác hàng không click lọc vé)
   - flights.html & js/flights.js (Bộ lọc đầy đủ bên trái, danh sách chuyến bay bên phải)
   - flight-detail.html & js/flight-detail.js (Chi tiết chuyến bay, loại máy bay, chọn vé Phổ thông/Thương gia, lưu giỏ hàng)
   - tours.html & js/tours.js (Bộ lọc tour bên trái, danh sách thẻ tour bên phải)
   - tour-detail.html & js/tour-detail.js (Lịch trình chi tiết các ngày, loại tàu bay, đặt tour lưu vào giỏ hàng)
   - cart.html & js/cart.js (Xem/xóa giỏ hàng, form thông tin khách hàng, đăng ký lưu vào bảng bookings SQLite, modal chúc mừng)

Hãy triển khai toàn bộ các file trên với mã nguồn hoàn thiện, không để mã nguồn dạng placeholder/todo!
```

---

## 🧩 CÁCH 2: CÁC CÂU LỆNH THEO TỪNG GIAI ĐOẠN (STEP-BY-STEP PROMPTS)

Nếu bạn muốn kiểm soát chất lượng và kiểm thử từng trang một, hãy gửi lần lượt các câu lệnh sau:

### Giai đoạn 1: Nền tảng CSS & SQLite Database
```text
Hãy thực hiện Giai đoạn 1 theo file TASK_LIST.md:
1. Tạo các file CSS: css/variables.css, css/style.css, css/components.css, css/responsive.css với màu chủ đạo #ee1d23, nền trắng sáng, chuẩn responsive.
2. Tạo file js/db.js nhúng sql.js qua CDN, tạo các bảng SQLite và nạp dữ liệu mẫu từ DATABASE_SCHEMA.md.
3. Tạo file js/main.js hỗ trợ cập nhật badge giỏ hàng và định dạng tiền tệ VNĐ.
```

### Giai đoạn 2: Xây dựng Trang Chủ (`index.html`)
```text
Hãy thực hiện Giai đoạn 2 theo file TASK_LIST.md:
Xây dựng trang chủ index.html và js/home.js bao gồm:
- Header thanh điều hướng, logo Vietjet, hotline và badge giỏ hàng.
- Khối tìm kiếm vé máy bay (khứ hồi/một chiều, chọn nơi đi/đến, ngày đi/về) -> Click "Tìm Kiếm" chuyển hướng sang flights.html.
- Khối 8 tour du lịch nổi bật từ SQLite với ảnh 600x400, tên hãng du lịch, số ngày đêm, giá tour màu đỏ -> Click mở chi tiết tour.
- Khối logo các hãng hàng không (VietJet, Vietnam Airlines, Singapore Airlines...) -> Click chuyển sang flights.html tự động lọc theo hãng.
- Footer đầy đủ thông tin.
```

### Giai đoạn 3: Xây dựng Trang Chuyến Bay (`flights.html`)
```text
Hãy thực hiện Giai đoạn 3 theo file TASK_LIST.md:
Xây dựng flights.html và js/flights.js:
- Cột bên trái: Bộ lọc sắp xếp giá tăng/giảm, loại vé khứ hồi/một chiều, bay thẳng/nhiều chặng, hãng hàng không, thời gian cất cánh, hạng vé Phổ thông/Thương gia.
- Cột bên phải: Danh sách thẻ chuyến bay lấy từ SQLite (lọc động theo bộ lọc và tham số URL), hiển thị giờ bay, hãng, giá tiền, dịch vụ. Click "Chọn Chuyến Bay" chuyển đến flight-detail.html?id=...
```

### Giai đoạn 4: Xây dựng Trang Chi Tiết Chuyến Bay (`flight-detail.html`)
```text
Hãy thực hiện Giai đoạn 4 theo file TASK_LIST.md:
Xây dựng flight-detail.html và js/flight-detail.js:
- Hiển thị đầy đủ thông tin chuyến bay: Điểm đi, điểm đến, thời gian bay, hãng bay, loại máy bay (Boeing, Airbus...).
- Khối chọn vé: Hạng Phổ Thông và Hạng Thương Gia với quyền lợi chi tiết và giá vé tương ứng.
- Khi bấm chọn vé: Lưu thông tin chuyến bay vào giỏ hàng (bảng cart trong SQLite), cập nhật badge giỏ hàng và hiển thị thông báo thành công.
```

### Giai đoạn 5: Xây dựng Trang Danh Sách Tour (`tours.html`)
```text
Hãy thực hiện Giai đoạn 5 theo file TASK_LIST.md:
Xây dựng tours.html và js/tours.js:
- Cột bên trái: Bộ lọc giá tour tăng/giảm, hãng hàng không đối tác, khung giờ khởi hành.
- Cột bên phải: Danh sách các thẻ tour lấy từ bảng tours trong SQLite, hiển thị ảnh 600x400, giá tiền, dịch vụ, hãng bay. Click vào tour dẫn đến tour-detail.html?id=...
```

### Giai đoạn 6: Xây dựng Trang Chi Tiết Tour (`tour-detail.html`)
```text
Hãy thực hiện Giai đoạn 6 theo file TASK_LIST.md:
Xây dựng tour-detail.html và js/tour-detail.js:
- Hiển thị thông tin tour: Điểm đi, điểm đến, thời gian, hãng bay, loại máy bay (Boeing/Airbus).
- Hiển thị Lịch trình chi tiết từng ngày (giải mã từ itinerary_json) dạng timeline trực quan đẹp mắt.
- Nút "Đặt Tour / Thêm Vào Giỏ Hàng" lưu tour vào bảng cart trong SQLite và chuyển hướng sang giỏ hàng.
```

### Giai đoạn 7: Xây dựng Trang Giỏ Hàng & Đăng Ký (`cart.html`)
```text
Hãy thực hiện Giai đoạn 7 theo file TASK_LIST.md:
Xây dựng cart.html và js/cart.js:
- Hiển thị bảng các chuyến bay và tour đã chọn từ SQLite, cho phép điều chỉnh số lượng hoặc xóa từng mục / xóa tất cả.
- Form nhập thông tin khách hàng (Họ tên, SĐT, Email, CCCD, Ghi chú) kèm kiểm tra dữ liệu hợp lệ.
- Nút "Xác Nhận Đăng Ký": Tạo mã đặt chỗ (PNR), lưu đơn hàng vào bảng bookings trong SQLite, làm trống giỏ hàng và bật Modal thông báo hoàn thành với đầy đủ thông tin xác nhận.
```

---

## 💡 GỢI Ý CÁC SLASH COMMAND TRONG ANTIGRAVITY

* **/plan**: Gõ `/plan` để cùng Antigravity rà soát lại các bước thực hiện trước khi sinh mã nguồn.
* **/boost**: Gõ `/boost` nếu bạn muốn Antigravity suy nghĩ kỹ lưỡng, tối ưu hiệu năng và xử lý toàn diện các trường hợp biên.
* **/goal**: Gõ `/goal` khi bạn muốn Antigravity tự động thực hiện xuyên suốt toàn bộ các file mà không dừng lại giữa chừng.
