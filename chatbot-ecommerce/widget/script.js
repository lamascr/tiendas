document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // REPLACE THIS URL WITH YOUR N8N WEBHOOK URL
    const WEBHOOK_URL = 'https://production-n8n.fly.dev/webhook/35cfb3de-6a18-4878-8d73-abe2130a0355/chat';
    // Uses the same generic hook for now, can be updated later by User if needed.

    // --- DOM Elements ---
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
    let sessionId = generateSessionId();

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

    function generateSessionId() {
        return 'session-' + Math.random().toString(36).substr(2, 9);
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

            // Add bot response
            // Handle different response formats (depending on how n8n returns it)
            // Expecting: { output: "text response" } or { message: "text response" } or plain text if wrapped
            const botText = data.output || data.message || data.text || "Lo siento, no entendí eso.";
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

        // Simple Markdown parsing implementation for basics
        // Bold: **text** -> <strong>text</strong>
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Newlines to <br>
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
