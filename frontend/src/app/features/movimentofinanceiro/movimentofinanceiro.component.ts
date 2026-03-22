import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule, PoFieldModule, PoModalModule, PoModalComponent,
  PoNotificationService, PoPageAction, PoPageModule, PoSelectOption,
  PoTableColumn, PoTableModule
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { MovimentoFinanceiro } from '../../core/models/types';

@Component({
  selector: 'app-movimentofinanceiro',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoModalModule, PoPageModule, PoTableModule],
  template: `
    <po-page-default p-title="Movimento Financeiro" [p-actions]="pageActions">
      <div class="po-row po-mb-3">
        <po-select
          p-label="Filtrar por tipo"
          [ngModel]="filtroTipo"
          (ngModelChange)="onFiltroTipoChange($event)"
          [p-options]="opcoesTipoFiltro"
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
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo lancamento' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Registre entradas e saidas com valor, data e descricao para facilitar o controle financeiro.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Dados do movimento</h4>
            <p class="crud-section__hint">Selecione o tipo e informe os dados basicos do lancamento.</p>
            <div class="po-row">
              <po-select
                p-label="Tipo"
                [ngModel]="form.tipo"
                (ngModelChange)="form.tipo = $event"
                [p-options]="opcoesTipo"
                p-required="true"
                class="po-lg-4">
              </po-select>

              <po-number
                p-label="Valor"
                [ngModel]="form.valor"
                (ngModelChange)="form.valor = $event"
                p-min-value="0"
                p-decimals-length="2"
                p-required="true"
                class="po-lg-4">
              </po-number>

              <po-datepicker
                p-label="Data do movimento"
                [ngModel]="form.data_movimento"
                (ngModelChange)="form.data_movimento = $event"
                p-required="true"
                class="po-lg-4">
              </po-datepicker>

              <po-textarea
                p-label="Descricao"
                [ngModel]="form.descricao"
                (ngModelChange)="form.descricao = $event"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>

              <po-switch
                p-label="Ativo"
                [(ngModel)]="form.ativo"
                class="po-lg-12">
              </po-switch>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class MovimentofinanceiroComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Array<MovimentoFinanceiro & { tipo_descricao: string }> = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo Movimento Financeiro';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;
  filtroTipo: '' | 1 | 2 = '';

  form: Partial<MovimentoFinanceiro> = {
    tipo: 1,
    valor: 0,
    data_movimento: this.obterDataHoje(),
    ativo: true
  };

  opcoesTipo: PoSelectOption[] = [
    { label: 'Entrada', value: 1 },
    { label: 'Saida', value: 2 }
  ];

  opcoesTipoFiltro: PoSelectOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Entrada', value: 1 },
    { label: 'Saida', value: 2 }
  ];

  colunas: PoTableColumn[] = [
    { property: 'tipo_descricao', label: 'Tipo' },
    { property: 'descricao', label: 'Descricao' },
    { property: 'valor', label: 'Valor', type: 'currency' },
    { property: 'data_movimento', label: 'Data', type: 'date' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: MovimentoFinanceiro) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: MovimentoFinanceiro) => this.excluir(item.id) }
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
    this.apiService.listarMovimentosFinanceiros(page, this.pageSize, this.filtroTipo || undefined).subscribe({
      next: res => {
        this.itens = (res.items ?? []).map(item => ({
          ...item,
          tipo_descricao: item.tipo === 1 ? 'Entrada' : 'Saida'
        }));
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar movimentos financeiros.');
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

  onFiltroTipoChange(tipo: '' | 1 | 2): void {
    this.filtroTipo = tipo;
    this.carregar(1);
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.modalTitulo = 'Novo Movimento Financeiro';
    this.form = {
      tipo: 1,
      valor: 0,
      data_movimento: this.obterDataHoje(),
      ativo: true
    };
    this.modal.open();
  }

  abrirEditar(item: MovimentoFinanceiro): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar Movimento Financeiro';
    this.form = {
      tipo: item.tipo,
      descricao: item.descricao,
      valor: item.valor,
      data_movimento: item.data_movimento,
      ativo: item.ativo
    };
    this.modal.open();
  }

  salvar(): void {
    if (!this.form.tipo || !this.form.data_movimento || this.form.valor === undefined || this.form.valor === null) {
      this.notificacao.warning('Informe tipo, valor e data do movimento.');
      return;
    }

    if (this.editandoId) {
      this.apiService.atualizarMovimentoFinanceiro(this.editandoId, this.form).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Movimento financeiro atualizado.');
          this.carregar();
        },
        error: () => this.notificacao.error('Erro ao atualizar movimento financeiro.')
      });
    } else {
      this.apiService.criarMovimentoFinanceiro(this.form).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Movimento financeiro criado.');
          this.carregar();
        },
        error: () => this.notificacao.error('Erro ao criar movimento financeiro.')
      });
    }
  }

  excluir(id: string): void {
    this.apiService.excluirMovimentoFinanceiro(id).subscribe({
      next: () => {
        this.notificacao.success('Movimento financeiro excluido.');
        this.carregar();
      },
      error: () => this.notificacao.error('Erro ao excluir movimento financeiro.')
    });
  }

  private obterDataHoje(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
