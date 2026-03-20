import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule, PoFieldModule, PoModalModule, PoModalComponent,
  PoNotificationService, PoPageModule, PoTableModule, PoTableColumn,
  PoPageAction
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { Tabela } from '../../core/models/types';

@Component({
  selector: 'app-tabelas',
  standalone: true,
  imports: [FormsModule, PoButtonModule, PoFieldModule, PoModalModule, PoPageModule, PoTableModule],
  template: `
    <po-page-default p-title="Tabelas (Dicionario)" [p-actions]="pageActions">
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
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Nova estrutura' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Cadastre a base do dicionario com um preenchimento mais guiado e facil de revisar.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Identificacao tecnica</h4>
            <p class="crud-section__hint">Esses dados representam a tabela no banco e ajudam a manter o catalogo organizado.</p>
            <div class="po-row">
              <po-input
                p-label="Nome"
                p-placeholder="Nome da tabela no banco de dados"
                [(ngModel)]="form.nome"
                p-required="true"
                p-help="Nome tecnico da tabela, sem espacos."
                class="po-lg-8">
              </po-input>
              <po-input
                p-label="Schema"
                p-placeholder="ex: public"
                [(ngModel)]="form.schema_nome"
                p-help="Schema do banco de dados. Padrao: public."
                class="po-lg-4">
              </po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Contexto</h4>
            <p class="crud-section__hint">Use uma descricao curta para facilitar entendimento por quem consultar o dicionario depois.</p>
            <div class="po-row">
              <po-textarea
                p-label="Descricao"
                p-placeholder="Descreva o proposito desta tabela"
                [(ngModel)]="form.descricao"
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
export class TabelasComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Tabela[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Nova Tabela';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;

  form: Partial<Tabela> = { schema_nome: 'public', ativo: true };

  colunas: PoTableColumn[] = [
    { property: 'nome', label: 'Nome' },
    { property: 'schema_nome', label: 'Schema' },
    { property: 'descricao', label: 'Descricao' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Nova', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Tabela) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Tabela) => this.excluir(item.id) }
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
    this.apiService.listarTabelas(page, this.pageSize).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar tabelas.');
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
    this.modalTitulo = 'Nova Tabela';
    this.form = { schema_nome: 'public', ativo: true };
    this.modal.open();
  }

  abrirEditar(item: Tabela): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar Tabela';
    this.form = { nome: item.nome, descricao: item.descricao, schema_nome: item.schema_nome, ativo: item.ativo };
    this.modal.open();
  }

  salvar(): void {
    if (this.editandoId) {
      this.apiService.atualizarTabela(this.editandoId, this.form).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Tabela atualizada.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao atualizar tabela.')
      });
    } else {
      this.apiService.criarTabela(this.form).subscribe({
        next: () => { this.modal.close(); this.notificacao.success('Tabela criada.'); this.carregar(); },
        error: () => this.notificacao.error('Erro ao criar tabela.')
      });
    }
  }

  excluir(id: string): void {
    this.apiService.excluirTabela(id).subscribe({
      next: () => { this.notificacao.success('Tabela excluida.'); this.carregar(); },
      error: () => this.notificacao.error('Erro ao excluir tabela.')
    });
  }
}
