import { Router } from 'express';
import {
  atualizarMovimentoFinanceiro,
  buscarMovimentoFinanceiro,
  criarMovimentoFinanceiro,
  excluirMovimentoFinanceiro,
  listarMovimentosFinanceiros,
  resumoMovimentoFinanceiro
} from '../controllers/movimentofinanceiro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listarMovimentosFinanceiros);
router.get('/resumo', resumoMovimentoFinanceiro);
router.get('/:id', buscarMovimentoFinanceiro);
router.post('/', criarMovimentoFinanceiro);
router.put('/:id', atualizarMovimentoFinanceiro);
router.delete('/:id', excluirMovimentoFinanceiro);

export default router;
