# ✅ DANH SÁCH CÔNG VIỆC TRIỂN KHAI (TASK LIST & CHECKLIST)

Tài liệu này phân chia toàn bộ quá trình xây dựng website du lịch Vietjet thành từng giai đoạn cụ thể để Antigravity thực hiện một cách tuần tự, chính xác và dễ kiểm tra nghiệm thu.

---

## GIAI ĐOẠN 1: THIẾT LẬP NỀN TẢNG & CƠ SỞ DỮ LIỆU SQLITE (FOUNDATION)

- [ ] **Task 1.1: Tạo hệ thống CSS nền tảng**
  - [ ] Tạo file `css/variables.css`: Khai báo bảng màu `#ee1d23` (Đỏ chủ đạo), `#ffc709` (Vàng điểm nhấn), nền trắng sáng, shadow, radius, typography.
  - [ ] Tạo file `css/style.css`: Reset CSS, typography font tiếng Việt, cấu trúc khung Header, Navbar, Footer dùng chung.
  - [ ] Tạo file `css/components.css`: Nút bấm (Button đỏ/vàng/outline), ô nhập liệu (Input/Select), thẻ card (Flight card, Tour card), Badge giỏ hàng, Modal thông báo.
  - [ ] Tạo file `css/responsive.css`: Tối ưu hiển thị cho thiết bị Mobile (<768px), Tablet (768px-1024px) và Desktop.

- [ ] **Task 1.2: Thiết lập cơ sở dữ liệu SQLite phía trình duyệt (`js/db.js`)**
  - [ ] Nhúng thư viện `sql.js` (WebAssembly) qua CDN.
  - [ ] Khởi tạo 6 bảng SQLite theo tài liệu `DATABASE_SCHEMA.md`: `airlines`, `airports`, `flights`, `tours`, `cart`, `bookings`.
  - [ ] Chèn dữ liệu mẫu (Seed Data): Danh sách 6 hãng hàng không, danh sách sân bay, 8+ chuyến bay phong phú, 8 tour du lịch nổi bật (ảnh 600x400).
  - [ ] Xây dựng các hàm trợ giúp SQL: `dbQuery(sql, params)`, `dbExecute(sql, params)`, `saveDatabase()`, `loadDatabase()`.

- [ ] **Task 1.3: Xây dựng JavaScript dùng chung (`js/main.js`)**
  - [ ] Hàm định dạng tiền tệ VNĐ: `formatCurrency(amount)` (ví dụ: `1.250.000 ₫`).
  - [ ] Hàm cập nhật số lượng hiển thị trên Badge giỏ hàng ở Header: `updateCartBadge()`.
  - [ ] Xử lý menu điều hướng responsive trên Mobile.

---

## GIAI ĐOẠN 2: XÂY DỰNG TRANG CHỦ (`index.html` & `js/home.js`)

- [ ] **Task 2.1: Header & Hero Banner**
  - [ ] Hiển thị Logo Vietjet (`Images/vietjet-air.png`), menu liên kết các trang, Hotline hỗ trợ và giỏ hàng có badge.
  - [ ] Banner chào mừng phong cách tươi sáng, khẩu hiệu bay Vietjet ấn tượng.

- [ ] **Task 2.2: Khối Tìm Kiếm Chuyến Bay (Flight Search Widget)**
  - [ ] Nút chọn loại vé: "Khứ hồi" (mặc định) và "Một chiều" (chuyển đổi ẩn/hiện ô chọn Ngày về).
  - [ ] Dropdown Điểm xuất phát (HAN, SGN, DAD, CXR, PQC, SIN...) lấy từ bảng `airports`.
  - [ ] Dropdown Điểm đến tương ứng.
  - [ ] Ô chọn Ngày đi và Ngày về (HTML5 Date picker hoặc flatpickr).
  - [ ] Nút **"Tìm Kiếm Chuyến Bay"**: Lấy dữ liệu người dùng chọn, đóng gói query params và chuyển hướng sang `flights.html?from=...&to=...&type=...&departDate=...`.

- [ ] **Task 2.3: Khối 8 Tour Du Lịch Nổi Bật (Featured Tours)**
  - [ ] Truy vấn SQLite: `SELECT * FROM tours WHERE is_featured = 1 LIMIT 8`.
  - [ ] Hiển thị lưới 8 tour với thẻ ảnh chuẩn tỉ lệ **600x400 px**.
  - [ ] Thông tin trên mỗi thẻ: Tên tour, hãng lữ hành tổ chức, số ngày/đêm (ví dụ: *4N3Đ*), giá tiền nổi bật màu đỏ.
  - [ ] Click vào thẻ tour sẽ chuyển hướng sang trang chi tiết tour `tour-detail.html?id=...`.
  - [ ] Nút "Xem tất cả tour" dẫn đến `tours.html`.

- [ ] **Task 2.4: Khối Đối Tác Hàng Không (Airlines Section)**
  - [ ] Hiển thị logo/thương hiệu các hãng: VietJet Air, Vietnam Airlines, Singapore Airlines, Bamboo Airways, Qatar Airways, Emirates.
  - [ ] Bắt sự kiện click vào từng logo: Chuyển hướng ngay đến `flights.html?airline=VietJet` (hoặc tên hãng tương ứng).

