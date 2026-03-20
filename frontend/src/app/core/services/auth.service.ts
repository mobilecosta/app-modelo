import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  LoginRequest, LoginResponse, RegistroRequest, Sistema, Usuario
} from '../models/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly SYSTEM_KEY = 'auth_system';

  private usuarioSubject = new BehaviorSubject<Pick<Usuario, 'id' | 'nome' | 'email'> | null>(this.carregarUsuario());
  private sistemaSubject = new BehaviorSubject<Pick<Sistema, 'codigo' | 'nome'> | null>(this.carregarSistema());
  usuario$ = this.usuarioSubject.asObservable();
  sistema$ = this.sistemaSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dados).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.usuario));
        localStorage.setItem(this.SYSTEM_KEY, JSON.stringify(response.sistema));
        this.usuarioSubject.next(response.usuario);
        this.sistemaSubject.next(response.sistema);
      })
    );
  }

  registrar(dados: RegistroRequest): Observable<{ usuario: Pick<Usuario, 'id' | 'nome' | 'email'> }> {
    return this.http.post<{ usuario: Pick<Usuario, 'id' | 'nome' | 'email'> }>(`${environment.apiUrl}/auth/registrar`, dados);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SYSTEM_KEY);
    this.usuarioSubject.next(null);
    this.sistemaSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  getUsuario(): Pick<Usuario, 'id' | 'nome' | 'email'> | null {
    return this.usuarioSubject.value;
  }

  getSistema(): Pick<Sistema, 'codigo' | 'nome'> | null {
    return this.sistemaSubject.value;
  }

  private carregarUsuario(): Pick<Usuario, 'id' | 'nome' | 'email'> | null {
    const dados = localStorage.getItem(this.USER_KEY);
    return dados ? JSON.parse(dados) : null;
  }

  private carregarSistema(): Pick<Sistema, 'codigo' | 'nome'> | null {
    const dados = localStorage.getItem(this.SYSTEM_KEY);
    return dados ? JSON.parse(dados) : null;
  }
}
