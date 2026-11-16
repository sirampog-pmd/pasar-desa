// ==========================================
// LOGIKA GLOBAL DASHBOARD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Mobile Toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // 2. Cek apakah kita sedang di halaman produk
    if (document.getElementById('produkTableBody')) {
        renderTabelProduk();
        
        // Event listener untuk pencarian
        const searchInput = document.getElementById('searchProduk');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderTabelProduk(e.target.value);
            });
        }
    }
});

// ==========================================
// LOGIKA KELOLA PRODUK
// ==========================================

function getProdukPenjual() {
    let semuaProduk = JSON.parse(localStorage.getItem('produk'));
    if (!semuaProduk) {
        semuaProduk = produk; // fallback ke data.js
        localStorage.setItem('produk', JSON.stringify(semuaProduk));
    }
    return semuaProduk; 
}

function renderTabelProduk(searchQuery = '') {
    const tbody = document.getElementById('produkTableBody');
    if (!tbody) return;

    let data = getProdukPenjual();
    const totalEl = document.getElementById('totalProduk');
    if (totalEl) totalEl.textContent = data.length;

    // Filter Search
    if (searchQuery) {
        data = data.filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--gray)">Belum ada produk atau tidak ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(p => {
        return `
        <tr>
            <td>
                <div class="table-product">
                    <img src="${p.gambar}" class="table-img" alt="${p.nama}" onerror="this.src='https://via.placeholder.com/48'">
                    <div class="table-product-info">
                        <strong>${p.nama}</strong>
                        <span>ID: PRD-${p.id}</span>
                    </div>
                </div>
            </td>
            <td style="text-transform:capitalize">${p.kategori}</td>
            <td><strong>${formatRupiah(p.harga)}</strong></td>
            <td>25 pcs</td>
            <td><span class="status-badge aktif"><i class="fas fa-check-circle"></i> Aktif</span></td>
            <td style="text-align:right; white-space:nowrap">
                <button type="button" class="action-btn" onclick="editProduk(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button type="button" class="action-btn delete" onclick="hapusProduk(${p.id})" title="Hapus"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// Buka Modal Form
function bukaFormProduk() {
    document.getElementById('formProduk').reset();
    document.getElementById('produkId').value = '';
    document.getElementById('modalTitle').textContent = 'Tambah Produk Baru';
    document.getElementById('modalProduk').classList.add('active');
}

// Tutup Modal Form
function tutupFormProduk() {
    document.getElementById('modalProduk').classList.remove('active');
}

// Edit Produk
function editProduk(id) {
    // Pastikan id bertipe integer
    const data = getProdukPenjual().find(p => p.id == id);
    if (!data) {
        alert("Produk tidak ditemukan!");
        return;
    }

    document.getElementById('produkId').value = data.id;
    document.getElementById('pNama').value = data.nama;
    document.getElementById('pKategori').value = data.kategori;
    document.getElementById('pStok').value = 25; 
    document.getElementById('pHarga').value = data.harga;
    document.getElementById('pHargaAsli').value = data.hargaAsli || '';
    document.getElementById('pGambar').value = data.gambar;
    document.getElementById('pDeskripsi').value = 'Deskripsi produk...';

    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('modalProduk').classList.add('active');
}

// Simpan Produk
function simpanProduk(e) {
    e.preventDefault();
    
    const id = document.getElementById('produkId').value;
    const isEdit = id !== '';
    
    const formData = {
        nama: document.getElementById('pNama').value,
        kategori: document.getElementById('pKategori').value,
        harga: parseInt(document.getElementById('pHarga').value),
        hargaAsli: parseInt(document.getElementById('pHargaAsli').value) || 0,
        gambar: document.getElementById('pGambar').value,
        toko: "Kopi Pak Tani",
        desa: "Desa Bener Meriah, Aceh",
        rating: 4.9,
        terjual: 0,
        unggulan: false
    };

    let semuaProduk = getProdukPenjual();

    if (isEdit) {
        const idx = semuaProduk.findIndex(p => p.id == id);
        if (idx !== -1) {
            semuaProduk[idx] = { ...semuaProduk[idx], ...formData };
        }
    } else {
        const newId = semuaProduk.length > 0 ? Math.max(...semuaProduk.map(p => parseInt(p.id))) + 1 : 1;
        semuaProduk.push({ id: newId, ...formData });
    }

    localStorage.setItem('produk', JSON.stringify(semuaProduk));
    renderTabelProduk();
    tutupFormProduk();
    alert(isEdit ? '✅ Produk berhasil diperbarui!' : '✅ Produk baru berhasil ditambahkan!');
}

// Hapus Produk
function hapusProduk(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    let semuaProduk = getProdukPenjual();
    semuaProduk = semuaProduk.filter(p => p.id != id);
    localStorage.setItem('produk', JSON.stringify(semuaProduk));

    renderTabelProduk();
    alert('🗑️ Produk berhasil dihapus.');
}

// ==========================================
// LOGIKA PESANAN
// ==========================================

function updateStatusPesanan(orderId, newStatus) {
    const badge = document.getElementById(`status-${orderId}`);
    if (!badge) return;

    const cfg = {
        pending:  { label: 'Pending', icon: 'fa-clock', cls: 'pending' },
        diproses: { label: 'Diproses', icon: 'fa-box', cls: 'diproses' },
        dikirim:  { label: 'Dikirim', icon: 'fa-truck', cls: 'dikirim' },
        selesai:  { label: 'Selesai', icon: 'fa-check-circle', cls: 'aktif' }
    };

    const c = cfg[newStatus];
    badge.className = `status-badge ${c.cls}`;
    badge.innerHTML = `<i class="fas ${c.icon}"></i> ${c.label}`;

    alert(`✅ Status pesanan #${orderId} berhasil diubah menjadi "${c.label}"`);
}