- [ ] **Task 2.5: Chân trang (Footer)**
  - [ ] Thông tin bản quyền, chứng nhận, phương thức thanh toán, hotline chăm sóc khách hàng.

---

## GIAI ĐOẠN 3: XÂY DỰNG TRANG DANH SÁCH CHUYẾN BAY (`flights.html` & `js/flights.js`)

- [ ] **Task 3.1: Bộ lọc bên trái (Left Filter Sidebar)**
  - [ ] Bộ lọc sắp xếp giá: Tăng dần (Giá rẻ nhất trước), Giảm dần.
  - [ ] Loại vé: Khứ hồi, Một chiều.
  - [ ] Hình thức bay: Bay thẳng, Một điểm dừng, Nhiều thành phố.
  - [ ] Hãng hàng không: Danh sách checkbox các hãng bay (VietJet Air, Vietnam Airlines, Singapore Airlines...).
  - [ ] Thời gian cất cánh: Các khung giờ (Sáng sớm 00-06h, Buổi sáng 06-12h, Buổi chiều 12-18h, Buổi tối 18-24h).
  - [ ] Hạng dịch vụ: Hạng Phổ Thông, Hạng Thương Gia.
  - [ ] Nút "Đặt lại bộ lọc" (Reset Filters).

- [ ] **Task 3.2: Danh sách kết quả chuyến bay bên phải (Right Flight List)**
  - [ ] Đọc các tham số tìm kiếm từ URL (nếu có từ trang chủ).
  - [ ] Chạy câu truy vấn SQLite động theo các điều kiện lọc đang được người dùng chọn:
    ```sql
    SELECT f.*, a.name as airline_name, a.logo as airline_logo 
    FROM flights f 
    JOIN airlines a ON f.airline_id = a.id 
    WHERE ... ORDER BY ...
    ```
  - [ ] Hiển thị danh sách thẻ chuyến bay: Logo hãng, giờ đi - đến, thời gian bay, dịch vụ bao gồm (suất ăn, hành lý), mức giá hiển thị màu đỏ rõ ràng.
  - [ ] Nút "Chọn Chuyến Bay" trên từng thẻ: Dẫn sang `flight-detail.html?id=[flight_id]`.
  - [ ] Trạng thái rỗng: Thông báo thân thiện khi không tìm thấy chuyến bay phù hợp với bộ lọc.

---

## GIAI ĐOẠN 4: XÂY DỰNG TRANG CHI TIẾT CHUYẾN BAY (`flight-detail.html` & `js/flight-detail.js`)

- [ ] **Task 4.1: Tải dữ liệu chuyến bay**
  - [ ] Đọc tham số `?id=...` trên URL.
  - [ ] Truy vấn SQLite lấy thông tin chi tiết của chuyến bay và hãng bay.

- [ ] **Task 4.2: Hiển thị thông tin hành trình & phương tiện**
  - [ ] Tên sân bay đi, sân bay đến, thời gian cất cánh, hạ cánh, tổng thời lượng bay.
  - [ ] Tên hãng bay và loại máy bay chuyên chở (Airbus A321 Neo, Boeing 787-9...).

- [ ] **Task 4.3: Khối Chọn Hạng Vé & Giá (Ticket Class Selection)**
  - [ ] **Thẻ Hạng Phổ Thông (Economy Class):**
    - Mức giá cơ bản.
    - Danh sách quyền lợi chi tiết (Hành lý xách tay 7kg, ghế ngồi tiêu chuẩn...).
    - Nút "Chọn Hạng Phổ Thông".
  - [ ] **Thẻ Hạng Thương Gia (Business Class / SkyBoss):**
    - Mức giá thương gia cao cấp.
    - Danh sách quyền lợi VIP (Phòng chờ VIP, 30kg hành lý ký gửi, suất ăn nóng cao cấp, ưu tiên làm thủ tục & lên tàu bay).
    - Nút "Chọn Hạng Thương Gia".

- [ ] **Task 4.4: Xử lý Thêm Vào Giỏ Hàng**
  - [ ] Khi người dùng bấm chọn hạng vé tương ứng: Thêm chuyến bay kèm hạng vé vào bảng `cart` trong SQLite.
  - [ ] Cập nhật số lượng trên icon giỏ hàng ở Header.
  - [ ] Hiển thị thông báo Toast / Popup xác nhận: Cho phép người dùng chuyển thẳng tới `cart.html` hoặc tiếp tục tìm kiếm.

---

## GIAI ĐOẠN 5: XÂY DỰNG TRANG DANH SÁCH TOUR DU LỊCH (`tours.html` & `js/tours.js`)

- [ ] **Task 5.1: Bộ lọc bên trái (Left Tour Filter Sidebar)**
  - [ ] Lọc giá tour: Tăng dần / Giảm dần.
  - [ ] Hãng hàng không đồng hành: Checkbox chọn các hãng bay vận chuyển.
  - [ ] Thời gian cất cánh / khởi hành: Khung giờ trong ngày.
  - [ ] Nút đặt lại bộ lọc.

