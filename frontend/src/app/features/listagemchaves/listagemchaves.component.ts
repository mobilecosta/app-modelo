import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoFieldModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoSelectOption,
  PoTableColumn,
  PoTableModule
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { EmpresaCertificado, ListagemChave } from '../../core/models/types';

@Component({
  selector: 'app-listagemchaves',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoFieldModule,
    PoPageModule,
    PoTableModule
  ],
  template: `
    <po-page-default p-title="listagemchaves" [p-actions]="pageActions">
      <section class="crud-section po-mb-md">
        <h4 class="crud-section__title">Filtros validados por empresascertificados</h4>
        <p class="crud-section__hint">Selecione uma empresa com certificado ativo para consultar e filtrar as chaves.</p>
        <div class="po-row">
          <po-select
            p-label="Empresa (CNPJ)"
            [ngModel]="empresaSelecionadaId"
            (ngModelChange)="onEmpresaChange($event)"
            [p-options]="opcoesEmpresas"
            class="po-lg-4">
          </po-select>

          <po-input
            p-label="CNPJ selecionado"
            [ngModel]="filtroCnpj"
            p-disabled="true"
            class="po-lg-3">
          </po-input>

          <po-input
            p-label="Chave de acesso"
            [(ngModel)]="filtroChaveAcesso"
            p-placeholder="44 digitos"
            class="po-lg-5">
          </po-input>

          <po-datepicker
            p-label="Data inicial"
            [(ngModel)]="dataInicioConsulta"
            class="po-lg-3">
          </po-datepicker>

          <po-datepicker
            p-label="Data final"
            [(ngModel)]="dataFimConsulta"
            class="po-lg-3">
          </po-datepicker>

          <div class="po-lg-6 listagemchaves__actions">
            <po-button p-label="Filtrar" (p-click)="carregar(1)"></po-button>
            <po-button
              p-label="Buscar chaves na SEFAZ"
              [p-loading]="buscandoSefaz"
              [p-disabled]="buscandoSefaz || !filtroCnpj || !dataInicioConsulta || !dataFimConsulta"
              (p-click)="buscarChavesNaSefaz()">
            </po-button>
          </div>
        </div>
      </section>

      <po-table
        [p-columns]="colunas"
        [p-items]="itens"
        [p-loading]="carregando">
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
  `,
  styles: [`
    .listagemchaves__actions {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      flex-wrap: wrap;
    }
  `]
})
export class ListagemchavesComponent implements OnInit {
  itens: ListagemChave[] = [];
  empresas: EmpresaCertificado[] = [];
  opcoesEmpresas: PoSelectOption[] = [];
  empresaSelecionadaId = '';
  filtroCnpj = '';
  filtroChaveAcesso = '';
  dataInicioConsulta = '';
  dataFimConsulta = '';

  carregando = false;
  buscandoSefaz = false;
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;

  colunas: PoTableColumn[] = [
    { property: 'cnpj', label: 'CNPJ' },
    { property: 'chave_acesso', label: 'Chave de acesso' },
    { property: 'data_emissao', label: 'Data emissao' },
    { property: 'valor_total', label: 'Valor total', type: 'currency' },
    { property: 'situacao', label: 'Situacao' },
    { property: 'created_at', label: 'Criado em' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Atualizar lista', icon: 'ph ph-arrows-clockwise', action: () => this.carregar(this.paginaAtual) }
  ];

  constructor(
    private apiService: ApiService,
    private notificacao: PoNotificationService
  ) {}

  ngOnInit(): void {
    this.carregarEmpresas();
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarListagemChaves(page, this.pageSize, {
      cnpj: this.filtroCnpj || undefined,
      chave_acesso: this.normalizarChaveAcesso(this.filtroChaveAcesso) || undefined
    }).subscribe({
      next: (res) => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: (erro) => {
        this.carregando = false;
        const mensagem = erro?.error?.message || 'Erro ao carregar listagemchaves.';
        this.notificacao.error(mensagem);
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

  onEmpresaChange(empresaId: string): void {
    this.empresaSelecionadaId = empresaId;
    const empresa = this.empresas.find((item) => item.id === empresaId);
    this.filtroCnpj = empresa ? this.normalizarCnpj(empresa.cnpj) : '';
    this.carregar(1);
  }

  buscarChavesNaSefaz(): void {
    if (!this.filtroCnpj) {
      this.notificacao.warning('Selecione uma empresa valida em empresascertificados.');
      return;
    }

    if (!this.validarDataIso(this.dataInicioConsulta) || !this.validarDataIso(this.dataFimConsulta)) {
      this.notificacao.warning('Informe data inicial e final no formato YYYY-MM-DD.');
      return;
    }

    this.buscandoSefaz = true;
    this.apiService.buscarChavesSefaz({
      cnpj: this.filtroCnpj,
      data_inicio: this.dataInicioConsulta,
      data_fim: this.dataFimConsulta
    }).subscribe({
      next: (res) => {
        this.buscandoSefaz = false;
        this.notificacao.success(`${res.totalEncontradas} chave(s) processada(s) da SEFAZ.`);
        this.carregar(1);
      },
      error: (erro) => {
        this.buscandoSefaz = false;
        const mensagem = erro?.error?.message || 'Erro ao buscar chaves na SEFAZ.';
        this.notificacao.error(mensagem);
      }
    });
  }

  private carregarEmpresas(): void {
    this.apiService.listarEmpresasCertificados(1, 200).subscribe({
      next: (res) => {
        this.empresas = (res.items ?? []).filter((item) => item.ativo);
        this.opcoesEmpresas = this.empresas.map((item) => ({
          label: item.cnpj,
          value: item.id
        }));
      },
      error: () => {
        this.notificacao.error('Erro ao carregar empresascertificados para filtro.');
      }
    });
  }

  private normalizarCnpj(valor?: string): string {
    return (valor ?? '').replace(/\D/g, '');
  }

  private normalizarChaveAcesso(valor?: string): string {
    return (valor ?? '').replace(/\s/g, '');
  }

  private validarDataIso(value?: string): boolean {
    if (!value) {
      return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }
}
