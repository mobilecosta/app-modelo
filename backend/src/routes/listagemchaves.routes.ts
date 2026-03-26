import { Router } from 'express';
import {
  atualizarListagemChave,
  buscarListagemChave,
  criarListagemChave,
  excluirListagemChave,
  listarListagemChaves
} from '../controllers/listagemchaves.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarListagemChaves);
router.get('/:id', buscarListagemChave);
router.post('/', criarListagemChave);
router.put('/:id', atualizarListagemChave);
router.delete('/:id', excluirListagemChave);

export default router;
