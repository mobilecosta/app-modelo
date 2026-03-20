import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PoButtonModule, PoFieldModule, PoNotificationService, PoPageModule
} from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default p-title="Criar conta">
      <div class="crud-register">
        <div class="crud-register__grid">
          <section class="crud-register__card">
            <div class="crud-register__hero">
              <span class="crud-modal__eyebrow">Acesso inicial</span>
              <h2>Cadastre sua conta</h2>
              <p>Preencha os dados abaixo para entrar na plataforma com uma experiencia mais clara e acolhedora.</p>
            </div>

            <div class="crud-register__form">
              <po-input
                p-label="Nome"
                [(ngModel)]="form.nome"
                p-required="true"
                p-placeholder="Como voce gostaria de ser identificado?"
                class="po-lg-12">
              </po-input>
              <po-email
                p-label="Email"
                [(ngModel)]="form.email"
                p-required="true"
                p-placeholder="seuemail@empresa.com"
                class="po-lg-12">
              </po-email>
              <po-password
                p-label="Senha"
                [(ngModel)]="form.senha"
                p-required="true"
                p-placeholder="Crie uma senha segura"
                class="po-lg-12">
              </po-password>
              <div class="crud-register__actions">
                <po-button
                  p-label="Registrar"
                  p-kind="primary"
                  [p-loading]="carregando"
                  (p-click)="onRegistrar()">
                </po-button>
                <po-button
                  p-label="Voltar ao login"
                  p-kind="tertiary"
                  (p-click)="voltar()">
                </po-button>
              </div>
            </div>
          </section>

          <aside class="crud-register__aside">
            <h3>Antes de continuar</h3>
            <ul class="crud-register__tips">
              <li>Use um email valido para facilitar recuperacao de acesso e comunicacoes futuras.</li>
              <li>Prefira uma senha forte, com combinacao de letras, numeros e caracteres especiais.</li>
              <li>Depois do cadastro, voce podera voltar ao login e acessar o sistema normalmente.</li>
            </ul>
          </aside>
        </div>
      </div>
    </po-page-default>
  `
})
export class RegistroComponent {
  carregando = false;
  form = { nome: '', email: '', senha: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacao: PoNotificationService
  ) {}

  onRegistrar(): void {
    if (!this.form.nome || !this.form.email || !this.form.senha) {
      this.notificacao.warning('Preencha todos os campos.');
      return;
    }
    this.carregando = true;
    this.authService.registrar(this.form).subscribe({
      next: () => {
        this.carregando = false;
        this.notificacao.success('Conta criada com sucesso. Faca o login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.carregando = false;
        const msg = err?.error?.message ?? 'Erro ao criar conta.';
        this.notificacao.error(msg);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }
}
