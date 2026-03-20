import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, Campo, Menu, Pessoa, PessoaFormPayload, PessoaReceitaWsResponse, Sistema, Tabela, Usuario
} from '../models/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  listarUsuarios(page = 1, pageSize = 10): Observable<ApiResponse<Usuario>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios`, { params });
  }

  buscarUsuario(id: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/${id}`);
  }

  criarUsuario(dados: Partial<Usuario> & { senha: string }): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios`, dados);
  }

  atualizarUsuario(id: string, dados: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/${id}`, dados);
  }

  excluirUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/usuarios/${id}`);
  }

  listarTabelas(page = 1, pageSize = 10): Observable<ApiResponse<Tabela>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ApiResponse<Tabela>>(`${environment.apiUrl}/tabelas`, { params });
  }

  buscarTabela(id: string): Observable<ApiResponse<Tabela>> {
    return this.http.get<ApiResponse<Tabela>>(`${environment.apiUrl}/tabelas/${id}`);
  }

  criarTabela(dados: Partial<Tabela>): Observable<ApiResponse<Tabela>> {
    return this.http.post<ApiResponse<Tabela>>(`${environment.apiUrl}/tabelas`, dados);
  }

  atualizarTabela(id: string, dados: Partial<Tabela>): Observable<ApiResponse<Tabela>> {
    return this.http.put<ApiResponse<Tabela>>(`${environment.apiUrl}/tabelas/${id}`, dados);
  }

  excluirTabela(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tabelas/${id}`);
  }

  listarCampos(page = 1, pageSize = 10, tabelaId?: string): Observable<ApiResponse<Campo>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (tabelaId) params = params.set('tabela_id', tabelaId);
    return this.http.get<ApiResponse<Campo>>(`${environment.apiUrl}/campos`, { params });
  }

  buscarCampo(id: string): Observable<ApiResponse<Campo>> {
    return this.http.get<ApiResponse<Campo>>(`${environment.apiUrl}/campos/${id}`);
  }

  criarCampo(dados: Partial<Campo>): Observable<ApiResponse<Campo>> {
    return this.http.post<ApiResponse<Campo>>(`${environment.apiUrl}/campos`, dados);
  }

  atualizarCampo(id: string, dados: Partial<Campo>): Observable<ApiResponse<Campo>> {
    return this.http.put<ApiResponse<Campo>>(`${environment.apiUrl}/campos/${id}`, dados);
  }

  excluirCampo(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/campos/${id}`);
  }

  listarMenus(page = 1, pageSize = 10): Observable<ApiResponse<Menu>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ApiResponse<Menu>>(`${environment.apiUrl}/menus`, { params });
  }

  listarMenusPorSistema(sistema: string, page = 1, pageSize = 10): Observable<ApiResponse<Menu>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sistema', sistema);
    return this.http.get<ApiResponse<Menu>>(`${environment.apiUrl}/menus`, { params });
  }

  menuArvore(sistema: string): Observable<ApiResponse<Menu>> {
    const params = new HttpParams().set('sistema', sistema);
    return this.http.get<ApiResponse<Menu>>(`${environment.apiUrl}/menus/arvore`, { params });
  }

  buscarMenu(id: string): Observable<ApiResponse<Menu>> {
    return this.http.get<ApiResponse<Menu>>(`${environment.apiUrl}/menus/${id}`);
  }

  criarMenu(dados: Partial<Menu>): Observable<ApiResponse<Menu>> {
    return this.http.post<ApiResponse<Menu>>(`${environment.apiUrl}/menus`, dados);
  }

  atualizarMenu(id: string, dados: Partial<Menu>): Observable<ApiResponse<Menu>> {
    return this.http.put<ApiResponse<Menu>>(`${environment.apiUrl}/menus/${id}`, dados);
  }

  excluirMenu(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/menus/${id}`);
  }

  listarSistemasPublicos(): Observable<ApiResponse<Sistema>> {
    return this.http.get<ApiResponse<Sistema>>(`${environment.apiUrl}/sistemas/publico`);
  }

  listarSistemas(page = 1, pageSize = 10): Observable<ApiResponse<Sistema>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ApiResponse<Sistema>>(`${environment.apiUrl}/sistemas`, { params });
  }

  listarPessoas(page = 1, pageSize = 10): Observable<ApiResponse<Pessoa>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ApiResponse<Pessoa>>(`${environment.apiUrl}/pessoas`, { params });
  }

  buscarPessoa(id: string): Observable<ApiResponse<Pessoa>> {
    return this.http.get<ApiResponse<Pessoa>>(`${environment.apiUrl}/pessoas/${id}`);
  }

  criarPessoa(dados: PessoaFormPayload): Observable<ApiResponse<Pessoa>> {
    return this.http.post<ApiResponse<Pessoa>>(`${environment.apiUrl}/pessoas`, dados);
  }

  atualizarPessoa(id: string, dados: PessoaFormPayload): Observable<ApiResponse<Pessoa>> {
    return this.http.put<ApiResponse<Pessoa>>(`${environment.apiUrl}/pessoas/${id}`, dados);
  }

  excluirPessoa(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/pessoas/${id}`);
  }

  consultarReceitaWs(cnpj: string): Observable<PessoaReceitaWsResponse> {
    return this.http.get<PessoaReceitaWsResponse>(`${environment.apiUrl}/pessoas/receitaws/${cnpj}`);
  }
}
