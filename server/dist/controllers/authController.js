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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = __importDefault(require("../services/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'parkease_super_secret_jwt_key_12345';
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name, role } = req.body;
            if (!email || !password || !name || !role) {
                return res.status(400).json({ error: 'All fields (email, password, name, role) are required.' });
            }
            if (!['DRIVER', 'OWNER', 'ADMIN'].includes(role)) {
                return res.status(400).json({ error: 'Invalid user role specified.' });
            }
            const existingUser = await db_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'An account with this email already exists.' });
            }
            const passwordHash = bcrypt.hashSync(password, 10);
            const user = await db_1.default.user.create({
                data: {
                    email,
                    password: passwordHash,
                    name,
                    role,
                },
            });
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required.' });
            }
            const user = await db_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async me(req, res) {
        try {
            const authReq = req;
            if (!authReq.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            const user = await db_1.default.user.findUnique({
                where: { id: authReq.user.id },
                select: { id: true, email: true, name: true, role: true },
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map