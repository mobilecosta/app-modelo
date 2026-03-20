import { Router } from 'express';
import {
  listarTabelas, buscarTabela, criarTabela, atualizarTabela, excluirTabela
} from '../controllers/tabelas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarTabelas);
router.get('/:id', buscarTabela);
router.post('/', criarTabela);
router.put('/:id', atualizarTabela);
router.delete('/:id', excluirTabela);

export default router;
