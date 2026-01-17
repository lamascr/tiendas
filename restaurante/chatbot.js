document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // CONFIGURACIÓN
    // =========================
    const WEBHOOK_URL = 'https://production-n8n.fly.dev/webhook-test/chatbot';

    // =========================
    // CREACIÓN DEL WIDGET
    // =========================
    if (!document.getElementById('chatbot-widget')) {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'chatbot-widget';
        widgetContainer.innerHTML = `
        <div id="chat-toggle-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </div>

        <div id="chat-window" class="hidden">
            <div class="chat-header">
                <div class="header-info">
                    <span class="bot-avatar">🤖</span>
                    <div>
                        <h4>Asistente Lumière</h4>
                        <small>En línea</small>
                    </div>
                </div>
                <button id="close-chat">×</button>
            </div>

            <div id="chat-messages">
                <div class="message bot-message">
                    ¡Bienvenido a Lumière! 🍷 ¿Desea reservar una mesa o consultar nuestro menú?
                    <div class="message-time">Ahora</div>
                </div>
            </div>

            <div class="chat-input-area">
                <input type="text" id="user-input" placeholder="Escribe tu mensaje..." autocomplete="off">
                <button id="send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
        `;
        document.body.appendChild(widgetContainer);
    }

    // =========================
    // REFERENCIAS DOM
    // =========================
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // =========================
    // ESTADO
    // =========================
    let isOpen = false;
    let isTyping = false;
    const sessionId = 'session-' + crypto.randomUUID();

    // =========================
    // EVENTOS
    // =========================
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // =========================
    // FUNCIONES
    // =========================
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.classList.toggle('hidden', !isOpen);
        if (isOpen) setTimeout(() => userInput.focus(), 100);
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text || isTyping) return;

        addMessage(text, 'user');
        userInput.value = '';
        showTypingIndicator();

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    sessionId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const rawText = await response.text();

            let data;
            try {
                data = JSON.parse(rawText);
            } catch {
                data = rawText;
            }

            removeTypingIndicator();

            let botText = 'Lo siento, no se recibió una respuesta válida.';

            if (typeof data === 'string') {
                botText = data;
            } else if (Array.isArray(data)) {
                // Check if the first item has 'output', 'message' or 'text'
                botText = data[0]?.output || data[0]?.message || data[0]?.text || JSON.stringify(data);
            } else if (data.output) {
                botText = data.output;
            } else if (data.message) {
                botText = data.message;
            } else if (data.response) {
                botText = data.response;
            }

            addMessage(botText, 'bot');

        } catch (error) {
            console.error('Chatbot error:', error);
            removeTypingIndicator();
            addMessage(
                'Error de conexión con el asistente. Inténtelo de nuevo más tarde.',
                'bot'
            );
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            ${formattedText}
            <div class="message-time">${time}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        if (isTyping) return;
        isTyping = true;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;

        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        isTyping = false;
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

});
