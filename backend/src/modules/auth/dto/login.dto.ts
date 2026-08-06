import { z } from 'zod';
import { loginSchema } from '../validators';

export type LoginDTO = z.infer<typeof loginSchema>;
