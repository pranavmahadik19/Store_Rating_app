"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingSchema = exports.addStoreSchema = exports.addUserSchema = exports.changePasswordSchema = exports.loginSchema = exports.signupSchema = exports.emailSchema = exports.passwordSchema = exports.addressSchema = exports.nameSchema = void 0;
const zod_1 = require("zod");
exports.nameSchema = zod_1.z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters');
exports.addressSchema = zod_1.z
    .string()
    .max(400, 'Address must not exceed 400 characters');
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must be at most 16 characters long')
    .refine((val) => /[A-Z]/.test(val), { message: 'Password must include at least one uppercase letter' })
    .refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Password must include at least one special character' });
exports.emailSchema = zod_1.z
    .string()
    .email('Must follow standard email validation rules');
// Schemas for API Requests
exports.signupSchema = zod_1.z.object({
    name: exports.nameSchema,
    email: exports.emailSchema,
    address: exports.addressSchema,
    password: exports.passwordSchema,
});
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: exports.passwordSchema,
});
exports.addUserSchema = zod_1.z.object({
    name: exports.nameSchema,
    email: exports.emailSchema,
    address: exports.addressSchema,
    password: exports.passwordSchema,
    role: zod_1.z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER']),
});
exports.addStoreSchema = zod_1.z.object({
    name: exports.nameSchema, // Enforcing same name constraints for store name
    email: exports.emailSchema,
    address: exports.addressSchema,
    ownerId: zod_1.z.number().nullable().optional(),
});
exports.ratingSchema = zod_1.z.object({
    rating: zod_1.z
        .number()
        .int()
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
});
