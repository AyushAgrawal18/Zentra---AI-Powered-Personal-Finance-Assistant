import { Router } from 'express';
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers';
import { authenticate } from '../../../common/middleware/auth';
import { validate } from '../../../common/middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
  categoryIdParamSchema,
} from '../validators';

const router = Router();

// Combined schema for PATCH /:id — validates both params.id and body fields
const updateCategoryWithIdSchema = categoryIdParamSchema.merge(updateCategorySchema);

// ─── All routes require authentication ────────────────────────────────────────

router.post('/',      authenticate, validate(createCategorySchema),            createCategory);
router.get('/',       authenticate, validate(listCategoriesSchema),            listCategories);
router.get('/:id',    authenticate, validate(categoryIdParamSchema),           getCategory);
router.patch('/:id',  authenticate, validate(updateCategoryWithIdSchema),      updateCategory);
router.delete('/:id', authenticate, validate(categoryIdParamSchema),           deleteCategory);

export default router;

