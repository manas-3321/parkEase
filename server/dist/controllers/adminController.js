"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const db_1 = __importDefault(require("../services/db"));
class AdminController {
    // GET /api/admin/dashboard (System-wide analytics)
    static async getAnalytics(req, res) {
        try {
            const totalUsers = await db_1.default.user.count();
            const totalSpaces = await db_1.default.parkingSpace.count();
            const verifiedSpaces = await db_1.default.parkingSpace.count({
                where: { status: 'VERIFIED' },
            });
            const pendingSpaces = await db_1.default.parkingSpace.count({
                where: { status: 'PENDING' },
            });
            const activeBookings = await db_1.default.booking.count({
                where: { status: { in: ['RESERVED', 'OCCUPIED'] } },
            });
            const payments = await db_1.default.payment.findMany({
                where: { status: 'SUCCESS' },
            });
            // Sum revenue (platform fees + payments total)
            const platformRevenue = payments.reduce((acc, p) => acc + (p.amount * 0.15), 0); // 15% platform cut
            const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);
            res.json({
                totalUsers,
                totalSpaces,
                verifiedSpaces,
                pendingSpaces,
                activeBookings,
                platformRevenue: Math.round(platformRevenue),
                totalVolume: Math.round(totalVolume),
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // GET /api/admin/listings/pending (Verification Queue)
    static async getPendingListings(req, res) {
        try {
            const pendingListings = await db_1.default.parkingSpace.findMany({
                where: { status: 'PENDING' },
                include: {
                    owner: { select: { name: true, email: true } },
                    images: true,
                    verifications: true,
                },
            });
            res.json(pendingListings);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST /api/admin/listings/:id/approve
    static async approveListing(req, res) {
        try {
            const { id } = req.params;
            const space = await db_1.default.parkingSpace.findUnique({ where: { id } });
            if (!space) {
                return res.status(404).json({ error: 'Parking space listing not found.' });
            }
            const updated = await db_1.default.parkingSpace.update({
                where: { id },
                data: {
                    status: 'VERIFIED',
                    verificationScore: space.verificationScore || 100, // Make sure score is set
                },
            });
            // Add a verification history entry
            await db_1.default.verification.create({
                data: {
                    parkingSpaceId: id,
                    status: 'VERIFIED',
                    confidence: 1.0,
                    details: JSON.stringify({ approvedBy: 'ADMIN', timestamp: new Date().toISOString() }),
                },
            });
            // Create notification for owner
            await db_1.default.notification.create({
                data: {
                    userId: space.ownerId,
                    title: 'Listing Approved',
                    message: `Your listing "${space.name}" has been approved by the admin and is now live!`,
                },
            });
            res.json({ message: 'Listing approved successfully.', space: updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST /api/admin/listings/:id/reject
    static async rejectListing(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const space = await db_1.default.parkingSpace.findUnique({ where: { id } });
            if (!space) {
                return res.status(404).json({ error: 'Parking space listing not found.' });
            }
            const updated = await db_1.default.parkingSpace.update({
                where: { id },
                data: { status: 'REJECTED' },
            });
            await db_1.default.verification.create({
                data: {
                    parkingSpaceId: id,
                    status: 'REJECTED',
                    confidence: 1.0,
                    details: JSON.stringify({ rejectedBy: 'ADMIN', reason: reason || 'Inappropriate image or incorrect details' }),
                },
            });
            // Create notification for owner
            await db_1.default.notification.create({
                data: {
                    userId: space.ownerId,
                    title: 'Listing Rejected',
                    message: `Your listing "${space.name}" was rejected. Reason: ${reason || 'Inappropriate details.'}`,
                },
            });
            res.json({ message: 'Listing rejected.', space: updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // GET /api/admin/users (List all registered users)
    static async getUsers(req, res) {
        try {
            const users = await db_1.default.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map