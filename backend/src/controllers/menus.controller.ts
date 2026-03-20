import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

export const listarMenus = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const sistema = typeof req.query.sistema === 'string' ? req.query.sistema : undefined;

  let query = supabase
    .from('menus')
    .select('*', { count: 'exact' })
    .order('ordem');

  if (sistema) {
    query = query.eq('sistema_codigo', sistema);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar menus', error: error.message });
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

export const buscarMenu = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const sistema = typeof req.query.sistema === 'string' ? req.query.sistema : undefined;

  let query = supabase
    .from('menus')
    .select('*')
    .eq('id', id);

  if (sistema) {
    query = query.eq('sistema_codigo', sistema);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    res.status(404).json({ message: 'Menu nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarMenu = async (req: Request, res: Response): Promise<void> => {
  const { sistema_codigo, label, link, icon, menu_pai_id, ordem = 0, ativo = true } = req.body;

  if (!sistema_codigo || !label) {
    res.status(400).json({ message: 'Sistema e label sao obrigatorios' });
    return;
  }

  const { data, error } = await supabase
    .from('menus')
    .insert({ sistema_codigo, label, link, icon, menu_pai_id: menu_pai_id || null, ordem, ativo })
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar menu', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarMenu = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { sistema_codigo, label, link, icon, menu_pai_id, ordem, ativo } = req.body;

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (sistema_codigo !== undefined) atualizacao.sistema_codigo = sistema_codigo;
  if (label !== undefined) atualizacao.label = label;
  if (link !== undefined) atualizacao.link = link;
  if (icon !== undefined) atualizacao.icon = icon;
  if (menu_pai_id !== undefined) atualizacao.menu_pai_id = menu_pai_id;
  if (ordem !== undefined) atualizacao.ordem = ordem;
  if (ativo !== undefined) atualizacao.ativo = ativo;

  const { data, error } = await supabase
    .from('menus')
    .update(atualizacao)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar menu', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirMenu = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase.from('menus').delete().eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir menu', error: error.message });
    return;
  }

  res.status(204).send();
};

export const menuArvore = async (req: Request, res: Response): Promise<void> => {
  const sistema = typeof req.query.sistema === 'string' ? req.query.sistema : undefined;

  if (!sistema) {
    res.status(400).json({ message: 'Sistema e obrigatorio para carregar os menus' });
    return;
  }

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('sistema_codigo', sistema)
    .eq('ativo', true)
    .order('ordem');

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar menus', error: error.message });
    return;
  }

  const construirArvore = (itens: Record<string, unknown>[], paiId: string | null = null): Record<string, unknown>[] => {
    return itens
      .filter(item => item['menu_pai_id'] === paiId)
      .map(item => ({
        ...item,
        subItems: construirArvore(itens, item['id'] as string)
      }));
  };

  res.json({ items: construirArvore(data ?? []) });
};
