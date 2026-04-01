// packages/shared/src/utils/validation.ts
// Zod schemas used for validating common data structures across services.

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────

export const uuidSchema = z
  .string()
  .uuid({ message: 'Must be a valid UUID v4' });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'Must be a valid email address' })
  .max(255, { message: 'Email must not exceed 255 characters' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(128, { message: 'Password must not exceed 128 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{1,14}$/, {
    message: 'Must be a valid E.164 phone number (e.g. +14155552671)',
  });

export const urlSchema = z
  .string()
  .url({ message: 'Must be a valid URL' })
  .max(2048, { message: 'URL must not exceed 2048 characters' });

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug may only contain lowercase letters, numbers and hyphens',
  })
  .min(2)
  .max(100);

// ─────────────────────────────────────────────────────────────
// Geo / Location
// ─────────────────────────────────────────────────────────────

export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
});

export const addressSchema = z.object({
  street: z.string().trim().min(1).max(255),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().min(1).max(20),
  country: z
    .string()
    .trim()
    .length(2, { message: 'Country must be an ISO 3166-1 alpha-2 code (e.g. US)' })
    .toUpperCase(),
  coordinates: coordinatesSchema.optional(),
});

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: 'Page must be at least 1' })
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, { message: 'Limit must be at least 1' })
    .max(100, { message: 'Limit must not exceed 100' })
    .default(20),
  sortBy: z.string().trim().max(64).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().trim().max(255).optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

// ─────────────────────────────────────────────────────────────
// Date range
// ─────────────────────────────────────────────────────────────

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    { message: 'startDate must be before or equal to endDate', path: ['startDate'] },
  );

// ─────────────────────────────────────────────────────────────
// Currency / Finance
// ─────────────────────────────────────────────────────────────

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, { message: 'Currency code must be an ISO 4217 3-letter code (e.g. USD)' });

export const monetaryAmountSchema = z
  .number()
  .finite()
  .nonnegative({ message: 'Amount must be a non-negative number' })
  .multipleOf(0.01, { message: 'Amount must have at most 2 decimal places' });

// ─────────────────────────────────────────────────────────────
// File upload
// ─────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
] as const;

export const fileUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024, { message: 'File size must not exceed 50 MB' }),
});

export const imageUploadSchema = fileUploadSchema.extend({
  mimeType: z.enum(ALLOWED_IMAGE_TYPES, {
    errorMap: () => ({ message: 'Only JPEG, PNG, WebP and GIF images are allowed' }),
  }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, { message: 'Image size must not exceed 5 MB' }),
});

export const documentUploadSchema = fileUploadSchema.extend({
  mimeType: z.enum(ALLOWED_DOCUMENT_TYPES, {
    errorMap: () => ({ message: 'Only PDF, Word, Excel or CSV documents are allowed' }),
  }),
});

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    organizationName: z.string().trim().min(2).max(255),
    country: z.string().trim().length(2).toUpperCase(),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Safely parse and validate data against a Zod schema.
 * Returns `{ success, data, errors }` without throwing.
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return { success: false, errors };
}

export type { z };
