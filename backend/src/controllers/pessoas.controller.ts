import { Request, Response } from 'express';
import https from 'https';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

type PessoaPayload = {
  cnpj?: string;
  tipo?: string;
  nome?: string;
  fantasia?: string;
  porte?: string;
  abertura?: string;
  natureza_juridica?: string;
  atividade_principal_codigo?: string;
  atividade_principal_texto?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  email?: string;
  telefone?: string;
  efr?: string;
  situacao?: string;
  data_situacao?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social?: number | string;
  ultima_atualizacao?: string;
  status?: string;
  ativo?: boolean;
  atividades_secundarias?: Array<{
    codigo: string;
    descricao: string;
    ordem?: number;
  }>;
  qsa?: Array<{
    nome: string;
    qualificacao?: string;
    pais_origem?: string;
    nome_rep_legal?: string;
    qual_rep_legal?: string;
    ordem?: number;
  }>;
};

type ReceitaWsAtividade = {
  code?: string;
  text?: string;
};

type ReceitaWsQsa = {
  nome?: string;
  qual?: string;
  pais_origem?: string;
  nome_rep_legal?: string;
  qual_rep_legal?: string;
};

type ReceitaWsResponse = {
  status?: string;
  message?: string;
  cnpj?: string;
  tipo?: string;
  nome?: string;
  fantasia?: string;
  porte?: string;
  abertura?: string;
  natureza_juridica?: string;
  atividade_principal?: ReceitaWsAtividade[];
  atividades_secundarias?: ReceitaWsAtividade[];
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  email?: string;
  telefone?: string;
  efr?: string;
  situacao?: string;
  data_situacao?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social?: string;
  ultima_atualizacao?: string;
  qsa?: ReceitaWsQsa[];
};

const pessoaSelect = `
  *,
  pessoas_atividades_secundarias(*),
  pessoas_qsa(*)
`;

const normalizarCnpj = (cnpj?: string): string | undefined => {
  if (!cnpj) return undefined;
  const apenasDigitos = cnpj.replace(/\D/g, '');
  return apenasDigitos || undefined;
};

const formatarCnpj = (cnpj?: string): string | undefined => {
  const digits = normalizarCnpj(cnpj);
  if (!digits) return undefined;

  if (digits.length !== 14) {
    return cnpj;
  }

  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

const getParamValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const toNullableNumber = (value: number | string | undefined): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = typeof value === 'number'
    ? value
    : Number.parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));

  return Number.isNaN(parsed) ? null : parsed;
};

const consultarReceitaWs = async (cnpj: string): Promise<ReceitaWsResponse> => (
  new Promise((resolve, reject) => {
    const request = https.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'app-modelo-backend/1.0'
      }
    }, (response) => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        if (!response.statusCode || response.statusCode >= 400) {
          reject(new Error(`ReceitaWS respondeu com status ${response.statusCode ?? 'desconhecido'}`));
          return;
        }

        try {
          resolve(JSON.parse(body) as ReceitaWsResponse);
        } catch {
          reject(new Error('Resposta invalida ao consultar o ReceitaWS'));
        }
      });
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error('Tempo limite excedido ao consultar o ReceitaWS'));
    });

    request.on('error', reject);
  })
);

const montarPessoaBase = (payload: PessoaPayload): Record<string, unknown> => ({
  cnpj: formatarCnpj(payload.cnpj),
  tipo: payload.tipo,
  nome: payload.nome,
  fantasia: payload.fantasia,
  porte: payload.porte,
  abertura: payload.abertura,
  natureza_juridica: payload.natureza_juridica,
  atividade_principal_codigo: payload.atividade_principal_codigo,
  atividade_principal_texto: payload.atividade_principal_texto,
  logradouro: payload.logradouro,
  numero: payload.numero,
  complemento: payload.complemento,
  cep: payload.cep,
  bairro: payload.bairro,
  municipio: payload.municipio,
  uf: payload.uf,
  email: payload.email,
  telefone: payload.telefone,
  efr: payload.efr,
  situacao: payload.situacao,
  data_situacao: payload.data_situacao,
  motivo_situacao: payload.motivo_situacao,
  situacao_especial: payload.situacao_especial,
  data_situacao_especial: payload.data_situacao_especial,
  capital_social: toNullableNumber(payload.capital_social),
  ultima_atualizacao: payload.ultima_atualizacao,
  status: payload.status,
  ativo: payload.ativo ?? true
});

