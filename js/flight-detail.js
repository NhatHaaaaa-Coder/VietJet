/**
 * ============================================================
 * VIETJET TRAVEL - CHI TIẾT CHUYẾN BAY (js/flight-detail.js)
 * ============================================================
 */

let currentFlight = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const flightId = urlParams.get('id');

  if (!flightId) {
    showFlightNotFound('Không tìm thấy thông tin chuyến bay!');
    return;
  }

  await loadFlightDetail(flightId);
});

/**
 * Tải chi tiết chuyến bay từ SQLite
 */
async function loadFlightDetail(id) {
  const container = document.getElementById('flightDetailContainer');
  if (!container) return;

  try {
    const flights = await dbQuery(`
      SELECT f.*, 
             a.name as airline_name, 
             a.logo as airline_logo,
             dep.city as departure_city, dep.name as departure_airport_name,
             arr.city as arrival_city, arr.name as arrival_airport_name
      FROM flights f
      JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airports dep ON f.departure_code = dep.code
      LEFT JOIN airports arr ON f.arrival_code = arr.code
      WHERE f.id = ?;
    `, [Number(id)]);

    if (flights.length === 0) {
      showFlightNotFound('Chuyến bay không tồn tại trong hệ thống!');
      return;
    }

    currentFlight = flights[0];
    renderFlightDetail(currentFlight);

  } catch (err) {
    console.error('Lỗi khi tải chi tiết chuyến bay:', err);
    showFlightNotFound('Không thể truy vấn cơ sở dữ liệu SQLite.');
  }
}

/**
 * Kết xuất giao diện chi tiết chuyến bay
 */
function renderFlightDetail(f) {
  const container = document.getElementById('flightDetailContainer');

  container.innerHTML = `
    <!-- Thẻ Tổng quan hành trình -->
    <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-sm); margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--border-light); padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${f.airline_logo}" alt="${f.airline_name}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px;" onerror="this.onerror=null; this.src='Images/vietjet-air.png';">
          <div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main);">${f.airline_name}</h2>
            <span style="font-size: 13px; color: var(--text-muted);">Số hiệu: <strong>${f.flight_number}</strong> | Tàu bay: <strong>${f.aircraft_type}</strong></span>
          </div>
        </div>
        <div style="background: var(--primary-light); color: var(--primary); font-weight: 700; padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px;">
          ${f.is_direct === 1 ? '✓ Chuyến Bay Thẳng' : '⚡ Chuyến Bay Quá Cảnh'}
        </div>
      </div>

      <!-- Hành trình chi tiết -->
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; margin-bottom: 24px;">
        <!-- Điểm đi -->
        <div style="text-align: left;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Khởi hành</span>
          <div style="font-size: 32px; font-weight: 900; color: var(--text-main); line-height: 1.1;">${f.departure_time}</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--primary); margin-top: 4px;">${f.departure_city} (${f.departure_code})</div>
          <div style="font-size: 13px; color: var(--text-muted);">${f.departure_airport_name || 'Sân bay khởi hành'}</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Ngày bay: ${f.flight_date}</div>
        </div>

        <!-- Thời gian ở giữa -->
        <div style="text-align: center; min-width: 140px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">⏱ ${f.duration}</span>
          <div style="width: 100%; height: 2px; background: var(--border-medium); margin: 8px 0; position: relative;">
            <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #ffffff; padding: 0 8px; color: var(--primary); font-size: 16px;">✈</span>
          </div>
          <span style="font-size: 11px; color: var(--text-muted);">Bay liên tục</span>
        </div>

        <!-- Điểm đến -->
        <div style="text-align: right;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Hạ cánh</span>
          <div style="font-size: 32px; font-weight: 900; color: var(--text-main); line-height: 1.1;">${f.arrival_time}</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--primary); margin-top: 4px;">${f.arrival_city} (${f.arrival_code})</div>
          <div style="font-size: 13px; color: var(--text-muted);">${f.arrival_airport_name || 'Sân bay đến'}</div>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">Ngày đến: ${f.flight_date}</div>
        </div>
      </div>
    </div>

    <!-- KHỐI CHỌN GIÁ VÉ: HẠNG PHỔ THÔNG VÀ HẠNG THƯƠNG GIA -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Chọn Hạng Vé Phù Hợp</h3>
      <p style="color: var(--text-muted); font-size: 14px;">Mỗi hạng vé mang lại quyền lợi và dịch vụ riêng biệt cho hành trình của bạn</p>
    </div>

    <div class="ticket-classes-grid">
      <!-- 1. HẠNG PHỔ THÔNG (ECONOMY CLASS) -->
      <div class="ticket-class-card economy">
        <h4 class="ticket-class-title">Hạng Phổ Thông</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Lựa chọn thông minh, giá vé tiết kiệm tối đa</p>
        <div class="ticket-class-price">${formatVND(f.price_economy)} <span style="font-size: 14px; font-weight: normal; color: var(--text-muted);">/ khách</span></div>

        <div class="perks-list">
          <div class="perk-item">
            <span class="perk-icon">✓</span>
            <span>Hành lý xách tay: <strong>07 kg</strong> tiêu chuẩn</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">✓</span>
            <span>Nước lọc đóng chai miễn phí trên chuyến bay</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">✓</span>
            <span>Ghế ngồi tiêu chuẩn êm ái</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">✓</span>
            <span>Thay đổi ngày giờ bay (có tính phí chênh lệch)</span>
          </div>
        </div>

        <button class="btn btn-outline-primary btn-block" onclick="selectFlightClass('Hạng Phổ Thông', ${f.price_economy})">
          Chọn Hạng Phổ Thông
        </button>
      </div>

      <!-- 2. HẠNG THƯƠNG GIA (BUSINESS / SKYBOSS CLASS) -->
      <div class="ticket-class-card business">
        <h4 class="ticket-class-title" style="color: var(--text-main);">Hạng Thương Gia (SkyBoss)</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Trải nghiệm bay đẳng cấp VIP và tiện nghi hoàn hảo</p>
        <div class="ticket-class-price">${formatVND(f.price_business)} <span style="font-size: 14px; font-weight: normal; color: var(--text-muted);">/ khách</span></div>

        <div class="perks-list">
          <div class="perk-item">
            <span class="perk-icon">★</span>
            <span><strong>Phòng chờ VIP sang trọng</strong> tại sân bay</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">★</span>
            <span>Hành lý: <strong>14kg xách tay + 30kg ký gửi</strong> miễn cước</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">★</span>
            <span><strong>Suất ăn nóng ấm & thức uống hảo hạng</strong> trên máy bay</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">★</span>
            <span>Ưu tiên làm thủ tục, lối đi an ninh riêng & xe đưa đón VIP</span>
          </div>
          <div class="perk-item">
            <span class="perk-icon">★</span>
            <span>Miễn phí thay đổi ngày giờ bay và hành trình</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block" style="background-color: var(--primary);" onclick="selectFlightClass('Hạng Thương Gia', ${f.price_business})">
          Chọn Hạng Thương Gia
        </button>
      </div>
    </div>
  `;
}

