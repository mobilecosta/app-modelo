import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

const limparPayload = (payload: Record<string, unknown>): Record<string, unknown> => {
  const dados = { ...payload };

  delete dados.id;
  delete dados.created_at;
  delete dados.updated_at;

  Object.keys(dados).forEach((chave) => {
    if (dados[chave] === undefined) {
      delete dados[chave];
    }
  });

  return dados;
};

export const listarNfseServicos = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const referencia = typeof req.query.referencia === 'string' ? req.query.referencia : undefined;

  let query = supabase
    .from('nfse_servicos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (referencia) {
    query = query.ilike('referencia', `%${referencia}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar nfse_servicos', error: error.message });
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

export const buscarNfseServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('nfse_servicos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'NFSe servico nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarNfseServico = async (req: Request, res: Response): Promise<void> => {
  const payload = limparPayload(req.body as Record<string, unknown>);

  const { data, error } = await supabase
    .from('nfse_servicos')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar nfse_servico', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarNfseServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const payload = limparPayload(req.body as Record<string, unknown>);

  const { data, error } = await supabase
    .from('nfse_servicos')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar nfse_servico', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirNfseServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('nfse_servicos')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir nfse_servico', error: error.message });
    return;
  }

  res.status(204).send();
};