const substituirRelacionamentos = async (
  pessoaId: string,
  payload: PessoaPayload
): Promise<{ error?: string }> => {
  const atividades = payload.atividades_secundarias ?? [];
  const qsa = payload.qsa ?? [];

  const { error: deleteAtividadesError } = await supabase
    .from('pessoas_atividades_secundarias')
    .delete()
    .eq('pessoa_id', pessoaId);

  if (deleteAtividadesError) {
    return { error: deleteAtividadesError.message };
  }

  const { error: deleteQsaError } = await supabase
    .from('pessoas_qsa')
    .delete()
    .eq('pessoa_id', pessoaId);

  if (deleteQsaError) {
    return { error: deleteQsaError.message };
  }

  if (atividades.length > 0) {
    const { error } = await supabase.from('pessoas_atividades_secundarias').insert(
      atividades.map((atividade, index) => ({
        pessoa_id: pessoaId,
        codigo: atividade.codigo,
        descricao: atividade.descricao,
        ordem: atividade.ordem ?? index
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  if (qsa.length > 0) {
    const { error } = await supabase.from('pessoas_qsa').insert(
      qsa.map((socio, index) => ({
        pessoa_id: pessoaId,
        nome: socio.nome,
        qualificacao: socio.qualificacao,
        pais_origem: socio.pais_origem,
        nome_rep_legal: socio.nome_rep_legal,
        qual_rep_legal: socio.qual_rep_legal,
        ordem: socio.ordem ?? index
      }))
    );

    if (error) {
      return { error: error.message };
    }
  }

  return {};
};

const mapearReceitaWsParaModelos = (receita: ReceitaWsResponse) => {
  const atividadePrincipal = receita.atividade_principal?.[0];

  return {
    pessoa: montarPessoaBase({
      cnpj: receita.cnpj,
      tipo: receita.tipo,
      nome: receita.nome,
      fantasia: receita.fantasia,
      porte: receita.porte,
      abertura: receita.abertura,
      natureza_juridica: receita.natureza_juridica,
      atividade_principal_codigo: atividadePrincipal?.code,
      atividade_principal_texto: atividadePrincipal?.text,
      logradouro: receita.logradouro,
      numero: receita.numero,
      complemento: receita.complemento,
      cep: receita.cep,
      bairro: receita.bairro,
      municipio: receita.municipio,
      uf: receita.uf,
      email: receita.email,
      telefone: receita.telefone,
      efr: receita.efr,
      situacao: receita.situacao,
      data_situacao: receita.data_situacao,
      motivo_situacao: receita.motivo_situacao,
      situacao_especial: receita.situacao_especial,
      data_situacao_especial: receita.data_situacao_especial,
      capital_social: receita.capital_social,
      ultima_atualizacao: receita.ultima_atualizacao,
      status: receita.status,
      ativo: true
    }),
    pessoas_atividades_secundarias: (receita.atividades_secundarias ?? []).map((atividade, index) => ({
      codigo: atividade.code ?? '',
      descricao: atividade.text ?? '',
      ordem: index
    })),
    pessoas_qsa: (receita.qsa ?? []).map((item, index) => ({
      nome: item.nome ?? '',
      qualificacao: item.qual,
      pais_origem: item.pais_origem,
      nome_rep_legal: item.nome_rep_legal,
      qual_rep_legal: item.qual_rep_legal,
      ordem: index
    }))
  };
};

export const listarPessoas = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const cnpj = normalizarCnpj(typeof req.query.cnpj === 'string' ? req.query.cnpj : undefined);

  let query = supabase
    .from('pessoas')
    .select(pessoaSelect, { count: 'exact' })
    .order('nome')
    .range(from, to);

  if (cnpj) {
    query = query.eq('cnpj', formatarCnpj(cnpj));
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar pessoas', error: error.message });
    return;
  }

  const totalRegistros = count ?? 0;
  res.json({
    items: data ?? [],
    total: totalRegistros,
    page,
    pageSize,
    hasNext: getHasNextPage(page, pageSize, totalRegistros)
  });
};

export const buscarPessoa = async (req: Request, res: Response): Promise<void> => {
  const id = getParamValue(req.params.id);

  if (!id) {
    res.status(400).json({ message: 'Id invalido' });
    return;
  }

  const { data, error } = await supabase
    .from('pessoas')
    .select(pessoaSelect)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Pessoa nao encontrada' });
    return;
  }

  res.json({ item: data });
};

export const buscarPessoaPorCnpj = async (req: Request, res: Response): Promise<void> => {
  const cnpj = formatarCnpj(getParamValue(req.params.cnpj));

  if (!cnpj) {
    res.status(400).json({ message: 'Cnpj invalido' });
    return;
  }

  const { data, error } = await supabase
    .from('pessoas')
    .select(pessoaSelect)
    .eq('cnpj', cnpj)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Pessoa nao encontrada para o CNPJ informado' });
    return;
  }

  res.json({ item: data });
};

export const consultarPessoaReceitaWs = async (req: Request, res: Response): Promise<void> => {
  const cnpjParam = getParamValue(req.params.cnpj);
  const cnpj = normalizarCnpj(cnpjParam);

  if (!cnpj || cnpj.length !== 14) {
    res.status(400).json({ message: 'Cnpj invalido' });
    return;
  }

  try {
    const receita = await consultarReceitaWs(cnpj);

    if (receita.status && receita.status !== 'OK') {
      res.status(502).json({
        message: 'ReceitaWS retornou erro ao consultar o CNPJ',
        error: receita.message ?? 'Erro nao informado',
        status: receita.status
      });
      return;
    }

    res.json({
      fonte: 'receitaws',
      consulta: {
        cnpj,
        url: `https://www.receitaws.com.br/v1/cnpj/${cnpj}`,
        realizada_em: new Date().toISOString()
      },
      ...mapearReceitaWsParaModelos(receita)
    });
  } catch (error) {
    res.status(502).json({
      message: 'Erro ao consultar o ReceitaWS',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

export const criarPessoa = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as PessoaPayload;

  if (!payload.nome || !payload.cnpj) {
    res.status(400).json({ message: 'Nome e cnpj sao obrigatorios' });
    return;
  }

  const { data, error } = await supabase
    .from('pessoas')
    .insert(montarPessoaBase(payload))
    .select('*')
    .single();

  if (error || !data) {
    res.status(500).json({ message: 'Erro ao criar pessoa', error: error?.message });
    return;
  }

  const relacionamento = await substituirRelacionamentos(data.id, payload);
  if (relacionamento.error) {
    res.status(500).json({ message: 'Pessoa criada, mas houve erro ao salvar relacionamentos', error: relacionamento.error });
    return;
  }

  const { data: pessoaCompleta, error: pessoaCompletaError } = await supabase
    .from('pessoas')
    .select(pessoaSelect)
    .eq('id', data.id)
    .single();

  if (pessoaCompletaError || !pessoaCompleta) {
    res.status(201).json({ item: data });
    return;
  }

  res.status(201).json({ item: pessoaCompleta });
};

export const atualizarPessoa = async (req: Request, res: Response): Promise<void> => {
  const id = getParamValue(req.params.id);
  const payload = req.body as PessoaPayload;

  if (!id) {
    res.status(400).json({ message: 'Id invalido' });
    return;
  }

  const atualizacao: Record<string, unknown> = {
    ...montarPessoaBase(payload),
    updated_at: new Date().toISOString()
  };

  Object.keys(atualizacao).forEach((key) => {
    if (atualizacao[key] === undefined) {
      delete atualizacao[key];
    }
  });

  const { data, error } = await supabase
    .from('pessoas')
    .update(atualizacao)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    res.status(500).json({ message: 'Erro ao atualizar pessoa', error: error?.message });
    return;
  }

  if (payload.atividades_secundarias || payload.qsa) {
    const relacionamento = await substituirRelacionamentos(id, payload);
    if (relacionamento.error) {
      res.status(500).json({ message: 'Pessoa atualizada, mas houve erro ao salvar relacionamentos', error: relacionamento.error });
      return;
    }
  }

  const { data: pessoaCompleta, error: pessoaCompletaError } = await supabase
    .from('pessoas')
    .select(pessoaSelect)
    .eq('id', id)
    .single();

  if (pessoaCompletaError || !pessoaCompleta) {
    res.json({ item: data });
    return;
  }

  res.json({ item: pessoaCompleta });
};

export const excluirPessoa = async (req: Request, res: Response): Promise<void> => {
  const id = getParamValue(req.params.id);

  if (!id) {
    res.status(400).json({ message: 'Id invalido' });
    return;
  }

  const { error } = await supabase.from('pessoas').delete().eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir pessoa', error: error.message });
    return;
  }

  res.status(204).send();
};
