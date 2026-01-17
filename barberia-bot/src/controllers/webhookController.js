const messageController = require('./messageController');
const logger = require('../utils/logger');

/**
 * Verify webhook for WhatsApp Business API
 * This endpoint is called by Meta to verify your webhook
 */
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check if mode and token are correct
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        logger.info('✅ Webhook verified successfully');
        res.status(200).send(challenge);
    } else {
        logger.warn('⚠️ Webhook verification failed');
        res.sendStatus(403);
    }
};

/**
 * Handle incoming messages from WhatsApp
 */
const handleMessage = async (req, res) => {
    try {
        const body = req.body;

        // Check if this is a WhatsApp message event
        if (body.object === 'whatsapp_business_account') {
            // Extract message data
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const messages = value?.messages;

            if (messages && messages.length > 0) {
                const message = messages[0];
                const from = message.from; // Phone number
                const messageBody = message.text?.body;
                const messageType = message.type;

                logger.info(`📨 New message from ${from}: ${messageBody}`);

                // Process the message
                await messageController.processMessage({
                    from,
                    messageBody,
                    messageType,
                    messageId: message.id
                });
            }

            // Always respond 200 OK to acknowledge receipt
            res.sendStatus(200);
        } else {
            logger.warn('⚠️ Received non-WhatsApp event');
            res.sendStatus(404);
        }
    } catch (error) {
        logger.error('❌ Error handling webhook:', error);
        res.sendStatus(500);
    }
};

module.exports = {
    verifyWebhook,
    handleMessage
};
