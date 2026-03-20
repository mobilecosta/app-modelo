import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

export const listarTabelas = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);

  const { data, error, count } = await supabase
    .from('tabelas')
    .select('*', { count: 'exact' })
    .order('nome')
    .range(from, to);

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar tabelas', error: error.message });
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

export const buscarTabela = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('tabelas')
    .select('*, campos(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Tabela nao encontrada' });
    return;
  }

  res.json({ item: data });
};

export const criarTabela = async (req: Request, res: Response): Promise<void> => {
  const { nome, descricao, schema_nome = 'public', ativo = true } = req.body;

  if (!nome) {
    res.status(400).json({ message: 'Nome e obrigatorio' });
    return;
  }

  const { data, error } = await supabase
    .from('tabelas')
    .insert({ nome, descricao, schema_nome, ativo })
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar tabela', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarTabela = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, descricao, schema_nome, ativo } = req.body;

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nome !== undefined) atualizacao.nome = nome;
  if (descricao !== undefined) atualizacao.descricao = descricao;
  if (schema_nome !== undefined) atualizacao.schema_nome = schema_nome;
  if (ativo !== undefined) atualizacao.ativo = ativo;

  const { data, error } = await supabase
    .from('tabelas')
    .update(atualizacao)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar tabela', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirTabela = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase.from('tabelas').delete().eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir tabela', error: error.message });
    return;
  }

  res.status(204).send();
};
