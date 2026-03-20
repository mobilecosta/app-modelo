import { Router } from 'express';
import {
  listarCampos, buscarCampo, criarCampo, atualizarCampo, excluirCampo
} from '../controllers/campos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarCampos);
router.get('/:id', buscarCampo);
router.post('/', criarCampo);
router.put('/:id', atualizarCampo);
router.delete('/:id', excluirCampo);

export default router;
