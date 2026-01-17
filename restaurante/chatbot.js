import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

createChat({
    webhookUrl: 'https://production-n8n.fly.dev/webhook/71551c27-bcad-4a7a-86d1-2fe8b5e49a49/chat',
    webhookConfig: {
        method: 'POST',
        headers: {}
    },
    target: '#n8n-chat',
    mode: 'window',
    chatInputKey: 'chatInput',
    chatSessionKey: 'sessionId',
    loadPreviousSession: true,
    metadata: {},
    showWelcomeScreen: false,
    defaultLanguage: 'es',
    initialMessages: [
        '¡Hola! 👋',
        'Soy Nathan, el asistente de Lumière Bistro. ¿En qué puedo ayudarte hoy?'
    ],
    i18n: {
        es: {
            title: '¡Hola! 👋',
            subtitle: "Estamos aquí para ayudarte 24/7.",
            footer: '',
            getStarted: 'Nueva conversación',
            inputPlaceholder: 'Escribe tu pregunta...',
        },
    },
    enableStreaming: false,
});
