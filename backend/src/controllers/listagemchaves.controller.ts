import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getHasNextPage, getPaginationParams } from '../utils/pagination';

type ListagemChavesPayload = {
  empresa_id?: string | null;
  cnpj?: string;
  chave_acesso?: string;
  data_emissao?: string | null;
  valor_total?: number | string | null;
  protocolo?: string | null;
  situacao?: string | null;
  retorno_servico?: Record<string, unknown> | null;
};

type BuscarChavesSefazPayload = {
  cnpj?: string;
  data_inicio?: string;
  data_fim?: string;
};

const NFCE_LISTAGEM_CHAVES_URL = 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NFCeListagemChaves.asmx';
const NFCE_LISTAGEM_CHAVES_SOAP_ACTION =
  'http://homologacao.nfce.fazenda.sp.gov.br/ws/NFCeListagemChaves.asmx/nfceListagemChaves';

const selectBase = `
  id,
  empresa_id,
  cnpj,
  chave_acesso,
  data_emissao,
  valor_total,
  protocolo,
  situacao,
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

const validarDataIso = (value?: string): boolean => {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const extrairChavesDoXml = (xml: string): string[] => {
  const matches = xml.match(/\b\d{44}\b/g) ?? [];
  return [...new Set(matches)];
};

const toNullableNumber = (value: number | string | null | undefined): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = typeof value === 'number'
    ? value
    : Number.parseFloat(value.toString().replace(/\./g, '').replace(',', '.'));

  return Number.isNaN(parsed) ? null : parsed;
};

const limparPayload = (payload: ListagemChavesPayload): Record<string, unknown> => {
  const dados: Record<string, unknown> = {
    empresa_id: payload.empresa_id,
    cnpj: formatarCnpj(payload.cnpj),
    chave_acesso: normalizarChaveAcesso(payload.chave_acesso),
    data_emissao: payload.data_emissao,
    valor_total: toNullableNumber(payload.valor_total),
    protocolo: payload.protocolo,
    situacao: payload.situacao,
    retorno_servico: payload.retorno_servico
  };

  Object.keys(dados).forEach((chave) => {
    if (dados[chave] === undefined) {
      delete dados[chave];
    }
  });

  return dados;
};

export const listarListagemChaves = async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize, from, to } = getPaginationParams(req.query as Record<string, unknown>);
  const cnpj = formatarCnpj(typeof req.query.cnpj === 'string' ? req.query.cnpj : undefined);
  const chaveAcesso = normalizarChaveAcesso(typeof req.query.chave_acesso === 'string' ? req.query.chave_acesso : undefined);

  if (cnpj) {
    const { data: empresaValida, error: erroEmpresa } = await supabase
      .from('empresascertificados')
      .select('id')
      .eq('cnpj', cnpj)
      .maybeSingle();

    if (erroEmpresa) {
      res.status(500).json({ message: 'Erro ao validar CNPJ em empresascertificados', error: erroEmpresa.message });
      return;
    }

    if (!empresaValida) {
      res.status(400).json({ message: 'CNPJ nao cadastrado em empresascertificados' });
      return;
    }
  }

  let query = supabase
    .from('listagemchaves')
    .select(selectBase, { count: 'exact' })
    .order('data_emissao', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (cnpj) {
    query = query.eq('cnpj', cnpj);
  }

  if (chaveAcesso) {
    query = query.eq('chave_acesso', chaveAcesso);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ message: 'Erro ao buscar listagemchaves', error: error.message });
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

export const buscarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('listagemchaves')
    .select(selectBase)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ message: 'Listagem chave nao encontrada' });
    return;
  }

  res.json({ item: data });
};

export const criarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as ListagemChavesPayload;

  if (!payload.cnpj || !payload.chave_acesso) {
    res.status(400).json({ message: 'Campos obrigatorios: cnpj e chave_acesso' });
    return;
  }

  const { data, error } = await supabase
    .from('listagemchaves')
    .insert(limparPayload(payload))
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao criar listagem chave', error: error.message });
    return;
  }

  res.status(201).json({ item: data });
};

export const atualizarListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const payload = req.body as ListagemChavesPayload;
  const atualizacao = {
    ...limparPayload(payload),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('listagemchaves')
    .update(atualizacao)
    .eq('id', id)
    .select(selectBase)
    .single();

  if (error) {
    res.status(500).json({ message: 'Erro ao atualizar listagem chave', error: error.message });
    return;
  }

  res.json({ item: data });
};

export const excluirListagemChave = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabase
    .from('listagemchaves')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({ message: 'Erro ao excluir listagem chave', error: error.message });
    return;
  }

  res.status(204).send();
};

export const buscarChavesSefaz = async (req: Request, res: Response): Promise<void> => {
  const payload = req.body as BuscarChavesSefazPayload;
  const cnpjDigits = normalizarCnpj(payload.cnpj);
  const cnpjFormatado = formatarCnpj(payload.cnpj);
  const dataInicio = payload.data_inicio;
  const dataFim = payload.data_fim;

  if (!cnpjDigits || cnpjDigits.length !== 14) {
    res.status(400).json({ message: 'Informe um CNPJ valido para consulta.' });
    return;
  }

  if (!validarDataIso(dataInicio) || !validarDataIso(dataFim)) {
    res.status(400).json({ message: 'Informe data_inicio e data_fim no formato YYYY-MM-DD.' });
    return;
  }

  const { data: empresa, error: erroEmpresa } = await supabase
    .from('empresascertificados')
    .select('id, cnpj, certificado_pfx_base64, senha_certificado, ativo')
    .eq('cnpj', cnpjFormatado)
    .maybeSingle();

  if (erroEmpresa) {
    res.status(500).json({ message: 'Erro ao validar empresa certificado', error: erroEmpresa.message });
    return;
  }

  if (!empresa) {
    res.status(400).json({ message: 'CNPJ nao cadastrado em empresascertificados.' });
    return;
  }

  if (!empresa.ativo) {
    res.status(400).json({ message: 'O certificado da empresa esta inativo.' });
    return;
  }

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <nfceListagemChaves xmlns="http://homologacao.nfce.fazenda.sp.gov.br/ws/NFCeListagemChaves.asmx">
      <cnpj>${cnpjDigits}</cnpj>
      <dataInicial>${dataInicio}</dataInicial>
      <dataFinal>${dataFim}</dataFinal>
      <certificadoPfxBase64>${empresa.certificado_pfx_base64}</certificadoPfxBase64>
      <senhaCertificado>${empresa.senha_certificado}</senhaCertificado>
    </nfceListagemChaves>
  </soap:Body>
</soap:Envelope>`;

  try {
    res.status(500).json({ message: 'Retorno servico NFCeListagemChaves', error: soapEnvelope });

    const resposta = await fetch(`${NFCE_LISTAGEM_CHAVES_URL}?op=nfceListagemChaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: NFCE_LISTAGEM_CHAVES_SOAP_ACTION
      },
      body: soapEnvelope
    });

    const xmlResposta = await resposta.text();
    const chaves = extrairChavesDoXml(xmlResposta);

    if (!chaves.length) {
      res.status(200).json({
        message: 'Consulta realizada, mas nenhuma chave foi identificada no retorno da SEFAZ.',
        totalEncontradas: 0,
        chaves: [],
        retorno_servico: {
          status_http: resposta.status,
          status_text: resposta.statusText
        }
      });
      return;
    }

    const registros = chaves.map((chave) => ({
      empresa_id: empresa.id,
      cnpj: empresa.cnpj,
      chave_acesso: chave,
      situacao: 'retornada_api',
      retorno_servico: {
        origem: 'NFCeListagemChaves',
        status_http: resposta.status
      }
    }));

    const { data: itensPersistidos, error: erroPersistencia } = await supabase
      .from('listagemchaves')
      .upsert(registros, { onConflict: 'chave_acesso' })
      .select(selectBase);

    if (erroPersistencia) {
      res.status(500).json({ message: 'Erro ao persistir listagemchaves', error: erroPersistencia.message });
      return;
    }

    res.status(200).json({
      message: 'Consulta SEFAZ realizada com sucesso.',
      totalEncontradas: chaves.length,
      chaves,
      items: itensPersistidos ?? []
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao consultar SEFAZ';
    res.status(500).json({ message: 'Erro ao consumir servico NFCeListagemChaves', error: message });
  }
};
