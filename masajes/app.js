document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('#main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal Animations
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

    document.querySelectorAll('.service-card, .benefits-visual, .benefits-content, .booking-wrap, .fade-in-scroll').forEach(el => {
        el.classList.add('fade-in-scroll');
        revealObserver.observe(el);
    });

    // Service Card Hover Effect (Custom Cursor or Interaction can be added here)
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Subtle sound or additional visual could go here
        });
    });

    // Booking Form
    const bookingForm = document.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'PROCESANDO SERENIDAD...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                btn.innerText = '¡CITA PRE-RESERVADA!';
                btn.style.background = '#8e9775';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.pointerEvents = 'all';
                    btn.style.opacity = '1';
                    btn.style.background = '';
                    bookingForm.reset();
                }, 3000);
            }, 1500);
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
