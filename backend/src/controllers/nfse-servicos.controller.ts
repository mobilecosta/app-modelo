import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getNuvemFiscalAccessToken, getNuvemFiscalBaseUrl } from '../config/nuvemfiscal';
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

const setNestedValue = (obj: Record<string, unknown>, path: string[], value: unknown): void => {
  let atual = obj;

  path.forEach((segmento, index) => {
    const isUltimo = index === path.length - 1;
    if (isUltimo) {
      atual[segmento] = value;
      return;
    }

    if (!atual[segmento] || typeof atual[segmento] !== 'object' || Array.isArray(atual[segmento])) {
      atual[segmento] = {};
    }

    atual = atual[segmento] as Record<string, unknown>;
  });
};

const montarPayloadEnvioNfse = (dados: Record<string, unknown>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const infDPS: Record<string, unknown> = {};

  if (dados.provedor !== undefined) payload.provedor = dados.provedor;
  if (dados.ambiente !== undefined) payload.ambiente = dados.ambiente;
  if (dados.referencia !== undefined) payload.referencia = dados.referencia;

  Object.entries(dados).forEach(([chave, valor]) => {
    if (!chave.startsWith('infDPS_') || valor === undefined) {
      return;
    }

    const path = chave.replace('infDPS_', '').split('_');
    if (!path.length) {
      return;
    }

    setNestedValue(infDPS, path, valor);
  });

  payload.infDPS = infDPS;
  return payload;
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

export const enviarNfseServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data: nfseServico, error } = await supabase
    .from('nfse_servicos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !nfseServico) {
    res.status(404).json({ message: 'NFSe servico nao encontrado' });
    return;
  }

  try {
    const token = await getNuvemFiscalAccessToken();
    const body = montarPayloadEnvioNfse(nfseServico as Record<string, unknown>);

    const response = await fetch(`${getNuvemFiscalBaseUrl()}/nfse/dps`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const raw = await response.text();
    let respostaNuvemFiscal: unknown = raw;

    try {
      respostaNuvemFiscal = raw ? JSON.parse(raw) : {};
    } catch {
      respostaNuvemFiscal = raw;
    }

    if (!response.ok) {
      res.status(response.status).json({
        message: 'Erro ao enviar NFSe para a Nuvem Fiscal',
        error: respostaNuvemFiscal
      });
      return;
    }

    res.json({
      message: 'NFSe enviada com sucesso para a Nuvem Fiscal.',
      item: nfseServico,
      envio: respostaNuvemFiscal
    });
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : 'Falha inesperada ao enviar NFSe.';
    res.status(500).json({ message: 'Erro ao enviar NFSe', error: mensagem });
  }
};
