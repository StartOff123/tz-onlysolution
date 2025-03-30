import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	proxy: z.object({
		ip: z.string().ip(),
		port: z.number(),
		username: z.string(),
		password: z.string()
	})
});

export type LoginDto = z.infer<typeof LoginSchema>;
