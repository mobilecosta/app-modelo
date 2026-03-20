import { Router } from 'express';
import {
  atualizarPessoa,
  buscarPessoa,
  buscarPessoaPorCnpj,
  consultarPessoaReceitaWs,
  criarPessoa,
  excluirPessoa,
  listarPessoas
} from '../controllers/pessoas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarPessoas);
router.get('/receitaws/:cnpj', consultarPessoaReceitaWs);
router.get('/cnpj/:cnpj', buscarPessoaPorCnpj);
router.get('/:id', buscarPessoa);
router.post('/', criarPessoa);
router.put('/:id', atualizarPessoa);
router.delete('/:id', excluirPessoa);

export default router;
