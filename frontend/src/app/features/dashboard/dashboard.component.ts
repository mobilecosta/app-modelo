import { Component } from '@angular/core';
import { PoPageModule, PoInfoModule } from '@po-ui/ng-components';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PoPageModule, PoInfoModule],
  template: `
    <po-page-default p-title="Dashboard">
      <div class="po-row">
        <po-info
          class="po-lg-4"
          p-label="Usuario"
          [p-value]="nomeUsuario">
        </po-info>
        <po-info
          class="po-lg-4"
          p-label="Email"
          [p-value]="emailUsuario">
        </po-info>
        <po-info
          class="po-lg-4"
          p-label="Sistema"
          [p-value]="nomeSistema">
        </po-info>
      </div>
    </po-page-default>
  `
})
export class DashboardComponent {
  nomeUsuario: string;
  emailUsuario: string;
  nomeSistema: string;

  constructor(private authService: AuthService) {
    const usuario = this.authService.getUsuario();
    const sistema = this.authService.getSistema();
    this.nomeUsuario = usuario?.nome ?? '';
    this.emailUsuario = usuario?.email ?? '';
    this.nomeSistema = sistema?.nome ?? '';
  }
}
