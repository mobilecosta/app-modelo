import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PoButtonModule, PoFieldModule, PoNotificationService, PoPageModule, PoSelectOption
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default p-title="Acesso ao sistema">
      <div class="login-page">
        <div class="login-page__content">
          <div class="login-card">
            <h2 class="login-card__title">Entrar</h2>
            <p class="login-card__text">Selecione o sistema e informe suas credenciais para carregar o menu correto.</p>

            <po-select
              name="sistema"
              p-label="Sistema"
              [p-options]="sistemas"
              [ngModel]="form.sistema"
              (ngModelChange)="form.sistema = $event"
              [p-disabled]="carregando || carregandoSistemas">
            </po-select>

            <po-email
              name="email"
              p-label="Email"
              [(ngModel)]="form.email"
              [disabled]="carregando">
            </po-email>

            <po-password
              name="senha"
              p-label="Senha"
              [(ngModel)]="form.senha"
              [disabled]="carregando">
            </po-password>

            <div class="login-card__actions">
              <po-button
                p-label="Entrar"
                p-kind="primary"
                [p-loading]="carregando"
                [p-disabled]="carregandoSistemas"
                (p-click)="onLogin()">
              </po-button>
              <po-button
                p-label="Criar conta"
                p-kind="tertiary"
                [p-disabled]="carregando"
                (p-click)="router.navigate(['/registro'])">
              </po-button>
            </div>
          </div>
        </div>
      </div>
    </po-page-default>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 12rem);
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
    }

    .login-page__content {
      width: min(100%, 28rem);
    }

    .login-card {
      display: grid;
      gap: 1rem;
      padding: 2rem;
      border-radius: 1rem;
      background: linear-gradient(180deg, #ffffff 0%, #f5f8fb 100%);
      box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.08);
    }

    .login-card__title {
      margin: 0;
    }

    .login-card__text {
      margin: 0;
      color: #52606d;
    }

    .login-card__actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `]
})
export class LoginComponent {
  carregando = false;
  carregandoSistemas = false;
  sistemas: PoSelectOption[] = [];
  form = {
    sistema: '',
    email: '',
    senha: ''
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public router: Router,
    private notificacao: PoNotificationService
  ) {
    this.carregarSistemas();
  }

  onLogin(): void {
    if (!this.form.sistema || !this.form.email || !this.form.senha) {
      this.notificacao.warning('Informe sistema, email e senha.');
      return;
    }

    this.carregando = true;
    this.authService.login({
      email: this.form.email,
      senha: this.form.senha,
      sistema: this.form.sistema
    }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Email ou senha invalidos.');
      }
    });
  }

  private carregarSistemas(): void {
    this.carregandoSistemas = true;
    this.apiService.listarSistemasPublicos().subscribe({
      next: response => {
        this.sistemas = (response.items ?? []).map(sistema => ({
          label: sistema.nome,
          value: sistema.codigo
        }));
        this.form.sistema = this.sistemas[0]?.value?.toString() ?? '';
        this.carregandoSistemas = false;
      },
      error: () => {
        this.carregandoSistemas = false;
        this.notificacao.error('Erro ao carregar sistemas.');
      }
    });
  }
}