/**
 * Xử lý khi chọn hạng vé -> Lưu vào Giỏ Hàng trong SQLite
 */
async function selectFlightClass(ticketClass, price) {
  if (!currentFlight) return;

  try {
    const f = currentFlight;
    const title = `Chuyến bay ${f.departure_city || f.departure_code} ➔ ${f.arrival_city || f.arrival_code} [${f.flight_number}]`;
    const departureInfo = `${f.departure_code} ${f.departure_time} (${f.flight_date})`;
    const arrivalInfo = `${f.arrival_code} ${f.arrival_time} (${f.flight_date})`;
    const detailsJson = JSON.stringify({
      aircraft: f.aircraft_type,
      airline: f.airline_name,
      flight_number: f.flight_number,
      is_direct: f.is_direct
    });

    // Thêm vào bảng cart trong SQLite
    await dbRun(`
      INSERT INTO cart (item_type, item_id, title, ticket_class, airline_name, departure_info, arrival_info, unit_price, quantity, total_price, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      'flight',
      f.id,
      title,
      ticketClass,
      f.airline_name,
      departureInfo,
      arrivalInfo,
      price,
      1,
      price,
      detailsJson
    ]);

    // Cập nhật số lượng trên icon giỏ hàng Navbar
    await updateCartBadge();

    // Hiển thị modal thông báo thành công
    showAddToCartSuccessModal(title, ticketClass, price);

  } catch (err) {
    console.error('Lỗi khi lưu chuyến bay vào giỏ hàng:', err);
    showToast('Lỗi khi thêm vào giỏ hàng!', 'error');
  }
}

/**
 * Bật Modal chúc mừng đã thêm vào giỏ hàng
 */
function showAddToCartSuccessModal(title, ticketClass, price) {
  let modal = document.getElementById('cartSuccessModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cartSuccessModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-success-icon">✓</div>
      <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Đã Thêm Vào Giỏ Hàng!</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Chuyến bay của bạn đã được lưu vào giỏ hàng thành công.</p>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; text-align: left;">
        <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">${title}</div>
        <div style="font-size: 13px; color: var(--primary); font-weight: 700;">${ticketClass}</div>
        <div style="font-size: 16px; font-weight: 900; color: var(--text-main); margin-top: 6px;">${formatVND(price)}</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-outline btn-block" onclick="document.getElementById('cartSuccessModal').classList.remove('active')">
          Tiếp Tục Chọn
        </button>
        <button class="btn btn-primary btn-block" onclick="window.location.href='cart.html'">
          Đến Giỏ Hàng →
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function showFlightNotFound(msg) {
  const container = document.getElementById('flightDetailContainer');
  if (container) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 48px; text-align: center;">
        <span style="font-size: 48px; display: block; margin-bottom: 12px;">✈</span>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">${msg}</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Vui lòng quay lại danh sách chuyến bay để chọn chuyến bay khác.</p>
        <a href="flights.html" class="btn btn-primary btn-sm">Xem Danh Sách Chuyến Bay</a>
      </div>
    `;
  }
}
