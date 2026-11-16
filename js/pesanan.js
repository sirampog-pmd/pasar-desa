// ============ STATE ============
const pState = {
    status: 'all',
    search: '',
    sort: 'terbaru'
};

const STATUS_CONFIG = {
    pending:  { label: 'Belum Bayar', icon: 'fa-clock',        cls: 'status-pending' },
    diproses: { label: 'Diproses',    icon: 'fa-box',          cls: 'status-diproses' },
    dikirim:  { label: 'Dikirim',     icon: 'fa-truck',        cls: 'status-dikirim' },
    selesai:  { label: 'Selesai',     icon: 'fa-check-circle', cls: 'status-selesai' },
    batal:    { label: 'Dibatalkan',  icon: 'fa-times-circle', cls: 'status-batal' }
};

const SHIPPING_LABEL = {
    reguler: 'Reguler (3-5 hari)',
    express: 'Express (1-2 hari)'
};

const PAYMENT_LABEL = {
    transfer: 'Transfer Bank',
    ewallet: 'E-Wallet',
    qris: 'QRIS',
    cod: 'COD (Bayar di Tempat)'
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    // Demo: kalau belum ada order, buat data contoh supaya halaman tidak kosong
    seedDemoOrdersIfEmpty();

    bindEvents();
    renderSemua();
});

// Seed data contoh untuk demo
function seedDemoOrdersIfEmpty() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length > 0) return;

    const now = Date.now();
    const demo = [
        {
            id: 'ORD-' + String(now - 86400000 * 5).slice(-6),
            tanggal: new Date(now - 86400000 * 5).toISOString(),
            nama: 'Budi Santoso', hp: '081234567890', email: 'budi@mail.com',
            alamat: 'Jl. Merdeka No. 12, RT 03/RW 02', provinsi: 'Jawa Barat',
            kota: 'Bandung', kecamatan: 'Coblong', kodepos: '40132', catatan: '',
            shipping: 'reguler', payment: 'transfer',
            items: [
                { id: 1, qty: 2 }, { id: 3, qty: 1 }
            ],
            total: 'Rp 185.000', voucher: 'DESA10',
            status: 'selesai'
        },
        {
            id: 'ORD-' + String(now - 86400000 * 2).slice(-6),
            tanggal: new Date(now - 86400000 * 2).toISOString(),
            nama: 'Budi Santoso', hp: '081234567890', email: 'budi@mail.com',
            alamat: 'Jl. Merdeka No. 12, RT 03/RW 02', provinsi: 'Jawa Barat',
            kota: 'Bandung', kecamatan: 'Coblong', kodepos: '40132', catatan: 'Titip di pos',
            shipping: 'express', payment: 'qris',
            items: [{ id: 2, qty: 1 }],
            total: 'Rp 300.000', voucher: null,
            status: 'dikirim'
        },
        {
            id: 'ORD-' + String(now - 3600000 * 3).slice(-6),
            tanggal: new Date(now - 3600000 * 3).toISOString(),
            nama: 'Budi Santoso', hp: '081234567890', email: 'budi@mail.com',
            alamat: 'Jl. Merdeka No. 12, RT 03/RW 02', provinsi: 'Jawa Barat',
            kota: 'Bandung', kecamatan: 'Coblong', kodepos: '40132', catatan: '',
            shipping: 'reguler', payment: 'ewallet',
            items: [{ id: 5, qty: 3 }, { id: 6, qty: 2 }],
            total: 'Rp 145.000', voucher: null,
            status: 'pending'
        }
    ];
    localStorage.setItem('orders', JSON.stringify(demo));
}

// ============ RENDER ============
function renderSemua() {
    const orders = getOrders();
    updateCounts(orders);
    renderList(filterOrders(orders));
}

function getOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    // pastikan semua punya status (untuk order lama yang belum punya)
    return orders.map(o => ({ ...o, status: o.status || 'pending' }));
}

