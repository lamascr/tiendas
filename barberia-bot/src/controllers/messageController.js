const aiAgent = require('../services/aiAgent');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

/**
 * Process incoming WhatsApp message
 */
const processMessage = async ({ from, messageBody, messageType, messageId }) => {
    try {
        // Only process text messages for now
        if (messageType !== 'text') {
            logger.info(`⏭️ Skipping non-text message type: ${messageType}`);
            return;
        }

        // Send "typing" indicator
        await whatsappService.sendTypingIndicator(from);

        // Get AI response
        const aiResponse = await aiAgent.generateResponse({
            userPhone: from,
            userMessage: messageBody,
            messageId
        });

        // Send response back to user
        await whatsappService.sendMessage(from, aiResponse.text);

        // If there are quick reply buttons, send them
        if (aiResponse.buttons) {
            await whatsappService.sendButtons(from, aiResponse.buttons);
        }

        logger.info(`✅ Message processed successfully for ${from}`);
    } catch (error) {
        logger.error(`❌ Error processing message from ${from}:`, error);

        // Send error message to user
        await whatsappService.sendMessage(
            from,
            'Disculpa, he tenido un problema técnico. ¿Puedes intentarlo de nuevo?'
        );
    }
};

module.exports = {
    processMessage
};
