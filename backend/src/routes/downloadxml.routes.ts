import { Router } from 'express';
import {
  atualizarDownloadXml,
  buscarDownloadXml,
  criarDownloadXml,
  excluirDownloadXml,
  listarDownloadsXml
} from '../controllers/downloadxml.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarDownloadsXml);
router.get('/:id', buscarDownloadXml);
router.post('/', criarDownloadXml);
router.put('/:id', atualizarDownloadXml);
router.delete('/:id', excluirDownloadXml);

export default router;
