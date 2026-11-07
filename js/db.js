/**
 * ============================================================
 * VIETJET TRAVEL - QUẢN LÝ CƠ SỞ DỮ LIỆU SQLITE (js/db.js)
 * Chạy SQLite thuần 100% trên trình duyệt bằng sql.js (WebAssembly)
 * Tự động tải từ file 'SQLite/vietjet.db' và lưu snapshot vào localStorage
 * ============================================================
 */

let dbInstance = null;
let dbInitPromise = null;

const STORAGE_KEY = 'vietjet_db_snapshot';
const DB_FILE_PATH = 'SQLite/vietjet.db';

/**
 * Khởi tạo Database SQLite từ file vietjet.db hoặc LocalStorage snapshot
 */
async function initDatabase() {
  if (dbInstance) return dbInstance;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      // 1. Tải sql.js WebAssembly
      const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      // 2. Kiểm tra xem đã có dữ liệu lưu trong localStorage hay chưa
      const savedSnapshot = localStorage.getItem(STORAGE_KEY);
      if (savedSnapshot) {
        try {
          const binaryString = atob(savedSnapshot);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          dbInstance = new SQL.Database(bytes);
          console.log('✅ SQLite: Tải thành công cơ sở dữ liệu từ LocalStorage snapshot.');
          return dbInstance;
        } catch (e) {
          console.warn('⚠️ Lỗi giải mã snapshot cũ, sẽ tải lại từ file vietjet.db:', e);
        }
      }

      // 3. Nếu chưa có snapshot, cố gắng fetch file SQLite/vietjet.db
      try {
        const response = await fetch(DB_FILE_PATH);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          dbInstance = new SQL.Database(new Uint8Array(buffer));
          console.log('✅ SQLite: Tải thành công từ file', DB_FILE_PATH);
          saveDatabase();
          return dbInstance;
        }
      } catch (fetchErr) {
        console.warn('⚠️ Không thể fetch trực tiếp file (do giao thức file:/// hoặc CORS), khởi tạo database mẫu:', fetchErr);
      }

      // 4. Fallback: Nếu mở trực tiếp bằng file:/// không fetch được, khởi tạo schema và seed data
      dbInstance = new SQL.Database();
      initFallbackData(dbInstance);
      saveDatabase();
      console.log('✅ SQLite: Khởi tạo database mẫu nội bộ thành công.');
      return dbInstance;

    } catch (err) {
      console.error('❌ Lỗi nghiêm trọng khi khởi tạo SQLite WebAssembly:', err);
      throw err;
    }
  })();

  return dbInitPromise;
}

/**
 * Lưu snapshot cơ sở dữ liệu hiện tại vào localStorage
 */
function saveDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    localStorage.setItem(STORAGE_KEY, btoa(binary));
  } catch (err) {
    console.error('Lỗi khi lưu database vào localStorage:', err);
  }
}

/**
 * Thực thi câu lệnh SQL SELECT và trả về mảng các đối tượng JSON
 */
