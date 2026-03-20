import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

export const listarUsuarios = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);

  const { data, error, count } = await supabase
    .from('usuarios')
    .select('id, nome, email, ativo, created_at, updated_at', { count: 'exact' })
    .order('nome')
    .range(from, to);

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar usuarios', error: error.message });
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

export const buscarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, ativo, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Usuario nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha, ativo = true } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ message: 'Nome, email e senha sao obrigatorios' });
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({ nome, email, senha_hash: senhaHash, ativo })
    .select('id, nome, email, ativo, created_at')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar usuario', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nome, email, ativo, senha } = req.body;

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nome !== undefined) atualizacao.nome = nome;
  if (email !== undefined) atualizacao.email = email;
  if (ativo !== undefined) atualizacao.ativo = ativo;
  if (senha) atualizacao.senha_hash = await bcrypt.hash(senha, 12);

  const { data, error } = await supabase
    .from('usuarios')
    .update(atualizacao)
    .eq('id', id)
    .select('id, nome, email, ativo, updated_at')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuario', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirUsuario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase.from('usuarios').delete().eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir usuario', error: error.message });
    return;
  }

  res.status(204).send();
};
