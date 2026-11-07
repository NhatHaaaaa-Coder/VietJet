-- ============================================================
-- CƠ SỞ DỮ LIỆU SQLITE - WEBSITE DU LỊCH VIETJET
-- File: schema.sql
-- Mô tả: Khởi tạo cấu trúc các bảng dữ liệu cho hệ thống
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. BẢNG HÃNG HÀNG KHÔNG (airlines)
-- Lưu danh sách các hãng hàng không hiển thị trên trang chủ và bộ lọc
-- ------------------------------------------------------------
DROP TABLE IF EXISTS airlines;
CREATE TABLE airlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,             -- Mã hãng: VJ, VN, SQ, QH, QR, EK
    name TEXT NOT NULL,                    -- Tên hãng: VietJet Air, Vietnam Airlines...
    logo TEXT NOT NULL,                    -- Đường dẫn ảnh logo (file nội bộ hoặc link online)
    country TEXT DEFAULT 'Việt Nam',       -- Quốc gia sở tại
    description TEXT,                      -- Giới thiệu ngắn về hãng
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. BẢNG SÂN BAY & THÀNH PHỐ (airports)
-- Lưu danh mục các sân bay trong nước và quốc tế để tìm kiếm vé
-- ------------------------------------------------------------
DROP TABLE IF EXISTS airports;
CREATE TABLE airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,             -- Mã sân bay IATA: HAN, SGN, DAD, CXR, PQC, SIN...
    name TEXT NOT NULL,                    -- Tên đầy đủ sân bay (Sân bay Quốc tế Nội Bài...)
    city TEXT NOT NULL,                    -- Tên thành phố / tỉnh (Hà Nội, TP. Hồ Chí Minh...)
    country TEXT DEFAULT 'Việt Nam'        -- Quốc gia
);

-- ------------------------------------------------------------
-- 3. BẢNG CHUYẾN BAY (flights)
-- Lưu thông tin lịch trình, loại máy bay, dịch vụ và 2 hạng vé
-- ------------------------------------------------------------
DROP TABLE IF EXISTS flights;
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_number TEXT NOT NULL,            -- Số hiệu chuyến bay: 'VJ-152', 'VN-240'
    airline_id INTEGER NOT NULL,            -- Khóa ngoại liên kết bảng airlines
    departure_code TEXT NOT NULL,           -- Mã sân bay đi: HAN, SGN...
    arrival_code TEXT NOT NULL,             -- Mã sân bay đến: SGN, DAD...
    departure_time TEXT NOT NULL,           -- Giờ cất cánh (HH:MM): '06:15'
    arrival_time TEXT NOT NULL,             -- Giờ hạ cánh (HH:MM): '08:25'
    flight_date TEXT NOT NULL,              -- Ngày bay (YYYY-MM-DD): '2026-11-15'
    duration TEXT NOT NULL,                 -- Thời gian bay dạng chữ: '2h 10m'
    duration_minutes INTEGER NOT NULL,      -- Tổng số phút bay: 130 (dùng cho bộ lọc & sắp xếp)
    aircraft_type TEXT NOT NULL,            -- Loại tàu bay: 'Airbus A321 Neo', 'Boeing 787-9'...
    is_direct INTEGER DEFAULT 1,            -- 1: Bay thẳng, 0: Quá cảnh / Nhiều thành phố
    price_economy REAL NOT NULL,            -- Giá vé Hạng Phổ Thông (VNĐ)
    price_business REAL NOT NULL,           -- Giá vé Hạng Thương Gia (VNĐ)
    services_economy TEXT,                  -- Tiện ích Hạng Phổ Thông (Hành lý xách tay 7kg...)
    services_business TEXT,                 -- Tiện ích Hạng Thương Gia (Phòng chờ VIP, 30kg ký gửi...)
    available_seats INTEGER DEFAULT 180,    -- Số ghế còn trống
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE,
    FOREIGN KEY (departure_code) REFERENCES airports(code),
    FOREIGN KEY (arrival_code) REFERENCES airports(code)
);

