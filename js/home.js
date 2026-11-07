/**
 * ============================================================
 * VIETJET TRAVEL - LOGIC TRANG CHỦ (js/home.js)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  await initSearchWidget();
  await loadFeaturedTours();
  await loadPartnerAirlines();
});

/**
 * Khởi tạo widget tìm kiếm vé máy bay
 */
async function initSearchWidget() {
  const tripTypeRadios = document.querySelectorAll('input[name="tripType"]');
  const returnDateInput = document.getElementById('returnDate');
  const departDateInput = document.getElementById('departDate');
  const fromSelect = document.getElementById('fromCity');
  const toSelect = document.getElementById('toCity');
  const searchBtn = document.getElementById('btnSearchFlights');

  // Đặt ngày mặc định (Hôm nay và 3 ngày sau)
  const today = new Date();
  const returnDate = new Date();
  returnDate.setDate(today.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];
  if (departDateInput) departDateInput.value = formatDate(today);
  if (returnDateInput) returnDateInput.value = formatDate(returnDate);

  // Xử lý bật/tắt ngày về khi chọn Một chiều hoặc Khứ hồi
  tripTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.tab-option').forEach(el => el.classList.remove('active'));
      radio.closest('.tab-option').classList.add('active');

      if (radio.value === 'oneway') {
        returnDateInput.disabled = true;
        returnDateInput.parentElement.style.opacity = '0.5';
      } else {
        returnDateInput.disabled = false;
        returnDateInput.parentElement.style.opacity = '1';
      }
    });
  });

  // Tải danh sách sân bay từ SQLite
  try {
    const airports = await dbQuery('SELECT * FROM airports ORDER BY city ASC;');
    if (airports.length > 0) {
      const optionsHtml = airports.map(a => `<option value="${a.code}">${a.city} (${a.code})</option>`).join('');
      if (fromSelect) {
        fromSelect.innerHTML = optionsHtml;
        fromSelect.value = 'HAN'; // Mặc định Hà Nội
      }
      if (toSelect) {
        toSelect.innerHTML = optionsHtml;
        toSelect.value = 'SGN'; // Mặc định TP.HCM
      }
    }
  } catch (err) {
    console.warn('Lỗi tải danh sách sân bay:', err);
  }

  // Bắt sự kiện click Tìm Kiếm -> Chuyển hướng sang flights.html
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const from = fromSelect.value;
      const to = toSelect.value;
      const departDate = departDateInput.value;
      const returnDate = returnDateInput.disabled ? '' : returnDateInput.value;
      const tripType = document.querySelector('input[name="tripType"]:checked')?.value || 'roundtrip';

      if (from === to) {
        showToast('Điểm xuất phát và điểm đến không được trùng nhau!', 'error');
        return;
      }

      // Điều hướng kèm query parameters
      window.location.href = `flights.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departDate=${encodeURIComponent(departDate)}&returnDate=${encodeURIComponent(returnDate)}&tripType=${encodeURIComponent(tripType)}`;
    });
  }
}

/**
 * Tải 8 tour du lịch nổi bật từ SQLite (Thumbnail chuẩn 600x400)
 */
async function loadFeaturedTours() {
  const container = document.getElementById('featuredToursList');
  if (!container) return;

  try {
    const tours = await dbQuery('SELECT * FROM tours WHERE is_featured = 1 ORDER BY id ASC LIMIT 8;');
    
    if (tours.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Đang cập nhật danh sách tour nổi bật...</p>';
      return;
    }

    container.innerHTML = tours.map(tour => `
      <div class="tour-card" onclick="window.location.href='tour-detail.html?id=${tour.id}'" style="cursor: pointer;">
        <div class="tour-thumbnail-wrap">
          <img class="tour-thumbnail" src="${tour.thumbnail}" alt="${tour.title}" loading="lazy">
          <span class="tour-badge-duration">⏱ ${tour.duration_text}</span>
          <span class="tour-badge-agency">${tour.agency}</span>
        </div>
        <div class="tour-body">
          <h3 class="tour-title" title="${tour.title}">${tour.title}</h3>
          <div class="tour-meta">
            <span class="tour-meta-item">📍 Khởi hành: <strong>${tour.departure_point}</strong></span>
            <span class="tour-meta-item">✈ ${tour.aircraft_type}</span>
          </div>
          <div class="tour-footer">
            <div class="tour-price-wrap">
              <span class="tour-price-label">Giá chỉ từ</span>
              <span class="tour-price-value">${formatVND(tour.price)}</span>
            </div>
            <button class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation(); window.location.href='tour-detail.html?id=${tour.id}'">Xem Tour</button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Lỗi khi tải tour nổi bật:', err);
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Không thể tải dữ liệu tour từ SQLite.</p>';
  }
}

/**
 * Tải danh sách logo hãng hàng không từ SQLite (Click dẫn sang flights.html)
 */
async function loadPartnerAirlines() {
  const container = document.getElementById('airlinesList');
  if (!container) return;

  try {
    const airlines = await dbQuery('SELECT * FROM airlines ORDER BY id ASC;');

    container.innerHTML = airlines.map(airline => `
      <div class="airline-card" onclick="window.location.href='flights.html?airline=${encodeURIComponent(airline.name)}'" title="Xem tất cả chuyến bay của ${airline.name}">
        <div class="airline-logo-box">
          <img src="${airline.logo}" alt="${airline.name}" onerror="this.onerror=null; this.src='Images/vietjet-air.png';">
        </div>
        <div class="airline-name">${airline.name}</div>
        <div class="airline-desc">${airline.country}</div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Lỗi tải hãng hàng không:', err);
  }
}
