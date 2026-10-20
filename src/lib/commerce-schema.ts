import { z } from 'zod';

export const RESPONSE_DAYS = 7;
export const RECEIVED_MESSAGE = 'Đã Nhận Được Thông Tin - Chờ Phản Hồi Sau 7 Ngày';
export const ownershipSchema = z.enum(['available', 'slotout']);
export const orderStatusSchema = z.enum(['received', 'processing', 'accepted', 'replied', 'done', 'rejected']);
export const authSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(128) });
export const demoSchema = z.object({
  code: z.string().regex(/^CQ-[WVE]-[0-9]{3,6}$/), name: z.string().trim().min(1).max(200),
  service: z.enum(['web', 'video', 'event']), tags: z.array(z.string().max(50)).max(30),
  visual: z.number().int().min(1).max(15), status: ownershipSchema,
  url: z.union([z.literal(''), z.string().url().max(2000).startsWith('https://')]),
  support: z.array(z.string().trim().min(1).max(500)).max(30),
});
export const orderSchema = z.object({ name: z.string().trim().min(1).max(200), items: z.array(z.object({
  code: demoSchema.shape.code,
  fb: z.string().max(2000).regex(/^https?:\/\/(www\.|m\.|web\.|mbasic\.)?(facebook\.com|fb\.com|fb\.me)\/\S+$/i),
  email: z.string().trim().email().max(255), price: z.coerce.number().int().positive().max(1_000_000_000_000),
  note: z.string().max(5000).default(''),
})).min(1).max(30) });