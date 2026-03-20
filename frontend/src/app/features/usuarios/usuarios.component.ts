import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule, PoFieldModule, PoModalModule, PoModalComponent,
  PoNotificationService, PoPageModule, PoTableModule, PoTableColumn,
  PoPageAction
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { Usuario } from '../../core/models/types';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoModalModule, PoPageModule, PoTableModule],
  template: `
    <po-page-default p-title="Usuarios" [p-actions]="pageActions">
      <po-table
        [p-columns]="colunas"
        [p-items]="itens"
        [p-loading]="carregando"
        [p-actions]="tabelaActions">
      </po-table>

      <div class="crud-pagination">
        <div class="crud-pagination__meta">
          <span class="crud-pagination__title">Paginacao</span>
          <span class="crud-pagination__text">{{ totalRegistros }} registro(s) encontrados</span>
        </div>

        <div class="crud-pagination__actions">
          <po-button
            p-label="Anterior"
            p-kind="tertiary"
            [p-disabled]="paginaAtual <= 1 || carregando"
            (p-click)="irParaPaginaAnterior()">
          </po-button>
          <span class="crud-pagination__counter">Pagina {{ paginaAtual }} de {{ totalPaginas }}</span>
          <po-button
            p-label="Proxima"
            p-kind="tertiary"
            [p-disabled]="paginaAtual >= totalPaginas || carregando"
            (p-click)="irParaProximaPagina()">
          </po-button>
        </div>
      </div>
    </po-page-default>

    <po-modal #modal [p-title]="modalTitulo" p-size="lg" [p-primary-action]="modalPrimary" [p-secondary-action]="modalSecondary">
      <div class="crud-modal">
        <div class="crud-modal__hero">
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo acesso' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Organize os dados de acesso e deixe claro quais usuarios podem utilizar a plataforma.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Identificacao</h4>
            <p class="crud-section__hint">Informe os dados principais do usuario para facilitar localizacao e acesso.</p>
            <div class="po-row">
              <po-input p-label="Nome" [(ngModel)]="form.nome" p-required="true" p-placeholder="Nome completo" class="po-lg-12"></po-input>
              <po-email p-label="Email" [(ngModel)]="form.email" p-required="true" p-placeholder="usuario@empresa.com" class="po-lg-12"></po-email>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Seguranca e status</h4>
            <p class="crud-section__hint">Defina a senha quando necessario e indique se o usuario deve continuar ativo.</p>
            <div class="po-row">
              <po-password p-label="Senha" [(ngModel)]="form.senha" p-placeholder="Preencha para criar ou atualizar" class="po-lg-12"></po-password>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-12"></po-switch>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class UsuariosComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Usuario[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo Usuario';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;

  form: Partial<Usuario> & { senha?: string } = { ativo: true };

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome' },
    { property: 'email', label: 'Email' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
    { property: 'created_at', label: 'Criado em', type: 'dateTime' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Usuario) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Usuario) => this.excluir(item.id) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };

  constructor(private apiService: ApiService, private notificacao: PoNotificationService) {}

  ngOnInit(): void {
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarUsuarios(page, this.pageSize).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar usuarios.');
      }
    });
  }

  irParaPaginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.carregar(this.paginaAtual - 1);
    }
  }

  irParaProximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.carregar(this.paginaAtual + 1);
    }
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.modalTitulo = 'Novo Usuario';
    this.form = { ativo: true };
    this.modal.open();
  }

  abrirEditar(item: Usuario): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar Usuario';
    this.form = { nome: item.nome, email: item.email, ativo: item.ativo };
    this.modal.open();
  }

  salvar(): void {
    if (this.editandoId) {
      this.apiService.atualizarUsuario(this.editandoId, this.form).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Usuario atualizado.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao atualizar usuario.')
      });
    } else {
      this.apiService.criarUsuario(this.form as Partial<Usuario> & { senha: string }).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Usuario criado.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao criar usuario.')
      });
    }
  }

  excluir(id: string): void {
    this.apiService.excluirUsuario(id).subscribe({
      next: () => { this.notificacao.success('Usuario excluido.'); this.carregar(); },
      error: () => this.notificacao.error('Erro ao excluir usuario.')
    });
  }
}
