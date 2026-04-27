/**
 * NexaTop – script.js
 * Website Top Up Game Free Fire & Mobile Legends
 */

// =============================================
// DATA PRODUK
// =============================================

const products = {
  ff: [
    { amount: 70,   price: 2000,   label: '70 💎',   badge: null },
    { amount: 140,  price: 4000,   label: '140 💎',  badge: null },
    { amount: 355,  price: 10000,  label: '355 💎',  badge: 'POPULER' },
    { amount: 720,  price: 20000,  label: '720 💎',  badge: null },
    { amount: 1450, price: 39000,  label: '1450 💎', badge: 'HEMAT' },
    { amount: 2180, price: 59000,  label: '2180 💎', badge: null },
    { amount: 3650, price: 99000,  label: '3650 💎', badge: 'HEMAT' },
    { amount: 5000, price: 132000, label: '5000 💎', badge: null },
    { amount: 7210, price: 189000, label: '7210 💎', badge: 'BEST' },
  ],
  ml: [
    { amount: 86,   price: 2000,   label: '86 💎',   badge: null },
    { amount: 172,  price: 4000,   label: '172 💎',  badge: null },
    { amount: 257,  price: 6000,   label: '257 💎',  badge: null },
    { amount: 514,  price: 12000,  label: '514 💎',  badge: 'POPULER' },
    { amount: 1070, price: 24000,  label: '1070 💎', badge: null },
    { amount: 2195, price: 48000,  label: '2195 💎', badge: 'HEMAT' },
    { amount: 3688, price: 78000,  label: '3688 💎', badge: null },
    { amount: 5532, price: 120000, label: '5532 💎', badge: 'HEMAT' },
    { amount: 9288, price: 189000, label: '9288 💎', badge: 'BEST' },
  ]
};

const promoCodes = {
  'NEXATOP10': 10,
  'GAMER20':   20,
  'NEWUSER15': 15,
  'HEMAT5':    5,
};

// =============================================
// STATE APLIKASI
// =============================================

let state = {
  activeGame:      'ff',
  selectedNominal: null,
  discountPercent: 0,
  promoApplied:    false,
};

// =============================================
// INISIALISASI
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  renderNominals('ff');
  renderNominals('ml');
  setupNavbar();
  setupHamburger();
  animateStats();
  observeAnimations();
});

// =============================================
// RENDER NOMINAL GRID
// =============================================

function renderNominals(game) {
  const container = document.getElementById(`nominal-${game}`);
  if (!container) return;

  container.innerHTML = '';
  products[game].forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'nominal-item';
    div.setAttribute('data-game', game);
    div.setAttribute('data-index', index);
    div.onclick = () => selectNominal(game, index, div);

    const badgeHTML = item.badge
      ? `<div class="nom-badge">${item.badge}</div>`
      : '';

    div.innerHTML = `
      ${badgeHTML}
      <div class="nom-diamond">💎 Diamond</div>
      <div class="nom-amount">${item.amount.toLocaleString('id-ID')}</div>
      <div class="nom-price">${formatRupiah(item.price)}</div>
    `;
    container.appendChild(div);
  });
}

// =============================================
// SWITCH TAB (FF / ML)
// =============================================