function filterOrders(list) {
    let hasil = [...list];

    if (pState.status !== 'all') {
        hasil = hasil.filter(o => o.status === pState.status);
    }

    if (pState.search) {
        const q = pState.search.toLowerCase();
        hasil = hasil.filter(o => {
            const cocokId = o.id.toLowerCase().includes(q);
            const cocokProduk = o.items.some(it => {
                const p = produk.find(x => x.id === it.id);
                return p && p.nama.toLowerCase().includes(q);
            });
            return cocokId || cocokProduk;
        });
    }

    // Sort
    if (pState.sort === 'terbaru') {
        hasil.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    } else if (pState.sort === 'terlama') {
        hasil.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    } else if (pState.sort === 'termahal') {
        hasil.sort((a, b) => parseRupiah(b.total) - parseRupiah(a.total));
    }

    return hasil;
}

function updateCounts(orders) {
    const counts = { all: orders.length, pending: 0, diproses: 0, dikirim: 0, selesai: 0, batal: 0 };
    orders.forEach(o => {
        if (counts[o.status] !== undefined) counts[o.status]++;
    });

    document.getElementById('countAll').textContent = counts.all;
    document.getElementById('countPending').textContent = counts.pending;
    document.getElementById('countDiproses').textContent = counts.diproses;
    document.getElementById('countDikirim').textContent = counts.dikirim;
    document.getElementById('countSelesai').textContent = counts.selesai;
    document.getElementById('countBatal').textContent = counts.batal;
}

