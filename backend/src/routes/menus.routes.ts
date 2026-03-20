import { Router } from 'express';
import {
  listarMenus, buscarMenu, criarMenu, atualizarMenu, excluirMenu, menuArvore
} from '../controllers/menus.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/arvore', menuArvore);
router.get('/', listarMenus);
router.get('/:id', buscarMenu);
router.post('/', criarMenu);
router.put('/:id', atualizarMenu);
router.delete('/:id', excluirMenu);

export default router;
