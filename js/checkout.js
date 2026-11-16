let voucherAktif = null;
let ongkirAktif = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderSummary();
    bindShipping();
    updateOngkir();
});

// ============ SUMMARY ============
function getCheckoutItems() {
    const ids = JSON.parse(localStorage.getItem('checkoutItems')) || [];
    const keranjang = getKeranjang();
    return keranjang.filter(k => ids.includes(k.id));
}

function renderSummary() {
    const items = getCheckoutItems();
    const container = document.getElementById('summaryItems');

    if (items.length === 0) {
        window.location.href = 'keranjang.html';
        return;
    }

    let subtotal = 0;
    let diskon = 0;

    container.innerHTML = items.map(item => {
        const p = produk.find(x => x.id === item.id);
        if (!p) return '';
        subtotal += p.harga * item.qty;
        if (p.hargaAsli) diskon += (p.hargaAsli - p.harga) * item.qty;

        return `
        <div class="summary-item">
            <img class="summary-item-img" src="${p.gambar}" alt="${p.nama}">
            <div class="summary-item-info">
                <strong>${p.nama}</strong>
                <span>${item.qty} x ${formatRupiah(p.harga)}</span>
            </div>
            <div class="summary-item-price">${formatRupiah(p.harga * item.qty)}</div>
        </div>`;
    }).join('');

    document.getElementById('coSubtotal').textContent = formatRupiah(subtotal + diskon);
    document.getElementById('coDiskon').textContent = '-' + formatRupiah(diskon);

    hitungTotalAkhir(subtotal, diskon);
}

// ============ ONGKIR ============
function bindShipping() {
    document.querySelectorAll('input[name="shipping"]').forEach(el => {
        el.addEventListener('change', updateOngkir);
    });
}

function updateOngkir() {
    const selected = document.querySelector('input[name="shipping"]:checked');
    ongkirAktif = parseInt(selected.dataset.ongkir) || 0;

    const el = document.getElementById('coOngkir');
    if (ongkirAktif === 0) {
        el.textContent = 'GRATIS';
        el.style.color = 'var(--primary)';
    } else {
        el.textContent = formatRupiah(ongkirAktif);
        el.style.color = 'var(--dark)';
    }

    // Recalculate
    const items = getCheckoutItems();
    let subtotal = 0, diskon = 0;
    items.forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if (!p) return;
        subtotal += p.harga * item.qty;
        if (p.hargaAsli) diskon += (p.hargaAsli - p.harga) * item.qty;
    });
    hitungTotalAkhir(subtotal, diskon);
}

// ============ VOUCHER ============
const VOUCHERS = {
    'DESA10': { tipe: 'persen', nilai: 10, min: 50000 },
    'UMKM20': { tipe: 'persen', nilai: 20, min: 100000 },
    'GRATISKIRIM': { tipe: 'ongkir' },
    'HEMAT15K': { tipe: 'nominal', nilai: 15000, min: 75000 }
};

function pakaiVoucher() {
    const kode = document.getElementById('voucherInput').value.trim().toUpperCase();
    const msg = document.getElementById('voucherMsg');
    msg.className = 'voucher-msg';

    if (!kode) {
        voucherAktif = null;
        msg.textContent = '';
        recalcAll();
        return;
    }

    const v = VOUCHERS[kode];
    if (!v) {
        voucherAktif = null;
        msg.textContent = '❌ Kode voucher tidak valid';
        msg.classList.add('err');
        recalcAll();
        return;
    }

    // Cek min belanja
    if (v.min) {
        const items = getCheckoutItems();
        let subtotal = 0;
        items.forEach(item => {
            const p = produk.find(x => x.id === item.id);
            if (p) subtotal += p.harga * item.qty;
        });
        if (subtotal < v.min) {
            voucherAktif = null;
            msg.textContent = `❌ Minimum belanja ${formatRupiah(v.min)}`;
            msg.classList.add('err');
            recalcAll();
            return;
        }
    }

    voucherAktif = { kode, ...v };
    msg.textContent = `✓ Voucher ${kode} berhasil dipakai`;
    msg.classList.add('ok');
    recalcAll();
}

// ============ TOTAL ============
function hitungTotalAkhir(subtotal, diskon) {
    let potonganVoucher = 0;
    let ongkirFinal = ongkirAktif;

    if (voucherAktif) {
        if (voucherAktif.tipe === 'persen') {
            potonganVoucher = Math.round(subtotal * voucherAktif.nilai / 100);
        } else if (voucherAktif.tipe === 'nominal') {
            potonganVoucher = voucherAktif.nilai;
        } else if (voucherAktif.tipe === 'ongkir') {
            ongkirFinal = 0;
        }
    }

    const total = Math.max(0, subtotal - potonganVoucher + ongkirFinal);

    // Update ongkir display if voucher free shipping
    if (voucherAktif?.tipe === 'ongkir') {
        const el = document.getElementById('coOngkir');
        el.textContent = 'GRATIS (Voucher)';
        el.style.color = 'var(--primary)';
    }

    document.getElementById('coTotal').textContent = formatRupiah(total);
    return total;
}

function recalcAll() {
    const items = getCheckoutItems();
    let subtotal = 0, diskon = 0;
    items.forEach(item => {
        const p = produk.find(x => x.id === item.id);
        if (!p) return;
        subtotal += p.harga * item.qty;
        if (p.hargaAsli) diskon += (p.hargaAsli - p.harga) * item.qty;
    });
    hitungTotalAkhir(subtotal, diskon);
}

// ============ SUBMIT ============
function prosesCheckout(e) {
    e.preventDefault();

    const btn = document.getElementById('btnBayar');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Simulasi proses 1.5 detik
    setTimeout(() => {
        // Simpan order ke localStorage
        const form = document.getElementById('checkoutForm');
        const fd = new FormData(form);
        const order = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            tanggal: new Date().toISOString(),
            nama: fd.get('nama'),
            hp: fd.get('hp'),
            email: fd.get('email'),
            alamat: fd.get('alamat'),
            provinsi: fd.get('provinsi'),
            kota: fd.get('kota'),
            kecamatan: fd.get('kecamatan'),
            kodepos: fd.get('kodepos'),
            catatan: fd.get('catatan'),
            shipping: fd.get('shipping'),
            payment: fd.get('payment'),
            items: getCheckoutItems(),
            total: document.getElementById('coTotal').textContent,
            voucher: voucherAktif?.kode || null
        };

        // Simpan riwayat pesanan
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Hapus produk yang sudah di-checkout dari keranjang
        const checkedIds = JSON.parse(localStorage.getItem('checkoutItems')) || [];
        let keranjang = getKeranjang();
        keranjang = keranjang.filter(k => !checkedIds.includes(k.id));
        localStorage.setItem('keranjang', JSON.stringify(keranjang));

        // Bersihkan
        localStorage.removeItem('checkoutItems');

        // Tampilkan modal sukses
        document.getElementById('orderNumber').textContent = '#' + order.id;
        document.getElementById('successModal').classList.add('active');
        updateCartCount();

        btn.disabled = false;
        btn.innerHTML = originalText;
    }, 1500);
}