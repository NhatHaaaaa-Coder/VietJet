# 📋 TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD) - WEBSITE DU LỊCH VIETJET

> **Tên dự án:** Website Đặt Vé & Tour Du Lịch Vietjet  
> **Ngôn ngữ:** HTML5, CSS3, JavaScript (ES6+ thuần - Vanilla JS, không sử dụng framework nặng)  
> **Backend:** Không có backend (Static Client-side Architecture)  
> **Cơ sở dữ liệu:** SQLite (vận hành trên trình duyệt thông qua WebAssembly `sql.js`, đồng bộ LocalStorage/IndexedDB)  
> **Tone & Mood:** Tông màu sáng, nền trắng tinh tế, sắc thái thương hiệu Vietjet (#ee1d23 - Đỏ chủ đạo kết hợp điểm nhấn Vàng #ffc709)

---

## 1. TỔNG QUAN DỰ ÁN

Mục tiêu xây dựng một nền tảng du lịch trực tuyến hiện đại, gọn nhẹ nhưng đầy đủ tiện ích đặt vé máy bay và tour du lịch. Nền tảng được thiết kế chạy hoàn toàn phía client (không cần máy chủ backend) nhưng vẫn có khả năng truy vấn, lọc dữ liệu động và lưu trữ giao dịch thông qua cơ sở dữ liệu SQLite nhúng trực tiếp trên trình duyệt bằng WebAssembly (`sql.js`).

---

## 2. HỆ THỐNG MÀU SẮC & GIAO DIỆN (DESIGN SYSTEM)

* **Màu chủ đạo (Primary Red):** `#ee1d23` (Đỏ Vietjet - biểu tượng của năng động, may mắn, nhiệt huyết)
* **Màu bổ trợ (Accent Yellow):** `#ffc709` (Vàng tươi - biểu tượng của sự tươi mới, ánh nắng mặt trời)
* **Nền giao diện (Background):** `#ffffff` (Trắng sáng) kết hợp nền phụ xám rất nhạt `#f8f9fa` cho các khối thẻ
* **Màu chữ (Typography):**
  * Tiêu đề: `#1e293b` (Slate tối, độ tương phản cao)
  * Nội dung thông thường: `#475569`
  * Chữ phụ / nhãn mờ: `#94a3b8`
* **Màu thành công (Success):** `#10b981` (Xanh lá)
* **Font chữ:** `Inter`, `Be Vietnam Pro` hoặc `Roboto` (sans-serif hiện đại, hỗ trợ tiếng Việt mượt mà)
* **Bo góc (Border Radius):** 8px - 12px (tạo cảm giác mềm mại, hiện đại)
* **Hiệu ứng đổ bóng (Box-shadow):** Đổ bóng mờ nhẹ (`0 4px 20px rgba(0, 0, 0, 0.06)`)

---

## 3. CÁC TRANG & CHỨC NĂNG CHI TIẾT

### 3.1. Trang Chủ (`index.html`)

#### A. Thanh điều hướng (Header / Navbar)
* Logo Vietjet (sử dụng file ảnh từ thư mục `Images/vietjet-air.png`).
* Menu điều hướng:
  * Trang Chủ (`index.html`)
  * Chuyến Bay (`flights.html`)
  * Tour Du Lịch (`tours.html`)
  * Giỏ Hàng (`cart.html`) kèm badge hiển thị số lượng vé/tour đã chọn.
* Hotline hỗ trợ nhanh (1900 1886) & chuyển đổi ngôn ngữ (VI/EN).

#### B. Khối Tìm Kiếm Vé Máy Bay (Hero Search Widget)
* Đặt nổi bật ngay đầu trang trên nền banner phong cảnh du lịch sống động.
* Tùy chọn loại vé: **Khứ hồi** (Round-trip) hoặc **Một chiều** (One-way) (radio/tab toggle).
* Các trường nhập liệu:
  * **Điểm xuất phát:** Dropdown danh sách sân bay (Hà Nội - HAN, TP. Hồ Chí Minh - SGN, Đà Nẵng - DAD, Nha Trang - CXR, Phú Quốc - PQC, Singapore - SIN, Tokyo - NRT, v.v.).
  * **Điểm đến:** Dropdown danh sách sân bay tương ứng.
  * **Ngày đi:** Trình chọn ngày (Datepicker) - mặc định ngày hôm nay hoặc ngày mai.
  * **Ngày về:** Trình chọn ngày (tự động khóa nếu chọn Một chiều, mở khi chọn Khứ hồi).
  * **Số lượng hành khách:** Người lớn, Trẻ em, Em bé.
* Nút **"Tìm Kiếm Chuyến Bay"**: Khi click sẽ điều hướng sang `flights.html` kèm các tham số truy vấn trên URL (Query Parameters: `?from=...&to=...&type=...&departDate=...`).

#### C. Khối Tour Du Lịch Nổi Bật (Featured Tours)
* Tiêu đề: "Tour Du Lịch Hấp Dẫn Nhất".
* Hiển thị lưới **8 tour du lịch nổi bật nhất**:
  * Hình ảnh thumbnail tỉ lệ tiêu chuẩn **600x400 px**.
  * Tên tour và điểm đến.
  * Tên hãng lữ hành tổ chức (Vietjet Travel, Saigontourist, Vietravel, v.v.).
  * Thời lượng tour: Số ngày / số đêm (ví dụ: *4 Ngày 3 Đêm*, *3 Ngày 2 Đêm*).
  * Giá tour hiển thị dạng VNĐ rõ ràng (ví dụ: *4.990.000 ₫*).
  * Nút "Xem Chi Tiết" hoặc click trực tiếp vào thẻ tour sẽ chuyển sang trang `tour-detail.html?id=...` hoặc trang danh sách tour `tours.html`.

#### D. Khối Đối Tác Hàng Không (Partner Airlines)
* Tiêu đề: "Các Hãng Hàng Không Đồng Hành".
* Hiển thị logo/thẻ của các hãng bay lớn:
  * **VietJet Air**
  * **Vietnam Airlines**
  * **Singapore Airlines**
  * **Bamboo Airways**
  * **Qatar Airways**
  * **Emirates**
* Mỗi logo khi người dùng click vào sẽ chuyển hướng đến trang `flights.html?airline=Vietjet` (hoặc tên hãng tương ứng) để tự động lọc chuyến bay của hãng đó.

#### E. Chân trang (Footer)
* Thông tin liên hệ, bản quyền Vietjet, liên kết mạng xã hội, phương thức thanh toán an toàn.

---

### 3.2. Trang Danh Sách Chuyến Bay (`flights.html`)

Bố cục 2 cột tiêu chuẩn của trang OTA (Online Travel Agency):

#### Cột Trái: Bộ Lọc (Filter Sidebar)
* **Sắp xếp theo giá:** Tăng dần (Ascending) / Giảm dần (Descending).
* **Loại chuyến bay:** Khứ hồi, Một chiều.
* **Hình thức bay:** Bay thẳng (Direct flight), Một điểm dừng, Nhiều thành phố.
* **Hãng hàng không:** Checkbox chọn nhiều hãng (VietJet Air, Vietnam Airlines, Singapore Airlines, v.v.).
* **Thời gian cất cánh (Giờ trong ngày):**
  * Sáng sớm (00:00 - 06:00)
  * Buổi sáng (06:00 - 12:00)
  * Buổi chiều (12:00 - 18:00)
  * Buổi tối (18:00 - 24:00)
  * Hoặc thanh trượt phạm vi giờ (Range Slider).
* **Hạng dịch vụ:** Hạng Phổ Thông (Economy), Hạng Thương Gia (Business).
* Nút "Đặt lại bộ lọc" (Reset filter).

#### Cột Phải: Danh Sách Kết Quả Chuyến Bay (Flight Cards)
* Hiển thị số lượng chuyến bay tìm thấy theo điều kiện lọc.
* Mỗi thẻ chuyến bay bao gồm:
  * Logo và tên hãng hàng không.
  * Giờ cất cánh - Giờ hạ cánh, mã sân bay đi/đến.
  * Tổng thời gian bay (ví dụ: *2h 10m*), loại hình bay (Bay thẳng).
  * Các dịch vụ đi kèm (Hành lý xách tay 7kg, suất ăn nhẹ, giải trí...).
  * Mức giá khởi điểm từ thấp nhất.
  * Nút **"Chọn Chuyến Bay"**: Dẫn sang trang Chi tiết chuyến bay (`flight-detail.html?id=...`).

---

### 3.3. Trang Chi Tiết Chuyến Bay (`flight-detail.html`)

Hiển thị toàn bộ thông tin chi tiết của chuyến bay được chọn:
* **Hành trình:** Điểm đi (Mã sân bay & Tên đầy đủ) $\rightarrow$ Điểm đến.
* **Lịch trình bay:** Ngày giờ cất cánh, ngày giờ hạ cánh, thời gian bay dự kiến.
* **Hãng bay & Phương tiện:** Tên hãng, mã số hiệu chuyến bay (ví dụ: VJ-152), loại máy bay chuyên chở (Airbus A321 Neo, Boeing 787-9 Dreamliner, Airbus A350...).
* **Bảng Chọn Hạng Vé & Giá (Ticket Class Selection):**
  * **Hạng Phổ Thông (Economy Class):**
    * Giá vé cơ bản.
    * Quyền lợi: Hành lý xách tay 7kg, ghế ngồi tiêu chuẩn, thay đổi vé có thu phí.
    * Nút "Chọn Hạng Phổ Thông".
  * **Hạng Thương Gia (Business / SkyBoss Class):**
    * Giá vé cao cấp.
    * Quyền lợi: Phòng chờ hạng thương gia VIP, ưu tiên làm thủ tục, hành lý xách tay 10-14kg + 30kg ký gửi, suất ăn nóng cao cấp miễn phí, ghế ngả rộng rãi, miễn phí đổi ngày giờ bay.
    * Nút "Chọn Hạng Thương Gia".
* **Hành động:** Khi bấm chọn hạng vé, thông tin chuyến bay kèm hạng vé và giá tiền tương ứng sẽ được lưu vào **Giỏ Hàng** (Cart trong SQLite / LocalStorage), hiển thị thông báo "Đã thêm vào giỏ hàng thành công!" kèm nút chuyển tới Giỏ hàng hoặc tiếp tục tìm vé.

---

### 3.4. Trang Danh Sách Tour (`tours.html`)

Bố cục 2 cột tương đồng:

#### Cột Trái: Bộ Lọc Tour (Tour Filter Sidebar)
* **Sắp xếp giá:** Tăng dần / Giảm dần.
* **Hãng hàng không vận chuyển:** Checkbox chọn hãng bay liên kết trong tour.
* **Thời gian cất cánh / Khởi hành:** Các khung giờ khởi hành trong ngày.
* **Thời lượng tour:** 3N2Đ, 4N3Đ, 5N4Đ, v.v.

#### Cột Phải: Danh Sách Thẻ Tour (Tour Cards)
* Hiển thị lưới/danh sách các tour:
  * Ảnh đại diện tour (600x400 px).
  * Tiêu đề tour, địa điểm đến.
  * Hãng bay đối tác đồng hành (VietJet Air, Vietnam Airlines...).
  * Ngày khởi hành định kỳ.
  * Thời gian di chuyển & thời lượng tour.
  * Giá tour trọn gói / khách.
  * Các dịch vụ bao gồm: Vé máy bay khứ hồi, khách sạn 4-5 sao, xe đưa đón, bảo hiểm du lịch.
  * Nút **"Xem Tour"**: Dẫn sang trang Chi tiết tour (`tour-detail.html?id=...`).

---

### 3.5. Trang Chi Tiết Tour (`tour-detail.html`)

* **Thông tin chuyến đi:**
  * Điểm đi, điểm đến.
  * Thời gian chuyến đi (Số ngày / số đêm).
  * Hãng bay vận chuyển, loại máy bay (Boeing, Airbus...).
* **Lịch trình chi tiết từng ngày (Detailed Itinerary Accordion/Timeline):**
  * *Ngày 1:* Đón đoàn tại sân bay, khởi hành, nhận phòng khách sạn, tham quan địa danh A...
  * *Ngày 2:* Khám phá danh lam thắng cảnh B, thưởng thức ẩm thực địa phương...
  * *Ngày 3:* Trải nghiệm văn hóa, tắm biển / vui chơi tự do...
  * *Ngày 4:* Mua sắm đặc sản, tiễn đoàn ra sân bay về lại điểm xuất phát.
* **Chính sách tour:** Bao gồm, không bao gồm, quy định hủy đổi.
* **Nút "Đặt Tour / Thêm Vào Giỏ Hàng":** Lưu tour vào Giỏ Hàng và điều hướng đến trang `cart.html`.

---

### 3.6. Trang Giỏ Hàng & Đăng Ký Đặt Chỗ (`cart.html`)

#### A. Danh Sách Dịch Vụ Đã Chọn
* Bảng hiển thị danh sách các Chuyến bay và Tour đã thêm vào giỏ:
  * Tên dịch vụ (Chuyến bay / Tour).
  * Chi tiết: Ngày giờ, hạng vé/thời lượng, hãng hàng không.
  * Đơn giá và số lượng hành khách (có thể tăng giảm).
  * Thành tiền.
  * Nút "Xóa" từng mục hoặc nút "Xóa tất cả giỏ hàng".
* Tổng tiền thanh toán dự tính.

#### B. Biểu Mẫu Nhập Thông Tin Khách Hàng (Customer Form)
* Họ và tên người liên hệ.
* Số điện thoại liên hệ (có xác thực định dạng số điện thoại Việt Nam).
* Địa chỉ Email nhận vé điện tử/xác nhận tour.
* Số CCCD / Hộ chiếu.
* Ghi chú đặc biệt (yêu cầu suất ăn chay, ghế ngồi gần cửa sổ, v.v.).
* Phương thức thanh toán (Mô phỏng: Chuyển khoản VietQR, Thẻ ATM/Visa, Thanh toán tại phòng vé).

#### C. Hành Động Đăng Ký & Thông Báo Hoàn Thành
* Nút **"Xác Nhận Đăng Ký & Đặt Chỗ"**.
* Khi bấm:
  1. Kiểm tra tính hợp lệ của dữ liệu đầu vào.
  2. Tạo mã đặt chỗ ngẫu nhiên (Mã PNR: ví dụ `VJ-892461`).
  3. Ghi dữ liệu đơn hàng vào bảng `bookings` trong cơ sở dữ liệu SQLite.
  4. Xóa trắng giỏ hàng.
  5. Hiển thị Popup / Modal thông báo:
     * Icon thành công màu xanh lá.
     * Tiêu đề: **"Chúc mừng! Đặt chỗ thành công"**.
     * Mã đặt chỗ, tổng số tiền, email xác nhận.
     * Hướng dẫn thanh toán và nút "Về Trang Chủ".
