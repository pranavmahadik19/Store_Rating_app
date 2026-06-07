"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'store_rating_app_jwt_secret_key_987654321';
const signup = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;
        // Check if user already exists
        const existingUsers = await (0, db_1.query)('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(400).json({ status: 'fail', message: 'Email already registered' });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Insert user
        const insertResult = await (0, db_1.query)('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, address, 'NORMAL']);
        const userId = insertResult.insertId;
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: userId, email, role: 'NORMAL', name }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            token,
            user: { id: userId, name, email, role: 'NORMAL', address },
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Fetch user
        const users = await (0, db_1.query)('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            res.status(400).json({ status: 'fail', message: 'Invalid email or password' });
            return;
        }
        const user = users[0];
        // Check password
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ status: 'fail', message: 'Invalid email or password' });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.login = login;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            return;
        }
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        // Fetch user's current password
        const users = await (0, db_1.query)('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            res.status(404).json({ status: 'fail', message: 'User not found' });
            return;
        }
        const currentHashedPassword = users[0].password;
        // Compare old password
        const isPasswordCorrect = await bcryptjs_1.default.compare(oldPassword, currentHashedPassword);
        if (!isPasswordCorrect) {
            res.status(400).json({ status: 'fail', message: 'Incorrect old password' });
            return;
        }
        // Hash new password
        const newHashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await (0, db_1.query)('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, userId]);
        res.status(200).json({ status: 'success', message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
