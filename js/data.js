// Data produk UMKM (bisa diganti dengan API/database)
const produkData = [
    {
        id: 1,
        nama: "Kopi Arabika Gayo Premium 250gr",
        toko: "Kopi Pak Tani",
        desa: "Desa Bener Meriah, Aceh",
        kategori: "minuman",
        harga: 45000,
        hargaAsli: 60000,
        rating: 4.9,
        terjual: 342,
        gambar: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
        unggulan: true
    },
    {
        id: 2,
        nama: "Batik Tulis Motif Parang",
        toko: "Batik Sari",
        desa: "Desa Laweyan, Solo",
        kategori: "fashion",
        harga: 285000,
        hargaAsli: 350000,
        rating: 4.8,
        terjual: 128,
        gambar: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
        unggulan: true
    },
    {
        id: 3,
        nama: "Madu Hutan Asli 500ml",
        toko: "Madu Rimba",
        desa: "Desa Sumbawa, NTB",
        kategori: "makanan",
        harga: 95000,
        hargaAsli: 120000,
        rating: 5.0,
        terjual: 567,
        gambar: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
        unggulan: true
    },
    {
        id: 4,
        nama: "Anyaman Bambu Dekorasi",
        toko: "Kriya Bambu",
        desa: "Desa Tasikmalaya, Jabar",
        kategori: "kriya",
        harga: 125000,
        hargaAsli: 0,
        rating: 4.7,
        terjual: 89,
        gambar: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400",
        unggulan: true
    },
    {
        id: 5,
        nama: "Keripik Pisang Pedas Manis 200gr",
        toko: "Snack Bu Yati",
        desa: "Desa Lumajang, Jatim",
        kategori: "makanan",
        harga: 25000,
        hargaAsli: 35000,
        rating: 4.6,
        terjual: 890,
        gambar: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
        unggulan: true
    },
    {
        id: 6,
        nama: "Teh Herbal Rosella 100gr",
        toko: "Herbal Desa",
        desa: "Desa Wonosobo, Jateng",
        kategori: "minuman",
        harga: 35000,
        hargaAsli: 0,
        rating: 4.8,
        terjual: 234,
        gambar: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
        unggulan: true
    },
    {
        id: 7,
        nama: "Sabun Organik Lidah Buaya",
        toko: "Natural Care",
        desa: "Desa Sleman, DIY",
        kategori: "kecantikan",
        harga: 28000,
        hargaAsli: 40000,
        rating: 4.9,
        terjual: 456,
        gambar: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400",
        unggulan: true
    },
    {
        id: 8,
        nama: "Beras Organik Pandan Wangi 5kg",
        toko: "Tani Makmur",
        desa: "Desa Klaten, Jateng",
        kategori: "pertanian",
        harga: 85000,
        hargaAsli: 95000,
        rating: 4.8,
        terjual: 678,
        gambar: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
        unggulan: true
    }
];

// Format harga ke Rupiah
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Simpan ke localStorage
localStorage.setItem('produk', JSON.stringify(produkData));