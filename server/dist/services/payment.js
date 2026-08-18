"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto = __importStar(require("crypto"));
class PaymentService {
    /**
     * Create a payment order. If Razorpay keys are configured, use Razorpay.
     * Otherwise, return a simulated order payload.
     */
    static async createOrder(options) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const amountInPaise = Math.round(options.amount * 100);
        if (keyId && keySecret) {
            try {
                // Dynamic import to prevent failing if razorpay is not installed
                // We'll require it locally
                const Razorpay = require('razorpay');
                const instance = new Razorpay({
                    key_id: keyId,
                    key_secret: keySecret,
                });
                const order = await instance.orders.create({
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `receipt_${options.bookingId.substring(0, 10)}`,
                });
                return {
                    orderId: order.id,
                    amount: options.amount,
                    currency: 'INR',
                    provider: 'RAZORPAY',
                    keyId: keyId,
                };
            }
            catch (err) {
                console.error('Failed to create order on Razorpay, falling back to simulator:', err);
            }
        }
        // Default Simulator Mode
        const simulatedOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
        return {
            orderId: simulatedOrderId,
            amount: options.amount,
            currency: 'INR',
            provider: 'SIMULATOR',
        };
    }
    /**
     * Verify a payment signature. If Razorpay keys are configured, verify cryptographically.
     * Otherwise, verify the simulator's signature structure.
     */
    static verifyPayment(options) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (keyId && keySecret && options.signature) {
            try {
                const body = options.orderId + '|' + options.paymentId;
                const expectedSignature = crypto
                    .createHmac('sha256', keySecret)
                    .update(body.toString())
                    .digest('hex');
                return expectedSignature === options.signature;
            }
            catch (err) {
                console.error('Error verifying Razorpay signature:', err);
                return false;
            }
        }
        // Simulator verification check
        // In simulator mode, the checkout panel generates a paymentId starting with "pay_sim_"
        // and sends it to the server. We verify it matches the simulated format.
        if (options.orderId.startsWith('order_sim_') && options.paymentId.startsWith('pay_sim_')) {
            return true;
        }
        return false;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.js.map