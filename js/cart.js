/**
 * ============================================================
 * VIETJET TRAVEL - QUẢN LÝ GIỎ HÀNG & ĐĂNG KÝ ĐẶT VÉ (js/cart.js)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  await renderCart();
  setupBookingForm();
});

/**
 * Hiển thị các dịch vụ (chuyến bay, tour) đã chọn trong bảng cart của SQLite
 */
async function renderCart() {
  const container = document.getElementById('cartItemsList');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const emptyState = document.getElementById('cartEmptyState');
  const contentSection = document.getElementById('cartContentSection');

  if (!container) return;

  try {
    const items = await dbQuery('SELECT * FROM cart ORDER BY id DESC;');

    if (items.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (contentSection) contentSection.style.display = 'none';
      if (subtotalEl) subtotalEl.textContent = '0 ₫';
      if (totalEl) totalEl.textContent = '0 ₫';
      await updateCartBadge();
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (contentSection) contentSection.style.display = 'grid';

    let grandTotal = 0;

    container.innerHTML = items.map(item => {
      grandTotal += item.total_price;
      const isFlight = item.item_type === 'flight';

      return `
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: ${isFlight ? 'var(--primary-light)' : 'var(--accent-light)'}; color: ${isFlight ? 'var(--primary)' : '#854d0e'}; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
              ${isFlight ? '✈' : '🏖'}
            </div>

            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background: ${isFlight ? 'var(--primary-light)' : 'var(--accent)'}; color: ${isFlight ? 'var(--primary)' : '#000'};">
                  ${isFlight ? 'Chuyến Bay' : 'Tour Du Lịch'}
                </span>
                <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">${item.airline_name || ''}</span>
              </div>

              <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">${item.title}</h4>
              
              <div style="font-size: 13px; color: var(--text-muted); display: flex; gap: 12px; flex-wrap: wrap;">
                ${item.ticket_class ? `<span>Hạng: <strong style="color: var(--primary);">${item.ticket_class}</strong></span>` : ''}
                <span>Nơi đi: ${item.departure_info}</span>
                <span>Nơi đến: ${item.arrival_info}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 24px;">
            <!-- Bộ chỉnh số lượng -->
            <div style="display: flex; align-items: center; border: 1px solid var(--border-medium); border-radius: var(--radius-sm); overflow: hidden;">
              <button style="padding: 6px 10px; background: var(--bg-surface); cursor: pointer;" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
              <span style="padding: 6px 12px; font-weight: 700; font-size: 14px;">${item.quantity}</span>
              <button style="padding: 6px 10px; background: var(--bg-surface); cursor: pointer;" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>

            <!-- Giá tiền -->
            <div style="text-align: right; min-width: 120px;">
              <div style="font-size: 18px; font-weight: 900; color: var(--primary);">${formatVND(item.total_price)}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${formatVND(item.unit_price)} / vé</div>
            </div>

            <!-- Nút xóa mục -->
            <button onclick="removeCartItem(${item.id})" style="background: none; border: none; cursor: pointer; color: var(--error); padding: 8px; font-size: 18px;" title="Xóa khỏi giỏ hàng">
              🗑
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = formatVND(grandTotal);
    if (totalEl) totalEl.textContent = formatVND(grandTotal);

    await updateCartBadge();

  } catch (err) {
    console.error('Lỗi khi tải giỏ hàng:', err);
  }
}

/**
 * Cập nhật số lượng vé / khách của 1 mục trong giỏ
 */
async function updateItemQuantity(itemId, newQty) {
  if (newQty <= 0) {
    await removeCartItem(itemId);
    return;
  }

  try {
    const item = (await dbQuery('SELECT * FROM cart WHERE id = ?;', [itemId]))[0];
    if (item) {
      const newTotal = item.unit_price * newQty;
      await dbRun('UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?;', [newQty, newTotal, itemId]);
      await renderCart();
    }
  } catch (err) {
    console.error('Lỗi cập nhật số lượng:', err);
  }
}

/**
 * Xóa 1 mục khỏi giỏ hàng
 */
async function removeCartItem(itemId) {
  try {
    await dbRun('DELETE FROM cart WHERE id = ?;', [itemId]);
    showToast('Đã xóa dịch vụ khỏi giỏ hàng.');
    await renderCart();
  } catch (err) {
    console.error('Lỗi xóa mục giỏ hàng:', err);
  }
}

/**
 * Xóa toàn bộ giỏ hàng
 */
async function clearAllCart() {
  if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ dịch vụ trong giỏ hàng không?')) {
    return;
  }

  try {
    await dbRun('DELETE FROM cart;');
    showToast('Đã xóa toàn bộ giỏ hàng.');
    await renderCart();
  } catch (err) {
    console.error('Lỗi làm trống giỏ hàng:', err);
  }
}

/**
 * Đăng ký sự kiện biểu mẫu thông tin khách hàng & Đăng ký
 */
function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Kiểm tra giỏ hàng có rỗng không
    const items = await dbQuery('SELECT * FROM cart;');
    if (items.length === 0) {
      showToast('Giỏ hàng đang rỗng! Vui lòng chọn chuyến bay hoặc tour trước.', 'error');
      return;
    }

    // 2. Lấy dữ liệu từ form
    const fullName = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const idCard = document.getElementById('custIdCard').value.trim();
    const note = document.getElementById('custNote').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'VietQR';

    if (!fullName || !phone || !email) {
      showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Email!', 'error');
      return;
    }

    // 3. Tính tổng tiền & chuẩn bị mã đặt chỗ (PNR)
    let totalAmount = 0;
    items.forEach(it => totalAmount += it.total_price);

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingCode = `VJ-${randomNum}`;

    try {
      // 4. Lưu đơn hàng vào bảng bookings trong SQLite
      await dbRun(`
        INSERT INTO bookings (booking_code, customer_name, customer_phone, customer_email, customer_id_card, note, payment_method, total_amount, items_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        bookingCode,
        fullName,
        phone,
        email,
        idCard,
        note,
        paymentMethod,
        totalAmount,
        JSON.stringify(items),
        'Đã xác nhận'
      ]);

      // 5. Làm trống giỏ hàng
      await dbRun('DELETE FROM cart;');
      await updateCartBadge();

      // 6. Hiển thị Popup / Modal thông báo hoàn thành
      showOrderSuccessModal(bookingCode, fullName, email, totalAmount, paymentMethod, items.length);

    } catch (err) {
      console.error('Lỗi khi lưu đơn đặt chỗ vào SQLite:', err);
      showToast('Có lỗi xảy ra khi xử lý đơn hàng!', 'error');
    }
  });
}

