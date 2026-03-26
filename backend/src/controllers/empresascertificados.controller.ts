import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

type EmpresaCertificadoPayload = {
  cnpj?: string;
  certificado_pfx_base64?: string;
  senha_certificado?: string;
  ativo?: boolean;
};

const selectBase = 'id, cnpj, certificado_pfx_base64, senha_certificado, ativo, created_at, updated_at';

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

const limparPayload = (payload: EmpresaCertificadoPayload): Record<string, unknown> => {
  const dados: Record<string, unknown> = {
    cnpj: formatarCnpj(payload.cnpj),
    certificado_pfx_base64: payload.certificado_pfx_base64,
    senha_certificado: payload.senha_certificado,
    ativo: payload.ativo
  };

  Object.keys(dados).forEach((chave) => {
    if (dados[chave] === undefined) {
      delete dados[chave];
    }
  });

  return dados;
};

export const listarEmpresasCertificados = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const cnpj = formatarCnpj(typeof req.query.cnpj === 'string' ? req.query.cnpj : undefined);

  let query = supabase
    .from('empresascertificados')
    .select(selectBase, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (cnpj) {
    query = query.eq('cnpj', cnpj);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar empresascertificados', error: error.message });
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

export const buscarEmpresaCertificado = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('empresascertificados')
    .select(selectBase)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Empresa certificado nao encontrada' });
    return;
  }

  res.json({ item: data });
};

export const criarEmpresaCertificado = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as EmpresaCertificadoPayload;

  if (!payload.cnpj || !payload.certificado_pfx_base64 || !payload.senha_certificado) {
    res.status(400).json({
      message: 'Campos obrigatorios: cnpj, certificado_pfx_base64 e senha_certificado'
    });
    return;
  }

  const { data, error } = await supabase
    .from('empresascertificados')
    .insert(limparPayload(payload))
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar empresa certificado', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarEmpresaCertificado = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const payload = req.body as EmpresaCertificadoPayload;
  const atualizacao = {
    ...limparPayload(payload),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('empresascertificados')
    .update(atualizacao)
    .eq('id', id)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar empresa certificado', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirEmpresaCertificado = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('empresascertificados')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir empresa certificado', error: error.message });
    return;
  }

  res.status(204).send();
};
