"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS for frontend cross-origin requests
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for the hackathon prototype
    credentials: true,
}));
// Setup JSON parsing rules
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'ParkEase API Server is healthy and running.' });
});
// Attach API Routing
app.use('/api', routes_1.default);
// Attach global error-handling boundary middleware
app.use(error_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  ParkEase Express Server has started!`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
    console.log(`===============================================`);
});
//# sourceMappingURL=index.js.map