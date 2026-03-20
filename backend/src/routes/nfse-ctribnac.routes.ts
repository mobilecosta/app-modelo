import { Router } from 'express';
import { buscarCTribNac, listarCTribNac } from '../controllers/nfse-ctribnac.controller';

const router = Router();

// Rota publica (tabela de referencia — nao requer autenticacao)
router.get('/', listarCTribNac);
router.get('/:codigo', buscarCTribNac);

export default router;
