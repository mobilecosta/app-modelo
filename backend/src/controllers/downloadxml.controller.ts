import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

type DownloadXmlPayload = {
  empresa_id?: string | null;
  chave_acesso?: string;
  cnpj?: string;
  xml_base64?: string;
  xml_decodificado?: string | null;
  status_download?: string;
  retorno_servico?: Record<string, unknown> | null;
};

const selectBase = `
  id,
  empresa_id,
  chave_acesso,
  cnpj,
  xml_base64,
  xml_decodificado,
  status_download,
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

const limparPayload = (payload: DownloadXmlPayload): Record<string, unknown> => {
  const dados: Record<string, unknown> = {
    empresa_id: payload.empresa_id,
    chave_acesso: normalizarChaveAcesso(payload.chave_acesso),
    cnpj: formatarCnpj(payload.cnpj),
    xml_base64: payload.xml_base64,
    xml_decodificado: payload.xml_decodificado,
    status_download: payload.status_download,
    retorno_servico: payload.retorno_servico
  };

  Object.keys(dados).forEach((chave) => {
    if (dados[chave] === undefined) {
      delete dados[chave];
    }
  });

  return dados;
};

export const listarDownloadsXml = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const cnpj = formatarCnpj(typeof req.query.cnpj === 'string' ? req.query.cnpj : undefined);
  const chaveAcesso = normalizarChaveAcesso(typeof req.query.chave_acesso === 'string' ? req.query.chave_acesso : undefined);

  let query = supabase
    .from('downloadxml')
    .select(selectBase, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (cnpj) {
    query = query.eq('cnpj', cnpj);
  }

  if (chaveAcesso) {
    query = query.eq('chave_acesso', chaveAcesso);
  }

  if (typeof req.query.status_download === 'string') {
    query = query.eq('status_download', req.query.status_download);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar downloadxml', error: error.message });
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

export const buscarDownloadXml = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('downloadxml')
    .select(selectBase)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Download XML nao encontrado' });
    return;
  }

  res.json({ item: data });
};

export const criarDownloadXml = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as DownloadXmlPayload;

  if (!payload.cnpj || !payload.chave_acesso || !payload.xml_base64) {
    res.status(400).json({ message: 'Campos obrigatorios: cnpj, chave_acesso e xml_base64' });
    return;
  }

  const { data, error } = await supabase
    .from('downloadxml')
    .insert({
      status_download: 'baixado',
      ...limparPayload(payload)
    })
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar downloadxml', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarDownloadXml = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const payload = req.body as DownloadXmlPayload;
  const atualizacao = {
    ...limparPayload(payload),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('downloadxml')
    .update(atualizacao)
    .eq('id', id)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar downloadxml', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirDownloadXml = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('downloadxml')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir downloadxml', error: error.message });
    return;
  }

  res.status(204).send();
};