/**
 * Hiển thị Modal chúc mừng đặt vé / tour thành công
 */
function showOrderSuccessModal(bookingCode, name, email, totalAmount, paymentMethod, itemsCount) {
  let modal = document.getElementById('orderCompleteModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orderCompleteModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 580px; text-align: left;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="modal-success-icon">🎉</div>
        <h2 style="font-size: 24px; font-weight: 900; color: var(--text-main); margin-bottom: 6px;">Đăng Ký Đặt Chỗ Thành Công!</h2>
        <p style="color: var(--text-muted); font-size: 14px;">Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Vietjet Travel.</p>
      </div>

      <!-- Khối Mã đặt chỗ nổi bật -->
      <div style="background: var(--primary-light); border: 1.5px dashed var(--primary); border-radius: var(--radius-md); padding: 18px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">MÃ ĐẶT CHỖ (MÃ PNR)</span>
        <div style="font-size: 28px; font-weight: 900; color: var(--primary); letter-spacing: 2px;">${bookingCode}</div>
        <span style="font-size: 12px; color: var(--text-muted);">Vui lòng lưu lại mã này khi làm thủ tục chuyến bay</span>
      </div>

      <!-- Tóm tắt thông tin đơn hàng -->
      <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; margin-bottom: 24px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Khách hàng:</span>
          <strong>${name}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Email nhận vé:</span>
          <strong>${email}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Phương thức thanh toán:</span>
          <strong>${paymentMethod}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Số lượng dịch vụ:</span>
          <strong>${itemsCount} dịch vụ</strong>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 10px; margin-top: 10px;">
          <span style="font-weight: 700; color: var(--text-main);">Tổng tiền thanh toán:</span>
          <strong style="font-size: 18px; color: var(--primary);">${formatVND(totalAmount)}</strong>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary btn-block" onclick="window.location.href='index.html'">
          Về Trang Chủ
        </button>
        <button class="btn btn-outline-primary btn-block" onclick="window.print()">
          In Vé Điện Tử 🖨
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}
