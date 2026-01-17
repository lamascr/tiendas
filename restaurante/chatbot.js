document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // Using the same webhook as the ecommerce chatbot, or the one found in the previous code.
    // The user edited the workflow to path 'chatbot'. 
    // Assuming the base URL is the same generic production one.
    // Ideally, this should be the specific production URL for the deployed workflow.
    const WEBHOOK_URL = 'https://production-n8n.fly.dev/webhook/chatbot';

    // --- DOM Elements ---
    // We will inject the widget HTML if it doesn't exist, or expect it to be there.
    // For safety, let's create the HTML dynamically so we don't have to touch index.html too much 
    // except for removing the old trash.

    // Check if widget exists, if not, create it
    if (!document.getElementById('chatbot-widget')) {
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'chatbot-widget';
        widgetContainer.innerHTML = `
        <div id="chat-toggle-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        
        <div id="chat-window" class="hidden">
            <div class="chat-header">
                <div class="header-info">
                    <span class="bot-avatar">🤖</span>
                    <div>
                        <h4>Asistente Lumière</h4>
                        <span class="status-dot"></span> <small>En línea</small>
                    </div>
                </div>
                <button id="close-chat">×</button>
            </div>
            <div id="chat-messages">
                <div class="message bot-message">
                    ¡Bienvenido a Lumière! 🍷 ¿Desea reservar una mesa o consultar nuestro menú?
                    <div class="message-time">Justo ahora</div>
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="user-input" placeholder="Escribe tu mensaje..." autocomplete="off">
                <button id="send-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
        `;
        document.body.appendChild(widgetContainer);
    }

    const chatWidget = document.getElementById('chatbot-widget');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat');
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // --- State ---
    let isOpen = false;
    let isTyping = false;
    let sessionId = 'session-' + Math.random().toString(36).substr(2, 9);

    // --- Event Listeners ---
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // --- Functions ---

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.remove('hidden');
            setTimeout(() => userInput.focus(), 100);
        } else {
            chatWindow.classList.add('hidden');
        }
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text || isTyping) return;

        // Add user message
        addMessage(text, 'user');
        userInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        try {
            // Send to n8n
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Remove typing indicator
            removeTypingIndicator();

            // Handle response
            // Support { output: ... } or { message: ... } or generic
            console.log("Respuesta n8n:", data); // Debug

            // Check for 'response' key from user's latest edit, or 'output', or 'message'
            let botText = "Lo siento, no entendí eso.";

            if (data.message) botText = data.message;
            else if (data.output) botText = data.output;
            else if (data.text) botText = data.text;
            else if (data.response) botText = data.response; // From user's edit in step 32? (User added "response" key to SET nodes, but "message" to output JSON)
            // Wait, in step 32, user set responseBody to: { "status": "success", "message": $json.response }
            // So data.message should be the one.

            addMessage(botText, 'bot');

        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage("Lo siento, hubo un problema de conexión. Inténtalo de nuevo más tarde.", 'bot');
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // Simple Markdown
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            ${formattedText}
            <div class="message-time">${time}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        if (document.querySelector('.typing-indicator')) return;

        isTyping = true;
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
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
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
