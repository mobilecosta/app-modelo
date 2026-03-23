import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './routes/auth.routes';
import usuariosRoutes from './routes/usuarios.routes';
import tabelasRoutes from './routes/tabelas.routes';
import camposRoutes from './routes/campos.routes';
import menusRoutes from './routes/menus.routes';
import sistemasRoutes from './routes/sistemas.routes';
import pessoasRoutes from './routes/pessoas.routes';
import nfseServicosRoutes from './routes/nfse-servicos.routes';
import nfseCTribNacRoutes from './routes/nfse-ctribnac.routes';
import movimentoFinanceiroRoutes from './routes/movimentofinanceiro.routes';
import { openApiDocument } from './docs/openapi';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;
const isDirectRun = require.main === module;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/docs.json', (_req, res) => {
  res.json(openApiDocument);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  explorer: true,
  customSiteTitle: 'MobileCosta API Docs'
}));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tabelas', tabelasRoutes);
app.use('/api/campos', camposRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/sistemas', sistemasRoutes);
app.use('/api/pessoas', pessoasRoutes);
app.use('/api/nfse_servicos', nfseServicosRoutes);
app.use('/api/nfse_ctribnac', nfseCTribNacRoutes);
app.use('/api/movimentofinanceiro', movimentoFinanceiroRoutes);

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

export default app;
