"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_1 = require("../services/ai");
class AIController {
    // GET /api/ai/availability
    static async getAvailabilityPrediction(req, res) {
        try {
            const { spaceId, targetTime, duration } = req.query;
            if (!spaceId) {
                return res.status(400).json({ error: 'spaceId is required.' });
            }
            const time = targetTime ? new Date(targetTime) : new Date();
            const dur = duration ? parseFloat(duration) : 2.0;
            const prediction = await ai_1.AIService.predictAvailability(spaceId, time, dur);
            res.json(prediction);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // GET /api/ai/pricing
    static async getPricingRecommendation(req, res) {
        try {
            const { spaceId } = req.query;
            if (!spaceId) {
                return res.status(400).json({ error: 'spaceId is required.' });
            }
            const recommendation = await ai_1.AIService.calculateDynamicPrice(spaceId);
            res.json(recommendation);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // POST /api/ai/verify-image
    static async analyzeListingImage(req, res) {
        try {
            const { imageUrl, spaceName } = req.body;
            if (!imageUrl || !spaceName) {
                return res.status(400).json({ error: 'imageUrl and spaceName are required.' });
            }
            const result = await ai_1.AIService.verifyParkingImage(imageUrl, spaceName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AIController = AIController;
//# sourceMappingURL=aiController.js.map