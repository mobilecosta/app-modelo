import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

type ListagemChavesPayload = {
  empresa_id?: string | null;
  cnpj?: string;
  chave_acesso?: string;
  data_emissao?: string | null;
  valor_total?: number | string | null;
  protocolo?: string | null;
  situacao?: string | null;
  retorno_servico?: Record<string, unknown> | null;
};

const selectBase = `
  id,
  empresa_id,
  cnpj,
  chave_acesso,
  data_emissao,
  valor_total,
  protocolo,
  situacao,
  retorno_servico,
  created_at,
  updated_at
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

const normalizarChaveAcesso = (chaveAcesso?: string): string | undefined => {
  if (!chaveAcesso) return undefined;
  return chaveAcesso.replace(/\s/g, '');
};

const toNullableNumber = (value: number | string | null | undefined): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = typeof value === 'number'
    ? value
    : Number.parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));

  return Number.isNaN(parsed) ? null : parsed;
};

const limparPayload = (payload: ListagemChavesPayload): Record<string, unknown> => {
  const dados: Record<string, unknown> = {
    empresa_id: payload.empresa_id,
    cnpj: formatarCnpj(payload.cnpj),
    chave_acesso: normalizarChaveAcesso(payload.chave_acesso),
    data_emissao: payload.data_emissao,
    valor_total: toNullableNumber(payload.valor_total),
    protocolo: payload.protocolo,
    situacao: payload.situacao,
    retorno_servico: payload.retorno_servico
  };

  Object.keys(dados).forEach((chave) => {
    if (dados[chave] === undefined) {
      delete dados[chave];
    }
  });

  return dados;
};

export const listarListagemChaves = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const cnpj = formatarCnpj(typeof req.query.cnpj === 'string' ? req.query.cnpj : undefined);
  const chaveAcesso = normalizarChaveAcesso(typeof req.query.chave_acesso === 'string' ? req.query.chave_acesso : undefined);

  let query = supabase
    .from('listagemchaves')
    .select(selectBase, { count: 'exact' })
    .order('data_emissao', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (cnpj) {
    query = query.eq('cnpj', cnpj);
  }

  if (chaveAcesso) {
    query = query.eq('chave_acesso', chaveAcesso);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar listagemchaves', error: error.message });
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

export const buscarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('listagemchaves')
    .select(selectBase)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Listagem chave nao encontrada' });
    return;
  }

  res.json({ item: data });
};

export const criarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as ListagemChavesPayload;

  if (!payload.cnpj || !payload.chave_acesso) {
    res.status(400).json({ message: 'Campos obrigatorios: cnpj e chave_acesso' });
    return;
  }

  const { data, error } = await supabase
    .from('listagemchaves')
    .insert(limparPayload(payload))
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar listagem chave', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const payload = req.body as ListagemChavesPayload;
  const atualizacao = {
    ...limparPayload(payload),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('listagemchaves')
    .update(atualizacao)
    .eq('id', id)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar listagem chave', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('listagemchaves')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir listagem chave', error: error.message });
    return;
  }

  res.status(204).send();
};
