import { Router } from 'express';
import { login, registrar, perfil } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/registrar', registrar);
router.get('/perfil', authMiddleware, perfil);

export default router;
