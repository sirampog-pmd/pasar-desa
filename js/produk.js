// ============ STATE ============
const state = {
    kategori: 'all',
    hargaMin: 0,
    hargaMax: 999999999,
    rating: 0,
    hanyaDiskon: false,
    search: '',
    sort: 'relevan'
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    // Baca query param kategori dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        state.kategori = catParam;
        const radio = document.querySelector(`input[name="kategori"][value="${catParam}"]`);
        if (radio) radio.checked = true;
    }

    bindEvents();
    render();
});

// ============ RENDER ============
function render() {
    let hasil = [...produk];

    // Filter kategori
    if (state.kategori !== 'all') {
        hasil = hasil.filter(p => p.kategori === state.kategori);
    }

    // Filter harga
    hasil = hasil.filter(p => p.harga >= state.hargaMin && p.harga <= state.hargaMax);

    // Filter rating
    if (state.rating > 0) {
        hasil = hasil.filter(p => p.rating >= state.rating);
    }

    // Filter diskon
    if (state.hanyaDiskon) {
        hasil = hasil.filter(p => p.hargaAsli > 0);
    }

    // Search
    if (state.search) {
        const q = state.search.toLowerCase();
        hasil = hasil.filter(p =>
            p.nama.toLowerCase().includes(q) ||
            p.toko.toLowerCase().includes(q) ||
            p.desa.toLowerCase().includes(q)
        );
    }

    // Sorting
    switch (state.sort) {
        case 'termurah': hasil.sort((a, b) => a.harga - b.harga); break;
        case 'termahal': hasil.sort((a, b) => b.harga - a.harga); break;
        case 'rating':   hasil.sort((a, b) => b.rating - a.rating); break;
        case 'terjual':  hasil.sort((a, b) => b.terjual - a.terjual); break;
    }

    renderGrid(hasil);
    renderActiveFilters();
    updateTitle(hasil.length);
}

function renderGrid(list) {
    const grid = document.getElementById('produkGrid');
    const empty = document.getElementById('emptyState');

    if (list.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = list.map(p => {
        const diskon = p.hargaAsli > 0
            ? Math.round((1 - p.harga / p.hargaAsli) * 100)
            : 0;

        return `
        <div class="produk-card" onclick="detailProduk(${p.id})">
            <div class="produk-img">
                <img src="${p.gambar}" alt="${p.nama}" loading="lazy">
                ${diskon ? `<span class="produk-badge">-${diskon}%</span>` : ''}
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
        </div>`;
    }).join('');
}

function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    const chips = [];

    if (state.kategori !== 'all') {
        chips.push({ label: `Kategori: ${state.kategori}`, key: 'kategori' });
    }
    if (state.hargaMin > 0 || state.hargaMax < 999999999) {
        const max = state.hargaMax === 999999999 ? '∞' : formatRupiah(state.hargaMax);
        chips.push({ label: `Harga: ${formatRupiah(state.hargaMin)} - ${max}`, key: 'harga' });
    }
    if (state.rating > 0) {
        chips.push({ label: `Rating ${state.rating}+`, key: 'rating' });
    }
    if (state.hanyaDiskon) {
        chips.push({ label: 'Diskon', key: 'diskon' });
    }
    if (state.search) {
        chips.push({ label: `"${state.search}"`, key: 'search' });
    }

    container.innerHTML = chips.map(c => `
        <span class="active-chip">
            ${c.label}
            <button onclick="clearFilter('${c.key}')"><i class="fas fa-times"></i></button>
        </span>
    `).join('');
}

function updateTitle(count) {
    const label = {
        all: 'Semua Produk',
        makanan: 'Makanan',
        minuman: 'Minuman',
        kriya: 'Kerajinan',
        pertanian: 'Pertanian',
        fashion: 'Fashion',
        kecantikan: 'Kecantikan'
    };
    const title = document.getElementById('produkTitle');
    const breadcrumb = document.getElementById('breadcrumbCat');
    const countEl = document.getElementById('produkCount');

    title.textContent = label[state.kategori] || 'Semua Produk';
    breadcrumb.textContent = label[state.kategori] || 'Semua Produk';
    countEl.textContent = `Menampilkan ${count} produk`;
}

// ============ EVENTS ============
function bindEvents() {
    // Kategori
    document.querySelectorAll('input[name="kategori"]').forEach(el => {
        el.addEventListener('change', e => {
            state.kategori = e.target.value;
            render();
        });
    });

    // Rating
    document.querySelectorAll('input[name="rating"]').forEach(el => {
        el.addEventListener('change', e => {
            state.rating = parseFloat(e.target.value);
            render();
        });
    });

    // Diskon checkbox
    document.getElementById('filterDiskon').addEventListener('change', e => {
        state.hanyaDiskon = e.target.checked;
        render();
    });

    // Harga min/max
    document.getElementById('hargaMin').addEventListener('input', e => {
        state.hargaMin = parseInt(e.target.value) || 0;
        render();
    });
    document.getElementById('hargaMax').addEventListener('input', e => {
        state.hargaMax = parseInt(e.target.value) || 999999999;
        render();
    });

    // Preset harga
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const min = parseInt(btn.dataset.min);
            const max = parseInt(btn.dataset.max);
            state.hargaMin = min;
            state.hargaMax = max;
            document.getElementById('hargaMin').value = min;
            document.getElementById('hargaMax').value = max === 999999999 ? '' : max;
            render();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', e => {
        state.search = e.target.value.trim();
        render();
    });

    // Sort
    document.getElementById('sortSelect').addEventListener('change', e => {
        state.sort = e.target.value;
        render();
    });

    // Reset
    document.getElementById('resetFilter').addEventListener('click', resetAll);

    // Mobile filter toggle
    const sidebar = document.getElementById('filterSidebar');
    const overlay = document.createElement('div');
    overlay.className = 'filter-overlay';
    document.body.appendChild(overlay);

    document.getElementById('filterToggle').addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });

    const closeFilter = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };
    document.getElementById('filterClose').addEventListener('click', closeFilter);
    overlay.addEventListener('click', closeFilter);
}

function resetAll() {
    state.kategori = 'all';
    state.hargaMin = 0;
    state.hargaMax = 999999999;
    state.rating = 0;
    state.hanyaDiskon = false;
    state.search = '';
    state.sort = 'relevan';

    document.querySelector('input[name="kategori"][value="all"]').checked = true;
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    document.getElementById('filterDiskon').checked = false;
    document.getElementById('hargaMin').value = '';
    document.getElementById('hargaMax').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'relevan';

    render();
}

function clearFilter(key) {
    if (key === 'kategori') state.kategori = 'all';
    if (key === 'harga') {
        state.hargaMin = 0;
        state.hargaMax = 999999999;
        document.getElementById('hargaMin').value = '';
        document.getElementById('hargaMax').value = '';
    }
    if (key === 'rating') {
        state.rating = 0;
        document.querySelector('input[name="rating"][value="0"]').checked = true;
    }
    if (key === 'diskon') {
        state.hanyaDiskon = false;
        document.getElementById('filterDiskon').checked = false;
    }
    if (key === 'search') {
        state.search = '';
        document.getElementById('searchInput').value = '';
    }
    render();
}