/**
 * ============================================================
 * VIETJET TRAVEL - LOGIC TRANG CHUYẾN BAY (js/flights.js)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupFilterEventListeners();
  await loadAirlinesFilterOptions();
  await applyFiltersAndRenderFlights();
});

/**
 * Đọc tham số URL
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get('from') || '',
    to: params.get('to') || '',
    airline: params.get('airline') || '',
    tripType: params.get('tripType') || '',
    departDate: params.get('departDate') || ''
  };
}

/**
 * Tải danh sách hãng bay động vào checkbox bộ lọc bên trái
 */
async function loadAirlinesFilterOptions() {
  const container = document.getElementById('filterAirlinesContainer');
  if (!container) return;

  try {
    const airlines = await dbQuery('SELECT * FROM airlines ORDER BY name ASC;');
    const urlParams = getUrlParams();

    container.innerHTML = airlines.map(airline => {
      const isChecked = urlParams.airline && urlParams.airline.toLowerCase().includes(airline.name.toLowerCase());
      return `
        <label class="filter-checkbox-label">
          <input type="checkbox" name="filterAirline" value="${airline.id}" ${isChecked ? 'checked' : ''}>
          <span>${airline.name}</span>
        </label>
      `;
    }).join('');

    // Gán sự kiện change cho các checkbox vừa tạo
    container.querySelectorAll('input[name="filterAirline"]').forEach(cb => {
      cb.addEventListener('change', () => applyFiltersAndRenderFlights());
    });
  } catch (err) {
    console.error('Lỗi khi nạp danh sách hãng hàng không:', err);
  }
}

/**
 * Đăng ký sự kiện cho tất cả các điều khiển của bộ lọc bên trái
 */
function setupFilterEventListeners() {
  // Sắp xếp giá
  document.querySelectorAll('input[name="sortPrice"]').forEach(r => {
    r.addEventListener('change', () => applyFiltersAndRenderFlights());
  });

  // Loại vé
  document.querySelectorAll('input[name="filterTripType"]').forEach(r => {
    r.addEventListener('change', () => applyFiltersAndRenderFlights());
  });

  // Hình thức bay (Bay thẳng, Nhiều thành phố)
  document.querySelectorAll('input[name="flightType"]').forEach(cb => {
    cb.addEventListener('change', () => applyFiltersAndRenderFlights());
  });

  // Khung giờ cất cánh
  document.querySelectorAll('input[name="departTimeSlot"]').forEach(cb => {
    cb.addEventListener('change', () => applyFiltersAndRenderFlights());
  });

  // Hạng dịch vụ (Phổ thông, Thương gia)
  document.querySelectorAll('input[name="serviceClass"]').forEach(r => {
    r.addEventListener('change', () => applyFiltersAndRenderFlights());
  });

  // Nút đặt lại bộ lọc
  const resetBtn = document.getElementById('btnResetFilter');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.getElementById('sortPriceAsc').checked = true;
      document.getElementById('tripTypeAll').checked = true;
      document.getElementById('serviceClassAll').checked = true;
      applyFiltersAndRenderFlights();
    });
  }
}

/**
 * Truy vấn SQLite và kết xuất danh sách chuyến bay
 */
