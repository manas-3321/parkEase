"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("./controllers/authController");
const parkingController_1 = require("./controllers/parkingController");
const bookingController_1 = require("./controllers/bookingController");
const paymentController_1 = require("./controllers/paymentController");
const aiController_1 = require("./controllers/aiController");
const eventController_1 = require("./controllers/eventController");
const reviewController_1 = require("./controllers/reviewController");
const adminController_1 = require("./controllers/adminController");
const auth_1 = require("./middleware/auth");
const db_1 = __importDefault(require("./services/db"));
const router = (0, express_1.Router)();
// --- AUTHENTICATION ---
router.post('/auth/register', authController_1.AuthController.register);
router.post('/auth/login', authController_1.AuthController.login);
router.get('/auth/me', auth_1.authenticateToken, authController_1.AuthController.me);
// --- PARKING ---
router.get('/parking/search', parkingController_1.ParkingController.search); // Search first to prevent match on ID
router.get('/parking', parkingController_1.ParkingController.getAll);
router.get('/parking/:id', parkingController_1.ParkingController.getById);
router.post('/parking', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ADMIN']), parkingController_1.ParkingController.create);
router.put('/parking/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ADMIN']), parkingController_1.ParkingController.update);
router.delete('/parking/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ADMIN']), parkingController_1.ParkingController.delete);
// --- BOOKINGS ---
router.post('/bookings', auth_1.authenticateToken, (0, auth_1.requireRole)(['DRIVER']), bookingController_1.BookingController.create);
router.get('/bookings', auth_1.authenticateToken, bookingController_1.BookingController.getAll);
router.get('/bookings/:id', auth_1.authenticateToken, bookingController_1.BookingController.getById);
router.post('/bookings/:id/check-in', auth_1.authenticateToken, bookingController_1.BookingController.checkIn);
router.post('/bookings/:id/check-out', auth_1.authenticateToken, bookingController_1.BookingController.checkOut);
router.post('/bookings/:id/cancel', auth_1.authenticateToken, bookingController_1.BookingController.cancel);
// --- PAYMENTS ---
router.post('/payments/create', auth_1.authenticateToken, (0, auth_1.requireRole)(['DRIVER']), paymentController_1.PaymentController.createIntent);
router.post('/payments/verify', auth_1.authenticateToken, (0, auth_1.requireRole)(['DRIVER']), paymentController_1.PaymentController.verify);
// --- AI SERVICE ---
router.get('/ai/availability', aiController_1.AIController.getAvailabilityPrediction);
router.get('/ai/pricing', aiController_1.AIController.getPricingRecommendation);
router.post('/ai/verify-image', aiController_1.AIController.analyzeListingImage);
// --- EVENTS ---
router.get('/events', eventController_1.EventController.getAll);
// --- REVIEWS ---
router.post('/reviews', auth_1.authenticateToken, (0, auth_1.requireRole)(['DRIVER']), reviewController_1.ReviewController.create);
// --- ADMIN SYSTEM ---
router.get('/admin/dashboard', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), adminController_1.AdminController.getAnalytics);
router.get('/admin/listings/pending', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), adminController_1.AdminController.getPendingListings);
router.post('/admin/listings/:id/approve', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), adminController_1.AdminController.approveListing);
router.post('/admin/listings/:id/reject', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), adminController_1.AdminController.rejectListing);
router.get('/admin/users', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), adminController_1.AdminController.getUsers);
// --- NOTIFICATIONS ---
router.get('/notifications', auth_1.authenticateToken, async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        const notifications = await db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/notifications/read-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const authReq = req;
        const userId = authReq.user?.id;
        await db_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'Notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- CONFIGS ---
router.get('/config/google-maps-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || '' });
});
exports.default = router;
//# sourceMappingURL=routes.js.map