- [ ] **Task 5.2: Danh sách thẻ tour bên phải (Right Tour List)**
  - [ ] Truy vấn SQLite: Lấy danh sách tour từ bảng `tours` kết hợp điều kiện lọc.
  - [ ] Thẻ tour hiển thị: Ảnh bìa 600x400 px, tên tour, hãng bay đồng hành, ngày khởi hành, thời gian đi, giá tiền trọn gói, danh sách dịch vụ đi kèm.
  - [ ] Nút "Xem Chi Tiết": Chuyển hướng sang `tour-detail.html?id=[tour_id]`.

---

## GIAI ĐOẠN 6: XÂY DỰNG TRANG CHI TIẾT TOUR (`tour-detail.html` & `js/tour-detail.js`)

- [ ] **Task 6.1: Tải dữ liệu chi tiết tour**
  - [ ] Đọc tham số `?id=...` trên URL.
  - [ ] Truy vấn SQLite lấy thông tin tour: Điểm đi, điểm đến, thời lượng, hãng bay, loại máy bay (Boeing, Airbus...).

- [ ] **Task 6.2: Khối Hiển Thị Lịch Trình Chuyến Đi (Detailed Itinerary)**
  - [ ] Giải mã `itinerary_json` từ bảng `tours`.
  - [ ] Hiển thị dạng Timeline hoặc Accordion trực quan theo từng ngày (Ngày 1, Ngày 2, Ngày 3, Ngày 4...).
  - [ ] Mỗi ngày có tiêu đề hoạt động và mô tả chi tiết các địa danh tham quan, ẩm thực.

- [ ] **Task 6.3: Nút Chọn Tour & Thêm Vào Giỏ Hàng**
  - [ ] Nút bấm "Đặt Tour Ngay / Thêm Vào Giỏ Hàng" màu đỏ Vietjet nổi bật.
  - [ ] Thêm tour vào bảng `cart` trong SQLite.
  - [ ] Tự động chuyển hướng hoặc hiển thị nút đến trang `cart.html`.

---

## GIAI ĐOẠN 7: XÂY DỰNG TRANG GIỎ HÀNG & ĐĂNG KÝ (`cart.html` & `js/cart.js`)

- [ ] **Task 7.1: Bảng danh sách dịch vụ đã chọn**
  - [ ] Truy vấn toàn bộ mục từ bảng `cart` trong SQLite.
  - [ ] Hiển thị rõ ràng phân loại: [Chuyến bay] hoặc [Tour du lịch], hạng vé, ngày giờ bay, hãng hàng không, đơn giá, số lượng.
  - [ ] Chức năng tăng/giảm số lượng hành khách.
  - [ ] Nút "Xóa" từng mục riêng lẻ (xóa trong SQLite và cập nhật lại giao diện ngay lập tức).
  - [ ] Nút "Xóa toàn bộ giỏ hàng".
  - [ ] Tính tổng tiền thanh toán tạm tính tự động.

- [ ] **Task 7.2: Biểu mẫu nhập thông tin khách hàng**
  - [ ] Các trường nhập liệu: Họ và tên, Số điện thoại, Email, Số CMND/CCCD/Passport, Ghi chú yêu cầu đặc biệt.
  - [ ] Kiểm tra tính hợp lệ dữ liệu (Validate) ngay trên trình duyệt trước khi cho phép bấm Đăng ký.

- [ ] **Task 7.3: Xử lý Đăng Ký & Thông Báo Hoàn Thành**
  - [ ] Khi bấm nút "Xác Nhận Đăng Ký":
    1. Sinh mã đặt chỗ duy nhất (ví dụ: `VJ-XXXXXX`).
    2. Ghi bản ghi vào bảng `bookings` trong SQLite.
    3. Xóa sạch giỏ hàng trong bảng `cart`.
    4. Cập nhật Badge giỏ hàng về số 0.
  - [ ] Bật Modal / Popup "Chúc mừng đặt chỗ thành công!":
    - Biểu tượng tích xanh hoàn thành.
    - Mã đặt chỗ (PNR Code).
    - Tên khách hàng, email xác nhận, tổng tiền.
    - Hướng dẫn thanh toán và nút "Quay Lại Trang Chủ".

---

## GIAI ĐOẠN 8: KIỂM THỬ TỔNG THỂ & TINH CHỈNH GIAO DIỆN (TESTING & POLISHING)

- [ ] Kiểm tra toàn bộ luồng hoạt động từ Trang chủ $\rightarrow$ Lọc vé $\rightarrow$ Chi tiết $\rightarrow$ Giỏ hàng $\rightarrow$ Đặt chỗ thành công.
- [ ] Kiểm tra khả năng lưu trữ của SQLite trên `localStorage` khi F5 hoặc mở tab mới.
- [ ] Kiểm tra responsive trên các kích thước màn hình: Mobile (iPhone, Android), Tablet (iPad), Laptop và Desktop.
- [ ] Rà soát tông màu nhận diện: Nền trắng sáng, màu đỏ `#ee1d23`, điểm nhấn vàng `#ffc709`.
