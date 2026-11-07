# 🗄️ THIẾT KẾ CƠ SỞ DỮ LIỆU SQLITE (DATABASE SCHEMA)

Dự án sử dụng **SQLite** thuần trên trình duyệt thông qua thư viện **`sql.js` (SQLite biên dịch sang WebAssembly)**.  
Giải pháp này cho phép:
* Chạy hoàn toàn 100% Client-side (không cần cài đặt Node.js hay máy chủ backend Python/PHP).
* Sử dụng cú pháp SQL chuẩn (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, `ORDER BY`, `WHERE`).
* Lưu trữ và đồng bộ trạng thái cơ sở dữ liệu (Database Binary) vào `localStorage` hoặc `IndexedDB` để dữ liệu giỏ hàng và đơn đặt chỗ không bị mất khi F5 tải lại trang.

---

## 1. THIẾT KẾ BẢNG DỮ LIỆU (DATABASE TABLES)

### 1.1. Bảng Hãng Hàng Không (`airlines`)
Lưu thông tin các hãng bay đối tác hiển thị trên trang chủ và dùng cho bộ lọc:
```sql
CREATE TABLE IF NOT EXISTS airlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,       -- Ví dụ: 'VJ', 'VN', 'SQ', 'QH'
    name TEXT NOT NULL,              -- 'VietJet Air', 'Vietnam Airlines', 'Singapore Airlines'
    logo TEXT NOT NULL,              -- Đường dẫn file ảnh logo hoặc SVG
    country TEXT DEFAULT 'Việt Nam'
);
```

### 1.2. Bảng Sân Bay / Thành Phố (`airports`)
```sql
CREATE TABLE IF NOT EXISTS airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,       -- 'HAN', 'SGN', 'DAD', 'CXR', 'PQC', 'SIN'
    name TEXT NOT NULL,              -- 'Sân bay Quốc tế Nội Bài'
    city TEXT NOT NULL               -- 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'
);
```

### 1.3. Bảng Chuyến Bay (`flights`)
Lưu danh sách chuyến bay cho trang Tìm Kiếm & Chi Tiết Chuyến Bay:
```sql
CREATE TABLE IF NOT EXISTS flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_number TEXT NOT NULL,      -- Ví dụ: 'VJ-152', 'VN-240'
    airline_id INTEGER NOT NULL,      -- Khóa ngoại liên kết bảng airlines
    departure_code TEXT NOT NULL,     -- Sân bay đi (HAN, SGN...)
    arrival_code TEXT NOT NULL,       -- Sân bay đến
    departure_time TEXT NOT NULL,     -- '06:15'
    arrival_time TEXT NOT NULL,       -- '08:25'
    flight_date TEXT NOT NULL,        -- '2026-11-15' (YYYY-MM-DD)
    duration TEXT NOT NULL,           -- '2h 10m'
    duration_minutes INTEGER,         -- 130 (dùng để lọc và sắp xếp)
    aircraft_type TEXT NOT NULL,      -- 'Airbus A321 Neo', 'Boeing 787-9'
    is_direct INTEGER DEFAULT 1,      -- 1: Bay thẳng, 0: Quá cảnh / Nhiều chặng
    price_economy REAL NOT NULL,      -- Giá vé Hạng Phổ Thông (ví dụ: 1250000)
    price_business REAL NOT NULL,     -- Giá vé Hạng Thương Gia (ví dụ: 3650000)
    services_economy TEXT,            -- 'Hành lý xách tay 7kg, Nước lọc'
    services_business TEXT,           -- 'Hành lý xách tay 14kg + 30kg ký gửi, Phòng chờ VIP, Suất ăn nóng, Ưu tiên làm thủ tục'
    FOREIGN KEY (airline_id) REFERENCES airlines(id)
);
```

