import { Router } from 'express';
import {
  listarUsuarios, buscarUsuario, criarUsuario, atualizarUsuario, excluirUsuario
} from '../controllers/usuarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarUsuarios);
router.get('/:id', buscarUsuario);
router.post('/', criarUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', excluirUsuario);

export default router;
