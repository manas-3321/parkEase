"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const db_1 = __importDefault(require("../services/db"));
class EventController {
    // GET /api/events
    static async getAll(req, res) {
        try {
            const events = await db_1.default.event.findMany({
                orderBy: { startTime: 'asc' },
            });
            res.json(events);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=eventController.js.map