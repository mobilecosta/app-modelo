import { Router } from 'express';
import {
  atualizarNfseServico,
  buscarNfseServico,
  criarNfseServico,
  excluirNfseServico,
  listarNfseServicos
} from '../controllers/nfse-servicos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarNfseServicos);
router.get('/:id', buscarNfseServico);
router.post('/', criarNfseServico);
router.put('/:id', atualizarNfseServico);
router.delete('/:id', excluirNfseServico);

export default router;