-- ------------------------------------------------------------
-- 4. BẢNG TOUR DU LỊCH (tours)
-- Lưu thông tin các gói tour du lịch, bao gồm 8 tour nổi bật trang chủ
-- ------------------------------------------------------------
DROP TABLE IF EXISTS tours;
CREATE TABLE tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                    -- Tên tour du lịch
    departure_point TEXT NOT NULL,          -- Điểm khởi hành (Hà Nội, TP. Hồ Chí Minh...)
    destination TEXT NOT NULL,              -- Điểm đến (Phú Quốc, Đà Nẵng, Nha Trang...)
    duration_days INTEGER NOT NULL,         -- Số ngày: 4
    duration_nights INTEGER NOT NULL,       -- Số đêm: 3
    duration_text TEXT NOT NULL,            -- Hiển thị: '4 Ngày 3 Đêm'
    price REAL NOT NULL,                    -- Giá tour trọn gói (VNĐ)
    agency TEXT NOT NULL,                   -- Đơn vị lữ hành (Vietjet Holidays, Saigontourist...)
    airline_id INTEGER,                     -- Hãng bay vận chuyển liên kết
    departure_time TEXT NOT NULL,           -- Giờ cất cánh xuất phát: '06:30'
    aircraft_type TEXT NOT NULL,            -- Loại máy bay: 'Airbus A321', 'Boeing 787'...
    thumbnail TEXT NOT NULL,                -- Ảnh thumbnail kích thước chuẩn 600x400 px
    services TEXT NOT NULL,                 -- Danh sách dịch vụ bao gồm
    itinerary_json TEXT NOT NULL,           -- Chi tiết lịch trình các ngày (JSON string)
    is_featured INTEGER DEFAULT 1,          -- 1: 8 Tour nổi bật trang chủ, 0: Tour thường
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- 5. BẢNG GIỎ HÀNG (cart)
-- Lưu danh sách vé máy bay hoặc tour khách hàng đã bấm chọn
-- ------------------------------------------------------------
DROP TABLE IF EXISTS cart;
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,                -- 'flight' hoặc 'tour'
    item_id INTEGER NOT NULL,               -- ID tương ứng từ bảng flights hoặc tours
    title TEXT NOT NULL,                    -- Tên hiển thị (Tên chuyến bay / Tên tour)
    ticket_class TEXT,                      -- 'Hạng Phổ Thông' hoặc 'Hạng Thương Gia' (nếu là flight)
    airline_name TEXT,                      -- Tên hãng hàng không vận chuyển
    departure_info TEXT,                    -- Nơi đi và thời gian khởi hành
    arrival_info TEXT,                      -- Nơi đến và thời gian hạ cánh
    unit_price REAL NOT NULL,               -- Đơn giá mỗi vé/khách (VNĐ)
    quantity INTEGER DEFAULT 1,             -- Số lượng khách đặt
    total_price REAL NOT NULL,              -- Thành tiền = unit_price * quantity
    details_json TEXT,                      -- Thông tin phụ dạng JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 6. BẢNG ĐƠN ĐẶT CHỖ & KHÁCH HÀNG (bookings)
-- Lưu thông tin đặt chỗ sau khi khách hàng điền form và bấm Đăng ký
-- ------------------------------------------------------------
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,      -- Mã PNR ngẫu nhiên: 'VJ-892461'
    customer_name TEXT NOT NULL,            -- Họ và tên khách hàng
    customer_phone TEXT NOT NULL,           -- Số điện thoại
    customer_email TEXT NOT NULL,           -- Email nhận vé điện tử
    customer_id_card TEXT,                  -- Số CMND / CCCD / Hộ chiếu
    note TEXT,                              -- Ghi chú yêu cầu đặc biệt
    payment_method TEXT DEFAULT 'VietQR',   -- Phương thức thanh toán (VietQR, ATM, Visa)
    total_amount REAL NOT NULL,             -- Tổng tiền thanh toán đơn hàng (VNĐ)
    items_json TEXT NOT NULL,               -- Danh sách dịch vụ đã đặt (JSON string)
    status TEXT DEFAULT 'Đã xác nhận',      -- Trạng thái đơn hàng
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TẠO CÁC CHỈ MỤC (INDEXES) TỐI ƯU TRUY VẤN
-- Giúp các bộ lọc chuyến bay và tour phản hồi tức thì
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_flights_route ON flights (departure_code, arrival_code);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights (flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_price ON flights (price_economy);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights (airline_id);
CREATE INDEX IF NOT EXISTS idx_flights_direct ON flights (is_direct);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours (is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours (price);
CREATE INDEX IF NOT EXISTS idx_tours_airline ON tours (airline_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings (booking_code);
