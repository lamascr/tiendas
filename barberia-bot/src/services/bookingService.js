const logger = require('../utils/logger');
const { format, addDays, setHours, setMinutes, isAfter, isBefore } = require('date-fns');

// In-memory storage (in production, use MongoDB)
const bookings = new Map();

// Business hours configuration
const BUSINESS_HOURS = {
    start: parseInt(process.env.BUSINESS_HOURS_START?.split(':')[0] || '10'),
    end: parseInt(process.env.BUSINESS_HOURS_END?.split(':')[0] || '20')
};

const BARBERS = (process.env.BARBERS || 'Carlos Mendoza,Javier Ruiz,Miguel Ángel').split(',');

/**
 * Check if a time slot is available
 */
const checkAvailability = async ({ date, time, barber }) => {
    try {
        const requestedDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        // Check if date is in the past
        if (isBefore(requestedDateTime, now)) {
            return {
                available: false,
                reason: 'No se pueden hacer reservas en el pasado'
            };
        }

        // Check if it's Sunday (closed)
        if (requestedDateTime.getDay() === 0) {
            return {
                available: false,
                reason: 'Los domingos estamos cerrados'
            };
        }

        // Check if time is within business hours
        const requestedHour = parseInt(time.split(':')[0]);
        if (requestedHour < BUSINESS_HOURS.start || requestedHour >= BUSINESS_HOURS.end) {
            return {
                available: false,
                reason: `Nuestro horario es de ${BUSINESS_HOURS.start}:00 a ${BUSINESS_HOURS.end}:00`
            };
        }

        // Check if slot is already booked
        const bookingKey = `${date}_${time}_${barber || 'any'}`;

        if (bookings.has(bookingKey)) {
            return {
                available: false,
                reason: 'Este horario ya está reservado'
            };
        }

        // Get alternative times if specific barber is requested
        const alternatives = [];
        if (barber) {
            for (const b of BARBERS) {
                const altKey = `${date}_${time}_${b}`;
                if (!bookings.has(altKey)) {
                    alternatives.push(b);
                }
            }
        }

        return {
            available: true,
            date: format(requestedDateTime, 'dd/MM/yyyy'),
            time: time,
            barber: barber || 'Cualquier barbero disponible',
            alternatives: alternatives.length > 0 ? alternatives : undefined
        };

    } catch (error) {
        logger.error('❌ Error checking availability:', error);
        throw error;
    }
};

/**
 * Create a new booking
 */
const createBooking = async ({ customerName, customerPhone, service, barber, date, time }) => {
    try {
        // First check availability
        const availability = await checkAvailability({ date, time, barber });

        if (!availability.available) {
            return {
                success: false,
                message: availability.reason
            };
        }

        // Generate booking ID
        const bookingId = `BK${Date.now().toString().slice(-8)}`;

        // Create booking object
        const booking = {
            id: bookingId,
            customerName,
            customerPhone,
            service,
            barber,
            date,
            time,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        // Store booking
        const bookingKey = `${date}_${time}_${barber}`;
        bookings.set(bookingKey, booking);
        bookings.set(bookingId, booking); // Also store by ID for lookups

        logger.info(`✅ Booking created: ${bookingId}`, booking);

        return {
            success: true,
            bookingId,
            booking: {
                ...booking,
                dateFormatted: format(new Date(`${date}T${time}`), 'dd/MM/yyyy'),
                price: getServicePrice(service)
            }
        };

    } catch (error) {
        logger.error('❌ Error creating booking:', error);
        throw error;
    }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (bookingId) => {
    try {
        const booking = bookings.get(bookingId);

        if (!booking) {
            return {
                success: false,
                message: 'Reserva no encontrada'
            };
        }

        // Check if cancellation is allowed (at least 2 hours before)
        const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
        const now = new Date();
        const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilBooking < 2) {
            return {
                success: false,
                message: 'No se puede cancelar con menos de 2 horas de anticipación'
            };
        }

        // Delete booking
        const bookingKey = `${booking.date}_${booking.time}_${booking.barber}`;
        bookings.delete(bookingKey);
        bookings.delete(bookingId);

        logger.info(`🗑️ Booking cancelled: ${bookingId}`);

        return {
            success: true,
            message: 'Reserva cancelada exitosamente'
        };

    } catch (error) {
        logger.error('❌ Error cancelling booking:', error);
        throw error;
    }
};

/**
 * Get service price
 */
const getServicePrice = (service) => {
    const prices = {
        'Corte Clásico': process.env.SERVICE_CORTE || '25€',
        'Afeitado Navaja': process.env.SERVICE_AFEITADO || '20€',
        'Corte + Barba': process.env.SERVICE_COMBO || '40€',
        'Diseño & Color': process.env.SERVICE_DISENO || '35€+'
    };

    return prices[service] || 'Consultar';
};

/**
 * Get all bookings for a specific date
 */
const getBookingsByDate = (date) => {
    const dayBookings = [];
    for (const [key, booking] of bookings.entries()) {
        if (booking.date === date && booking.status === 'confirmed') {
            dayBookings.push(booking);
        }
    }
    return dayBookings;
};

module.exports = {
    checkAvailability,
    createBooking,
    cancelBooking,
    getBookingsByDate,
    getServicePrice
};
