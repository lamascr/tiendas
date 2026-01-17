document.addEventListener('DOMContentLoaded', () => {
    // Gallery Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    // Scroll Reveal Animations
    const observerOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .service-box, .barber-card').forEach(el => {
        el.classList.add('fade-in');
        revealObserver.observe(el);
    });

    // Booking Form
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('.btn-submit');
            const originalText = btn.innerText;

            btn.innerText = 'PROCESANDO RESERVA...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                btn.innerText = '¡CITA CONFIRMADA!';
                btn.style.background = '#d4af37';
                btn.style.color = '#1a1a1a';

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.pointerEvents = 'all';
                    btn.style.opacity = '1';
                    btn.style.background = '';
                    btn.style.color = '';
                    bookingForm.reset();
                }, 3000);
            }, 1500);
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect on hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });
});
