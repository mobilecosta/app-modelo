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
