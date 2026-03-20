import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule, PoFieldModule, PoModalModule, PoModalComponent,
  PoNotificationService, PoPageModule, PoTableModule, PoTableColumn,
  PoPageAction, PoSelectOption
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Menu, Sistema } from '../../core/models/types';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoModalModule, PoPageModule, PoTableModule],
  template: `
    <po-page-default p-title="Menus" [p-actions]="pageActions">
      <div class="po-row po-mb-3">
        <po-select
          p-label="Sistema em edicao"
          [ngModel]="sistemaSelecionado"
          (ngModelChange)="onSistemaChange($event)"
          [p-options]="opcoesSistema"
          class="po-lg-4">
        </po-select>
      </div>

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
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo menu' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Monte a navegacao com hierarquia clara, ordem definida e informacoes visuais mais legiveis.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Conteudo do item</h4>
            <p class="crud-section__hint">Defina como esse menu sera apresentado para o usuario e para onde ele aponta.</p>
            <div class="po-row">
              <po-select p-label="Sistema" [ngModel]="form.sistema_codigo" (ngModelChange)="form.sistema_codigo = $event" [p-options]="opcoesSistema" class="po-lg-6"></po-select>
              <po-input p-label="Label" [(ngModel)]="form.label" p-required="true" p-placeholder="Ex.: Relatorios" class="po-lg-6"></po-input>
              <po-input p-label="Link" [(ngModel)]="form.link" p-placeholder="Ex.: /relatorios" class="po-lg-6"></po-input>
              <po-input p-label="Icone" [(ngModel)]="form.icon" p-placeholder="Ex.: ph ph-chart-bar" class="po-lg-6"></po-input>
              <po-number p-label="Ordem" [(ngModel)]="form.ordem" p-placeholder="Ex.: 1" class="po-lg-6"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Hierarquia e disponibilidade</h4>
            <p class="crud-section__hint">Use um menu pai quando quiser agrupar itens relacionados dentro da navegacao.</p>
            <div class="po-row">
              <po-select p-label="Menu Pai" [ngModel]="form.menu_pai_id" (ngModelChange)="form.menu_pai_id = $event" [p-options]="opcoesMenuPai" class="po-lg-12"></po-select>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-12"></po-switch>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class MenusComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Menu[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo Menu';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;
  sistemaSelecionado = '';

  form: Partial<Menu> = { ordem: 0, ativo: true };

  opcoesMenuPai: PoSelectOption[] = [];
  opcoesSistema: PoSelectOption[] = [];

  colunas: PoTableColumn[] = [
    { property: 'label', label: 'Label' },
    { property: 'sistema_codigo', label: 'Sistema' },
    { property: 'link', label: 'Link' },
    { property: 'icon', label: 'Icone' },
    { property: 'ordem', label: 'Ordem' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Menu) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Menu) => this.excluir(item.id) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private notificacao: PoNotificationService
  ) {}

  ngOnInit(): void {
    this.carregarSistemas();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    if (!this.sistemaSelecionado) {
      this.itens = [];
      this.totalRegistros = 0;
      this.paginaAtual = 1;
      return;
    }

    this.carregando = true;
    this.apiService.listarMenusPorSistema(this.sistemaSelecionado, page, this.pageSize).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar menus.');
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

  carregarOpcoesMenuPai(): void {
    if (!this.sistemaSelecionado) {
      this.opcoesMenuPai = [{ label: '(Nenhum)', value: '' }];
      return;
    }

    this.apiService.listarMenusPorSistema(this.sistemaSelecionado, 1, 100).subscribe({
      next: res => {
        this.opcoesMenuPai = [
          { label: '(Nenhum)', value: '' },
          ...(res.items ?? []).map(menu => ({ label: menu.label, value: menu.id }))
        ];
      }
    });
  }

  carregarSistemas(): void {
    this.apiService.listarSistemas(1, 100).subscribe({
      next: res => {
        this.opcoesSistema = (res.items ?? []).map((sistema: Sistema) => ({
          label: sistema.nome,
          value: sistema.codigo
        }));
        this.sistemaSelecionado = this.authService.getSistema()?.codigo
          ?? this.opcoesSistema[0]?.value?.toString()
          ?? '';
        this.form.sistema_codigo = this.sistemaSelecionado;
        this.carregar();
        this.carregarOpcoesMenuPai();
      },
      error: () => {
        this.notificacao.error('Erro ao carregar sistemas.');
      }
    });
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.modalTitulo = 'Novo Menu';
    this.form = { sistema_codigo: this.sistemaSelecionado, ordem: 0, ativo: true };
    this.modal.open();
  }

  onSistemaChange(sistema: string): void {
    this.sistemaSelecionado = sistema;
    this.form.sistema_codigo = sistema;
    this.carregar(1);
    this.carregarOpcoesMenuPai();
  }

  abrirEditar(item: Menu): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar Menu';
    this.form = {
      sistema_codigo: item.sistema_codigo,
      label: item.label,
      link: item.link,
      icon: item.icon,
      menu_pai_id: item.menu_pai_id,
      ordem: item.ordem,
      ativo: item.ativo
    };
    this.modal.open();
  }

  salvar(): void {
    if (!this.form.sistema_codigo) {
      this.notificacao.warning('Selecione o sistema do menu.');
      return;
    }

    if (this.editandoId) {
      this.apiService.atualizarMenu(this.editandoId, this.form).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Menu atualizado.');
          this.sistemaSelecionado = this.form.sistema_codigo ?? this.sistemaSelecionado;
          this.carregar();
          this.carregarOpcoesMenuPai();
        },
        error: () => this.notificacao.error('Erro ao atualizar menu.')
      });
    } else {
      this.apiService.criarMenu(this.form).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Menu criado.');
          this.carregar();
          this.carregarOpcoesMenuPai();
        },
        error: () => this.notificacao.error('Erro ao criar menu.')
      });
    }
  }

  excluir(id: string): void {
    this.apiService.excluirMenu(id).subscribe({
      next: () => { this.notificacao.success('Menu excluido.'); this.carregar(); this.carregarOpcoesMenuPai(); },
      error: () => this.notificacao.error('Erro ao excluir menu.')
    });
  }
}
