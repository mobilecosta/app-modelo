import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule, PoFieldModule, PoModalModule, PoModalComponent,
  PoNotificationService, PoPageModule, PoTableModule, PoTableColumn,
  PoPageAction, PoSelectOption
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { Campo, Tabela } from '../../core/models/types';

@Component({
  selector: 'app-campos',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoModalModule, PoPageModule, PoTableModule],
  template: `
    <po-page-default p-title="Campos (Dicionario)" [p-actions]="pageActions">
      <div class="po-row po-mb-md">
        <po-select
          class="po-lg-4"
          p-label="Filtrar por Tabela"
          [p-options]="opcoesTabelas"
          [ngModel]="tabelaSelecionada"
          (ngModelChange)="tabelaSelecionada = $event"
          (p-change)="carregar()">
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
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo campo' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Estruture cada atributo com contexto, configuracao e comportamento bem separados.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Vinculo</h4>
            <p class="crud-section__hint">Associe o campo a uma tabela para manter o dicionario consistente desde a criacao.</p>
            <div class="po-row">
              <po-select
                p-label="Tabela"
                p-placeholder="Selecione a tabela"
                [ngModel]="form.tabela_id"
                (ngModelChange)="form.tabela_id = $event"
                [p-options]="opcoesTabelas"
                p-required="true"
                class="po-lg-12">
              </po-select>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Identificacao</h4>
            <p class="crud-section__hint">Use um nome tecnico claro e um rotulo amigavel para o usuario final.</p>
            <div class="po-row">
              <po-input
                p-label="Nome"
                p-placeholder="Nome tecnico do campo"
                [(ngModel)]="form.nome"
                p-required="true"
                p-help="Nome do campo no banco de dados, sem espacos."
                class="po-lg-6">
              </po-input>
              <po-input
                p-label="Label"
                p-placeholder="Rotulo exibido ao usuario"
                [(ngModel)]="form.label"
                p-required="true"
                class="po-lg-6">
              </po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Configuracao</h4>
            <p class="crud-section__hint">Ajuste tipo, tamanho e valores auxiliares para orientar o comportamento do campo.</p>
            <div class="po-row">
              <po-select
                p-label="Tipo"
                p-placeholder="Selecione o tipo"
                [ngModel]="form.tipo"
                (ngModelChange)="form.tipo = $event"
                [p-options]="opcoesTipo"
                p-required="true"
                class="po-lg-4">
              </po-select>
              <po-number
                p-label="Tamanho Maximo"
                p-placeholder="ex: 255"
                [(ngModel)]="form.tamanho_maximo"
                class="po-lg-4">
              </po-number>
              <po-number
                p-label="Ordem"
                p-placeholder="ex: 1"
                [(ngModel)]="form.ordem"
                class="po-lg-4">
              </po-number>
              <po-input
                p-label="Valor Padrao"
                p-placeholder="Valor preenchido automaticamente"
                [(ngModel)]="form.valor_padrao"
                class="po-lg-6">
              </po-input>
              <po-input
                p-label="Opcoes (JSON)"
                p-placeholder='ex: [{"label":"Sim","value":"S"}]'
                [(ngModel)]="form.opcoes"
                p-help="Utilizado apenas para campos do tipo Selecao."
                class="po-lg-6">
              </po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Regras de uso</h4>
            <p class="crud-section__hint">Defina se o preenchimento sera obrigatorio e se o campo ficara disponivel.</p>
            <div class="po-row">
              <po-switch p-label="Obrigatorio" [(ngModel)]="form.obrigatorio" class="po-lg-6"></po-switch>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-6"></po-switch>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class CamposComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Campo[] = [];
  tabelas: Tabela[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo Campo';
  tabelaSelecionada: string | undefined;
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;

  form: Partial<Campo> = { obrigatorio: false, ordem: 0, ativo: true };

  opcoesTabelas: PoSelectOption[] = [];

  opcoesTipo: PoSelectOption[] = [
    { label: 'Texto', value: 'text' },
    { label: 'Numero', value: 'number' },
    { label: 'Booleano', value: 'boolean' },
    { label: 'Data', value: 'date' },
    { label: 'Data/Hora', value: 'datetime' },
    { label: 'Selecao', value: 'select' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Email', value: 'email' },
    { label: 'Senha', value: 'password' }
  ];

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome' },
    { property: 'label', label: 'Label' },
    { property: 'tipo', label: 'Tipo' },
    { property: 'obrigatorio', label: 'Obrigatorio', type: 'boolean' },
    { property: 'ordem', label: 'Ordem' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Campo) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Campo) => this.excluir(item.id) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };

  constructor(private apiService: ApiService, private notificacao: PoNotificationService) {}

  ngOnInit(): void {
    this.apiService.listarTabelas(1, 100).subscribe({
      next: res => {
        this.tabelas = res.items ?? [];
        this.opcoesTabelas = this.tabelas.map(t => ({ label: t.nome, value: t.id }));
      }
    });
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarCampos(page, this.pageSize, this.tabelaSelecionada).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar campos.');
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
    this.modalTitulo = 'Novo Campo';
    this.form = { obrigatorio: false, ordem: 0, ativo: true };
    this.modal.open();
  }

  abrirEditar(item: Campo): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar Campo';
    this.form = { ...item };
    this.modal.open();
  }

  salvar(): void {
    if (this.editandoId) {
      this.apiService.atualizarCampo(this.editandoId, this.form).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Campo atualizado.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao atualizar campo.')
      });
    } else {
      this.apiService.criarCampo(this.form).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Campo criado.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao criar campo.')
      });
    }
  }

  excluir(id: string): void {
    this.apiService.excluirCampo(id).subscribe({
      next: () => { this.notificacao.success('Campo excluido.'); this.carregar(); },
      error: () => this.notificacao.error('Erro ao excluir campo.')
    });
  }
}
