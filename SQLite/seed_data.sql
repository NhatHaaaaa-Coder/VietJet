-- ============================================================
-- CƠ SỞ DỮ LIỆU SQLITE - WEBSITE DU LỊCH VIETJET
-- File: init_db.sql
-- Mô tả: File hợp nhất tạo cấu trúc bảng (Schema) và nạp dữ liệu mẫu (Seed Data)
-- Cách dùng: Chạy trực tiếp trên SQLite CLI, DB Browser hoặc sql.js
--            sqlite3 vietjet.db < init_db.sql
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- PHẦN 1: TẠO CẤU TRÚC CÁC BẢNG (SCHEMA)
-- ============================================================

DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS airports;
DROP TABLE IF EXISTS airlines;

-- 1. BẢNG HÃNG HÀNG KHÔNG
CREATE TABLE airlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    country TEXT DEFAULT 'Việt Nam',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG SÂN BAY
CREATE TABLE airports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Việt Nam'
);

-- 3. BẢNG CHUYẾN BAY
CREATE TABLE flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flight_number TEXT NOT NULL,
    airline_id INTEGER NOT NULL,
    departure_code TEXT NOT NULL,
    arrival_code TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    flight_date TEXT NOT NULL,
    duration TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    aircraft_type TEXT NOT NULL,
    is_direct INTEGER DEFAULT 1,
    price_economy REAL NOT NULL,
    price_business REAL NOT NULL,
    services_economy TEXT,
    services_business TEXT,
    available_seats INTEGER DEFAULT 180,
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE,
    FOREIGN KEY (departure_code) REFERENCES airports(code),
    FOREIGN KEY (arrival_code) REFERENCES airports(code)
);

-- 4. BẢNG TOUR DU LỊCH
CREATE TABLE tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    departure_point TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    duration_nights INTEGER NOT NULL,
    duration_text TEXT NOT NULL,
    price REAL NOT NULL,
    agency TEXT NOT NULL,
    airline_id INTEGER,
    departure_time TEXT NOT NULL,
    aircraft_type TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    services TEXT NOT NULL,
    itinerary_json TEXT NOT NULL,
    is_featured INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE SET NULL
);

-- 5. BẢNG GIỎ HÀNG
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    ticket_class TEXT,
    airline_name TEXT,
    departure_info TEXT,
    arrival_info TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price REAL NOT NULL,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG ĐƠN ĐẶT CHỖ
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_id_card TEXT,
    note TEXT,
    payment_method TEXT DEFAULT 'VietQR',
    total_amount REAL NOT NULL,
    items_json TEXT NOT NULL,
    status TEXT DEFAULT 'Đã xác nhận',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CHỈ MỤC TỐI ƯU
