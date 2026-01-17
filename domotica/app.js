document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeBtn = document.querySelector('#scene-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);

            // Visual feedback for background ambient
            document.body.style.setProperty('--ambient-opacity', newTheme === 'light' ? '0.02' : '0.05');
        });
    }

    // Custom cursor glow effect
    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });

    // Scroll header effect
    const header = document.querySelector('#main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Room selector logic
    const roomBtns = document.querySelectorAll('.room-btn');
    const statusText = document.querySelector('.status-indicator');
    const previewContainer = document.querySelector('.room-preview');
    const energyVal = document.querySelector('#val-energy');
    const humiVal = document.querySelector('#val-humi');

    const roomData = {
        living: { color: '#00d2ff', bg: 'rgba(0, 210, 255, 0.05)', l: '80%', t: '22°C', e: '1.2 kW', h: '45%' },
        kitchen: { color: '#ff9f43', bg: 'rgba(255, 159, 67, 0.05)', l: '40%', t: '24°C', e: '2.5 kW', h: '60%' },
        bedroom: { color: '#a29bfe', bg: 'rgba(162, 155, 254, 0.05)', l: '20%', t: '21°C', e: '0.8 kW', h: '40%' }
    };

    roomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const room = btn.getAttribute('data-room');
            const data = roomData[room];

            statusText.innerText = `Sincronizando ${room}...`;
            statusText.style.color = data.color;
            previewContainer.style.backgroundColor = data.bg;

            setTimeout(() => {
                statusText.innerText = `Sistema ${room} Online`;
                statusText.style.color = '#4CAF50';

                // Update simulation values
                energyVal.innerText = data.e;
                humiVal.innerText = data.h;

                // Update sliders
                document.querySelectorAll('.slider .fill')[0].style.width = data.l;
                document.querySelectorAll('.slider .fill')[1].style.width = room === 'kitchen' ? '80%' : '50%';
            }, 800);
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Reveal animations refined
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.sol-card, .exp-visual, .contact-card, .hw-item, .price-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(el);
    });

    // Handle scroll reveal class
    document.addEventListener('scroll', () => {
        document.querySelectorAll('.revealed').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    });

    // Form submission
    const form = document.querySelector('#contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'ENVIANDO SOLICITUD...';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                btn.innerText = 'SOLICITUD ENVIADA';
                btn.style.background = '#4CAF50';
                form.reset();
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.style.pointerEvents = 'all';
                }, 3000);
            }, 1500);
        });
    }
});
