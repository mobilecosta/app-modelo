import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoFieldModule,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoSelectOption,
  PoTableColumn,
  PoTableModule
} from '@po-ui/ng-components';
import { Campo, Pessoa, PessoaFormPayload } from '../../core/models/types';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-pessoas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PoButtonModule,
    PoFieldModule,
    PoModalModule,
    PoPageModule,
    PoTableModule
  ],
  template: `
    <po-page-default p-title="pessoas" [p-actions]="pageActions">
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

    <po-modal
      #modal
      [p-title]="modalTitulo"
      p-size="lg"
      [p-primary-action]="modalPrimary"
      [p-secondary-action]="modalSecondary">
      <div class="crud-modal">
        <div class="crud-modal__hero">
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo registro' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Formulario dinamico carregado a partir do dicionario de campos da tabela pessoas.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Dados da Pessoa</h4>
            <div class="po-row">
              <ng-container *ngFor="let campo of camposFormulario">
                <ng-container [ngSwitch]="campo.tipo">
                  <po-input
                    *ngSwitchCase="'text'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    [p-maxlength]="getMaxLength(campo)"
                    class="po-lg-4">
                  </po-input>

                  <po-number
                    *ngSwitchCase="'number'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-number>

                  <po-switch
                    *ngSwitchCase="'boolean'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    class="po-lg-4">
                  </po-switch>

                  <po-datepicker
                    *ngSwitchCase="'date'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-datepicker>

                  <po-input
                    *ngSwitchCase="'datetime'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-input>

                  <po-select
                    *ngSwitchCase="'select'"
                    [p-label]="campo.label"
                    [ngModel]="form[campo.nome]"
                    (ngModelChange)="form[campo.nome] = $event"
                    [p-options]="getOpcoesCampo(campo)"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-select>

                  <po-textarea
                    *ngSwitchCase="'textarea'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="campo.obrigatorio"
                    [p-maxlength]="getMaxLength(campo)"
                    [p-rows]="3"
                    class="po-lg-12">
                  </po-textarea>

                  <po-email
                    *ngSwitchCase="'email'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-email>

                  <po-password
                    *ngSwitchCase="'password'"
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    class="po-lg-4">
                  </po-password>

                  <po-input
                    *ngSwitchDefault
                    [p-label]="campo.label"
                    [(ngModel)]="form[campo.nome]"
                    [p-required]="getRequired(campo)"
                    [p-maxlength]="getMaxLength(campo)"
                    class="po-lg-4">
                  </po-input>
                </ng-container>
              </ng-container>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class PessoasComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Pessoa[] = [];
  camposFormulario: Campo[] = [];
  colunas: PoTableColumn[] = [
    { property: 'cnpj', label: 'CNPJ' },
    { property: 'nome', label: 'Nome' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];
  carregando = false;
  carregandoCampos = false;
  editandoId: string | null = null;
  modalTitulo = 'Nova pessoa';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;
  tabelaPessoasId: string | null = null;

  form: Record<string, unknown> = {};
  private opcoesCampoMap = new Map<string, PoSelectOption[]>();

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Pessoa) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Pessoa) => this.excluir(item.id) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };

  constructor(
    private apiService: ApiService,
    private notificacao: PoNotificationService
  ) {}

  ngOnInit(): void {
    this.carregarConfiguracao();
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarPessoas(page, this.pageSize).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar pessoas.');
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
    this.modalTitulo = 'Nova pessoa';
    this.form = this.criarFormPadrao();
    this.modal.open();
  }

  abrirEditar(item: Pessoa): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar pessoa';
    this.form = this.mapearItemParaFormulario(item);
    this.modal.open();
  }

  salvar(): void {
    if (!this.validarObrigatorios()) {
      return;
    }

    const payload = this.montarPayload();

    if (this.editandoId) {
      this.apiService.atualizarPessoa(this.editandoId, payload).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Pessoa atualizada.');
          this.carregar(this.paginaAtual);
        },
        error: () => this.notificacao.error('Erro ao atualizar pessoa.')
      });
      return;
    }

    this.apiService.criarPessoa(payload).subscribe({
      next: () => {
        this.modal.close();
        this.notificacao.success('Pessoa criada.');
        this.carregar(1);
      },
      error: () => this.notificacao.error('Erro ao criar pessoa.')
    });
  }

  excluir(id: string): void {
    this.apiService.excluirPessoa(id).subscribe({
      next: () => {
        this.notificacao.success('Pessoa excluida.');
        this.carregar(this.paginaAtual);
      },
      error: () => this.notificacao.error('Erro ao excluir pessoa.')
    });
  }

  getOpcoesCampo(campo: Campo): PoSelectOption[] {
    return this.opcoesCampoMap.get(campo.nome) ?? [];
  }

  getRequired(campo: Campo): string {
    return campo.obrigatorio ? 'true' : 'false';
  }

  getMaxLength(campo: Campo): number {
    return campo.tamanho_maximo ?? 255;
  }

  private carregarConfiguracao(): void {
    this.carregandoCampos = true;
    this.apiService.listarTabelas(1, 200).subscribe({
      next: res => {
        const tabelaPessoas = (res.items ?? []).find(t => t.nome === 'pessoas');

        if (!tabelaPessoas) {
          this.carregandoCampos = false;
          this.notificacao.warning('Tabela pessoas nao encontrada no dicionario.');
          return;
        }

        this.tabelaPessoasId = tabelaPessoas.id;
        this.carregarCamposPessoas(tabelaPessoas.id);
      },
      error: () => {
        this.carregandoCampos = false;
        this.notificacao.error('Erro ao carregar configuracao da tabela pessoas.');
      }
    });
  }

  private carregarCamposPessoas(tabelaId: string): void {
    this.apiService.listarCampos(1, 200, tabelaId).subscribe({
      next: res => {
        const campos = (res.items ?? [])
          .filter(campo => campo.ativo)
          .sort((a, b) => a.ordem - b.ordem);

        this.camposFormulario = campos;
        this.opcoesCampoMap.clear();

        campos.forEach(campo => {
          this.opcoesCampoMap.set(campo.nome, this.converterOpcoesCampo(campo.opcoes));
        });

        this.colunas = this.montarColunasTabela(campos);
        this.form = this.criarFormPadrao();
        this.carregandoCampos = false;
      },
      error: () => {
        this.carregandoCampos = false;
        this.notificacao.error('Erro ao carregar campos da tabela pessoas.');
      }
    });
  }

  private montarColunasTabela(campos: Campo[]): PoTableColumn[] {
    const camposPreferenciais = ['cnpj', 'nome', 'fantasia', 'municipio', 'uf', 'situacao', 'ativo'];
    const mapa = new Map(campos.map(campo => [campo.nome, campo]));

    const selecionados = camposPreferenciais
      .map(nome => mapa.get(nome))
      .filter((campo): campo is Campo => !!campo);

    if (!selecionados.length) {
      selecionados.push(...campos.slice(0, 6));
    }

    return selecionados.map(campo => ({
      property: campo.nome,
      label: campo.label,
      type: campo.tipo === 'boolean' ? 'boolean' : undefined
    }));
  }

  private criarFormPadrao(): Record<string, unknown> {
    const form: Record<string, unknown> = {};

    this.camposFormulario.forEach(campo => {
      form[campo.nome] = this.resolverValorPadrao(campo);
    });

    if (form['ativo'] === undefined) {
      form['ativo'] = true;
    }

    return form;
  }

  private resolverValorPadrao(campo: Campo): unknown {
    if (campo.valor_padrao !== undefined && campo.valor_padrao !== null && campo.valor_padrao !== '') {
      if (campo.tipo === 'number') {
        const numero = Number(campo.valor_padrao);
        return Number.isNaN(numero) ? null : numero;
      }

      if (campo.tipo === 'boolean') {
        const valor = String(campo.valor_padrao).toLowerCase();
        return valor === 'true' || valor === '1' || valor === 't' || valor === 'sim';
      }

      return campo.valor_padrao;
    }

    if (campo.tipo === 'boolean') {
      return false;
    }

    return '';
  }

  private mapearItemParaFormulario(item: Pessoa): Record<string, unknown> {
    const form = this.criarFormPadrao();

    this.camposFormulario.forEach(campo => {
      form[campo.nome] = (item as unknown as Record<string, unknown>)[campo.nome] ?? form[campo.nome];
    });

    return form;
  }

  private validarObrigatorios(): boolean {
    const campoFaltante = this.camposFormulario.find(campo => {
      if (!campo.obrigatorio) {
        return false;
      }

      const valor = this.form[campo.nome];

      if (campo.tipo === 'boolean') {
        return valor === undefined || valor === null;
      }

      if (campo.tipo === 'number') {
        return valor === undefined || valor === null || valor === '';
      }

      return String(valor ?? '').trim() === '';
    });

    if (campoFaltante) {
      this.notificacao.warning(`Campo obrigatorio: ${campoFaltante.label}`);
      return false;
    }

    return true;
  }

  private montarPayload(): PessoaFormPayload {
    const payload: Record<string, unknown> = {};

    this.camposFormulario.forEach(campo => {
      let valor = this.form[campo.nome];

      if (campo.tipo === 'number') {
        if (valor === '' || valor === null || valor === undefined) {
          valor = null;
        } else {
          const numero = Number(valor);
          valor = Number.isNaN(numero) ? null : numero;
        }
      }

      if (campo.tipo === 'boolean') {
        valor = Boolean(valor);
      }

      if (campo.nome === 'cnpj' && typeof valor === 'string') {
        valor = valor.replace(/\D/g, '');
      }

      if (campo.tipo !== 'boolean' && campo.tipo !== 'number' && typeof valor === 'string') {
        valor = valor.trim();
      }

      payload[campo.nome] = valor;
    });

    return payload as unknown as PessoaFormPayload;
  }

  private converterOpcoesCampo(opcoes?: string): PoSelectOption[] {
    if (!opcoes) {
      return [];
    }

    try {
      const parsed = JSON.parse(opcoes) as Array<{ label?: string; value?: unknown } | string>;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((opcao, index) => {
        if (typeof opcao === 'string') {
          return { label: opcao, value: opcao };
        }

        const label = opcao.label ?? String(opcao.value ?? `Opcao ${index + 1}`);
        const value = typeof opcao.value === 'number' || typeof opcao.value === 'string'
          ? opcao.value
          : label;
        return { label, value };
      });
    } catch {
      return [];
    }
  }
}