function switchTab(game) {
  state.activeGame = game;
  state.selectedNominal = null;
  state.discountPercent = 0;
  state.promoApplied = false;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-${game}`).classList.add('active');

  // Show / hide forms
  document.getElementById('form-ff').classList.toggle('hidden', game !== 'ff');
  document.getElementById('form-ml').classList.toggle('hidden', game !== 'ml');

  // Reset UI
  updateSummary();
  updateOrderBtn();
  document.getElementById('promo-input').value = '';
}

// =============================================
// SELECT GAME (dari game card section)
// =============================================

function selectGame(game) {
  switchTab(game);
  scrollToTopup();
}

// =============================================
// SELECT NOMINAL
// =============================================

function selectNominal(game, index, el) {
  if (game !== state.activeGame) return;

  // Deselect all in this game
  document.querySelectorAll(`[data-game="${game}"].nominal-item`)
    .forEach(n => n.classList.remove('selected'));

  el.classList.add('selected');
  state.selectedNominal = products[game][index];
  state.discountPercent = 0;
  state.promoApplied = false;
  document.getElementById('promo-input').value = '';

  updateSummary();
  updateOrderBtn();
}

// =============================================
// SELECT PAYMENT METHOD
// =============================================

function selectPayment(el) {
  const container = el.closest('.payment-grid');
  container.querySelectorAll('.payment-opt').forEach(opt => opt.classList.remove('selected'));
  el.classList.add('selected');
}

// =============================================
// UPDATE SUMMARY PANEL
// =============================================

function updateSummary() {
  const body   = document.getElementById('summary-body');
  const footer = document.getElementById('summary-footer');

  if (!state.selectedNominal) {
    body.innerHTML = `
      <div class="summary-empty">
        <span class="empty-icon">🛒</span>
        <p>Pilih nominal untuk melihat ringkasan pesanan</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  const game  = state.activeGame;
  const nom   = state.selectedNominal;
  const uid   = getUID();
  const payEl = document.querySelector('.payment-opt.selected');
  const pay   = payEl ? payEl.textContent.trim() : '-';
  const gameLabel = game === 'ff' ? '🔥 Free Fire' : '⚔️ Mobile Legends';

  // Hitung harga
  const subtotal = nom.price;
  const discount = state.promoApplied
    ? Math.round(subtotal * state.discountPercent / 100)
    : 0;
  const total = subtotal - discount;

  body.innerHTML = `
    <div class="summary-info">
      <div class="s-row">
        <span class="s-label">Game</span>
        <span class="s-val">${gameLabel}</span>
      </div>
      <div class="s-row">
        <span class="s-label">User ID</span>
        <span class="s-val">${uid || '<em style="opacity:.5">Belum diisi</em>'}</span>
      </div>
      <div class="s-row">
        <span class="s-label">Item</span>
        <span class="s-val"><span class="s-diamond">💎 ${nom.amount.toLocaleString('id-ID')} Diamond</span></span>
      </div>
      <div class="s-row">
        <span class="s-label">Bayar via</span>
        <span class="s-val">${pay}</span>
      </div>
    </div>`;

  // Footer harga
  document.getElementById('s-subtotal').textContent = formatRupiah(subtotal);

  const promoRow = document.getElementById('s-promo-row');
  if (state.promoApplied && discount > 0) {
    promoRow.style.display = 'flex';
    document.getElementById('s-discount').textContent = `- ${formatRupiah(discount)} (${state.discountPercent}%)`;
  } else {
    promoRow.style.display = 'none';
  }

  document.getElementById('s-total').textContent = formatRupiah(total);
  footer.style.display = 'flex';
}

// =============================================
// VALIDASI INPUT → Aktifkan tombol
// =============================================

function validateInput(game) {
  updateOrderBtn();
  updateSummary();
}

function getUID() {
  if (state.activeGame === 'ff') {
    return document.getElementById('ff-uid')?.value.trim() || '';
  } else {
    const uid  = document.getElementById('ml-uid')?.value.trim()  || '';
    const zone = document.getElementById('ml-zone')?.value.trim() || '';
    return uid && zone ? `${uid} (${zone})` : uid || zone || '';
  }
}

function isFormValid() {
  if (!state.selectedNominal) return false;
  if (state.activeGame === 'ff') {
    return document.getElementById('ff-uid')?.value.trim().length > 0;
  } else {
    const uid  = document.getElementById('ml-uid')?.value.trim();
    const zone = document.getElementById('ml-zone')?.value.trim();
    return uid && zone && uid.length > 0 && zone.length > 0;
  }
}

function updateOrderBtn() {
  const btn = document.getElementById('btn-order');
  if (!btn) return;
  btn.disabled = !isFormValid();
}

// =============================================
// APPLY PROMO CODE
// =============================================

function applyPromo() {
  const input = document.getElementById('promo-input');
  const code  = input.value.trim().toUpperCase();

  if (!code) {
    showToast('⚠️ Masukkan kode promo terlebih dahulu', 'warn');
    return;
  }

  if (!state.selectedNominal) {
    showToast('⚠️ Pilih nominal terlebih dahulu', 'warn');
    return;
  }

  if (state.promoApplied) {
    showToast('✅ Promo sudah diterapkan', 'info');
    return;
  }

  if (promoCodes[code] !== undefined) {
    state.discountPercent = promoCodes[code];
    state.promoApplied = true;
    showToast(`🎉 Kode promo berhasil! Diskon ${state.discountPercent}%`, 'success');
    updateSummary();
  } else {
    showToast('❌ Kode promo tidak valid atau sudah habis', 'error');
  }
}

