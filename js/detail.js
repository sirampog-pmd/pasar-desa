// Deskripsi default per kategori
const deskripsiKategori = {
    makanan: 'Produk makanan olahan UMKM desa yang dibuat dengan bahan-bahan pilihan dan resep turun-temurun. Dijamin halal, higienis, dan tanpa pengawet berbahaya.',
    minuman: 'Minuman khas desa yang diproduksi secara alami tanpa bahan kimia tambahan. Cocok untuk konsumsi harian keluarga.',
    kriya: 'Produk kerajinan tangan asli pengrajin desa dengan kualitas premium. Setiap produk dibuat dengan penuh ketelitian dan cinta.',
    pertanian: 'Hasil pertanian segar langsung dari petani desa. Ditanam secara organik tanpa pestisida berbahaya.',
    fashion: 'Produk fashion dengan motif dan desain khas daerah, dibuat oleh penjahit lokal berpengalaman.',
    kecantikan: 'Produk kecantikan alami dari bahan-bahan herbal desa yang aman untuk kulit.'
};

document.addEventListener('DOMContentLoaded', () => {
    const id = parseInt(localStorage.getItem('produkDetail'));
    const item = produk.find(p => p.id === id);

    if (!item) {
        document.getElementById('detailContainer').innerHTML = `
            <div class="empty-state" style="padding: 100px 20px;">
                <i class="fas fa-box-open"></i>
                <h3>Produk tidak ditemukan</h3>
                <p>Silakan kembali ke katalog produk</p>
                <a href="produk.html" class="btn-primary">Lihat Semua Produk</a>
            </div>
        `;
        return;
    }

    renderDetail(item);
    renderTerkait(item);
});

function renderDetail(p) {
    const diskon = p.hargaAsli > 0 ? Math.round((1 - p.harga / p.hargaAsli) * 100) : 0;
    const desc = deskripsiKategori[p.kategori] || 'Produk berkualitas dari UMKM desa.';

    // Update breadcrumb & title
    document.getElementById('breadcrumbProduk').textContent = p.nama;
    document.title = `${p.nama} - DesaMart`;

    document.getElementById('detailContainer').innerHTML = `
        <div class="detail-grid">
            <!-- GALERI -->
            <div class="galeri">
                <div class="galeri-main">
                    <img id="mainImage" src="${p.gambar}" alt="${p.nama}">
                    ${diskon ? `<span class="galeri-badge">-${diskon}%</span>` : ''}
                </div>
                <div class="galeri-thumbs">
                    ${[p.gambar, p.gambar, p.gambar, p.gambar].map((img, i) => `
                        <div class="galeri-thumb ${i === 0 ? 'active' : ''}" onclick="gantiGambar(this, '${img}')">
                            <img src="${img}" alt="thumb">
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- INFO -->
            <div class="detail-info">
                <div class="produk-toko">
                    <i class="fas fa-store"></i> ${p.toko} · ${p.desa}
                </div>
                <h1>${p.nama}</h1>

                <div class="detail-rating-row">
                    <span class="rating-val"><i class="fas fa-star"></i> ${p.rating}</span>
                    <span>·</span>
                    <span>${p.terjual} terjual</span>
                    <span>·</span>
                    <span><i class="fas fa-check-circle" style="color:var(--primary)"></i> Terverifikasi</span>
                </div>

                <div class="detail-harga">
                    <span class="harga-main">${formatRupiah(p.harga)}</span>
                    ${p.hargaAsli ? `<span class="harga-asli">${formatRupiah(p.hargaAsli)}</span>` : ''}
                    ${diskon ? `<span class="diskon-badge">Hemat ${diskon}%</span>` : ''}
                </div>

                <div class="detail-section">
                    <h3>Deskripsi Produk</h3>
                    <p>${desc}</p>
                </div>

                <div class="detail-info-umkm">
                    <div class="avatar"><i class="fas fa-store"></i></div>
                    <div class="info-toko">
                        <h4>${p.toko}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${p.desa}</p>
                    </div>
                </div>

                <div class="qty-row">
                    <label>Jumlah:</label>
                    <div class="qty-control">
                        <button onclick="ubahQty(-1)">−</button>
                        <input type="number" id="qtyInput" value="1" min="1" max="99" readonly>
                        <button onclick="ubahQty(1)">+</button>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn-cart" onclick="tambahKeranjang(${p.id}, qtyValue())">
                        <i class="fas fa-shopping-cart"></i> Keranjang
                    </button>
                    <button class="btn-beli" onclick="beliSekarang(${p.id})">
                        <i class="fas fa-bolt"></i> Beli Sekarang
                    </button>
                </div>

                <div class="detail-badges">
                    <div class="detail-badge"><i class="fas fa-shield-alt"></i> Produk Original</div>
                    <div class="detail-badge"><i class="fas fa-truck"></i> Kirim Cepat</div>
                    <div class="detail-badge"><i class="fas fa-undo"></i> Bisa Return</div>
                </div>
            </div>
        </div>
    `;
}

function renderTerkait(current) {
    const terkait = produk
        .filter(p => p.kategori === current.kategori && p.id !== current.id)
        .slice(0, 4);

    const container = document.getElementById('produkTerkait');
    if (terkait.length === 0) {
        container.innerHTML = '<p style="color:var(--gray)">Belum ada produk terkait.</p>';
        return;
    }

    container.innerHTML = terkait.map(p => `
        <div class="produk-card" onclick="detailProduk(${p.id})">
            <div class="produk-img">
                <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
            </div>
            <div class="produk-info">
                <div class="produk-toko"><i class="fas fa-store" style="font-size:10px"></i> ${p.toko}</div>
                <div class="produk-nama">${p.nama}</div>
                <div class="produk-rating">
                    <i class="fas fa-star"></i> ${p.rating} · ${p.terjual} terjual
                </div>
                <div class="produk-harga">${formatRupiah(p.harga)}</div>
            </div>
        </div>
    `).join('');
}

// ============ HELPERS ============
function gantiGambar(el, src) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.galeri-thumb').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function ubahQty(delta) {
    const input = document.getElementById('qtyInput');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
}

function qtyValue() {
    return parseInt(document.getElementById('qtyInput').value) || 1;
}

function beliSekarang(id) {
    tambahKeranjang(id, qtyValue());
    window.location.href = 'keranjang.html';
}