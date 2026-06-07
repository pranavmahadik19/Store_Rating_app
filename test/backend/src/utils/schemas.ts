import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name must not exceed 60 characters');

export const addressSchema = z
  .string()
  .max(400, 'Address must not exceed 400 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password must be at most 16 characters long')
  .refine(
    (val) => /[A-Z]/.test(val),
    { message: 'Password must include at least one uppercase letter' }
  )
  .refine(
    (val) => /[^A-Za-z0-9]/.test(val),
    { message: 'Password must include at least one special character' }
  );

export const emailSchema = z
  .string()
  .email('Must follow standard email validation rules');

// Schemas for API Requests
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: passwordSchema,
});

export const addUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER']),
});

export const addStoreSchema = z.object({
  name: nameSchema, // Enforcing same name constraints for store name
  email: emailSchema,
  address: addressSchema,
  ownerId: z.number().nullable().optional(),
});

export const ratingSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});
