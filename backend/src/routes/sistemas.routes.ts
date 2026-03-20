import { Router } from 'express';
import {
  atualizarSistema,
  buscarSistema,
  criarSistema,
  excluirSistema,
  listarSistemas,
  listarSistemasPublicos
} from '../controllers/sistemas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/publico', listarSistemasPublicos);

router.use(authMiddleware);

router.get('/', listarSistemas);
router.get('/:codigo', buscarSistema);
router.post('/', criarSistema);
router.put('/:codigo', atualizarSistema);
router.delete('/:codigo', excluirSistema);

export default router;
