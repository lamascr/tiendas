const XLSX = require('xlsx');

const data = [
    {
        category: 'entrantes',
        name: 'Carpaccio de Wagyu',
        price: 28,
        description: 'Láminas de Wagyu A5, trufa negra y lascas de Parmigiano Reggiano 36 meses.',
        image: 'https://images.unsplash.com/photo-1546241072480-10ad28c2c?auto=format&fit=crop&q=80&w=800' // Fixed URL slightly, removed random char if any, keeping original mostly
    },
    {
        category: 'principales',
        name: 'Lubina Salvaje',
        price: 42,
        description: 'Costra de sal, emulsión de algas y verduras de temporada glaceadas.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800'
    },
    {
        category: 'postres',
        name: 'Texturas de Chocolate',
        price: 16,
        description: 'Valrhona 70%, frutos rojos y helado artesanal de vainilla Bourbon.',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800'
    }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Menu");
XLSX.writeFile(wb, "menu.xlsx");
console.log("menu.xlsx created successfully!");