// =============================================
// PLACE ORDER
// =============================================

function placeOrder() {
  if (!isFormValid()) return;

  const game      = state.activeGame;
  const nom       = state.selectedNominal;
  const uid       = getUID();
  const payEl     = document.querySelector('.payment-opt.selected');
  const pay       = payEl ? payEl.textContent.trim() : 'Transfer Bank';
  const gameLabel = game === 'ff' ? '🔥 Free Fire' : '⚔️ Mobile Legends';

  const subtotal  = nom.price;
  const discount  = state.promoApplied ? Math.round(subtotal * state.discountPercent / 100) : 0;
  const total     = subtotal - discount;
  const orderId   = generateOrderId();

  // Tampilkan modal sukses
  document.getElementById('modal-desc').textContent =
    `Order ID: ${orderId} – Diamond sedang diproses ke akun kamu.`;

  document.getElementById('modal-detail').innerHTML = `
    <strong>Detail Pesanan</strong><br>
    Game &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${gameLabel}<br>
    User ID &nbsp;&nbsp;: ${uid}<br>
    Item &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 💎 ${nom.amount.toLocaleString('id-ID')} Diamond<br>
    Metode &nbsp;&nbsp;: ${pay}<br>
    ${discount > 0 ? `Diskon &nbsp;&nbsp;&nbsp;: - ${formatRupiah(discount)}<br>` : ''}
    <strong>Total &nbsp;&nbsp;&nbsp;&nbsp;: ${formatRupiah(total)}</strong>
  `;

  openModal();
}

// =============================================
// MODAL
// =============================================

function openModal() {
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
  resetForm();
}

function resetForm() {
  // Reset state
  state.selectedNominal = null;
  state.discountPercent = 0;
  state.promoApplied = false;

  // Reset inputs
  ['ff-uid', 'ml-uid', 'ml-zone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('promo-input').value = '';

  // Deselect nominals
  document.querySelectorAll('.nominal-item').forEach(el => el.classList.remove('selected'));

  updateSummary();
  updateOrderBtn();
}

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link on scroll
    let current = '';
    sections.forEach(section => {
      const sTop = section.offsetTop - 100;
      if (window.scrollY >= sTop) {
        current = section.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth close nav on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navLinks').classList.remove('open');
    });
  });
}

// =============================================
// HAMBURGER MENU
// =============================================

function setupHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// =============================================
// ANIMATE STATS COUNTER
// =============================================

function animateStats() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Trigger when hero visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(animate);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);
}

// =============================================
// SCROLL FADE-IN ANIMATIONS
// =============================================

function observeAnimations() {
  const targets = document.querySelectorAll(
    '.game-card, .step-card, .keunggulan-card, .topup-form-panel, .summary-panel'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60 * i);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// =============================================
// SCROLL HELPERS
// =============================================

function scrollToTopup() {
  document.getElementById('topup')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToGames() {
  document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
}

// =============================================
// TOAST NOTIFICATION
// =============================================

let toastTimeout;

function showToast(message, type = 'info') {
  let toast = document.getElementById('toast-notif');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notif';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '28px',
      left: '50%',
      transform: 'translateX(-50%) translateY(80px)',
      background: 'white',
      borderRadius: '50px',
      padding: '12px 24px',
      fontFamily: "'Outfit', sans-serif",
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      zIndex: '9999',
      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
      opacity: '0',
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
      border: '1.5px solid rgba(0,0,0,0.06)',
    });
    document.body.appendChild(toast);
  }

  const colors = {
    success: '#22c55e',
    error:   '#ef4444',
    warn:    '#f59e0b',
    info:    '#3b5bdb',
  };
  toast.style.color = colors[type] || colors.info;
  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  toast.style.opacity   = '1';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
  }, 3000);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'NX-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Tutup mobile nav saat klik di luar
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navLinks');
  if (nav && nav.classList.contains('open')) {
    if (!nav.contains(e.target) && !document.getElementById('hamburger').contains(e.target)) {
      nav.classList.remove('open');
    }
  }
});
