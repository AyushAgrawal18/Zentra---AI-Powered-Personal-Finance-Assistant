import { z } from 'zod';
import { refreshSchema } from '../validators';

export type RefreshDTO = z.infer<typeof refreshSchema>['body'];
