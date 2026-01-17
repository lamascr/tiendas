const OpenAI = require('openai');
const bookingService = require('./bookingService');
const systemPrompt = require('../prompts/systemPrompt');
const logger = require('../utils/logger');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// In-memory conversation history (in production, use Redis or MongoDB)
const conversationHistory = new Map();

/**
 * Generate AI response for user message
 */
const generateResponse = async ({ userPhone, userMessage, messageId }) => {
    try {
        // Get or create conversation history
        if (!conversationHistory.has(userPhone)) {
            conversationHistory.set(userPhone, []);
        }

        const history = conversationHistory.get(userPhone);

        // Add user message to history
        history.push({
            role: 'user',
            content: userMessage
        });

        // Limit history to last 10 messages (5 exchanges)
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt.getSystemPrompt() },
                ...history
            ],
            temperature: 0.7,
            max_tokens: 500,
            functions: [
                {
                    name: 'check_availability',
                    description: 'Check if a specific time slot is available for booking',
                    parameters: {
                        type: 'object',
                        properties: {
                            date: {
                                type: 'string',
                                description: 'Date in YYYY-MM-DD format'
                            },
                            time: {
                                type: 'string',
                                description: 'Time in HH:MM format (24h)'
                            },
                            barber: {
                                type: 'string',
                                description: 'Barber name (optional)'
                            }
                        },
                        required: ['date', 'time']
                    }
                },
                {
                    name: 'create_booking',
                    description: 'Create a new booking reservation',
                    parameters: {
                        type: 'object',
                        properties: {
                            customerName: {
                                type: 'string',
                                description: 'Customer full name'
                            },
                            service: {
                                type: 'string',
                                description: 'Service type',
                                enum: ['Corte Clásico', 'Afeitado Navaja', 'Corte + Barba', 'Diseño & Color']
                            },
                            barber: {
                                type: 'string',
                                description: 'Preferred barber'
                            },
                            date: {
                                type: 'string',
                                description: 'Date in YYYY-MM-DD format'
                            },
                            time: {
                                type: 'string',
                                description: 'Time in HH:MM format'
                            }
                        },
                        required: ['customerName', 'service', 'barber', 'date', 'time']
                    }
                }
            ],
            function_call: 'auto'
        });

        const response = completion.choices[0].message;

        // Check if AI wants to call a function
        if (response.function_call) {
            const functionName = response.function_call.name;
            const functionArgs = JSON.parse(response.function_call.arguments);

            logger.info(`🔧 AI calling function: ${functionName}`, functionArgs);

            let functionResult;

            if (functionName === 'check_availability') {
                functionResult = await bookingService.checkAvailability(functionArgs);
            } else if (functionName === 'create_booking') {
                functionResult = await bookingService.createBooking({
                    ...functionArgs,
                    customerPhone: userPhone
                });
            }

            // Call AI again with function result
            const secondCompletion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt.getSystemPrompt() },
                    ...history,
                    response,
                    {
                        role: 'function',
                        name: functionName,
                        content: JSON.stringify(functionResult)
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const finalResponse = secondCompletion.choices[0].message.content;

            // Add assistant response to history
            history.push({
                role: 'assistant',
                content: finalResponse
            });

            return {
                text: finalResponse,
                functionCalled: functionName,
                functionResult
            };
        }

        // No function call, just return text response
        const assistantMessage = response.content;

        // Add assistant response to history
        history.push({
            role: 'assistant',
            content: assistantMessage
        });

        return {
            text: assistantMessage
        };

    } catch (error) {
        logger.error('❌ Error generating AI response:', error);
        throw error;
    }
};

/**
 * Clear conversation history for a user
 */
const clearHistory = (userPhone) => {
    conversationHistory.delete(userPhone);
    logger.info(`🗑️ Cleared conversation history for ${userPhone}`);
};

module.exports = {
    generateResponse,
    clearHistory
};
