// Load data produk
const produk = JSON.parse(localStorage.getItem('produk')) || [];

// Render produk unggulan di homepage
function renderProdukUnggulan() {
    const container = document.getElementById('produkUnggulan');
    if (!container) return;
    
    const unggulan = produk.filter(p => p.unggulan);
    
    container.innerHTML = unggulan.map(p => `
        <div class="produk-card" onclick="detailProduk(${p.id})">
            <div class="produk-img">
                <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
                ${p.hargaAsli ? '<span class="produk-badge">DISKON</span>' : ''}
            </div>
            <div class="produk-info">
                <div class="produk-toko">
                    <i class="fas fa-store" style="font-size:10px"></i> ${p.toko}
                </div>
                <div class="produk-nama">${p.nama}</div>
                <div class="produk-rating">
                    <i class="fas fa-star"></i>
                    ${p.rating} · ${p.terjual} terjual
                </div>
                <div class="produk-harga">
                    ${formatRupiah(p.harga)}
                    ${p.hargaAsli ? `<s>${formatRupiah(p.hargaAsli)}</s>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Detail produk
function detailProduk(id) {
    localStorage.setItem('produkDetail', id);
    window.location.href = 'detail-produk.html';
}

// Keranjang
function getKeranjang() {
    return JSON.parse(localStorage.getItem('keranjang')) || [];
}

function tambahKeranjang(id, qty = 1) {
    const keranjang = getKeranjang();
    const item = keranjang.find(k => k.id === id);
    
    if (item) {
        item.qty += qty;
    } else {
        keranjang.push({ id, qty });
    }
    
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    updateCartCount();
    alert('✅ Produk ditambahkan ke keranjang!');
}

function updateCartCount() {
    const keranjang = getKeranjang();
    const total = keranjang.reduce((sum, k) => sum + k.qty, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = total;
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    renderProdukUnggulan();
    updateCartCount();
});