### 1.4. Bảng Tour Du Lịch (`tours`)
Lưu danh sách 8 tour du lịch nổi bật và danh sách tour du lịch:
```sql
CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,              -- 'Khám Phá Thiên Đường Đảo Ngọc Phú Quốc'
    departure_point TEXT NOT NULL,    -- 'Hà Nội' hoặc 'TP. Hồ Chí Minh'
    destination TEXT NOT NULL,        -- 'Phú Quốc', 'Đà Nẵng', 'Thái Lan'...
    duration_days INTEGER NOT NULL,   -- 4
    duration_nights INTEGER NOT NULL, -- 3
    duration_text TEXT NOT NULL,      -- '4 Ngày 3 Đêm'
    price REAL NOT NULL,              -- 4990000
    agency TEXT NOT NULL,             -- 'Vietjet Travel', 'Saigontourist'
    airline_id INTEGER,               -- Hãng bay vận chuyển
    departure_time TEXT NOT NULL,     -- '07:30'
    aircraft_type TEXT NOT NULL,      -- 'Airbus A321'
    thumbnail TEXT NOT NULL,          -- Đường dẫn ảnh kích thước 600x400
    services TEXT NOT NULL,           -- 'Vé máy bay khứ hồi, Khách sạn 4*, Xe đưa đón, Bữa ăn theo chương trình, Bảo hiểm'
    itinerary_json TEXT NOT NULL,     -- JSON mảng các ngày: [{"day": 1, "title": "...", "content": "..."}, ...]
    is_featured INTEGER DEFAULT 1,    -- 1: Tour nổi bật trang chủ (8 tour)
    FOREIGN KEY (airline_id) REFERENCES airlines(id)
);
```

### 1.5. Bảng Giỏ Hàng (`cart`)
Lưu tạm các chuyến bay và tour khách hàng đã chọn:
```sql
CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,          -- 'flight' hoặc 'tour'
    item_id INTEGER NOT NULL,         -- ID từ bảng flights hoặc tours
    title TEXT NOT NULL,              -- Tiêu đề vé / tour
    ticket_class TEXT,                -- 'Hạng Phổ Thông' hoặc 'Hạng Thương Gia'
    unit_price REAL NOT NULL,         -- Đơn giá
    quantity INTEGER DEFAULT 1,       -- Số lượng hành khách
    details_json TEXT NOT NULL,       -- Chi tiết chuyến đi (giờ bay, ngày đi, hãng)
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 1.6. Bảng Đơn Đặt Chỗ (`bookings`)
Lưu thông tin khách hàng đăng ký sau khi xác nhận thanh toán giỏ hàng:
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,-- Mã đặt chỗ ngẫu nhiên: 'VJ-892461'
    customer_name TEXT NOT NULL,      -- Họ tên
    customer_phone TEXT NOT NULL,     -- Số điện thoại
    customer_email TEXT NOT NULL,     -- Email
    customer_id_card TEXT,            -- Số CMND/CCCD/Passport
    note TEXT,                        -- Yêu cầu thêm
    total_amount REAL NOT NULL,       -- Tổng tiền thanh toán
    items_json TEXT NOT NULL,         -- JSON danh sách các mục đã đặt
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Đã xác nhận'
);
```

---

## 2. KỊCH BẢN DỮ LIỆU KHỞI TẠO (SEED DATA)

