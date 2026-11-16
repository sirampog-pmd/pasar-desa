/**
 * Hero Slider — auto-play dengan animasi zoom (Ken Burns)
 * - Ganti slide setiap 5 detik
 * - Zoom IN / Zoom OUT bergantian tiap slide
 * - Pause saat hover, resume saat keluar
 * - Navigasi manual via panah & dot
 * - Pause saat tab tidak aktif (hemat resource)
 */
(function () {
    const DURATION = 5000; // 5 detik per slide
    const ZOOM_MODES = ['zoom-in', 'zoom-out']; // bergantian

    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('sliderDots');
    const progressBar = document.getElementById('sliderProgressBar');
    const btnPrev = document.getElementById('sliderPrev');
    const btnNext = document.getElementById('sliderNext');

    let current = 0;
    let timer = null;
    let isPaused = false;

    // ============ INIT DOTS ============
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i, true));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    // ============ CORE ============
    function showSlide(index) {
        // Reset semua slide
        slides.forEach((s, i) => {
            s.classList.remove('active', 'zoom-out');
            if (i === index) {
                // Tentukan mode zoom bergantian (genap = in, ganjil = out)
                const mode = ZOOM_MODES[index % 2];
                if (mode === 'zoom-out') s.classList.add('zoom-out');
                s.classList.add('active');
            }
        });

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(index, manual = false) {
        current = (index + slides.length) % slides.length;
        showSlide(current);
        restartAutoplay();

        // Reset progress bar saat ganti manual
        if (manual) resetProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // ============ AUTOPLAY ============
    function startAutoplay() {
        if (isPaused) return;
        stopAutoplay();
        resetProgress();
        slider.classList.add('playing');

        // Mulai animasi progress bar
        // (CSS animation diatur ulang tiap kali class .playing ditambah ulang)
        timer = setTimeout(() => {
            next();
        }, DURATION);
    }

    function stopAutoplay() {
        clearTimeout(timer);
        timer = null;
        slider.classList.remove('playing');
    }

    function restartAutoplay() {
        stopAutoplay();
        // Paksa reflow agar animasi progress CSS restart
        void progressBar.offsetWidth;
        startAutoplay();
    }

    function resetProgress() {
        // Restart animasi CSS progress bar
        if (progressBar) {
            progressBar.style.animation = 'none';
            void progressBar.offsetWidth;
            progressBar.style.animation = '';
        }
    }

    // ============ EVENTS ============
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    // Pause saat hover
    slider.addEventListener('mouseenter', () => {
        isPaused = true;
        stopAutoplay();
    });

    slider.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoplay();
    });

    // Pause saat tab tidak aktif
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else if (!isPaused) {
            startAutoplay();
        }
    });

    // Keyboard navigasi (kiri/kanan) saat slider fokus
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });

    // Swipe support (mobile)
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) prev();
            else next();
        }
    }, { passive: true });

    // ============ START ============
    showSlide(0);
    startAutoplay();
})();