CREATE INDEX IF NOT EXISTS idx_flights_route ON flights (departure_code, arrival_code);
CREATE INDEX IF NOT EXISTS idx_flights_date ON flights (flight_date);
CREATE INDEX IF NOT EXISTS idx_flights_price ON flights (price_economy);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights (airline_id);
CREATE INDEX IF NOT EXISTS idx_flights_direct ON flights (is_direct);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours (is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours (price);
CREATE INDEX IF NOT EXISTS idx_tours_airline ON tours (airline_id);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings (booking_code);


-- ============================================================
-- PHẦN 2: CHÈN DỮ LIỆU BAN ĐẦU (SEED DATA)
-- ============================================================

-- 1. HÃNG HÀNG KHÔNG
INSERT INTO airlines (id, code, name, logo, country, description) VALUES
(1, 'VJ', 'VietJet Air', 'Images/vietjet-air.png', 'Việt Nam', 'Hãng hàng không thế hệ mới, tiên phong mang đến cơ hội bay với chi phí tiết kiệm và dịch vụ thân thiện.'),
(2, 'VN', 'Vietnam Airlines', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop', 'Việt Nam', 'Hãng hàng không Quốc gia Việt Nam, tiêu chuẩn dịch vụ quốc tế 4 sao của Skytrax.'),
(3, 'SQ', 'Singapore Airlines', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop', 'Singapore', 'Một trong những hãng hàng không 5 sao hàng đầu thế giới với chất lượng phục vụ đỉnh cao.'),
(4, 'QH', 'Bamboo Airways', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop', 'Việt Nam', 'Hãng hàng không mang sứ mệnh kết nối những miền đất du lịch tiềm năng của Việt Nam.'),
(5, 'QR', 'Qatar Airways', 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e91f?w=120&h=120&fit=crop', 'Qatar', 'Hãng hàng không đẳng cấp thế giới với đội bay hiện đại bậc nhất.'),
(6, 'EK', 'Emirates', 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=120&h=120&fit=crop', 'UAE', 'Hãng hàng không quốc tế danh tiếng với trải nghiệm khoang hạng nhất và thương gia xa hoa.');

-- 2. SÂN BAY
INSERT INTO airports (code, name, city, country) VALUES
('HAN', 'Sân bay Quốc tế Nội Bài', 'Hà Nội', 'Việt Nam'),
('SGN', 'Sân bay Quốc tế Tân Sơn Nhất', 'TP. Hồ Chí Minh', 'Việt Nam'),
('DAD', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng', 'Việt Nam'),
('CXR', 'Sân bay Quốc tế Cam Ranh', 'Nha Trang', 'Việt Nam'),
('PQC', 'Sân bay Quốc tế Phú Quốc', 'Phú Quốc', 'Việt Nam'),
('HPH', 'Sân bay Quốc tế Cát Bi', 'Hải Phòng', 'Việt Nam'),
('VCA', 'Sân bay Quốc tế Cần Thơ', 'Cần Thơ', 'Việt Nam'),
('SIN', 'Sân bay Quốc tế Changi', 'Singapore', 'Singapore'),
('BKK', 'Sân bay Quốc tế Suvarnabhumi', 'Bangkok', 'Thái Lan');

-- 3. CHUYẾN BAY
INSERT INTO flights (
    flight_number, airline_id, departure_code, arrival_code, 
    departure_time, arrival_time, flight_date, duration, duration_minutes, 
    aircraft_type, is_direct, price_economy, price_business, 
    services_economy, services_business, available_seats
) VALUES
('VJ-152', 1, 'HAN', 'SGN', '06:15', '08:25', '2026-11-15', '2h 10m', 130, 'Airbus A321 Neo', 1, 1250000, 3450000, 'Hành lý xách tay 7kg, Nước uống đóng chai', 'Khoang SkyBoss sang trọng, 30kg ký gửi, Phòng chờ VIP, Suất ăn nóng đặc biệt, Ưu tiên làm thủ tục', 165),
('VN-240', 2, 'HAN', 'SGN', '07:00', '09:10', '2026-11-15', '2h 10m', 130, 'Boeing 787-9 Dreamliner', 1, 1950000, 4850000, 'Hành lý 12kg xách tay, 23kg ký gửi, Bữa ăn nhẹ', 'Phòng chờ Bông Sen tiêu chuẩn 4 sao, 32kg ký gửi, Ghế ngả phẳng 180 độ, Thực đơn ẩm thực cao cấp', 240),
('VJ-166', 1, 'HAN', 'SGN', '09:30', '11:45', '2026-11-15', '2h 15m', 135, 'Airbus A330-300', 1, 1450000, 3650000, 'Hành lý xách tay 7kg, Nước lọc miễn phí', 'Khoang Business rộng rãi, Ghế bọc da ngả lưng 180 độ, Suất ăn nóng nóng hổi, Check-in ưu tiên', 280),
('QH-204', 4, 'HAN', 'SGN', '14:20', '16:30', '2026-11-15', '2h 10m', 130, 'Boeing 787-9', 1, 1380000, 3500000, 'Hành lý xách tay 7kg, Nước suối', 'Phòng thương gia First Lounge, Suất ăn nóng, 30kg hành lý ký gửi', 190),
('VJ-178', 1, 'HAN', 'SGN', '18:45', '20:55', '2026-11-15', '2h 10m', 130, 'Airbus A321', 1, 1150000, 3150000, 'Hành lý xách tay 7kg', 'SkyBoss Business, 30kg ký gửi, Phòng chờ thương gia VIP', 170),
('VN-288', 2, 'HAN', 'SGN', '21:00', '23:10', '2026-11-15', '2h 10m', 130, 'Airbus A350-900', 1, 1650000, 4250000, 'Hành lý 12kg xách tay, 23kg ký gửi', 'Phòng chờ Bông Sen, Ghế nằm rộng rãi, Suất ăn tối cao cấp', 220),
('VJ-153', 1, 'SGN', 'HAN', '07:30', '09:40', '2026-11-15', '2h 10m', 130, 'Airbus A321 Neo', 1, 1250000, 3450000, 'Hành lý xách tay 7kg, Nước uống', 'Khoang SkyBoss, Phòng chờ VIP, 30kg ký gửi, Suất ăn nóng, Lối đi ưu tiên', 160),
('VN-241', 2, 'SGN', 'HAN', '11:15', '13:25', '2026-11-15', '2h 10m', 130, 'Boeing 787-9', 1, 1850000, 4650000, 'Hành lý 12kg xách tay, 23kg ký gửi', 'Khoang Lotus Business, Ghế nằm phẳng, Ẩm thực truyền thống Việt Nam', 210),
('VJ-320', 1, 'HAN', 'DAD', '08:00', '09:20', '2026-11-15', '1h 20m', 80, 'Airbus A320', 1, 890000, 2450000, 'Hành lý xách tay 7kg', 'Phòng chờ SkyBoss, Suất ăn nóng, 30kg ký gửi, Xe đưa đón riêng tại sân đỗ', 150),
('VN-165', 2, 'HAN', 'DAD', '13:10', '14:30', '2026-11-15', '1h 20m', 80, 'Airbus A321', 1, 1250000, 2950000, 'Hành lý xách tay 12kg, 23kg ký gửi', 'Hạng thương gia Bông Sen, Ưu tiên quầy thủ tục', 160),
('VJ-325', 1, 'SGN', 'PQC', '09:10', '10:15', '2026-11-15', '1h 05m', 65, 'Airbus A320', 1, 790000, 2250000, 'Hành lý xách tay 7kg', 'SkyBoss sang trọng, 30kg ký gửi, Miễn phí chọn chỗ ngồi', 140),
('VN-182', 2, 'SGN', 'PQC', '15:20', '16:25', '2026-11-15', '1h 05m', 65, 'Airbus A321', 1, 1090000, 2750000, 'Hành lý xách tay 12kg, 23kg ký gửi', 'Hạng thương gia, Phòng chờ VIP Tân Sơn Nhất', 155),
('SQ-173', 3, 'HAN', 'SIN', '12:35', '17:15', '2026-11-15', '3h 40m', 220, 'Boeing 787-10 Dreamliner', 1, 3850000, 8900000, 'Hành lý xách tay 7kg, 25kg ký gửi, Suất ăn quốc tế chuẩn 5 sao', 'Khoang Business 5 sao thế giới, Ghế ngả phẳng hoàn toàn, Rượu vang thượng hạng, Màn hình 18 inch', 290),
('VJ-915', 1, 'HAN', 'SIN', '14:50', '19:25', '2026-11-15', '3h 35m', 215, 'Airbus A321 Neo', 1, 2190000, 4890000, 'Hành lý xách tay 7kg', 'SkyBoss Business quốc tế, 30kg ký gửi, Suất ăn nóng ấm, Check-in lối riêng', 175),
('VJ-502', 1, 'DAD', 'SIN', '06:00', '13:45', '2026-11-15', '6h 45m (1 điểm dừng tại SGN)', 405, 'Airbus A320', 0, 2690000, 5690000, 'Hành lý xách tay 7kg', 'SkyBoss toàn chặng bay, 30kg ký gửi, Hỗ trợ chuyển tiếp hành lý', 130);

-- 4. 8 TOUR DU LỊCH NỔI BẬT
INSERT INTO tours (
    id, title, departure_point, destination, 
    duration_days, duration_nights, duration_text, price, 
    agency, airline_id, departure_time, aircraft_type, 
    thumbnail, services, itinerary_json, is_featured
) VALUES
(
    1, 
    'Tour Phú Quốc - Đảo Ngọc Nghỉ Dưỡng Grand World & Sunset Town', 
    'Hà Nội', 
    'Phú Quốc', 
    4, 3, '4 Ngày 3 Đêm', 5490000, 
    'Vietjet Holidays', 1, '06:30', 'Airbus A321', 
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', 
    'Vé máy bay khứ hồi VietJet Air, Khách sạn 4 sao sát biển, Xe du lịch đời mới đưa đón, Vé vào cổng Grand World, Bữa ăn hải sản theo tiêu chuẩn, Bảo hiểm du lịch 50 triệu', 
    '[{"day":1,"title":"Hà Nội - Đảo Ngọc Phú Quốc - Sunset Town Lãng Mạn","content":"Sáng: Hướng dẫn viên đón đoàn tại sân bay Nội Bài, làm thủ tục đáp chuyến bay Vietjet đi Phú Quốc. Đến nơi, xe đón đoàn về khách sạn nhận phòng nghỉ ngơi. Chiều: Tham quan Thị trấn Hoàng Hôn (Sunset Town), chiêm ngưỡng Cầu Hôn (Kiss Bridge) tuyệt tác kiến trúc. Tối: Thưởng thức bữa tối hải sản tươi sống và ngắm pháo hoa rực rỡ."},{"day":2,"title":"Khám Phá Thành Phố Không Ngủ Grand World - Tinh Hoa Việt Nam","content":"Sáng: Dùng buffet sáng tại resort. Xe đưa đoàn đến Bắc Đảo khám phá quần thể Grand World: Du ngoạn kênh đào Venice thơ mộng, ghé thăm Bảo tàng Gấu Teddy Bear. Chiều: Tự do tắm biển Bãi Dài. Tối: Thưởng thức siêu show thực cảnh Tinh Hoa Việt Nam hoành tráng và trình diễn nhạc nước Sắc Màu Venice."},{"day":3,"title":"Trải Nghiệm Cano Cao Tốc 4 Đảo - Công Viên San Hô Nam Đảo","content":"Sáng: Lên cano cao tốc tham quan Hòn Mây Rút Trong, Hòn Mây Rút Ngoài, tắm biển nước trong vắt tận đáy. Trải nghiệm lặn ngắm san hô tự nhiên tại Hòn Gầm Ghì. Trưa: Ăn trưa trên đảo với ẩm thực miền biển. Chiều: Check-in ga An Thới phong cách đấu trường La Mã."},{"day":4,"title":"Chợ Dương Đông - Mua Sắm Đặc Sản - Sân Bay - Về Lại Hà Nội","content":"Sáng: Thong thả dạo chợ truyền thống Dương Đông, mua đặc sản tiêu chín, nước mắm cá cơm trứ danh và ngọc trai Phú Quốc. Trưa: Trả phòng khách sạn, xe đưa đoàn ra sân bay Phú Quốc đáp chuyến bay về lại Hà Nội. Kết thúc hành trình trọn vẹn."}]', 
    1
),
(
    2, 
    'Tour Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng Huyền Thoại', 
    'TP. Hồ Chí Minh', 
    'Đà Nẵng', 
    3, 2, '3 Ngày 2 Đêm', 4290000, 
    'Vietjet Holidays', 1, '07:15', 'Airbus A320', 
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop', 
    'Vé máy bay khứ hồi, Khách sạn 4 sao biển Mỹ Khê, Vé cáp treo Bà Nà Hills khứ hồi, Vé tham quan phố cổ Hội An, Buffet trưa 80 món trên đỉnh Bà Nà, Hướng dẫn viên suốt tuyến', 
    '[{"day":1,"title":"TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà - Phố Cổ Hội An","content":"Sáng: Quý khách tập trung tại Tân Sơn Nhất, bay đến Đà Nẵng. Đoàn viếng Chùa Linh Ứng trên Bán đảo Sơn Trà, chiêm bái tượng Phật Bà Quán Thế Âm cao 67m hướng ra biển. Chiều: Di chuyển đến Phố cổ Hội An, bách bộ ngắm Chùa Cầu, nhà cổ Tấn Ký. Tối: Đi thuyền thả hoa đăng ước nguyện trên sông Hoài."},{"day":2,"title":"Bà Nà Hills - Cầu Vàng Bàn Tay Khổng Lồ - Fantasy Park","content":"Sáng: Khởi hành lên đỉnh Bà Nà bằng cáp treo đạt nhiều kỷ lục thế giới. Check-in Cầu Vàng (Golden Bridge) vươn giữa mây trời, Làng Pháp cổ kính. Trưa: Thưởng thức đại tiệc buffet hơn 80 món ăn Á - Âu. Chiều: Vui chơi thỏa thích hơn 100 trò chơi tại Fantasy Park."},{"day":3,"title":"Tắm Biển Mỹ Khê - Mua Sắm Chợ Hàn - TP. Hồ Chí Minh","content":"Sáng: Đón bình minh và tắm biển tại bãi biển Mỹ Khê - một trong những bãi biển quyến rũ nhất hành tinh. Mua sắm đặc sản chả bò, mực rim tại Chợ Hàn. Trưa: Xe tiễn đoàn ra sân bay Quốc tế Đà Nẵng bay về TP.HCM."}]', 
    1
),
(
    3, 
    'Tour Nha Trang - Du Ngoạn Vịnh San Hô - Thiên Đường VinWonders', 
    'Hà Nội', 
    'Nha Trang', 
    4, 3, '4 Ngày 3 Đêm', 4890000, 
    'Saigontourist', 2, '08:00', 'Airbus A321', 
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 
    'Vé máy bay khứ hồi, Khách sạn trung tâm đường biển Trần Phú, Cano khám phá Vịnh San Hô, Vé cáp treo & vui chơi không giới hạn VinWonders Nha Trang, Suất tắm bùn khoáng nóng I-Resort', 
    '[{"day":1,"title":"Hà Nội - Cam Ranh - Nha Trang Phố Biển Xinh Đẹp","content":"Đáp sân bay Cam Ranh, xe đưa đoàn theo cung đường ven biển tuyệt đẹp về trung tâm Nha Trang nhận phòng. Chiều: Tham quan Tháp Bà Ponagar - dấu ấn văn hóa Chăm pa rực rỡ và Viện Hải Dương Học Nha Trang."},{"day":2,"title":"Du Ngoạn Vịnh San Hô - Làng Chài - Tắm Biển Đảo Con Sẻ Tre","content":"Sáng: Cano cao tốc đưa đoàn khám phá Vịnh San Hô, trải nghiệm lặn biển ngắm các loài san hô quý hiếm và sinh vật biển đa dạng. Trưa: Dùng bữa trưa hải sản phong phú tại bè nổi Làng Chài. Chiều: Thư giãn trên bãi biển cát trắng Con Sẻ Tre."},{"day":3,"title":"Thế Giới Cổ Tích VinWonders Hòn Tre Đẳng Cấp","content":"Cả ngày trải nghiệm công viên giải trí hàng đầu khu vực: Vịnh phao nổi lớn nhất thế giới, Bánh xe bầu trời Sky Wheel ngắm toàn cảnh vịnh biển, xem trình diễn Tata Show hoành tráng kết hợp ánh sáng 3D mapping."},{"day":4,"title":"Tắm Bùn Khoáng Nóng I-Resort - Tiễn Sân Bay Về Hà Nội","content":"Sáng: Ngâm bùn khoáng nóng thiên nhiên phục hồi sức khỏe và làm đẹp da tại I-Resort. Mua sắm yến sào Khánh Hòa, nem nướng Ninh Hòa. Trưa: Xe đưa đoàn ra sân bay Cam Ranh về Hà Nội."}]', 
    1
),
(
    4, 
    'Tour Đà Lạt - Săn Mây Cầu Đất - Xứ Sở Ngàn Hoa Thơ Mộng', 
    'TP. Hồ Chí Minh', 
    'Đà Lạt', 
    3, 2, '3 Ngày 2 Đêm', 3290000, 
    'Vietravel', 1, '06:45', 'Airbus A320', 
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop', 
    'Vé máy bay VietJet Air, Khách sạn phong cách châu Âu ngắm thung lũng, Xe ô tô du lịch chất lượng cao, Trải nghiệm nông trại Puppy Farm, Bữa tối lẩu gà lá é đặc sản', 
    '[{"day":1,"title":"TP.HCM - Sân Bay Liên Khương - Quảng Trường Lâm Viên","content":"Sáng: Bay từ TP.HCM đến sân bay Liên Khương, xe đón đoàn lên phố núi Đà Lạt. Check-in biểu tượng nụ hoa Atiso khổng lồ tại Quảng trường Lâm Viên, dạo quanh bờ Hồ Xuân Hương êm đềm."},{"day":2,"title":"Săn Biển Mây Cầu Đất - Đồi Chè Xanh - Nông Trại Puppy Farm","content":"Sáng sớm: Khởi hành săn biển mây bồng bềnh tại đồi chè Cầu Đất lúc rạng đông. Thăm cánh đồng hoa cẩm tú cầu nở rộ quanh năm. Chiều: Vui chơi cùng những chú cún cưng thân thiện tại Puppy Farm và hái dâu tây trĩu quả tại vườn."},{"day":3,"title":"Chợ Đêm Đà Lạt - Ga Xe Lửa Cổ - Về Lại TP.HCM","content":"Sáng: Khám phá kiến trúc cổ kính của Ga Đà Lạt - nhà ga xe lửa đẹp nhất Đông Dương. Tự do mua sắm mứt atiso, hoa quả sấy dẻo tại chợ Đà Lạt. Trưa: Xe đưa đoàn ra sân bay Liên Khương đáp chuyến bay về TP.HCM."}]', 
    1
),
(
    5, 
    'Tour Hà Nội - Vịnh Hạ Long - Du Thuyền 5 Sao Đẳng Cấp', 
    'TP. Hồ Chí Minh', 
    'Hạ Long', 
    4, 3, '4 Ngày 3 Đêm', 6990000, 
    'Vietjet Holidays', 2, '07:30', 'Boeing 787', 
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop', 
    'Vé máy bay khứ hồi Vietnam Airlines, 1 đêm trải nghiệm Du thuyền 5 sao trên vịnh Hạ Long, 2 đêm khách sạn trung tâm phố cổ Hà Nội, Chèo thuyền kayak, Buffet hải sản cao cấp', 
    '[{"day":1,"title":"TP.HCM - Thủ Đô Hà Nội 36 Phố Phường Cổ Kính","content":"Sáng: Bay từ TP.HCM đến Hà Nội. Xe đón đoàn dạo quanh Hồ Gươm, viếng Đền Ngọc Sơn, Cầu Thê Húc. Thưởng thức phở bò truyền thống và cà phê trứng trứ danh phố cổ Giảng."},{"day":2,"title":"Hà Nội - Di Sản Vịnh Hạ Long - Check-in Du Thuyền 5 Sao","content":"Sáng: Khởi hành theo cao tốc hiện đại đến cảng Tuần Châu, lên du thuyền 5 sao sang trọng. Thưởng thức tiệc buffet trưa hải sản khi tàu lướt qua hàng nghìn hòn đảo đá vôi kỳ vĩ. Chiều: Chèo thuyền kayak qua hang Luồn, tắm biển tại đảo Ti Tốp."},{"day":3,"title":"Hang Sửng Sốt - Trở Về Hà Nội - Thưởng Thức Ẩm Thực Đêm","content":"Sáng: Đón bình minh với bài tập Thái Cực Quyền trên boong tàu (Sundeck). Tham quan Hang Sửng Sốt với muôn vàn nhũ đá lấp lánh kỳ ảo. Trưa: Tàu cập bến, xe đưa đoàn về lại Hà Nội, tự do dạo phố đi bộ và chợ đêm Đồng Xuân."},{"day":4,"title":"Viếng Lăng Bác - Văn Miếu Quốc Tử Giám - TP.HCM","content":"Sáng: Viếng Lăng Chủ tịch Hồ Chí Minh, tham quan Nhà sàn, Chùa Một Cột, tiếp tục đến Văn Miếu - trường đại học đầu tiên của Việt Nam. Chiều: Xe tiễn đoàn ra sân bay Nội Bài về TP.HCM."}]', 
    1
),
(
    6, 
    'Tour Bangkok - Pattaya - Thiên Đường Du Lịch Mua Sắm Thái Lan', 
    'Hà Nội', 
    'Bangkok', 
    5, 4, '5 Ngày 4 Đêm', 6590000, 
    'Vietjet Travel', 1, '09:00', 'Airbus A321 Neo', 
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop', 
    'Vé máy bay quốc tế khứ hồi VietJet Air, Khách sạn 4-5 sao chuẩn quốc tế, Buffet quốc tế tại tòa nhà 86 tầng Baiyoke Sky, Du thuyền dạo sông Chaophraya huyền thoại, Vé đảo San Hô Coral', 
    '[{"day":1,"title":"Hà Nội - Bangkok - Thành Phố Biển Pattaya Sôi Động","content":"Đáp sân bay Suvarnabhumi, xe đưa đoàn thẳng về Pattaya. Tối: Thưởng thức bữa tối ẩm thực Thái truyền thống và xem show Alcazar hoành tráng của các vũ công chuyển giới."},{"day":2,"title":"Đảo San Hô Coral Island - Núi Phật Vàng Trân Bảo Phật Sơn","content":"Sáng: Tàu cao tốc đưa đoàn ra Đảo San Hô Coral Island tham gia dù lượn, mô tô nước, lặn biển. Chiều: Viếng Trân Bảo Phật Sơn - ngọn núi khắc tượng Phật Thích Ca bằng vàng 24k nặng hàng tấn."},{"day":3,"title":"Pattaya - Bangkok - Tiệc Buffet Tòa Nhà Baiyoke Sky 86 Tầng","content":"Trở lại thủ đô Bangkok. Dùng tiệc buffet quốc tế xa hoa trên tòa nhà chọc trời Baiyoke Sky ngắm toàn cảnh thành phố từ tầng xoay 86. Tối: Dạo chợ đêm Asiatique The Riverfront."},{"day":4,"title":"Chùa Phật Vàng Wat Traimit - Du Thuyền Sông Chaophraya - Mua Sắm","content":"Sáng: Viếng Chùa Phật Vàng chiêm bái pho tượng Phật bằng vàng ròng nguyên khối nặng 5.5 tấn linh thiêng. Dạo thuyền trên dòng sông Mẹ Chaophraya. Chiều: Thỏa sức shopping hàng hiệu tại IconSiam và siêu thị Big C Ratchadamri."},{"day":5,"title":"Chợ Nổi Bốn Miền - Sân Bay Suvarnabhumi - Hà Nội","content":"Sáng: Trải nghiệm chợ nổi đặc trưng xứ Chùa Vàng, mua sắm quà lưu niệm và bánh kẹo Thái. Trưa: Xe đưa đoàn ra sân bay đáp chuyến bay Vietjet về lại Hà Nội."}]', 
    1
),
(
    7, 
    'Tour Singapore - Malaysia - Hai Quốc Gia Một Hành Trình Đẳng Cấp', 
    'TP. Hồ Chí Minh', 
    'Singapore', 
    5, 4, '5 Ngày 4 Đêm', 9890000, 
    'Vietravel', 3, '08:45', 'Boeing 787-10', 
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop', 
    'Vé máy bay 5 sao Singapore Airlines, Khách sạn 4 sao trung tâm, Vé Flower Dome & Cloud Forest Gardens by the Bay, Cáp treo cao nguyên Genting, Thưởng thức lẩu nướng BBQ', 
    '[{"day":1,"title":"TP.HCM - Đảo Quốc Sư Tử Singapore - Gardens By The Bay","content":"Đáp sân bay Changi hiện đại nhất thế giới, chiêm ngưỡng thác nước Jewel Changi kỳ vĩ. Di chuyển về trung tâm check-in Công viên Sư tử biển Merlion Park và siêu cây khổng lồ Gardens by the Bay."},{"day":2,"title":"Đảo Giải Trí Sentosa - Di Chuyển Đến Thành Phố Cổ Malacca","content":"Sáng: Tham quan đảo Sentosa, chụp ảnh biểu tượng quả cầu Universal Studios Singapore. Chiều: Làm thủ tục xuất cảnh sang Malaysia, đến thành phố di sản Malacca tham quan Pháo đài cổ Famosa và Quảng trường Hà Lan đỏ rực."},{"day":3,"title":"Malacca - Thủ Đô Kuala Lumpur - Tháp Đôi Petronas Twin Towers","content":"Khám phá thủ đô Kuala Lumpur: Check-in Cung điện Hoàng gia, Quảng trường Độc Lập Merdeka và chụp ảnh kỷ niệm tại chân Tháp đôi Petronas - biểu tượng tự hào của đất nước Malaysia."},{"day":4,"title":"Động Batu Huyền Bí - Cao Nguyên Giải Trí Genting Mát Lạnh","content":"Sáng: Chinh phục 272 bậc thang rực rỡ sắc màu tại Động Batu linh thiêng của đạo Hindu. Chiều: Đi hệ thống cáp treo hiện đại lên đỉnh cao nguyên Genting quanh năm mây mù mát mẻ, khám phá sòng bài Casino và khu mua sắm sầm uất."},{"day":5,"title":"Kuala Lumpur - TP. Hồ Chí Minh","content":"Sáng: Tự do mua sắm chocolate và đặc sản sâm Tongkat Ali nổi tiếng. Trưa: Xe tiễn đoàn ra sân bay quốc tế KLIA đáp chuyến bay về TP.HCM."}]', 
    1
),
(
    8, 
    'Tour Quy Nhơn - Thiên Đường Biển Kỳ Co & Eo Gió Tuyệt Sắc', 
    'Hà Nội', 
    'Quy Nhơn', 
    3, 2, '3 Ngày 2 Đêm', 3890000, 
    'Vietjet Holidays', 1, '10:00', 'Airbus A320', 
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 
    'Vé máy bay khứ hồi VietJet Air, Khách sạn 4 sao FLC Quy Nhơn cao cấp, Cano sang bãi biển Kỳ Co, Trọn gói bữa trưa hải sản 9 món, Vé tham quan Eo Gió, Bảo hiểm du lịch trọn gói', 
    '[{"day":1,"title":"Hà Nội - Sân Bay Phù Cát - Eo Gió Nơi Ngắm Hoàng Hôn Đẹp Nhất","content":"Sáng: Bay từ Hà Nội đến sân bay Phù Cát, xe đón đoàn về Quy Nhơn. Chiều: Khám phá thắng cảnh Eo Gió hùng vĩ với cung đường đi bộ ven biển đẹp ngoạn mục tựa đảo Jeju. Viếng tượng Phật đôi cao nhất Việt Nam tại Tịnh Xá Ngọc Hòa."},{"day":2,"title":"Bãi Tắm Thiên Đường Kỳ Co - Lặn Ngắm San Hô Bãi Dứa","content":"Sáng: Lên cano siêu tốc lướt sóng đến bãi biển Kỳ Co - nơi sở hữu làn nước trong xanh hai màu tuyệt mỹ và bãi cát trắng phau. Trải nghiệm lặn ngắm rạn san hô Bãi Dứa nguyên sơ. Trưa: Thưởng thức bữa trưa hải sản tươi sống thịnh soạn tại làng chài Nhơn Lý."},{"day":3,"title":"Ghềnh Ráng Tiên Sa - Đồi Thi Nhân Hàn Mặc Tử - Về Hà Nội","content":"Sáng: Tham quan Khu du lịch Ghềnh Ráng Tiên Sa, viếng mộ thi sĩ tài hoa Hàn Mặc Tử, ngắm Bãi đá Trứng (Bãi tắm Hoàng Hậu). Mua đặc sản bánh ít lá gai, nem Chợ Huyện. Trưa: Xe đưa đoàn ra sân bay Phù Cát bay về Hà Nội."}]', 
    1
);

-- 5. GIỎ HÀNG
INSERT INTO cart (item_type, item_id, title, ticket_class, airline_name, departure_info, arrival_info, unit_price, quantity, total_price, details_json) VALUES
('flight', 1, 'Chuyến bay Hà Nội (HAN) -> TP.HCM (SGN) [VJ-152]', 'Hạng Phổ Thông', 'VietJet Air', 'HAN 06:15 (15/11/2026)', 'SGN 08:25 (15/11/2026)', 1250000, 1, 1250000, '{"aircraft": "Airbus A321 Neo", "baggage": "7kg xách tay"}'),
('tour', 1, 'Tour Phú Quốc - Đảo Ngọc Nghỉ Dưỡng Grand World & Sunset Town', NULL, 'VietJet Air', 'Hà Nội (06:30)', 'Phú Quốc (4 Ngày 3 Đêm)', 5490000, 2, 10980000, '{"agency": "Vietjet Holidays", "hotel": "Khách sạn 4 sao"}');

-- 6. ĐƠN ĐẶT CHỖ
INSERT INTO bookings (
    booking_code, customer_name, customer_phone, customer_email, 
    customer_id_card, note, payment_method, total_amount, items_json, status
) VALUES
(
    'VJ-892461', 
    'Nguyễn Văn An', 
    '0912345678', 
    'nguyenvanan@example.com', 
    '001200001234', 
    'Yêu cầu ghế ngồi cạnh cửa sổ cho người lớn tuổi', 
    'VietQR', 
    12230000, 
    '[{"type":"flight","title":"Chuyến bay VJ-152 HAN-SGN","class":"Hạng Phổ Thông","qty":1,"price":1250000},{"type":"tour","title":"Tour Phú Quốc 4N3Đ","qty":2,"price":10980000}]', 
    'Đã xác nhận'
);
