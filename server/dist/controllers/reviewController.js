"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const db_1 = __importDefault(require("../services/db"));
class ReviewController {
    // POST /api/reviews
    static async create(req, res) {
        try {
            const authReq = req;
            const driverId = authReq.user?.id;
            if (!driverId) {
                return res.status(401).json({ error: 'Unauthorized: Driver authentication required.' });
            }
            const { bookingId, rating, comment } = req.body;
            if (!bookingId || !rating) {
                return res.status(400).json({ error: 'bookingId and rating (1-5) are required.' });
            }
            const parsedRating = parseInt(rating);
            if (parsedRating < 1 || parsedRating > 5) {
                return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
            }
            const booking = await db_1.default.booking.findUnique({
                where: { id: bookingId },
                include: { parkingSpace: true },
            });
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }
            if (booking.driverId !== driverId) {
                return res.status(403).json({ error: 'Forbidden: You cannot review someone else\'s booking.' });
            }
            if (booking.status !== 'COMPLETED') {
                return res.status(400).json({ error: 'You can only review completed booking sessions.' });
            }
            // Check if review already exists for this booking
            const existingReview = await db_1.default.review.findFirst({
                where: { bookingId },
            });
            if (existingReview) {
                return res.status(400).json({ error: 'You have already submitted a review for this booking session.' });
            }
            const review = await db_1.default.review.create({
                data: {
                    bookingId,
                    driverId,
                    parkingSpaceId: booking.parkingSpaceId,
                    rating: parsedRating,
                    comment: comment || '',
                },
            });
            res.status(201).json({
                message: 'Review submitted successfully.',
                review,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=reviewController.js.map