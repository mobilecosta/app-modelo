import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

const selectBase = 'codigo, nome, descricao, ativo, created_at, updated_at';

export const listarSistemasPublicos = async (_req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('sistemas')
    .select(selectBase)
    .eq('ativo', true)
    .order('nome');

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar sistemas', error: error.message });
    return;
  }

  res.json({ items: data ?? [] });
};

export const listarSistemas = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);

  const { data, error, count } = await supabase
    .from('sistemas')
    .select(selectBase, { count: 'exact' })
    .order('nome')
    .range(from, to);

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar sistemas', error: error.message });
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

export const buscarSistema = async (req: Request, res: Response): Promise<void> => {
  const { codigo } = req.params;

  const { data, error } = await supabase
    .from('sistemas')
    .select(selectBase)
    .eq('codigo', codigo)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Sistema nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarSistema = async (req: Request, res: Response): Promise<void> => {
  const { codigo, nome, descricao, ativo = true } = req.body;

  if (!codigo || !nome) {
    res.status(400).json({ message: 'Codigo e nome sao obrigatorios' });
    return;
  }

  const { data, error } = await supabase
    .from('sistemas')
    .insert({ codigo, nome, descricao, ativo })
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar sistema', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarSistema = async (req: Request, res: Response): Promise<void> => {
  const { codigo } = req.params;
  const { nome, descricao, ativo } = req.body;

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nome !== undefined) atualizacao.nome = nome;
  if (descricao !== undefined) atualizacao.descricao = descricao;
  if (ativo !== undefined) atualizacao.ativo = ativo;

  const { data, error } = await supabase
    .from('sistemas')
    .update(atualizacao)
    .eq('codigo', codigo)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar sistema', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirSistema = async (req: Request, res: Response): Promise<void> => {
  const { codigo } = req.params;

  const { error } = await supabase.from('sistemas').delete().eq('codigo', codigo);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir sistema', error: error.message });
    return;
  }

  res.status(204).send();
};
