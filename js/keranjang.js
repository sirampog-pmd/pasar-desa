let selectedItems = new Set(); // ID produk yang dicentang

document.addEventListener('DOMContentLoaded', () => {
    renderKeranjang();
});

function renderKeranjang() {
    const keranjang = getKeranjang();
    const layout = document.getElementById('keranjangLayout');
    const empty = document.getElementById('emptyCart');
    const list = document.getElementById('keranjangList');

    if (keranjang.length === 0) {
        layout.style.display = 'none';
        empty.style.display = 'block';
        document.getElementById('totalItemsLabel').textContent = '0 produk';
        return;
    }

    layout.style.display = 'grid';
    empty.style.display = 'none';

    // Default: semua item terpilih
    if (selectedItems.size === 0) {
        keranjang.forEach(k => selectedItems.add(k.id));
    } else {
        // Bersihkan item yang sudah tidak ada di keranjang
        const ids = keranjang.map(k => k.id);
        selectedItems = new Set([...selectedItems].filter(id => ids.includes(id)));
    }

    let totalQty = 0;
    list.innerHTML = keranjang.map(item => {
        const p = produk.find(x => x.id === item.id);
        if (!p) return '';
        totalQty += item.qty;
        const checked = selectedItems.has(p.id) ? 'checked' : '';

        return `
        <div class="cart-item">
            <div class="cart-check">
                <input type="checkbox" ${checked} onchange="toggleSelect(${p.id}, this.checked)">
            </div>
            <div class="cart-item-img" onclick="detailProduk(${p.id})">
                <img src="${p.gambar}" alt="${p.nama}">
            </div>
            <div class="cart-item-body">
                <div>
                    <div class="cart-item-toko">
                        <i class="fas fa-store" style="font-size:10px"></i> ${p.toko}
                    </div>
                    <div class="cart-item-name" onclick="detailProduk(${p.id})">${p.nama}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-price">
                        ${formatRupiah(p.harga * item.qty)}
                        ${p.hargaAsli ? `<s>${formatRupiah(p.hargaAsli * item.qty)}</s>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="cart-qty">
                            <button onclick="ubahQtyCart(${p.id}, -1)">−</button>
                            <input type="number" value="${item.qty}" readonly>
                            <button onclick="ubahQtyCart(${p.id}, 1)">+</button>
                        </div>
                        <button class="cart-remove" onclick="hapusItem(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    document.getElementById('totalItemsLabel').textContent = `${totalQty} produk`;
    hitungTotal();
    updateCartCount();
}

function toggleSelect(id, checked) {
    if (checked) selectedItems.add(id);
    else selectedItems.delete(id);
    hitungTotal();
}

function ubahQtyCart(id, delta) {
    const keranjang = getKeranjang();
    const item = keranjang.find(k => k.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty < 1) item.qty = 1;
    if (item.qty > 99) item.qty = 99;

    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    renderKeranjang();
}

function hapusItem(id) {
    if (!confirm('Hapus produk ini dari keranjang?')) return;

    let keranjang = getKeranjang();
    keranjang = keranjang.filter(k => k.id !== id);
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    selectedItems.delete(id);

    renderKeranjang();
    updateCartCount();
}

function hitungTotal() {
    const keranjang = getKeranjang();
    let subtotal = 0;
    let diskon = 0;
    let qtyTotal = 0;

    keranjang.forEach(item => {
        if (!selectedItems.has(item.id)) return;
        const p = produk.find(x => x.id === item.id);
        if (!p) return;

        subtotal += p.harga * item.qty;
        if (p.hargaAsli) diskon += (p.hargaAsli - p.harga) * item.qty;
        qtyTotal += item.qty;
    });

    const total = subtotal;

    document.getElementById('sumQty').textContent = qtyTotal;
    document.getElementById('sumHarga').textContent = formatRupiah(subtotal + diskon);
    document.getElementById('sumDiskon').textContent = '-' + formatRupiah(diskon);
    document.getElementById('sumTotal').textContent = formatRupiah(total);

    const btn = document.getElementById('btnCheckout');
    btn.disabled = qtyTotal === 0;
    btn.innerHTML = qtyTotal === 0
        ? 'Pilih Produk Dulu'
        : `Lanjut ke Checkout <i class="fas fa-arrow-right"></i>`;
}

// Tombol checkout
document.addEventListener('click', e => {
    if (e.target.closest('#btnCheckout')) {
        const selected = [...selectedItems];
        if (selected.length === 0) return;
        localStorage.setItem('checkoutItems', JSON.stringify(selected));
        window.location.href = 'checkout.html';
    }
});