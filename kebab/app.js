// Scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Smooth scroll for navigation links
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

    // Header scroll effect
    const header = document.getElementById('main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.padding = '0.5rem 0';
        } else {
            header.style.padding = '1rem 0';
        }

        lastScroll = currentScroll;
    });

    // Menu image click to enlarge
    const menuImages = document.querySelectorAll('.menu-item-display');
    menuImages.forEach(img => {
        img.addEventListener('click', function () {
            const imgSrc = this.querySelector('img').src;
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                padding: 2rem;
            `;

            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            `;

            modal.appendChild(img);
            document.body.appendChild(modal);

            modal.addEventListener('click', () => {
                modal.remove();
            });
        });
    });

    // Scroll indicator animation
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }

    console.log('🥙 King Doner Kebab - Website loaded successfully!');
    console.log('☪ Productos 100% Halal certificados');
});
