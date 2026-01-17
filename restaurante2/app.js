document.addEventListener('DOMContentLoaded', () => {
    // Scroll header
    const header = document.querySelector('#main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initialize Menu
    loadMenu();

    // Form submission mock
    const form = document.querySelector('#reserva-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'PROCESANDO...';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            btn.innerText = 'RESERVA SOLICITADA';
            btn.style.background = '#4CAF50';
            btn.style.color = 'white';
            form.reset();
        }, 2000);
    });
});

async function loadMenu() {
    try {
        const response = await fetch('2menu.xlsx');
        if (!response.ok) throw new Error('Failed to load menu file');

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Assume first sheet is the menu
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const products = XLSX.utils.sheet_to_json(worksheet);

        renderMenu(products);
        initializeFilters();
        initializeScrollReveal();

    } catch (error) {
        console.error('Error loading menu:', error);
        document.getElementById('menu-grid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #d6b161;">
                <p>No se pudo cargar el menú. Asegúrese de que 'menu.xlsx' existe.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function renderMenu(products) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = ''; // Clear loading message

    products.forEach(product => {
        const html = `
            <div class="menu-item" data-category="${product.category ? product.category.toLowerCase() : 'otros'}">
                <div class="item-img"
                    style="background-image: url('${product.image || 'assets/placeholder.jpg'}');">
                </div>
                <div class="item-details">
                    <div class="item-header">
                        <h3>${product.name}</h3>
                        <span class="price">${product.price}€</span>
                    </div>
                    <p>${product.description || ''}</p>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });
}

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');
                // Simple partial matching or exact match
                if (filter === 'todos' || category === filter || (category && category.includes(filter))) {
                    item.style.display = 'flex';
                    setTimeout(() => item.classList.add('visible'), 10);
                } else {
                    item.classList.remove('visible');
                    setTimeout(() => item.style.display = 'none', 500);
                }
            });
        });
    });
}

function initializeScrollReveal() {
    const menuItems = document.querySelectorAll('.menu-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    menuItems.forEach(item => observer.observe(item));
}
