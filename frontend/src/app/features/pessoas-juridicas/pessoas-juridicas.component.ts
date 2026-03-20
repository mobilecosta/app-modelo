import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoFieldModule,
  PoLoadingModule,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoTableColumn,
  PoTableModule
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import {
  Pessoa,
  PessoaAtividadeSecundaria,
  PessoaFormPayload,
  PessoaQsa
} from '../../core/models/types';

@Component({
  selector: 'app-pessoas-juridicas',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoFieldModule,
    PoLoadingModule,
    PoModalModule,
    PoPageModule,
    PoTableModule
  ],
  template: `
    <po-page-default p-title="pessoas_juridicas" [p-actions]="pageActions">
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
      p-size="xl"
      [p-primary-action]="modalPrimary"
      [p-secondary-action]="modalSecondary">
      <div class="crud-modal">
        <div class="crud-modal__hero">
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo cadastro' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Cadastre pessoas juridicas com preenchimento automatico por CNPJ e acompanhe os detalhes de atividades e QSA.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Consulta e identificacao</h4>
            <p class="crud-section__hint">Digite o CNPJ e consulte a ReceitaWS para preencher os dados da pessoa e os grids de detalhe.</p>
            <div class="po-row">
              <po-input
                p-label="CNPJ"
                [(ngModel)]="form.cnpj"
                p-placeholder="00.000.000/0000-00"
                class="po-lg-4"
                (ngModelChange)="onCnpjChange($event)">
              </po-input>
              <div class="po-lg-3 pessoas-juridicas__consulta">
                <po-button
                  p-label="Consultar CNPJ"
                  [p-loading]="consultandoCnpj"
                  [p-disabled]="consultandoCnpj || !cnpjValido"
                  (p-click)="consultarCnpj()">
                </po-button>
              </div>
              <po-input p-label="Nome" [(ngModel)]="form.nome" p-required="true" class="po-lg-5"></po-input>
              <po-input p-label="Fantasia" [(ngModel)]="form.fantasia" class="po-lg-6"></po-input>
              <po-input p-label="Tipo" [(ngModel)]="form.tipo" class="po-lg-3"></po-input>
              <po-input p-label="Porte" [(ngModel)]="form.porte" class="po-lg-3"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Situacao cadastral</h4>
            <p class="crud-section__hint">Esses campos ajudam a acompanhar o enquadramento da empresa e a ultima atualizacao da consulta.</p>
            <div class="po-row">
              <po-input p-label="Abertura" [(ngModel)]="form.abertura" class="po-lg-3"></po-input>
              <po-input p-label="Situacao" [(ngModel)]="form.situacao" class="po-lg-3"></po-input>
              <po-input p-label="Data situacao" [(ngModel)]="form.data_situacao" class="po-lg-3"></po-input>
              <po-input p-label="Status consulta" [(ngModel)]="form.status" class="po-lg-3"></po-input>
              <po-input p-label="Natureza juridica" [(ngModel)]="form.natureza_juridica" class="po-lg-6"></po-input>
              <po-number p-label="Capital social" [(ngModel)]="form.capital_social" class="po-lg-3"></po-number>
              <po-input p-label="Ultima atualizacao" [(ngModel)]="form.ultima_atualizacao" class="po-lg-3"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Contato e endereco</h4>
            <p class="crud-section__hint">Confira os dados principais de localizacao e contato antes de salvar o cadastro.</p>
            <div class="po-row">
              <po-email p-label="Email" [(ngModel)]="form.email" class="po-lg-4"></po-email>
              <po-input p-label="Telefone" [(ngModel)]="form.telefone" class="po-lg-4"></po-input>
              <po-input p-label="EFR" [(ngModel)]="form.efr" class="po-lg-4"></po-input>
              <po-input p-label="CEP" [(ngModel)]="form.cep" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro" [(ngModel)]="form.logradouro" class="po-lg-5"></po-input>
              <po-input p-label="Numero" [(ngModel)]="form.numero" class="po-lg-2"></po-input>
              <po-input p-label="Complemento" [(ngModel)]="form.complemento" class="po-lg-2"></po-input>
              <po-input p-label="Bairro" [(ngModel)]="form.bairro" class="po-lg-4"></po-input>
              <po-input p-label="Municipio" [(ngModel)]="form.municipio" class="po-lg-4"></po-input>
              <po-input p-label="UF" [(ngModel)]="form.uf" class="po-lg-2"></po-input>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-2"></po-switch>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Atividade principal</h4>
            <p class="crud-section__hint">A atividade principal vem da consulta externa e fica armazenada na tabela principal de pessoas.</p>
            <div class="po-row">
              <po-input p-label="Codigo" [(ngModel)]="form.atividade_principal_codigo" class="po-lg-3"></po-input>
              <po-input p-label="Descricao" [(ngModel)]="form.atividade_principal_texto" class="po-lg-9"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">pessoas_atividades_secundarias</h4>
            <p class="crud-section__hint">Edite as atividades secundarias manualmente, alem do retorno da consulta do CNPJ.</p>
            <div class="po-row po-mb-md">
              <po-input p-label="Codigo" [(ngModel)]="atividadeEmEdicao.codigo" class="po-lg-3"></po-input>
              <po-input p-label="Descricao" [(ngModel)]="atividadeEmEdicao.descricao" class="po-lg-7"></po-input>
              <po-number p-label="Ordem" [(ngModel)]="atividadeEmEdicao.ordem" class="po-lg-2"></po-number>
              <div class="po-lg-12 pessoas-juridicas__grid-actions">
                <po-button
                  [p-label]="editandoAtividadeIndex === null ? 'Adicionar atividade' : 'Atualizar atividade'"
                  (p-click)="salvarAtividadeSecundaria()">
                </po-button>
                <po-button
                  p-label="Limpar"
                  p-kind="tertiary"
                  [p-disabled]="editandoAtividadeIndex === null && !atividadeEmEdicao.codigo && !atividadeEmEdicao.descricao"
                  (p-click)="cancelarEdicaoAtividade()">
                </po-button>
              </div>
            </div>
            <po-table
              [p-columns]="colunasAtividades"
              [p-items]="atividadesSecundarias"
              [p-actions]="acoesAtividades">
            </po-table>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">pessoas_qsa</h4>
            <p class="crud-section__hint">Edite o quadro societario e administradores diretamente no formulario.</p>
            <div class="po-row po-mb-md">
              <po-input p-label="Nome" [(ngModel)]="qsaEmEdicao.nome" class="po-lg-4"></po-input>
              <po-input p-label="Qualificacao" [(ngModel)]="qsaEmEdicao.qualificacao" class="po-lg-4"></po-input>
              <po-input p-label="Pais origem" [(ngModel)]="qsaEmEdicao.pais_origem" class="po-lg-4"></po-input>
              <po-input p-label="Representante legal" [(ngModel)]="qsaEmEdicao.nome_rep_legal" class="po-lg-4"></po-input>
              <po-input p-label="Qual. rep. legal" [(ngModel)]="qsaEmEdicao.qual_rep_legal" class="po-lg-4"></po-input>
              <po-number p-label="Ordem" [(ngModel)]="qsaEmEdicao.ordem" class="po-lg-2"></po-number>
              <div class="po-lg-12 pessoas-juridicas__grid-actions">
                <po-button
                  [p-label]="editandoQsaIndex === null ? 'Adicionar QSA' : 'Atualizar QSA'"
                  (p-click)="salvarQsa()">
                </po-button>
                <po-button
                  p-label="Limpar"
                  p-kind="tertiary"
                  [p-disabled]="editandoQsaIndex === null && !qsaEmEdicao.nome && !qsaEmEdicao.qualificacao"
                  (p-click)="cancelarEdicaoQsa()">
                </po-button>
              </div>
            </div>
            <po-table
              [p-columns]="colunasQsa"
              [p-items]="qsa"
              [p-actions]="acoesQsa">
            </po-table>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class PessoasJuridicasComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: Pessoa[] = [];
  atividadesSecundarias: PessoaAtividadeSecundaria[] = [];
  qsa: PessoaQsa[] = [];
  atividadeEmEdicao: Partial<PessoaAtividadeSecundaria> = this.criarAtividadePadrao();
  qsaEmEdicao: Partial<PessoaQsa> = this.criarQsaPadrao();
  carregando = false;
  consultandoCnpj = false;
  editandoId: string | null = null;
  editandoAtividadeIndex: number | null = null;
  editandoQsaIndex: number | null = null;
  modalTitulo = 'Nova pessoa juridica';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;

  form: PessoaFormPayload = this.criarFormPadrao();

  colunas: PoTableColumn[] = [
    { property: 'cnpj', label: 'CNPJ' },
    { property: 'nome', label: 'Nome' },
    { property: 'fantasia', label: 'Fantasia' },
    { property: 'municipio', label: 'Municipio' },
    { property: 'uf', label: 'UF' },
    { property: 'situacao', label: 'Situacao' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  colunasAtividades: PoTableColumn[] = [
    { property: 'ordem', label: '#' },
    { property: 'codigo', label: 'Codigo' },
    { property: 'descricao', label: 'Descricao' }
  ];

  colunasQsa: PoTableColumn[] = [
    { property: 'ordem', label: '#' },
    { property: 'nome', label: 'Nome' },
    { property: 'qualificacao', label: 'Qualificacao' },
    { property: 'pais_origem', label: 'Pais origem' },
    { property: 'nome_rep_legal', label: 'Representante legal' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: Pessoa) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: Pessoa) => this.excluir(item.id) }
  ];

  acoesAtividades = [
    { label: 'Editar', action: (item: PessoaAtividadeSecundaria) => this.editarAtividadeSecundaria(item) },
    { label: 'Excluir', action: (item: PessoaAtividadeSecundaria) => this.removerAtividadeSecundaria(item) }
  ];

  acoesQsa = [
    { label: 'Editar', action: (item: PessoaQsa) => this.editarQsa(item) },
    { label: 'Excluir', action: (item: PessoaQsa) => this.removerQsa(item) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };

  constructor(
    private apiService: ApiService,
    private notificacao: PoNotificationService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  get cnpjValido(): boolean {
    return this.normalizarCnpj(this.form.cnpj).length === 14;
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
        this.notificacao.error('Erro ao carregar pessoas juridicas.');
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
    this.modalTitulo = 'Nova pessoa juridica';
    this.form = this.criarFormPadrao();
    this.atividadesSecundarias = [];
    this.qsa = [];
    this.cancelarEdicaoAtividade();
    this.cancelarEdicaoQsa();
    this.modal.open();
  }

  abrirEditar(item: Pessoa): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar pessoa juridica';
    this.form = this.mapearPessoaParaForm(item);
    this.atividadesSecundarias = item.pessoas_atividades_secundarias ?? [];
    this.qsa = item.pessoas_qsa ?? [];
    this.cancelarEdicaoAtividade();
    this.cancelarEdicaoQsa();
    this.modal.open();
  }

  salvar(): void {
    if (!this.form.nome || !this.cnpjValido) {
      this.notificacao.warning('Informe um CNPJ valido e o nome da pessoa.');
      return;
    }

    const payload = this.montarPayload();

    if (this.editandoId) {
      this.apiService.atualizarPessoa(this.editandoId, payload).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Pessoa juridica atualizada.');
          this.carregar(this.paginaAtual);
        },
        error: () => this.notificacao.error('Erro ao atualizar pessoa juridica.')
      });
      return;
    }

    this.apiService.criarPessoa(payload).subscribe({
      next: () => {
        this.modal.close();
        this.notificacao.success('Pessoa juridica criada.');
        this.carregar(1);
      },
      error: () => this.notificacao.error('Erro ao criar pessoa juridica.')
    });
  }

  excluir(id: string): void {
    this.apiService.excluirPessoa(id).subscribe({
      next: () => {
        this.notificacao.success('Pessoa juridica excluida.');
        this.carregar(this.paginaAtual);
      },
      error: () => this.notificacao.error('Erro ao excluir pessoa juridica.')
    });
  }

  consultarCnpj(): void {
    const cnpj = this.normalizarCnpj(this.form.cnpj);

    if (cnpj.length !== 14) {
      this.notificacao.warning('Informe um CNPJ valido para consultar.');
      return;
    }

    this.consultandoCnpj = true;
    this.apiService.consultarReceitaWs(cnpj).subscribe({
      next: response => {
        this.aplicarRetornoReceita(response.pessoa, response.pessoas_atividades_secundarias, response.pessoas_qsa);
        this.consultandoCnpj = false;
        this.notificacao.success('Dados do CNPJ carregados.');
      },
      error: () => {
        this.consultandoCnpj = false;
        this.notificacao.error('Erro ao consultar o CNPJ na ReceitaWS.');
      }
    });
  }

  onCnpjChange(value: string): void {
    this.form.cnpj = this.formatarCnpj(value);
  }

  salvarAtividadeSecundaria(): void {
    if (!this.atividadeEmEdicao.codigo || !this.atividadeEmEdicao.descricao) {
      this.notificacao.warning('Informe codigo e descricao da atividade secundaria.');
      return;
    }

    const item: PessoaAtividadeSecundaria = {
      codigo: this.atividadeEmEdicao.codigo,
      descricao: this.atividadeEmEdicao.descricao,
      ordem: this.atividadeEmEdicao.ordem ?? this.proximaOrdem(this.atividadesSecundarias)
    };

    if (this.editandoAtividadeIndex === null) {
      this.atividadesSecundarias = [...this.atividadesSecundarias, item];
    } else {
      this.atividadesSecundarias = this.atividadesSecundarias.map((atividade, index) =>
        index === this.editandoAtividadeIndex ? { ...atividade, ...item } : atividade
      );
    }

    this.cancelarEdicaoAtividade();
  }

  editarAtividadeSecundaria(item: PessoaAtividadeSecundaria): void {
    this.editandoAtividadeIndex = this.atividadesSecundarias.indexOf(item);
    this.atividadeEmEdicao = { ...item };
  }

  removerAtividadeSecundaria(item: PessoaAtividadeSecundaria): void {
    const index = this.atividadesSecundarias.indexOf(item);
    this.atividadesSecundarias = this.atividadesSecundarias.filter((_, currentIndex) => currentIndex !== index);

    if (this.editandoAtividadeIndex === index) {
      this.cancelarEdicaoAtividade();
    }
  }

  cancelarEdicaoAtividade(): void {
    this.editandoAtividadeIndex = null;
    this.atividadeEmEdicao = this.criarAtividadePadrao();
  }

  salvarQsa(): void {
    if (!this.qsaEmEdicao.nome) {
      this.notificacao.warning('Informe pelo menos o nome do QSA.');
      return;
    }

    const item: PessoaQsa = {
      nome: this.qsaEmEdicao.nome,
      qualificacao: this.qsaEmEdicao.qualificacao,
      pais_origem: this.qsaEmEdicao.pais_origem,
      nome_rep_legal: this.qsaEmEdicao.nome_rep_legal,
      qual_rep_legal: this.qsaEmEdicao.qual_rep_legal,
      ordem: this.qsaEmEdicao.ordem ?? this.proximaOrdem(this.qsa)
    };

    if (this.editandoQsaIndex === null) {
      this.qsa = [...this.qsa, item];
    } else {
      this.qsa = this.qsa.map((qsaItem, index) =>
        index === this.editandoQsaIndex ? { ...qsaItem, ...item } : qsaItem
      );
    }

    this.cancelarEdicaoQsa();
  }

  editarQsa(item: PessoaQsa): void {
    this.editandoQsaIndex = this.qsa.indexOf(item);
    this.qsaEmEdicao = { ...item };
  }

  removerQsa(item: PessoaQsa): void {
    const index = this.qsa.indexOf(item);
    this.qsa = this.qsa.filter((_, currentIndex) => currentIndex !== index);

    if (this.editandoQsaIndex === index) {
      this.cancelarEdicaoQsa();
    }
  }

  cancelarEdicaoQsa(): void {
    this.editandoQsaIndex = null;
    this.qsaEmEdicao = this.criarQsaPadrao();
  }

  private aplicarRetornoReceita(
    pessoa: PessoaFormPayload,
    atividades: PessoaAtividadeSecundaria[],
    qsa: PessoaQsa[]
  ): void {
    this.form = {
      ...this.form,
      ...pessoa,
      cnpj: this.formatarCnpj(pessoa.cnpj ?? this.form.cnpj ?? ''),
      ativo: pessoa.ativo ?? this.form.ativo ?? true
    };
    this.atividadesSecundarias = atividades ?? [];
    this.qsa = qsa ?? [];
  }

  private montarPayload(): PessoaFormPayload {
    return {
      ...this.form,
      cnpj: this.normalizarCnpj(this.form.cnpj),
      atividades_secundarias: this.atividadesSecundarias.map((item, index) => ({
        codigo: item.codigo,
        descricao: item.descricao,
        ordem: item.ordem ?? index
      })),
      qsa: this.qsa.map((item, index) => ({
        nome: item.nome,
        qualificacao: item.qualificacao,
        pais_origem: item.pais_origem,
        nome_rep_legal: item.nome_rep_legal,
        qual_rep_legal: item.qual_rep_legal,
        ordem: item.ordem ?? index
      }))
    };
  }

  private mapearPessoaParaForm(item: Pessoa): PessoaFormPayload {
    return {
      ...item,
      cnpj: this.formatarCnpj(item.cnpj),
      atividades_secundarias: item.pessoas_atividades_secundarias ?? [],
      qsa: item.pessoas_qsa ?? []
    };
  }

  private criarFormPadrao(): PessoaFormPayload {
    return {
      ativo: true,
      atividades_secundarias: [],
      qsa: []
    };
  }

  private criarAtividadePadrao(): Partial<PessoaAtividadeSecundaria> {
    return {
      codigo: '',
      descricao: ''
    };
  }

  private criarQsaPadrao(): Partial<PessoaQsa> {
    return {
      nome: '',
      qualificacao: '',
      pais_origem: '',
      nome_rep_legal: '',
      qual_rep_legal: ''
    };
  }

  private proximaOrdem<T extends { ordem?: number }>(itens: T[]): number {
    if (!itens.length) {
      return 0;
    }

    return Math.max(...itens.map(item => item.ordem ?? 0)) + 1;
  }

  private normalizarCnpj(valor?: string): string {
    return (valor ?? '').replace(/\D/g, '');
  }

  private formatarCnpj(valor?: string): string {
    const digits = this.normalizarCnpj(valor);

    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (digits.length <= 8) return digits.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    if (digits.length <= 12) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');

    return digits
      .slice(0, 14)
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  }
}
