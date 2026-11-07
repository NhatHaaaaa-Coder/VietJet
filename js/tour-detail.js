/**
 * ============================================================
 * VIETJET TRAVEL - CHI TIẾT TOUR DU LỊCH (js/tour-detail.js)
 * ============================================================
 */

let currentTour = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('id');

  if (!tourId) {
    showTourNotFound('Không tìm thấy thông tin tour du lịch!');
    return;
  }

  await loadTourDetail(tourId);
});

/**
 * Tải chi tiết tour từ SQLite
 */
async function loadTourDetail(id) {
  const container = document.getElementById('tourDetailContainer');
  if (!container) return;

  try {
    const tours = await dbQuery(`
      SELECT t.*, a.name as airline_name, a.logo as airline_logo
      FROM tours t
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE t.id = ?;
    `, [Number(id)]);

    if (tours.length === 0) {
      showTourNotFound('Tour du lịch không tồn tại!');
      return;
    }

    currentTour = tours[0];
    renderTourDetail(currentTour);

  } catch (err) {
    console.error('Lỗi khi tải chi tiết tour:', err);
    showTourNotFound('Không thể truy vấn cơ sở dữ liệu SQLite.');
  }
}

/**
 * Kết xuất giao diện chi tiết tour và lịch trình
 */
function renderTourDetail(t) {
  const container = document.getElementById('tourDetailContainer');

  // Giải mã lịch trình các ngày
  let itineraryList = [];
  try {
    itineraryList = JSON.parse(t.itinerary_json);
  } catch (e) {
    console.warn('Lỗi parse JSON lịch trình:', e);
  }

  container.innerHTML = `
    <!-- Ảnh Bìa & Thông tin cơ bản -->
    <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); margin-bottom: 32px;">
      <div style="width: 100%; height: 380px; position: relative; overflow: hidden; background: #e2e8f0;">
        <img src="${t.thumbnail}" alt="${t.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; top: 20px; left: 20px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #ffffff; font-size: 14px; font-weight: 700; padding: 6px 14px; border-radius: var(--radius-full);">
          ⏱ Thời lượng: ${t.duration_text}
        </span>
        <span style="position: absolute; top: 20px; right: 20px; background: var(--accent); color: #0f172a; font-size: 13px; font-weight: 800; padding: 6px 14px; border-radius: var(--radius-sm); text-transform: uppercase;">
          ${t.agency}
        </span>
      </div>

      <div style="padding: 32px;">
        <h1 style="font-size: 26px; font-weight: 900; color: var(--text-main); margin-bottom: 16px; line-height: 1.3;">${t.title}</h1>

        <!-- Khối Thông Tin Chuyến Đi: Điểm đi, điểm đến, thời gian bay, hãng bay, loại máy bay -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: var(--bg-surface); padding: 20px; border-radius: var(--radius-md); margin-bottom: 24px;">
          <div>
            <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block;">HÀNH TRÌNH</span>
            <strong style="color: var(--text-main); font-size: 15px;">${t.departure_point} ➔ ${t.destination}</strong>
          </div>
          <div>
            <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block;">HÃNG BAY ĐỒNG HÀNH</span>
            <strong style="color: var(--primary); font-size: 15px;">${t.airline_name || 'VietJet Air'}</strong>
          </div>
          <div>
            <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block;">GIỜ CẤT CÁNH</span>
            <strong style="color: var(--text-main); font-size: 15px;">${t.departure_time}</strong>
          </div>
          <div>
            <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block;">LOẠI TÀU BAY</span>
            <strong style="color: var(--text-main); font-size: 15px;">${t.aircraft_type}</strong>
          </div>
        </div>

        <!-- Dịch vụ bao gồm -->
        <div style="margin-bottom: 28px;">
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-main); margin-bottom: 10px;">🎁 Dịch Vụ Đã Bao Gồm Trong Tour</h3>
          <p style="font-size: 14px; color: var(--text-body); background: var(--primary-light); border: 1px solid var(--primary-border); padding: 14px 18px; border-radius: var(--radius-md);">
            ${t.services}
          </p>
        </div>

        <!-- Khối Giá và Nút Chọn Tour Lưu Vào Giỏ Hàng -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-top: 1px solid var(--border-light); padding-top: 24px;">
          <div>
            <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Giá trọn gói khuyến mãi / khách:</span>
            <div style="font-size: 32px; font-weight: 900; color: var(--primary); line-height: 1.1;">${formatVND(t.price)}</div>
          </div>

          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="display: flex; align-items: center; border: 1.5px solid var(--border-medium); border-radius: var(--radius-md); overflow: hidden;">
              <button style="padding: 10px 14px; background: var(--bg-surface); cursor: pointer; font-weight: bold;" onclick="adjustGuestCount(-1)">-</button>
              <input type="number" id="tourGuestCount" value="1" min="1" max="10" style="width: 50px; text-align: center; font-weight: bold; border: none; outline: none;" readonly>
              <button style="padding: 10px 14px; background: var(--bg-surface); cursor: pointer; font-weight: bold;" onclick="adjustGuestCount(1)">+</button>
            </div>

            <button class="btn btn-primary btn-lg" onclick="addTourToCart()">
              🛒 Chọn Tour & Thêm Vào Giỏ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- KHỐI LỊCH TRÌNH CHUYẾN ĐI (DAY-BY-DAY ITINERARY) -->
    <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-sm);">
      <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main);">📅 Lịch Trình Chi Tiết Chuyến Đi</h2>
        <p style="color: var(--text-muted); font-size: 14px;">Chương trình tham quan chi tiết qua từng ngày của ${t.agency}</p>
      </div>

      <div class="itinerary-timeline">
        ${itineraryList.map(day => `
          <div class="itinerary-day-item">
            <h4 class="itinerary-day-title">Ngày ${day.day}: ${day.title}</h4>
            <p class="itinerary-day-desc">${day.content}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function adjustGuestCount(change) {
  const input = document.getElementById('tourGuestCount');
  if (!input) return;
  let val = parseInt(input.value) + change;
  if (val < 1) val = 1;
  if (val > 10) val = 10;
  input.value = val;
}

/**
 * Xử lý khi bấm Chọn Tour -> Lưu vào Giỏ Hàng trong SQLite
 */
async function addTourToCart() {
  if (!currentTour) return;

  const guestInput = document.getElementById('tourGuestCount');
  const quantity = guestInput ? parseInt(guestInput.value) || 1 : 1;
  const t = currentTour;
  const totalPrice = t.price * quantity;

  try {
    const title = `${t.title} (${t.duration_text})`;
    const departureInfo = `${t.departure_point} (${t.departure_time})`;
    const arrivalInfo = `${t.destination} (${t.duration_text})`;
    const detailsJson = JSON.stringify({
      agency: t.agency,
      airline: t.airline_name || 'VietJet Air',
      aircraft: t.aircraft_type,
      services: t.services
    });

    await dbRun(`
      INSERT INTO cart (item_type, item_id, title, ticket_class, airline_name, departure_info, arrival_info, unit_price, quantity, total_price, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      'tour',
      t.id,
      title,
      'Tour Trọn Gói',
      t.airline_name || 'VietJet Air',
      departureInfo,
      arrivalInfo,
      t.price,
      quantity,
      totalPrice,
      detailsJson
    ]);

    await updateCartBadge();

    // Hiển thị modal thông báo thành công
    showAddTourSuccessModal(title, quantity, totalPrice);

  } catch (err) {
    console.error('Lỗi khi thêm tour vào giỏ hàng:', err);
    showToast('Có lỗi khi thêm tour vào giỏ hàng!', 'error');
  }
}

/**
 * Bật Modal chúc mừng đã thêm Tour vào giỏ hàng
 */
function showAddTourSuccessModal(title, qty, totalPrice) {
  let modal = document.getElementById('tourSuccessModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tourSuccessModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-success-icon">🏖</div>
      <h3 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Đã Thêm Tour Vào Giỏ Hàng!</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Bạn đã chọn gói tour thành công.</p>

      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; text-align: left;">
        <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">${title}</div>
        <div style="font-size: 13px; color: var(--text-muted);">Số lượng: <strong>${qty} khách</strong></div>
        <div style="font-size: 18px; font-weight: 900; color: var(--primary); margin-top: 6px;">Tổng: ${formatVND(totalPrice)}</div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-outline btn-block" onclick="document.getElementById('tourSuccessModal').classList.remove('active')">
          Xem Thêm Tour
        </button>
        <button class="btn btn-primary btn-block" onclick="window.location.href='cart.html'">
          Đến Giỏ Hàng →
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function showTourNotFound(msg) {
  const container = document.getElementById('tourDetailContainer');
  if (container) {
    container.innerHTML = `
      <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 48px; text-align: center;">
        <span style="font-size: 48px; display: block; margin-bottom: 12px;">🏖</span>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">${msg}</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Vui lòng quay lại danh sách tour để chọn chuyến đi khác.</p>
        <a href="tours.html" class="btn btn-primary btn-sm">Xem Danh Sách Tour</a>
      </div>
    `;
  }
}
