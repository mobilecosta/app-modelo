import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

export const listarCampos = async (req: Request, res: Response): Promise<void> => {
  const { tabela_id } = req.query;
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);

  let query = supabase
    .from('campos')
    .select('*', { count: 'exact' })
    .order('ordem')
    .range(from, to);

  if (tabela_id) {
    query = query.eq('tabela_id', tabela_id as string);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar campos', error: error.message });
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

export const buscarCampo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('campos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Campo nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarCampo = async (req: Request, res: Response): Promise<void> => {
  const {
    tabela_id, nome, label, tipo, obrigatorio = false,
    tamanho_maximo, valor_padrao, opcoes, ordem = 0, ativo = true
  } = req.body;

  if (!tabela_id || !nome || !label || !tipo) {
    res.status(400).json({ message: 'tabela_id, nome, label e tipo sao obrigatorios' });
    return;
  }

  const { data, error } = await supabase
    .from('campos')
    .insert({ tabela_id, nome, label, tipo, obrigatorio, tamanho_maximo, valor_padrao, opcoes, ordem, ativo })
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar campo', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarCampo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, label, tipo, obrigatorio, tamanho_maximo, valor_padrao, opcoes, ordem, ativo } = req.body;

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nome !== undefined) atualizacao.nome = nome;
  if (label !== undefined) atualizacao.label = label;
  if (tipo !== undefined) atualizacao.tipo = tipo;
  if (obrigatorio !== undefined) atualizacao.obrigatorio = obrigatorio;
  if (tamanho_maximo !== undefined) atualizacao.tamanho_maximo = tamanho_maximo;
  if (valor_padrao !== undefined) atualizacao.valor_padrao = valor_padrao;
  if (opcoes !== undefined) atualizacao.opcoes = opcoes;
  if (ordem !== undefined) atualizacao.ordem = ordem;
  if (ativo !== undefined) atualizacao.ativo = ativo;

  const { data, error } = await supabase
    .from('campos')
    .update(atualizacao)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar campo', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirCampo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase.from('campos').delete().eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir campo', error: error.message });
    return;
  }

  res.status(204).send();
};