```sql
-- Dữ liệu Hãng Hàng Không
INSERT INTO airlines (id, code, name, logo, country) VALUES
(1, 'VJ', 'VietJet Air', 'Images/vietjet-air.png', 'Việt Nam'),
(2, 'VN', 'Vietnam Airlines', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=100&h=100&fit=crop', 'Việt Nam'),
(3, 'SQ', 'Singapore Airlines', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=100&h=100&fit=crop', 'Singapore'),
(4, 'QH', 'Bamboo Airways', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&h=100&fit=crop', 'Việt Nam'),
(5, 'QR', 'Qatar Airways', 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e91f?w=100&h=100&fit=crop', 'Qatar'),
(6, 'EK', 'Emirates', 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=100&h=100&fit=crop', 'UAE');

-- Dữ liệu Sân Bay
INSERT INTO airports (code, name, city) VALUES
('HAN', 'Sân bay Quốc tế Nội Bài', 'Hà Nội'),
('SGN', 'Sân bay Quốc tế Tân Sơn Nhất', 'TP. Hồ Chí Minh'),
('DAD', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng'),
('CXR', 'Sân bay Quốc tế Cam Ranh', 'Nha Trang'),
('PQC', 'Sân bay Quốc tế Phú Quốc', 'Phú Quốc'),
('SIN', 'Sân bay Changi Singapore', 'Singapore');

-- Dữ liệu Chuyến Bay mẫu
INSERT INTO flights (flight_number, airline_id, departure_code, arrival_code, departure_time, arrival_time, flight_date, duration, duration_minutes, aircraft_type, is_direct, price_economy, price_business, services_economy, services_business) VALUES
('VJ-152', 1, 'HAN', 'SGN', '06:15', '08:25', '2026-11-15', '2h 10m', 130, 'Airbus A321 Neo', 1, 1250000, 3450000, 'Hành lý xách tay 7kg, Nước uống', 'Phòng chờ VIP SkyBoss, 30kg ký gửi, Suất ăn nóng, Ưu tiên làm thủ tục'),
('VJ-180', 1, 'HAN', 'SGN', '09:30', '11:45', '2026-11-15', '2h 15m', 135, 'Airbus A330', 1, 1450000, 3650000, 'Hành lý xách tay 7kg, Nước uống', 'Phòng chờ VIP SkyBoss, 30kg ký gửi, Suất ăn nóng, Ưu tiên làm thủ tục'),
('VN-240', 2, 'HAN', 'SGN', '07:00', '09:10', '2026-11-15', '2h 10m', 130, 'Boeing 787-9 Dreamliner', 1, 1950000, 4850000, 'Hành lý 12kg xách tay, 23kg ký gửi, Suất ăn nhẹ', 'Phòng chờ Bông Sen, 32kg ký gửi, Ghế ngả phẳng 180 độ, Ẩm thực 4 sao'),
('QH-204', 4, 'HAN', 'SGN', '14:20', '16:30', '2026-11-15', '2h 10m', 130, 'Boeing 787-9', 1, 1380000, 3500000, 'Hành lý xách tay 7kg, Nước uống', 'Phòng thương gia First Lounge, Ưu tiên quầy thủ tục'),
('VJ-320', 1, 'HAN', 'DAD', '08:00', '09:20', '2026-11-15', '1h 20m', 80, 'Airbus A320', 1, 890000, 2450000, 'Hành lý xách tay 7kg', 'Phòng chờ SkyBoss, Suất ăn nóng, 30kg ký gửi'),
('VN-160', 2, 'SGN', 'PQC', '10:15', '11:20', '2026-11-15', '1h 05m', 65, 'Airbus A321', 1, 1150000, 2890000, 'Hành lý xách tay 12kg, 23kg ký gửi', 'Phòng chờ Thương gia, Ưu tiên lên tàu bay'),
('SQ-173', 3, 'HAN', 'SIN', '12:35', '17:15', '2026-11-15', '3h 40m', 220, 'Boeing 787-10', 1, 3850000, 8900000, 'Hành lý 25kg, Bữa ăn chuẩn 5 sao quốc tế', 'Khoang thương gia 5 sao, Rượu vang thượng hạng, Màn hình 18-inch'),
('VJ-881', 1, 'SGN', 'SIN', '15:10', '18:15', '2026-11-15', '2h 05m', 125, 'Airbus A321 Neo', 1, 1890000, 4200000, 'Hành lý xách tay 7kg', 'SkyBoss Business, Ghế bọc da êm ái, Suất ăn nóng');

-- Dữ liệu 8 Tour Du Lịch Nổi Bật (Thumbnail 600x400)
INSERT INTO tours (id, title, departure_point, destination, duration_days, duration_nights, duration_text, price, agency, airline_id, departure_time, aircraft_type, thumbnail, services, itinerary_json, is_featured) VALUES
(1, 'Tour Phú Quốc - Đảo Ngọc Nghỉ Dưỡng Grand World & Sunset Town', 'Hà Nội', 'Phú Quốc', 4, 3, '4 Ngày 3 Đêm', 5490000, 'Vietjet Holidays', 1, '06:30', 'Airbus A321', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi VietJet, Khách sạn 4 sao, Xe du lịch đưa đón, Vé Grand World', '[{"day":1,"title":"Hà Nội - Đảo Ngọc Phú Quốc - Sunset Town","content":"Đón đoàn tại sân bay Nội Bài, đáp chuyến bay đến Phú Quốc. Check-in thị trấn Hoàng Hôn Sunset Town, ngắm Cầu Hôn."},{"day":2,"title":"Khám Phá Grand World - Tinh Hoa Việt Nam","content":"Tham quan kênh đào Venice phiên bản Việt, bảo tàng Gấu Teddy, xem show thực cảnh Tinh Hoa Việt Nam rực rỡ."},{"day":3,"title":"Tour Canô 4 Đảo - Lặn Ngắm San Hô Tự Nhiên","content":"Trải nghiệm canô cao tốc khám phá Hòn Mây Rút, Hòn Gầm Ghì, lặn ngắm rạn san hô đa sắc màu."},{"day":4,"title":"Chợ Dương Đông - Tạm Biệt Phú Quốc - Hà Nội","content":"Mua sắm hồ tiêu, nước mắm truyền thống, ngọc trai. Xe đưa đoàn ra sân bay về lại Hà Nội."}]', 1),

(2, 'Tour Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng Huyền Thoại', 'TP. Hồ Chí Minh', 'Đà Nẵng', 3, 2, '3 Ngày 2 Đêm', 4290000, 'Vietjet Holidays', 1, '07:15', 'Airbus A320', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi, Khách sạn 4* biển Mỹ Khê, Vé cáp treo Bà Nà Hills, Ăn buffet', '[{"day":1,"title":"TP.HCM - Đà Nẵng - Phố Cổ Hội An Lung Linh","content":"Bay đến Đà Nẵng, viếng Chùa Linh Ứng Bán Đảo Sơn Trà. Chiều tối dạo bộ phố cổ Hội An thả hoa đăng sông Hoài."},{"day":2,"title":"Bà Nà Hills - Cầu Vàng - Fantasy Park","content":"Trải nghiệm cáp treo đạt kỷ lục thế giới, check-in Cầu Vàng trên mây, vui chơi Fantasy Park."},{"day":3,"title":"Bãi Biển Mỹ Khê - Chợ Hàn - TP.HCM","content":"Tắm biển Mỹ Khê đón bình minh, mua sắm đặc sản Chợ Hàn. Tiễn sân bay Đà Nẵng về lại TP.HCM."}]', 1),

(3, 'Tour Nha Trang - Vịnh San Hô - VinWonders Đẳng Cấp', 'Hà Nội', 'Nha Trang', 4, 3, '4 Ngày 3 Đêm', 4890000, 'Saigontourist', 2, '08:00', 'Airbus A321', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi, Khách sạn trung tâm đường Trần Phú, Cano Vịnh Nha Trang', '[{"day":1,"title":"Hà Nội - Cam Ranh - Nha Trang Phố Biển","content":"Đáp sân bay Cam Ranh, xe đưa đoàn về khách sạn nhận phòng nghỉ ngơi. Tham quan Tháp Bà Ponagar."},{"day":2,"title":"Du Ngoạn Vịnh Biển - Vịnh San Hô - Làng Chài","content":"Lên tàu cao tốc khám phá Vịnh San Hô, tắm biển nước trong vắt, thưởng thức hải sản tại Làng Chài."},{"day":3,"title":"Thiên Đường Giải Trí VinWonders Hòn Tre","content":"Cả ngày vui chơi bất tận tại công viên nước, vịnh phao nổi, thủy cung hiện đại bậc nhất."},{"day":4,"title":"Tắm Bùn Khoáng I-Resort - Tiễn Sân Bay","content":"Thư giãn ngâm khoáng nóng tái tạo năng lượng, xe đưa ra sân bay Cam Ranh kết thúc chuyến đi."}]', 1),

(4, 'Tour Đà Lạt - Xứ Sở Sương Mù & Vườn Hoa Cẩm Tú Cầu', 'TP. Hồ Chí Minh', 'Đà Lạt', 3, 2, '3 Ngày 2 Đêm', 3290000, 'Vietravel', 1, '06:45', 'Airbus A320', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop', 'Vé máy bay VietJet, Khách sạn boutique ngắm thung lũng, Xe máy/xe ô tô du lịch', '[{"day":1,"title":"TP.HCM - Liên Khương - Check-in Đà Lạt Mộng Mơ","content":"Bay đến Liên Khương, ghé Thung Lũng Đèn, Quảng trường Lâm Viên ngắm Hồ Xuân Hương thơ mộng."},{"day":2,"title":"Đồi Chè Cầu Đất - Vườn Cẩm Tú Cầu - Puppy Farm","content":"Săn mây Cầu Đất lúc bình minh, chụp ảnh tại cánh đồng hoa cẩm tú cầu, chơi cùng đàn cún Puppy Farm."},{"day":3,"title":"Chợ Đà Lạt - Dinh Bảo Đại - Về TP.HCM","content":"Thưởng thức sữa đậu nành, bánh tráng nướng chợ Đà Lạt, mua mứt Atiso, tiễn đoàn về TP.HCM."}]', 1),

(5, 'Tour Hà Nội - Hạ Long - Du Thuyền 5 Sao Vịnh Di Sản', 'TP. Hồ Chí Minh', 'Hạ Long', 4, 3, '4 Ngày 3 Đêm', 6990000, 'Vietjet Holidays', 2, '07:30', 'Boeing 787', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi Vietnam Airlines, 1 đêm Du thuyền 5 sao, 2 đêm khách sạn Hà Nội', '[{"day":1,"title":"TP.HCM - Hà Nội 36 Phố Phường","content":"Khám phá Hồ Gươm, Nhà hát Lớn, thưởng thức cà phê trứng và phở gia truyền Hà Nội."},{"day":2,"title":"Hà Nội - Vịnh Hạ Long - Nghỉ Dưỡng Du Thuyền","content":"Lên du thuyền 5 sao, thưởng thức buffet hải sản, chèo thuyền kayak qua hang Luồn."},{"day":3,"title":"Hang Sửng Sốt - Đảo Ti Tốp - Hà Nội","content":"Chiêm ngưỡng nhũ đá hang Sửng Sốt, leo đỉnh Ti Tốp ngắm toàn cảnh Vịnh, quay về thủ đô."},{"day":4,"title":"Chùa Một Cột - Lăng Bác - TP.HCM","content":"Viếng Lăng Bác, Văn Miếu Quốc Tử Giám, xe tiễn sân bay Nội Bài về TP.HCM."}]', 1),

(6, 'Tour Bangkok - Pattaya - Thái Lan Thiên Đường Mua Sắm', 'Hà Nội', 'Bangkok', 5, 4, '5 Ngày 4 Đêm', 6590000, 'Vietjet Travel', 1, '09:00', 'Airbus A321 Neo', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi quốc tế Vietjet, Khách sạn 4-5 sao, Buffet baiyoke sky 86 tầng', '[{"day":1,"title":"Hà Nội - Bangkok - Thành Phố Pattaya","content":"Bay thẳng sang sân bay Suvarnabhumi, di chuyển về Pattaya, thưởng thức ẩm thực đêm Walking Street."},{"day":2,"title":"Đảo San Hô Coral Island - Trân Bảo Phật Sơn","content":"Tắm biển đảo Coral, viếng núi Phật Vàng khắc bằng tia laser 24k ấn tượng."},{"day":3,"title":"Pattaya - Bangkok - Du Thuyền Sông Chaophraya","content":"Trở lại Bangkok, ngắm hoàng hôn và dùng tiệc buffet quốc tế trên du thuyền Chaophraya Princess."},{"day":4,"title":"Chùa Phật Vàng Wat Traimit - Shopping Siam Paragon","content":"Viếng tượng Phật vàng nguyên khối nặng 5.5 tấn, thỏa sức mua sắm tại IconSiam và Big C."},{"day":5,"title":"Bangkok - Hà Nội","content":"Dạo chợ nổi Bốn Miền, xe đưa ra sân bay trở về Việt Nam an toàn."}]', 1),

(7, 'Tour Singapore - Malaysia 2 Quốc Gia 1 Hành Trình', 'TP. Hồ Chí Minh', 'Singapore', 5, 4, '5 Ngày 4 Đêm', 9890000, 'Vietravel', 3, '08:45', 'Boeing 787-10', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop', 'Bay Singapore Airlines 5 sao, Thác nước Jewel Changi, Động Batu, Tháp đôi Petronas', '[{"day":1,"title":"TP.HCM - Singapore - Gardens By The Bay","content":"Đáp Changi, chiêm ngưỡng siêu cây nhân tạo và nhà kính Flower Dome tại Vịnh Marina."},{"day":2,"title":"Đảo Sentosa - Thành Phố Cổ Malacca Malaysia","content":"Chụp hình Quả Cầu Universal Sentosa, di chuyển qua cửa khẩu đến thành phố di sản Malacca."},{"day":3,"title":"Malacca - Thủ Đô Kuala Lumpur - Tháp Đôi","content":"Khám phá Quảng trường Hà Lan, Pháo đài cổ Famosa, chụp hình Tháp đôi Petronas Twin Towers."},{"day":4,"title":"Động Batu - Cao Nguyên Genting Mát Lạnh","content":"Chinh phục 272 bậc thang rực rỡ Động Batu, đi cáp treo lên khu phức hợp giải trí Genting."},{"day":5,"title":"Kuala Lumpur - TP.HCM","content":"Tự do mua sắm tại Pavilion Mall, xe đưa ra sân bay quốc tế KLIA về TP.HCM."}]', 1),

(8, 'Tour Quy Nhơn - Kỳ Co - Eo Gió - Nơi Ngắm Hoàng Hôn Đẹp Nhất', 'Hà Nội', 'Quy Nhơn', 3, 2, '3 Ngày 2 Đêm', 3890000, 'Vietjet Holidays', 1, '10:00', 'Airbus A320', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 'Vé máy bay VietJet khứ hồi, Khách sạn 4* FLC Quy Nhơn, Cano đảo Kỳ Co', '[{"day":1,"title":"Hà Nội - Phù Cát - Eo Gió Hùng Vĩ","content":"Bay đến sân bay Phù Cát, check-in con đường đi bộ ven biển Eo Gió đẹp tựa Jeju."},{"day":2,"title":"Thiên Đường Biển Kỳ Co - Tịnh Xá Ngọc Hòa","content":"Đi cano sang Kỳ Co với bãi cát trắng trải dài, lặn ngắm san hô Bãi Dứa, viếng tượng Phật đôi."},{"day":3,"title":"Ghềnh Ráng Tiên Sa - Đồi Thi Nhân Hàn Mặc Tử - Hà Nội","content":"Thăm Bãi đá Trứng (Bãi tắm Hoàng Hậu), dâng hương thi sĩ Hàn Mặc Tử, xe đưa ra sân bay về Hà Nội."}]', 1);
```