async function applyFiltersAndRenderFlights() {
  const container = document.getElementById('flightsList');
  const countLabel = document.getElementById('flightResultsCount');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Đang truy vấn các chuyến bay từ SQLite...</div>';

  try {
    const urlParams = getUrlParams();

    // 1. Thu thập điều kiện lọc
    const sortOrder = document.querySelector('input[name="sortPrice"]:checked')?.value || 'ASC';
    
    // Hãng bay được chọn
    const selectedAirlines = Array.from(document.querySelectorAll('input[name="filterAirline"]:checked')).map(cb => cb.value);

    // Hình thức bay
    const selectedFlightTypes = Array.from(document.querySelectorAll('input[name="flightType"]:checked')).map(cb => cb.value);

    // Khung giờ cất cánh
    const selectedTimeSlots = Array.from(document.querySelectorAll('input[name="departTimeSlot"]:checked')).map(cb => cb.value);

    // Hạng dịch vụ
    const serviceClass = document.querySelector('input[name="serviceClass"]:checked')?.value || 'all';

    // 2. Xây dựng câu truy vấn SQL động
    let query = `
      SELECT f.*, 
             a.name as airline_name, 
             a.logo as airline_logo,
             dep.city as departure_city,
             arr.city as arrival_city
      FROM flights f
      JOIN airlines a ON f.airline_id = a.id
      LEFT JOIN airports dep ON f.departure_code = dep.code
      LEFT JOIN airports arr ON f.arrival_code = arr.code
      WHERE 1=1
    `;

    const params = [];

    // Lọc theo nơi đi / nơi đến từ URL nếu có
    if (urlParams.from) {
      query += ` AND f.departure_code = ?`;
      params.push(urlParams.from);
    }
    if (urlParams.to) {
      query += ` AND f.arrival_code = ?`;
      params.push(urlParams.to);
    }

    // Lọc theo hãng bay
    if (selectedAirlines.length > 0) {
      const placeholders = selectedAirlines.map(() => '?').join(',');
      query += ` AND f.airline_id IN (${placeholders})`;
      selectedAirlines.forEach(id => params.push(Number(id)));
    }

    // Lọc bay thẳng / quá cảnh
    if (selectedFlightTypes.length === 1) {
      if (selectedFlightTypes[0] === 'direct') {
        query += ` AND f.is_direct = 1`;
      } else if (selectedFlightTypes[0] === 'transit') {
        query += ` AND f.is_direct = 0`;
      }
    }

    // Lọc theo khung giờ cất cánh
    if (selectedTimeSlots.length > 0) {
      const timeConditions = [];
      selectedTimeSlots.forEach(slot => {
        if (slot === 'early') timeConditions.push("(f.departure_time >= '00:00' AND f.departure_time < '06:00')");
        if (slot === 'morning') timeConditions.push("(f.departure_time >= '06:00' AND f.departure_time < '12:00')");
        if (slot === 'afternoon') timeConditions.push("(f.departure_time >= '12:00' AND f.departure_time < '18:00')");
        if (slot === 'evening') timeConditions.push("(f.departure_time >= '18:00' AND f.departure_time <= '23:59')");
      });
      if (timeConditions.length > 0) {
        query += ` AND (${timeConditions.join(' OR ')})`;
      }
    }

    // Sắp xếp theo giá
    if (serviceClass === 'business') {
      query += ` ORDER BY f.price_business ${sortOrder};`;
    } else {
      query += ` ORDER BY f.price_economy ${sortOrder};`;
    }

    // 3. Thực thi truy vấn
    const flights = await dbQuery(query, params);

    if (countLabel) {
      countLabel.textContent = `Tìm thấy ${flights.length} chuyến bay`;
    }

    if (flights.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 48px; text-align: center;">
          <span style="font-size: 48px; display: block; margin-bottom: 12px;">🛫</span>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Không tìm thấy chuyến bay phù hợp</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Vui lòng thử bỏ chọn một số tiêu chí bộ lọc bên trái để xem thêm kết quả.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="document.getElementById('btnResetFilter').click()">Đặt Lại Bộ Lọc</button>
        </div>
      `;
      return;
    }

    // 4. Kết xuất thẻ chuyến bay
    container.innerHTML = flights.map(f => {
      const displayPrice = serviceClass === 'business' ? f.price_business : f.price_economy;
      const classLabel = serviceClass === 'business' ? 'Hạng Thương Gia' : 'Hạng Phổ Thông';
      const services = serviceClass === 'business' ? (f.services_business || '') : (f.services_economy || '');

      return `
        <div class="flight-card" onclick="window.location.href='flight-detail.html?id=${f.id}'" style="cursor: pointer;">
          <!-- Thông tin Hãng bay -->
          <div class="flight-airline-info">
            <div class="flight-airline-header">
              <img class="flight-airline-logo" src="${f.airline_logo}" alt="${f.airline_name}" onerror="this.onerror=null; this.src='Images/vietjet-air.png';">
              <span class="flight-airline-name">${f.airline_name}</span>
            </div>
            <span class="flight-number-badge">Số hiệu: ${f.flight_number}</span>
            <span style="font-size: 12px; color: var(--text-muted);">Máy bay: ${f.aircraft_type}</span>
          </div>

          <!-- Lịch trình & Thời gian bay -->
          <div class="flight-timeline">
            <div class="flight-point">
              <div class="flight-time">${f.departure_time}</div>
              <div class="flight-code">${f.departure_city || f.departure_code} (${f.departure_code})</div>
            </div>

            <div class="flight-duration-center">
              <span class="flight-duration-text">${f.duration}</span>
              <div class="flight-line"></div>
              <span class="flight-type-badge">${f.is_direct === 1 ? 'Bay Thẳng' : 'Quá Cảnh'}</span>
            </div>

            <div class="flight-point">
              <div class="flight-time">${f.arrival_time}</div>
              <div class="flight-code">${f.arrival_city || f.arrival_code} (${f.arrival_code})</div>
            </div>
          </div>

          <!-- Giá vé & Nút chọn -->
          <div class="flight-pricing-action">
            <span class="flight-price-from">${classLabel}</span>
            <span class="flight-price-amount">${formatVND(displayPrice)}</span>
            <span style="font-size: 11px; color: var(--text-muted); text-align: right; max-width: 170px;">
              ${services.length > 50 ? services.substring(0, 50) + '...' : services}
            </span>
            <button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); window.location.href='flight-detail.html?id=${f.id}'">
              Chọn Chuyến Bay
            </button>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Lỗi khi truy vấn chuyến bay:', err);
    container.innerHTML = '<div style="color: red; text-align: center; padding: 40px;">Có lỗi xảy ra khi truy vấn dữ liệu từ SQLite.</div>';
  }
}
