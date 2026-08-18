"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error('Express Error Handler:', err);
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred on the server';
    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
//# sourceMappingURL=error.js.map