async function dbQuery(sql, params = []) {
  const db = await initDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Thực thi câu lệnh INSERT / UPDATE / DELETE và tự động lưu snapshot
 */
async function dbRun(sql, params = []) {
  const db = await initDatabase();
  db.run(sql, params);
  saveDatabase();
}

/**
 * Khởi tạo dữ liệu dự phòng khi chạy trên file:/// không fetch được file binary
 */
function initFallbackData(db) {
  const initSql = `
    CREATE TABLE IF NOT EXISTS airlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      logo TEXT NOT NULL,
      country TEXT DEFAULT 'Việt Nam',
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS airports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT DEFAULT 'Việt Nam'
    );

    CREATE TABLE IF NOT EXISTS flights (
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
      available_seats INTEGER DEFAULT 180
    );

    CREATE TABLE IF NOT EXISTS tours (
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
      is_featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cart (
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
      details_json TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
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

    INSERT OR IGNORE INTO airlines (id, code, name, logo, country, description) VALUES
    (1, 'VJ', 'VietJet Air', 'Images/vietjet-air.png', 'Việt Nam', 'Bay khắp Việt Nam & Thế giới với giá siêu tiết kiệm.'),
    (2, 'VN', 'Vietnam Airlines', 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop', 'Việt Nam', 'Hãng hàng không Quốc gia 4 sao chuẩn quốc tế.'),
    (3, 'SQ', 'Singapore Airlines', 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop', 'Singapore', 'Dịch vụ hàng không 5 sao đẳng cấp thế giới.'),
    (4, 'QH', 'Bamboo Airways', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop', 'Việt Nam', 'Hơn cả một chuyến bay - Kết nối những miền đất.'),
    (5, 'QR', 'Qatar Airways', 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e91f?w=120&h=120&fit=crop', 'Qatar', 'Trải nghiệm dịch vụ bay hàng đầu toàn cầu.'),
    (6, 'EK', 'Emirates', 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=120&h=120&fit=crop', 'UAE', 'Hành trình xa hoa trên bầu trời quốc tế.');

    INSERT OR IGNORE INTO airports (code, name, city) VALUES
    ('HAN', 'Sân bay Quốc tế Nội Bài', 'Hà Nội'),
    ('SGN', 'Sân bay Quốc tế Tân Sơn Nhất', 'TP. Hồ Chí Minh'),
    ('DAD', 'Sân bay Quốc tế Đà Nẵng', 'Đà Nẵng'),
    ('CXR', 'Sân bay Quốc tế Cam Ranh', 'Nha Trang'),
    ('PQC', 'Sân bay Quốc tế Phú Quốc', 'Phú Quốc'),
    ('SIN', 'Sân bay Quốc tế Changi', 'Singapore');

    INSERT OR IGNORE INTO flights (flight_number, airline_id, departure_code, arrival_code, departure_time, arrival_time, flight_date, duration, duration_minutes, aircraft_type, is_direct, price_economy, price_business, services_economy, services_business) VALUES
    ('VJ-152', 1, 'HAN', 'SGN', '06:15', '08:25', '2026-11-15', '2h 10m', 130, 'Airbus A321 Neo', 1, 1250000, 3450000, 'Hành lý xách tay 7kg, Nước uống', 'Phòng chờ SkyBoss VIP, 30kg ký gửi, Suất ăn nóng, Lối đi ưu tiên'),
    ('VN-240', 2, 'HAN', 'SGN', '07:00', '09:10', '2026-11-15', '2h 10m', 130, 'Boeing 787-9 Dreamliner', 1, 1950000, 4850000, 'Hành lý 12kg xách tay, 23kg ký gửi', 'Phòng chờ Bông Sen, 32kg ký gửi, Ghế ngả 180 độ, Ẩm thực 4 sao'),
    ('VJ-166', 1, 'HAN', 'SGN', '09:30', '11:45', '2026-11-15', '2h 15m', 135, 'Airbus A330-300', 1, 1450000, 3650000, 'Hành lý xách tay 7kg', 'Ghế da ngả 180 độ, Suất ăn nóng, Ưu tiên làm thủ tục'),
    ('QH-204', 4, 'HAN', 'SGN', '14:20', '16:30', '2026-11-15', '2h 10m', 130, 'Boeing 787-9', 1, 1380000, 3500000, 'Hành lý xách tay 7kg', 'Phòng chờ First Lounge, Suất ăn nóng, 30kg ký gửi'),
    ('VJ-320', 1, 'HAN', 'DAD', '08:00', '09:20', '2026-11-15', '1h 20m', 80, 'Airbus A320', 1, 890000, 2450000, 'Hành lý xách tay 7kg', 'Phòng chờ SkyBoss, Suất ăn nóng, 30kg ký gửi'),
    ('VN-165', 2, 'HAN', 'DAD', '13:10', '14:30', '2026-11-15', '1h 20m', 80, 'Airbus A321', 1, 1250000, 2950000, 'Hành lý xách tay 12kg', 'Hạng thương gia Bông Sen'),
    ('VJ-325', 1, 'SGN', 'PQC', '09:10', '10:15', '2026-11-15', '1h 05m', 65, 'Airbus A320', 1, 790000, 2250000, 'Hành lý xách tay 7kg', 'SkyBoss VIP, 30kg ký gửi'),
    ('SQ-173', 3, 'HAN', 'SIN', '12:35', '17:15', '2026-11-15', '3h 40m', 220, 'Boeing 787-10', 1, 3850000, 8900000, 'Hành lý 25kg, Suất ăn quốc tế 5 sao', 'Khoang Business 5 sao thế giới, Rượu vang thượng hạng');

    INSERT OR IGNORE INTO tours (id, title, departure_point, destination, duration_days, duration_nights, duration_text, price, agency, airline_id, departure_time, aircraft_type, thumbnail, services, itinerary_json, is_featured) VALUES
    (1, 'Tour Phú Quốc - Đảo Ngọc Nghỉ Dưỡng Grand World & Sunset Town', 'Hà Nội', 'Phú Quốc', 4, 3, '4 Ngày 3 Đêm', 5490000, 'Vietjet Holidays', 1, '06:30', 'Airbus A321', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi VietJet, Khách sạn 4 sao, Xe đưa đón, Vé Grand World', '[{"day":1,"title":"Hà Nội - Đảo Ngọc Phú Quốc - Sunset Town","content":"Đón đoàn tại Nội Bài, đáp chuyến bay đến Phú Quốc. Check-in thị trấn Hoàng Hôn Sunset Town, ngắm Cầu Hôn."},{"day":2,"title":"Khám Phá Grand World - Tinh Hoa Việt Nam","content":"Tham quan kênh đào Venice, bảo tàng Gấu Teddy, xem show thực cảnh Tinh Hoa Việt Nam."},{"day":3,"title":"Tour Canô 4 Đảo - Lặn Ngắm San Hô","content":"Cano cao tốc khám phá Hòn Mây Rút, Hòn Gầm Ghì, lặn ngắm san hô tự nhiên."},{"day":4,"title":"Chợ Dương Đông - Tạm Biệt Phú Quốc","content":"Mua sắm đặc sản tiêu, ngọc trai. Tiễn sân bay về Hà Nội."}]', 1),
    (2, 'Tour Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng Huyền Thoại', 'TP. Hồ Chí Minh', 'Đà Nẵng', 3, 2, '3 Ngày 2 Đêm', 4290000, 'Vietjet Holidays', 1, '07:15', 'Airbus A320', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi, Khách sạn 4* biển Mỹ Khê, Vé cáp treo Bà Nà Hills', '[{"day":1,"title":"TP.HCM - Đà Nẵng - Phố Cổ Hội An","content":"Bay đến Đà Nẵng, viếng Chùa Linh Ứng Bán Đảo Sơn Trà. Chiều tối dạo phố cổ Hội An thả hoa đăng."},{"day":2,"title":"Bà Nà Hills - Cầu Vàng - Fantasy Park","content":"Trải nghiệm cáp treo kỷ lục, check-in Cầu Vàng trên mây, vui chơi Fantasy Park."},{"day":3,"title":"Tắm Biển Mỹ Khê - Mua Sắm Chợ Hàn","content":"Tắm biển Mỹ Khê, mua đặc sản chả bò chợ Hàn, tiễn sân bay về TP.HCM."}]', 1),
    (3, 'Tour Nha Trang - Vịnh San Hô - VinWonders Đẳng Cấp', 'Hà Nội', 'Nha Trang', 4, 3, '4 Ngày 3 Đêm', 4890000, 'Saigontourist', 2, '08:00', 'Airbus A321', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi, Khách sạn trung tâm Trần Phú, Cano Vịnh San Hô', '[{"day":1,"title":"Hà Nội - Cam Ranh - Nha Trang Phố Biển","content":"Đáp sân bay Cam Ranh, tham quan Tháp Bà Ponagar, Viện Hải Dương Học."},{"day":2,"title":"Du Ngoạn Vịnh San Hô - Làng Chài","content":"Lên cano lặn ngắm san hô, dùng tiệc hải sản tươi sống tại Làng Chài."},{"day":3,"title":"Vui Chơi VinWonders Hòn Tre","content":"Cả ngày giải trí tại vịnh phao nổi, thủy cung hiện đại bậc nhất."},{"day":4,"title":"Tắm Bùn Khoáng I-Resort - Tiễn Sân Bay","content":"Thư giãn phục hồi sức khỏe với bùn khoáng nóng thiên nhiên."}]', 1),
    (4, 'Tour Đà Lạt - Săn Mây Cầu Đất - Xứ Sở Ngàn Hoa Thơ Mộng', 'TP. Hồ Chí Minh', 'Đà Lạt', 3, 2, '3 Ngày 2 Đêm', 3290000, 'Vietravel', 1, '06:45', 'Airbus A320', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop', 'Vé máy bay VietJet, Khách sạn ngắm thung lũng, Nông trại Puppy Farm', '[{"day":1,"title":"TP.HCM - Liên Khương - Đà Lạt Mộng Mơ","content":"Check-in Quảng trường Lâm Viên, dạo quanh Hồ Xuân Hương thơ mộng."},{"day":2,"title":"Săn Mây Cầu Đất - Vườn Cẩm Tú Cầu - Puppy Farm","content":"Săn mây bình minh Cầu Đất, chụp ảnh vườn hoa, chơi đùa cùng cún Puppy Farm."},{"day":3,"title":"Chợ Đà Lạt - Tiễn Sân Bay Về TP.HCM","content":"Thưởng thức sữa đậu nành, mua mứt atiso và hoa quả sấy dẻo."}]', 1),
    (5, 'Tour Hà Nội - Vịnh Hạ Long - Du Thuyền 5 Sao Đẳng Cấp', 'TP. Hồ Chí Minh', 'Hạ Long', 4, 3, '4 Ngày 3 Đêm', 6990000, 'Vietjet Holidays', 2, '07:30', 'Boeing 787', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop', 'Vé máy bay khứ hồi Vietnam Airlines, 1 đêm Du thuyền 5 sao', '[{"day":1,"title":"TP.HCM - Hà Nội 36 Phố Phường","content":"Dạo Hồ Gươm, viếng Đền Ngọc Sơn, thưởng thức phở truyền thống và cà phê trứng."},{"day":2,"title":"Hà Nội - Du Thuyền 5 Sao Vịnh Hạ Long","content":"Check-in du thuyền sang trọng, chèo kayak qua hang Luồn, ngắm kỳ quan đá vôi."},{"day":3,"title":"Hang Sửng Sốt - Trở Về Hà Nội","content":"Chiêm ngưỡng nhũ đá hang Sửng Sốt, leo đỉnh Ti Tốp ngắm toàn cảnh Vịnh."},{"day":4,"title":"Viếng Lăng Bác - Văn Miếu - Về TP.HCM","content":"Viếng Lăng Chủ tịch Hồ Chí Minh, Văn Miếu Quốc Tử Giám."}]', 1),
    (6, 'Tour Bangkok - Pattaya - Thiên Đường Du Lịch Mua Sắm', 'Hà Nội', 'Bangkok', 5, 4, '5 Ngày 4 Đêm', 6590000, 'Vietjet Travel', 1, '09:00', 'Airbus A321 Neo', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop', 'Vé máy bay VietJet khứ hồi, Khách sạn 4-5*, Buffet Baiyoke Sky 86 tầng', '[{"day":1,"title":"Hà Nội - Bangkok - Phố Biển Pattaya","content":"Bay thẳng sang Bangkok, di chuyển về Pattaya trải nghiệm phố đi bộ."},{"day":2,"title":"Đảo San Hô Coral - Núi Phật Vàng","content":"Tắm biển đảo Coral, viếng tượng Phật Thích Ca dát vàng 24k trên vách núi."},{"day":3,"title":"Pattaya - Bangkok - Tiệc Buffet Baiyoke Sky","content":"Thưởng thức tiệc buffet trên tầng 86 ngắm toàn cảnh Bangkok rực rỡ."},{"day":4,"title":"Chùa Phật Vàng - Du Thuyền Sông Chaophraya","content":"Chiêm bái tượng Phật vàng 5.5 tấn, mua sắm thỏa thích tại IconSiam."},{"day":5,"title":"Chợ Nổi Bốn Miền - Về Hà Nội","content":"Dạo chợ nổi Thái Lan, mua quà lưu niệm, đáp chuyến bay về Việt Nam."}]', 1),
    (7, 'Tour Singapore - Malaysia - Hai Quốc Gia Một Hành Trình', 'TP. Hồ Chí Minh', 'Singapore', 5, 4, '5 Ngày 4 Đêm', 9890000, 'Vietravel', 3, '08:45', 'Boeing 787-10', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop', 'Vé bay Singapore Airlines 5*, Gardens By The Bay, Cao nguyên Genting', '[{"day":1,"title":"TP.HCM - Singapore - Thác Nước Jewel Changi","content":"Check-in thác nước Jewel Changi, công viên Merlion và siêu cây Gardens by the Bay."},{"day":2,"title":"Đảo Sentosa - Thành Phố Cổ Malacca","content":"Tham quan đảo Sentosa, di chuyển sang thành phố di sản Malacca Malaysia."},{"day":3,"title":"Malacca - Kuala Lumpur - Tháp Đôi Petronas","content":"Chụp ảnh Tháp đôi Petronas, Quảng trường Merdeka độc lập."},{"day":4,"title":"Động Batu - Cao Nguyên Giải Trí Genting","content":"Chinh phục 272 bậc thang Động Batu, đi cáp treo lên đỉnh Genting mát lạnh."},{"day":5,"title":"Kuala Lumpur - TP. Hồ Chí Minh","content":"Tự do mua sắm đặc sản socola, xe tiễn sân bay KLIA về TP.HCM."}]', 1),
    (8, 'Tour Quy Nhơn - Thiên Đường Biển Kỳ Co & Eo Gió', 'Hà Nội', 'Quy Nhơn', 3, 2, '3 Ngày 2 Đêm', 3890000, 'Vietjet Holidays', 1, '10:00', 'Airbus A320', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', 'Vé máy bay VietJet, Khách sạn 4* FLC Quy Nhơn, Cano đảo Kỳ Co', '[{"day":1,"title":"Hà Nội - Phù Cát - Eo Gió Hùng Vĩ","content":"Check-in con đường ven biển Eo Gió, viếng tượng Phật đôi Tịnh Xá Ngọc Hòa."},{"day":2,"title":"Biển Thiên Đường Kỳ Co - Lặn Ngắm San Hô","content":"Đi cano sang Kỳ Co cát trắng nước trong vắt, lặn ngắm san hô Bãi Dứa."},{"day":3,"title":"Ghềnh Ráng Tiên Sa - Hàn Mặc Tử - Về Hà Nội","content":"Thăm Bãi đá Trứng Hoàng Hậu, mộ thi sĩ Hàn Mặc Tử, mua nem Chợ Huyện."}]', 1);
  `;
  db.run(initSql);
}
