"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const db_1 = __importDefault(require("../services/db"));
const payment_1 = require("../services/payment");
class PaymentController {
    // Create payment order intent
    static async createIntent(req, res) {
        try {
            const { bookingId } = req.body;
            const authReq = req;
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: Auth token required.' });
            }
            if (!bookingId) {
                return res.status(400).json({ error: 'bookingId is required.' });
            }
            const booking = await db_1.default.booking.findUnique({
                where: { id: bookingId },
                include: { parkingSpace: true },
            });
            if (!booking) {
                return res.status(404).json({ error: 'Booking reservation not found.' });
            }
            if (booking.driverId !== userId) {
                return res.status(403).json({ error: 'Forbidden: You did not initialize this booking.' });
            }
            if (booking.status !== 'PENDING') {
                return res.status(400).json({ error: `Booking has already been processed (Status: ${booking.status}).` });
            }
            // Calculate total amount (base price + platform fee)
            const chargeAmount = booking.totalAmount + booking.platformFee;
            // Call Payment service to initialize Razorpay/Simulator order
            const orderResult = await payment_1.PaymentService.createOrder({
                amount: chargeAmount,
                bookingId: booking.id,
            });
            // Upsert payment details in the database
            const payment = await db_1.default.payment.upsert({
                where: { bookingId: booking.id },
                update: {
                    orderId: orderResult.orderId,
                    amount: chargeAmount,
                    provider: orderResult.provider,
                    status: 'PENDING',
                },
                create: {
                    bookingId: booking.id,
                    userId: userId,
                    orderId: orderResult.orderId,
                    amount: chargeAmount,
                    provider: orderResult.provider,
                    status: 'PENDING',
                },
            });
            res.status(200).json({
                message: 'Payment order created.',
                order: {
                    orderId: orderResult.orderId,
                    amount: orderResult.amount,
                    currency: orderResult.currency,
                    provider: orderResult.provider,
                    keyId: orderResult.keyId,
                },
                paymentId: payment.id,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Verify payment status on backend
    static async verify(req, res) {
        try {
            const { bookingId, orderId, paymentId, signature } = req.body;
            const authReq = req;
            const userId = authReq.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized.' });
            }
            if (!bookingId || !orderId || !paymentId) {
                return res.status(400).json({ error: 'Required fields missing: bookingId, orderId, paymentId.' });
            }
            // Verify signature on backend
            const isValid = payment_1.PaymentService.verifyPayment({
                orderId,
                paymentId,
                signature,
            });
            if (!isValid) {
                // Update payment state to FAILED
                await db_1.default.payment.update({
                    where: { bookingId },
                    data: { status: 'FAILED' },
                });
                return res.status(400).json({
                    error: 'Payment verification failed. Invalid transaction signature.',
                });
            }
            // Update payment state to SUCCESS & Booking to RESERVED
            const result = await db_1.default.$transaction(async (tx) => {
                const updatedPayment = await tx.payment.update({
                    where: { bookingId },
                    data: {
                        status: 'SUCCESS',
                        paymentId,
                        signature,
                    },
                });
                const updatedBooking = await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'RESERVED',
                    },
                    include: { parkingSpace: true },
                });
                // Add a notification for successful booking
                await tx.notification.createMany({
                    data: [
                        {
                            userId: updatedBooking.driverId,
                            title: 'Booking Confirmed',
                            message: `Your booking at ${updatedBooking.parkingSpace.name} is confirmed! Check-in QR is generated.`,
                        },
                        {
                            userId: updatedBooking.parkingSpace.ownerId,
                            title: 'New Reservation',
                            message: `Your spot ${updatedBooking.parkingSpace.name} has been reserved.`,
                        },
                    ],
                });
                return { updatedPayment, updatedBooking };
            });
            res.status(200).json({
                message: 'Payment verified and booking confirmed.',
                booking: result.updatedBooking,
                payment: result.updatedPayment,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=paymentController.js.map