import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PoMenuModule, PoMenuItem, PoToolbarModule, PoToolbarAction } from '@po-ui/ng-components';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';
import { Menu } from '../core/models/types';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, PoMenuModule, PoToolbarModule],
  template: `
    <po-toolbar
      [p-title]="nomeUsuario"
      [p-actions]="toolbarActions">
    </po-toolbar>
    <po-menu [p-menus]="menus" [p-logo]="logo">
    </po-menu>
    <div class="po-wrapper">
      <router-outlet />
    </div>
  `
})
export class ShellComponent implements OnInit {
  menus: PoMenuItem[] = [];
  nomeUsuario = '';
  nomeSistema = '';
  logo = '';

  toolbarActions: PoToolbarAction[] = [
    {
      label: 'Sair',
      icon: 'ph ph-sign-out',
      action: () => this.authService.logout()
    }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    const sistema = this.authService.getSistema();
    this.nomeUsuario = usuario?.nome ?? '';
    this.nomeSistema = sistema?.nome ?? '';
    this.carregarMenus();
  }

  private carregarMenus(): void {
    const sistema = this.authService.getSistema();

    if (!sistema?.codigo) {
      this.menus = this.menusPadrao();
      return;
    }

    this.apiService.menuArvore(sistema.codigo).subscribe({
      next: response => {
        this.menus = this.converterMenus(response.items ?? []);
      },
      error: () => {
        this.menus = this.menusPadrao();
      }
    });
  }

  private converterMenus(itens: Menu[]): PoMenuItem[] {
    return itens.map(item => ({
      label: item.label,
      link: item.link,
      icon: item.icon,
      subItems: item.subItems?.length ? this.converterMenus(item.subItems) : undefined
    }));
  }

  private menusPadrao(): PoMenuItem[] {
    return [
      { label: 'Dashboard', link: '/dashboard', icon: 'ph ph-house' },
      {
        label: 'Dicionario',
        icon: 'ph ph-database',
        subItems: [
          { label: 'Tabelas', link: '/tabelas', icon: 'ph ph-table' },
          { label: 'Campos', link: '/campos', icon: 'ph ph-columns' }
        ]
      },
      { label: 'Usuarios', link: '/usuarios', icon: 'ph ph-users' },
      {
        label: 'Configuracoes',
        icon: 'ph ph-gear',
        subItems: [
          { label: 'Menus', link: '/menus', icon: 'ph ph-list' }
        ]
      }
    ];
  }
}
