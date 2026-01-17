import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
    webhookUrl: 'https://production-n8n.fly.dev/webhook/71551c27-bcad-4a7a-86d1-2fe8b5e49a49/chat',
    mode: 'window',
    initialMessages: [
        '¡Bienvenido a Lumière! 🍷 ¿Desea reservar una mesa o consultar nuestro menú?'
    ],
    i18n: {
        en: {
            title: 'Asistente Lumière',
            subtitle: 'En línea',
            footer: '',
            getStarted: 'Nuevo chat',
            inputPlaceholder: 'Escribe tu mensaje...',
        },
    },
});