---

## 3. CÁCH THỨC TRIỂN KHAI SQLITE TRÊN TRÌNH DUYỆT (`db.js`)

Để website chạy mượt mà không cần backend nhưng vẫn dùng cơ sở dữ liệu SQLite, file `js/db.js` sẽ sử dụng thư viện **`sql.js` (WebAssembly)** từ CDN:

```html
<!-- Nhúng thư viện sql.js CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
```

Cơ chế hoạt động trong `js/db.js`:
1. **Khởi tạo Database (`initDatabase`):**
   * Kiểm tra trong `localStorage` xem đã có cơ sở dữ liệu lưu trữ từ trước (`vietjet_db_bin`) hay chưa.
   * Nếu đã có: Tải lại mảng `Uint8Array` vào `sql.js` để giữ nguyên giỏ hàng và danh sách đặt chỗ.
   * Nếu chưa có: Tạo mới `new SQL.Database()`, chạy toàn bộ câu lệnh `CREATE TABLE` và `INSERT` dữ liệu mẫu (Seed Data) ở trên.
2. **Lưu dữ liệu (`saveDatabase`):**
   * Sau mỗi lần người dùng Thêm/Xóa giỏ hàng hoặc Đăng ký đặt chỗ (`cart`, `bookings`), gọi `db.export()` để lấy `Uint8Array` và lưu vào `localStorage`.
3. **Các hàm truy vấn tiện ích:**
   * `dbQuery(sql, params)`: Trả về danh sách đối tượng JSON chuẩn (`[{id: 1, ...}]`).
   * `dbExecute(sql, params)`: Thực thi câu lệnh `INSERT`, `UPDATE`, `DELETE` và tự động kích hoạt `saveDatabase()`.
