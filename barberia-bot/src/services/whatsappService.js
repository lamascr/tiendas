const axios = require('axios');
const logger = require('../utils/logger');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Send a text message via WhatsApp Business API
 */
const sendMessage = async (to, text) => {
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: text }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        logger.info(`📤 Message sent to ${to}`);
        return response.data;
    } catch (error) {
        logger.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Send typing indicator (marks conversation as read)
 */
const sendTypingIndicator = async (to) => {
    try {
        await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                status: 'read',
                to: to
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        logger.error('❌ Error sending typing indicator:', error.message);
    }
};

/**
 * Send interactive buttons
 */
const sendButtons = async (to, buttons) => {
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: {
                        text: buttons.text
                    },
                    action: {
                        buttons: buttons.options.map((option, index) => ({
                            type: 'reply',
                            reply: {
                                id: `btn_${index}`,
                                title: option
                            }
                        }))
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        logger.info(`📤 Interactive buttons sent to ${to}`);
        return response.data;
    } catch (error) {
        logger.error('❌ Error sending buttons:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Send template message (for pre-approved templates)
 */
const sendTemplate = async (to, templateName, languageCode = 'es') => {
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        logger.info(`📤 Template message sent to ${to}`);
        return response.data;
    } catch (error) {
        logger.error('❌ Error sending template:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendMessage,
    sendTypingIndicator,
    sendButtons,
    sendTemplate
};
