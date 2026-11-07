/**
 * ============================================================
 * VIETJET TRAVEL - TIỆN ÍCH DÙNG CHUNG (js/main.js)
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupNavMenu();
  try {
    await updateCartBadge();
  } catch (err) {
    console.error('Lỗi khởi tạo giỏ hàng:', err);
  }
});

/**
 * Định dạng tiền tệ VNĐ (ví dụ: 1250000 -> "1.250.000 ₫")
 */
function formatVND(amount) {
  if (isNaN(amount) || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Cập nhật số lượng hiển thị trên Badge Giỏ Hàng ở Header
 */
async function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (!badge) return;

  try {
    const res = await dbQuery('SELECT SUM(quantity) as total FROM cart;');
    const count = (res[0] && res[0].total) ? res[0].total : 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  } catch (err) {
    console.warn('Không thể đọc giỏ hàng từ SQLite:', err);
  }
}

/**
 * Hiển thị thông báo Toast góc phải màn hình
 */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size: 18px;">${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Xử lý mở/đóng menu responsive trên Mobile
 */
function setupNavMenu() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }
}
