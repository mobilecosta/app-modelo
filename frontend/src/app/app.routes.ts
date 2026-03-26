import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard_financeiro',
        loadComponent: () => import('./features/dashboard-financeiro/dashboard-financeiro.component').then(m => m.DashboardFinanceiroComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'tabelas',
        loadComponent: () => import('./features/tabelas/tabelas.component').then(m => m.TabelasComponent)
      },
      {
        path: 'campos',
        loadComponent: () => import('./features/campos/campos.component').then(m => m.CamposComponent)
      },
      {
        path: 'menus',
        loadComponent: () => import('./features/menus/menus.component').then(m => m.MenusComponent)
      },
      {
        path: 'pessoas_juridicas',
        loadComponent: () => import('./features/pessoas-juridicas/pessoas-juridicas.component').then(m => m.PessoasJuridicasComponent)
      },
      {
        path: 'nfse_servicos',
        loadComponent: () => import('./features/nfse-servicos/nfse-servicos.component').then(m => m.NfseServicosComponent)
      },
      {
        path: 'movimentofinanceiro',
        loadComponent: () => import('./features/movimentofinanceiro/movimentofinanceiro.component').then(m => m.MovimentofinanceiroComponent)
      },
      {
        path: 'empresascertificados',
        loadComponent: () => import('./features/empresascertificados/empresascertificados.component').then(m => m.EmpresascertificadosComponent)
      },
      {
        path: 'listagemchaves',
        loadComponent: () => import('./features/listagemchaves/listagemchaves.component').then(m => m.ListagemchavesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