function renderList(orders) {
    const list = document.getElementById('pesananList');
    const empty = document.getElementById('emptyPesanan');

    if (orders.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';

        const emptyTitle = document.getElementById('emptyTitle');
        const emptyText = document.getElementById('emptyText');

        if (pState.search) {
            emptyTitle.textContent = 'Pesanan Tidak Ditemukan';
            emptyText.textContent = 'Coba kata kunci lain atau ubah filter status';
        } else if (pState.status !== 'all') {
            const statusLabel = STATUS_CONFIG[pState.status]?.label || pState.status;
            emptyTitle.textContent = `Tidak Ada Pesanan ${statusLabel}`;
            emptyText.textContent = 'Belum ada pesanan dengan status ini';
        } else {
            emptyTitle.textContent = 'Belum Ada Pesanan';
            emptyText.textContent = 'Yuk mulai belanja produk UMKM desa terbaik!';
        }
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = orders.map(o => renderOrderCard(o)).join('');
}

function renderOrderCard(o) {
    const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
    const totalItem = o.items.reduce((s, i) => s + i.qty, 0);

    // Siapkan thumb (max 3 + indikator)
    const thumbs = o.items.slice(0, 3).map(it => {
        const p = produk.find(x => x.id === it.id);
        return p ? `<img class="order-thumb" src="${p.gambar}" alt="${p.nama}" title="${p.nama}">` : '';
    }).join('');

    const moreCount = o.items.length > 3
        ? `<div class="order-more">+${o.items.length - 3}</div>`
        : '';

    // Info produk pertama
    const firstItem = o.items[0];
    const firstProduk = firstItem ? produk.find(x => x.id === firstItem.id) : null;
    const extraText = o.items.length > 1 ? `+${o.items.length - 1} produk lain` : '';

    // Tombol sesuai status
    const buttons = renderButtons(o.status, o.id);

    return `
    <div class="order-card">
        <div class="order-card-header">
            <div class="order-meta">
                <span class="order-id">${o.id}</span>
                <span class="order-date">
                    <i class="fas fa-calendar" style="font-size:11px"></i>
                    ${formatTanggal(o.tanggal)}
                </span>
            </div>
            <span class="order-status ${cfg.cls}">
                <i class="fas ${cfg.icon}"></i> ${cfg.label}
            </span>
        </div>
        <div class="order-card-body">
            <div class="order-products">
                ${thumbs}
                ${moreCount}
                <div class="order-product-info">
                    <strong>${firstProduk ? firstProduk.nama : 'Produk'}</strong>
                    <span>${totalItem} barang${extraText ? ' · ' + extraText : ''}</span>
                </div>
            </div>
            <div class="order-total-info">
                <span>Total Belanja</span>
                <strong>${o.total}</strong>
            </div>
        </div>
        <div class="order-card-footer">
            ${buttons}
        </div>
    </div>`;
}

function renderButtons(status, id) {
    const btnDetail = `<button class="btn-order outline" onclick="bukaDetail('${id}')">
        <i class="fas fa-eye"></i> Detail
    </button>`;

    let extra = '';

    if (status === 'pending') {
        extra = `
            <button class="btn-order danger" onclick="batalkanPesanan('${id}')">
                <i class="fas fa-times"></i> Batalkan
            </button>
            <button class="btn-order primary" onclick="bayarSekarang('${id}')">
                <i class="fas fa-credit-card"></i> Bayar
            </button>`;
    } else if (status === 'diproses') {
        extra = `<button class="btn-order outline" onclick="hubungiPenjual()">
            <i class="fas fa-comments"></i> Chat Penjual
        </button>`;
    } else if (status === 'dikirim') {
        extra = `
            <button class="btn-order outline" onclick="lacakPaket()">
                <i class="fas fa-map-marker-alt"></i> Lacak
            </button>
            <button class="btn-order primary" onclick="konfirmasiTerima('${id}')">
                <i class="fas fa-check"></i> Pesanan Diterima
            </button>`;
    } else if (status === 'selesai') {
        extra = `
            <button class="btn-order outline" onclick="beliLagi('${id}')">
                <i class="fas fa-redo"></i> Beli Lagi
            </button>
            <button class="btn-order primary" onclick="beriUlasan('${id}')">
                <i class="fas fa-star"></i> Beri Ulasan
            </button>`;
    } else if (status === 'batal') {
        extra = `<button class="btn-order outline" onclick="beliLagi('${id}')">
            <i class="fas fa-redo"></i> Beli Lagi
        </button>`;
    }

    return btnDetail + extra;
}

// ============ DETAIL MODAL ============
function bukaDetail(id) {
    const o = getOrders().find(x => x.id === id);
    if (!o) return;

    const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;

    document.getElementById('modalOrderId').textContent = o.id;
    document.getElementById('modalOrderDate').textContent = formatTanggalLengkap(o.tanggal);

    // Tracking steps
    const steps = [
        { key: 'pending',  label: 'Pesanan Dibuat',    desc: 'Pesanan Anda telah masuk' },
        { key: 'diproses', label: 'Sedang Diproses',   desc: 'Penjual menyiapkan produk' },
        { key: 'dikirim',  label: 'Dalam Pengiriman',  desc: 'Paket menuju alamat Anda' },
        { key: 'selesai',  label: 'Pesanan Selesai',   desc: 'Paket telah diterima' }
    ];

    const urutan = ['pending', 'diproses', 'dikirim', 'selesai'];
    const currentIdx = urutan.indexOf(o.status);

    const trackingHTML = o.status === 'batal'
        ? `<div class="tracking" style="background:#fee2e2">
            <div class="track-step done" style="padding-bottom:0">
                <div class="track-dot" style="background:var(--danger); border-color:var(--danger)"><i class="fas fa-times"></i></div>
                <div class="track-info">
                    <strong style="color:var(--danger)">Pesanan Dibatalkan</strong>
                    <span>Pesanan ini telah dibatalkan</span>
                </div>
            </div>
          </div>`
        : `<div class="tracking">
            ${steps.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return `
                <div class="track-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
                    <div class="track-dot">${done ? '<i class="fas fa-check"></i>' : i + 1}</div>
                    <div class="track-info">
                        <strong>${s.label}</strong>
                        <span>${s.desc}</span>
                    </div>
                </div>`;
            }).join('')}
          </div>`;

    // Items
    const itemsHTML = o.items.map(it => {
        const p = produk.find(x => x.id === it.id);
        if (!p) return '';
        return `
        <div class="modal-item">
            <img class="modal-item-img" src="${p.gambar}" alt="${p.nama}">
            <div class="modal-item-info">
                <strong>${p.nama}</strong>
                <span>${it.qty} x ${formatRupiah(p.harga)}</span>
            </div>
            <div class="modal-item-price">${formatRupiah(p.harga * it.qty)}</div>
        </div>`;
    }).join('');

    // Hitung subtotal
    let subtotal = 0;
    o.items.forEach(it => {
        const p = produk.find(x => x.id === it.id);
        if (p) subtotal += p.harga * it.qty;
    });

    const ongkir = o.shipping === 'express' ? 15000 : 0;

    document.getElementById('modalBody').innerHTML = `
        <span class="order-status ${cfg.cls}" style="margin-bottom:16px; display:inline-flex">
            <i class="fas ${cfg.icon}"></i> ${cfg.label}
        </span>

        ${trackingHTML}

        <div class="modal-section">
            <h4>Produk Dipesan</h4>
            ${itemsHTML}
        </div>

        <div class="modal-section">
            <h4>Alamat Pengiriman</h4>
            <div class="modal-address">
                <strong>${o.nama} · ${o.hp}</strong>
                ${o.alamat}<br>
                Kec. ${o.kecamatan}, ${o.kota}, ${o.provinsi} ${o.kodepos}
                ${o.catatan ? `<br><em style="color:var(--gray)">Catatan: ${o.catatan}</em>` : ''}
            </div>
        </div>

        <div class="modal-section">
            <h4>Info Pengiriman & Pembayaran</h4>
            <div class="info-row">
                <span>Metode Pengiriman</span>
                <span>${SHIPPING_LABEL[o.shipping] || o.shipping}</span>
            </div>
            <div class="info-row">
                <span>Metode Pembayaran</span>
                <span>${PAYMENT_LABEL[o.payment] || o.payment}</span>
            </div>
            ${o.voucher ? `<div class="info-row">
                <span>Voucher Digunakan</span>
                <span style="color:var(--primary)">${o.voucher}</span>
            </div>` : ''}
        </div>

        <div class="modal-section">
            <h4>Rincian Pembayaran</h4>
            <div class="info-row">
                <span>Subtotal Produk</span>
                <span>${formatRupiah(subtotal)}</span>
            </div>
            <div class="info-row">
                <span>Ongkos Kirim</span>
                <span>${ongkir === 0 ? '<span style="color:var(--primary)">GRATIS</span>' : formatRupiah(ongkir)}</span>
            </div>
            <div class="info-total">
                <span>Total Bayar</span>
                <strong>${o.total}</strong>
            </div>
        </div>
    `;

    document.getElementById('detailModal').classList.add('active');
}

function tutupModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Tutup modal klik overlay
document.addEventListener('click', e => {
    if (e.target.id === 'detailModal') tutupModal();
});

// ============ ACTIONS ============
function ubahStatus(id, status) {
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return;
    orders[idx].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    renderSemua();
}

function batalkanPesanan(id) {
    if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
    ubahStatus(id, 'batal');
}

function bayarSekarang(id) {
    // Simulasi pembayaran berhasil
    if (!confirm('Lanjutkan pembayaran pesanan ini?')) return;
    ubahStatus(id, 'diproses');
    alert('✅ Pembayaran berhasil! Pesanan sedang diproses penjual.');
}

function konfirmasiTerima(id) {
    if (!confirm('Konfirmasi bahwa pesanan sudah Anda terima?')) return;
    ubahStatus(id, 'selesai');
    alert('🎉 Terima kasih! Pesanan telah selesai.');
}

function beliLagi(id) {
    const o = getOrders().find(x => x.id === id);
    if (!o) return;

    const keranjang = getKeranjang();
    o.items.forEach(it => {
        const existing = keranjang.find(k => k.id === it.id);
        if (existing) existing.qty += it.qty;
        else keranjang.push({ id: it.id, qty: it.qty });
    });
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    updateCartCount();
    window.location.href = 'keranjang.html';
}

function beriUlasan(id) {
    alert('⭐ Fitur ulasan akan segera hadir!');
}

function lacakPaket() {
    alert('📍 Nomor resi akan dikirim via WhatsApp. Fitur tracking real-time segera hadir!');
}

function hubungiPenjual() {
    alert('💬 Fitur chat penjual akan segera hadir!');
}

// ============ EVENTS ============
function bindEvents() {
    // Tab filter
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pState.status = btn.dataset.status;
            renderList(filterOrders(getOrders()));
        });
    });

    // Search
    document.getElementById('searchOrder').addEventListener('input', e => {
        pState.search = e.target.value.trim();
        renderList(filterOrders(getOrders()));
    });

    // Sort
    document.getElementById('sortOrder').addEventListener('change', e => {
        pState.sort = e.target.value;
        renderList(filterOrders(getOrders()));
    });

    // ESC tutup modal
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') tutupModal();
    });
}

// ============ HELPERS ============
function parseRupiah(str) {
    return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

function formatTanggal(iso) {
    const d = new Date(iso);
    const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalLengkap(iso) {
    const d = new Date(iso);
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const jam = String(d.getHours()).padStart(2, '0');
    const menit = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()} · ${jam}:${menit} WIB`;
}