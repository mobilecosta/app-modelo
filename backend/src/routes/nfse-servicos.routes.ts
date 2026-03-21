import { Router } from 'express';
import {
  atualizarNfseServico,
  buscarNfseServico,
  criarNfseServico,
  enviarNfseServico,
  excluirNfseServico,
  listarNfseServicos
} from '../controllers/nfse-servicos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarNfseServicos);
router.post('/:id/enviar', enviarNfseServico);
router.get('/:id', buscarNfseServico);
router.post('/', criarNfseServico);
router.put('/:id', atualizarNfseServico);
router.delete('/:id', excluirNfseServico);

export default router;
