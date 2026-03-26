import { Router } from 'express';
import {
  atualizarEmpresaCertificado,
  buscarEmpresaCertificado,
  criarEmpresaCertificado,
  excluirEmpresaCertificado,
  listarEmpresasCertificados
} from '../controllers/empresascertificados.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarEmpresasCertificados);
router.get('/:id', buscarEmpresaCertificado);
router.post('/', criarEmpresaCertificado);
router.put('/:id', atualizarEmpresaCertificado);
router.delete('/:id', excluirEmpresaCertificado);

export default router;
