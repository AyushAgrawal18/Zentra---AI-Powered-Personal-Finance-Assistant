import { z } from 'zod';
import { registerSchema } from '../validators';

export type RegisterDTO = z.infer<typeof registerSchema>;
