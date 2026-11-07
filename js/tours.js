/**
 * ============================================================
 * VIETJET TRAVEL - LOGIC DANH SÁCH TOUR DU LỊCH (js/tours.js)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupTourFilterListeners();
  await loadTourAirlinesOptions();
  await applyTourFiltersAndRender();
});

/**
 * Tải danh sách hãng hàng không đối tác vào bộ lọc bên trái
 */
async function loadTourAirlinesOptions() {
  const container = document.getElementById('filterTourAirlines');
  if (!container) return;

  try {
    const airlines = await dbQuery('SELECT * FROM airlines ORDER BY name ASC;');
    container.innerHTML = airlines.map(airline => `
      <label class="filter-checkbox-label">
        <input type="checkbox" name="filterTourAirline" value="${airline.id}">
        <span>${airline.name}</span>
      </label>
    `).join('');

    container.querySelectorAll('input[name="filterTourAirline"]').forEach(cb => {
      cb.addEventListener('change', () => applyTourFiltersAndRender());
    });
  } catch (err) {
    console.error('Lỗi khi tải hãng hàng không cho tour:', err);
  }
}

/**
 * Đăng ký sự kiện cho bộ lọc Tour
 */
function setupTourFilterListeners() {
  // Sắp xếp giá tour tăng / giảm dần
  document.querySelectorAll('input[name="tourSortPrice"]').forEach(r => {
    r.addEventListener('change', () => applyTourFiltersAndRender());
  });

  // Khung giờ khởi hành
  document.querySelectorAll('input[name="tourTimeSlot"]').forEach(cb => {
    cb.addEventListener('change', () => applyTourFiltersAndRender());
  });

  // Nút đặt lại bộ lọc
  const resetBtn = document.getElementById('btnResetTourFilter');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
      document.getElementById('tourSortAsc').checked = true;
      applyTourFiltersAndRender();
    });
  }
}

/**
 * Lọc và kết xuất danh sách tour từ SQLite
 */
async function applyTourFiltersAndRender() {
  const container = document.getElementById('toursListContainer');
  const countLabel = document.getElementById('toursCountLabel');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Đang tải danh sách tour từ SQLite...</div>';

  try {
    const sortOrder = document.querySelector('input[name="tourSortPrice"]:checked')?.value || 'ASC';
    const selectedAirlines = Array.from(document.querySelectorAll('input[name="filterTourAirline"]:checked')).map(cb => cb.value);
    const selectedTimeSlots = Array.from(document.querySelectorAll('input[name="tourTimeSlot"]:checked')).map(cb => cb.value);

    let query = `
      SELECT t.*, a.name as airline_name, a.logo as airline_logo
      FROM tours t
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE 1=1
    `;
    const params = [];

    // Lọc theo hãng hàng không
    if (selectedAirlines.length > 0) {
      const placeholders = selectedAirlines.map(() => '?').join(',');
      query += ` AND t.airline_id IN (${placeholders})`;
      selectedAirlines.forEach(id => params.push(Number(id)));
    }

    // Lọc theo khung giờ khởi hành
    if (selectedTimeSlots.length > 0) {
      const timeConds = [];
      selectedTimeSlots.forEach(slot => {
        if (slot === 'early') timeConds.push("(t.departure_time >= '00:00' AND t.departure_time < '06:00')");
        if (slot === 'morning') timeConds.push("(t.departure_time >= '06:00' AND t.departure_time < '12:00')");
        if (slot === 'afternoon') timeConds.push("(t.departure_time >= '12:00' AND t.departure_time < '18:00')");
        if (slot === 'evening') timeConds.push("(t.departure_time >= '18:00' AND t.departure_time <= '23:59')");
      });
      if (timeConds.length > 0) {
        query += ` AND (${timeConds.join(' OR ')})`;
      }
    }

    // Sắp xếp giá
    query += ` ORDER BY t.price ${sortOrder};`;

    const tours = await dbQuery(query, params);

    if (countLabel) {
      countLabel.textContent = `Tìm thấy ${tours.length} tour du lịch`;
    }

    if (tours.length === 0) {
      container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 48px; text-align: center;">
          <span style="font-size: 48px; display: block; margin-bottom: 12px;">🏖</span>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Không tìm thấy tour phù hợp</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Vui lòng thử điều chỉnh lại bộ lọc bên trái để xem thêm kết quả.</p>
          <button class="btn btn-outline-primary btn-sm" onclick="document.getElementById('btnResetTourFilter').click()">Đặt Lại Bộ Lọc</button>
        </div>
      `;
      return;
    }

    // Hiển thị danh sách thẻ Tour
    container.innerHTML = tours.map(t => `
      <div class="tour-card" onclick="window.location.href='tour-detail.html?id=${t.id}'" style="cursor: pointer; display: grid; grid-template-columns: 280px 1fr; gap: 20px;">
        <div class="tour-thumbnail-wrap" style="height: 100%; aspect-ratio: auto;">
          <img class="tour-thumbnail" src="${t.thumbnail}" alt="${t.title}" loading="lazy">
          <span class="tour-badge-duration">⏱ ${t.duration_text}</span>
          <span class="tour-badge-agency">${t.agency}</span>
        </div>

        <div class="tour-body" style="padding: 20px 20px 20px 0;">
          <h3 class="tour-title" style="font-size: 18px; height: auto; margin-bottom: 8px;">${t.title}</h3>
          
          <div style="display: flex; gap: 16px; font-size: 13px; color: var(--text-muted); margin-bottom: 12px; flex-wrap: wrap;">
            <span>📍 Điểm đi: <strong>${t.departure_point}</strong> ➔ <strong>${t.destination}</strong></span>
            <span>✈ Bay cùng: <strong style="color: var(--primary);">${t.airline_name || 'VietJet Air'}</strong></span>
            <span>🕒 Giờ cất cánh: <strong>${t.departure_time}</strong></span>
            <span>🛸 Loại tàu bay: <strong>${t.aircraft_type}</strong></span>
          </div>

          <div style="font-size: 13px; color: var(--text-body); background: var(--bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px;">
            🎁 <strong>Dịch vụ bao gồm:</strong> ${t.services}
          </div>

          <div class="tour-footer" style="padding-top: 10px;">
            <div class="tour-price-wrap">
              <span class="tour-price-label">Giá trọn gói / khách</span>
              <span class="tour-price-value">${formatVND(t.price)}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.href='tour-detail.html?id=${t.id}'">
              Xem Chi Tiết Tour →
            </button>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Lỗi khi truy vấn tour:', err);
    container.innerHTML = '<div style="color: red; text-align: center; padding: 40px;">Có lỗi xảy ra khi truy vấn dữ liệu từ SQLite.</div>';
  }
}
