export interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tabela {
  id: string;
  nome: string;
  descricao?: string;
  schema_nome: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Campo {
  id: string;
  tabela_id: string;
  nome: string;
  label: string;
  tipo: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'textarea' | 'email' | 'password';
  obrigatorio: boolean;
  tamanho_maximo?: number;
  valor_padrao?: string;
  opcoes?: string;
  ordem: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sistema {
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Menu {
  id: string;
  sistema_codigo: string;
  label: string;
  link?: string;
  icon?: string;
  menu_pai_id?: string;
  subItems?: Menu[];
  ordem: number;
  ativo: boolean;
}

export interface PessoaAtividadeSecundaria {
  id?: string;
  pessoa_id?: string;
  codigo: string;
  descricao: string;
  ordem: number;
  created_at?: string;
  updated_at?: string;
}

export interface PessoaQsa {
  id?: string;
  pessoa_id?: string;
  nome: string;
  qualificacao?: string;
  pais_origem?: string;
  nome_rep_legal?: string;
  qual_rep_legal?: string;
  ordem: number;
  created_at?: string;
  updated_at?: string;
}

export interface Pessoa {
  id: string;
  cnpj: string;
  tipo?: string;
  nome: string;
  fantasia?: string;
  porte?: string;
  abertura?: string;
  natureza_juridica?: string;
  atividade_principal_codigo?: string;
  atividade_principal_texto?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  email?: string;
  telefone?: string;
  efr?: string;
  situacao?: string;
  data_situacao?: string;
  motivo_situacao?: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  capital_social?: number;
  ultima_atualizacao?: string;
  status?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
  pessoas_atividades_secundarias?: PessoaAtividadeSecundaria[];
  pessoas_qsa?: PessoaQsa[];
}

export interface PessoaFormPayload extends Partial<Pessoa> {
  atividades_secundarias?: PessoaAtividadeSecundaria[];
  qsa?: PessoaQsa[];
}

export interface PessoaReceitaWsResponse {
  fonte: string;
  consulta: {
    cnpj: string;
    url: string;
    realizada_em: string;
  };
  pessoa: PessoaFormPayload;
  pessoas_atividades_secundarias: PessoaAtividadeSecundaria[];
  pessoas_qsa: PessoaQsa[];
}

export interface LoginRequest {
  email: string;
  senha: string;
  sistema: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Pick<Usuario, 'id' | 'nome' | 'email'>;
  sistema: Pick<Sistema, 'codigo' | 'nome'>;
}

export interface ApiResponse<T> {
  items?: T[];
  item?: T;
  total?: number;
  page?: number;
  pageSize?: number;
  hasNext?: boolean;
  message?: string;
}
