import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const listarCTribNac = async (req: Request, res: Response): Promise<void> => {
  const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : undefined;
  const grupo = typeof req.query.grupo === 'string' ? req.query.grupo.trim() : undefined;

  let query = supabase
    .from('nfse_ctribnac')
    .select('*')
    .eq('ativo', true)
    .order('codigo', { ascending: true });

  if (grupo) {
    query = query.eq('grupo', grupo);
  }

  if (busca) {
    query = query.or(`codigo.ilike.%${busca}%,descricao.ilike.%${busca}%,grupo_desc.ilike.%${busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar codigos cTribNac', error: error.message });
    return;
  }

  res.json({ items: data ?? [] });
};

export const buscarCTribNac = async (req: Request, res: Response): Promise<void> => {
  const { codigo } = req.params;

  const { data, error } = await supabase
    .from('nfse_ctribnac')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Codigo cTribNac nao encontrado' });
    return;
  }

  res.json({ item: data });
};
