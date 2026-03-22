import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

const selectBase = 'id, tipo, descricao, valor, data_movimento, ativo, created_at, updated_at';

const isTipoValido = (tipo: unknown): boolean => tipo === 1 || tipo === 2;

export const listarMovimentosFinanceiros = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);

  let query = supabase
    .from('movimentofinanceiro')
    .select(selectBase, { count: 'exact' })
    .order('data_movimento', { ascending: false })
    .order('created_at', { ascending: false });

  if (typeof req.query.tipo === 'string') {
    const tipo = Number(req.query.tipo);
    if (!Number.isNaN(tipo)) {
      query = query.eq('tipo', tipo);
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar movimentos financeiros', error: error.message });
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

export const buscarMovimentoFinanceiro = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('movimentofinanceiro')
    .select(selectBase)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Movimento financeiro nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const resumoMovimentoFinanceiro = async (req: Request, res: Response): Promise<void> => {
  const anoParam = typeof req.query.ano === 'string' ? Number(req.query.ano) : NaN;
  const mesParam = typeof req.query.mes === 'string' ? Number(req.query.mes) : NaN;

  const temAno = !Number.isNaN(anoParam);
  const temMes = !Number.isNaN(mesParam);

  if (temAno && (anoParam < 1900 || anoParam > 3000)) {
    res.status(400).json({ message: 'Ano invalido.' });
    return;
  }

  if (temMes && (mesParam < 1 || mesParam > 12)) {
    res.status(400).json({ message: 'Mes invalido. Use valores de 1 a 12.' });
    return;
  }

  let query = supabase
    .from('movimentofinanceiro')
    .select('tipo, valor')
    .eq('ativo', true);

  if (temAno && temMes) {
    const inicioPeriodo = new Date(Date.UTC(anoParam, mesParam - 1, 1)).toISOString().slice(0, 10);
    const fimPeriodo = new Date(Date.UTC(anoParam, mesParam, 1)).toISOString().slice(0, 10);
    query = query.gte('data_movimento', inicioPeriodo).lt('data_movimento', fimPeriodo);
  } else if (temAno) {
    const inicioAno = new Date(Date.UTC(anoParam, 0, 1)).toISOString().slice(0, 10);
    const fimAno = new Date(Date.UTC(anoParam + 1, 0, 1)).toISOString().slice(0, 10);
    query = query.gte('data_movimento', inicioAno).lt('data_movimento', fimAno);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar resumo financeiro', error: error.message });
    return;
  }

  const totalEntradas = (data ?? [])
    .filter(item => item.tipo === 1)
    .reduce((acumulado, item) => acumulado + Number(item.valor ?? 0), 0);

  const totalSaidas = (data ?? [])
    .filter(item => item.tipo === 2)
    .reduce((acumulado, item) => acumulado + Number(item.valor ?? 0), 0);

  res.json({
    item: {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas
    }
  });
};

export const criarMovimentoFinanceiro = async (req: Request, res: Response): Promise<void> => {
  const { tipo, descricao, valor = 0, data_movimento, ativo = true } = req.body;

  if (!isTipoValido(tipo)) {
    res.status(400).json({ message: 'Tipo invalido. Use 1 para Entrada ou 2 para Saida' });
    return;
  }

  const { data, error } = await supabase
    .from('movimentofinanceiro')
    .insert({
      tipo,
      descricao,
      valor,
      data_movimento: data_movimento ?? new Date().toISOString().slice(0, 10),
      ativo
    })
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar movimento financeiro', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarMovimentoFinanceiro = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { tipo, descricao, valor, data_movimento, ativo } = req.body;

  if (tipo !== undefined && !isTipoValido(tipo)) {
    res.status(400).json({ message: 'Tipo invalido. Use 1 para Entrada ou 2 para Saida' });
    return;
  }

  const atualizacao: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (tipo !== undefined) atualizacao.tipo = tipo;
  if (descricao !== undefined) atualizacao.descricao = descricao;
  if (valor !== undefined) atualizacao.valor = valor;
  if (data_movimento !== undefined) atualizacao.data_movimento = data_movimento;
  if (ativo !== undefined) atualizacao.ativo = ativo;

  const { data, error } = await supabase
    .from('movimentofinanceiro')
    .update(atualizacao)
    .eq('id', id)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar movimento financeiro', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirMovimentoFinanceiro = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('movimentofinanceiro')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir movimento financeiro', error: error.message });
    return;
  }

  res.status(204).send();
};
