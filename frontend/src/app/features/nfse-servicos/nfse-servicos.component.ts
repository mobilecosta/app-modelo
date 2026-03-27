import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoDividerModule,
  PoFieldModule,
  PoModalComponent,
  PoModalModule,
  PoNotificationService,
  PoPageAction,
  PoPageModule,
  PoSelectOption,
  PoTableColumn,
  PoTableModule,
  PoTabsModule
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { NfseServico } from '../../core/models/types';
import { CTribNacLookupService } from './nfse-ctribnac-lookup.service';

@Component({
  selector: 'app-nfse-servicos',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoDividerModule,
    PoFieldModule,
    PoModalModule,
    PoPageModule,
    PoTableModule,
    PoTabsModule
  ],
  template: `
    <po-page-default p-title="nfse_servicos" [p-actions]="pageActions">
      <div class="po-row po-mb-md">
        <po-input
          class="po-lg-4"
          p-label="Filtrar por referencia"
          [(ngModel)]="filtroReferencia"
          (keyup.enter)="carregar()">
        </po-input>
        <div class="po-lg-2 nfse-servicos__filter-action">
          <po-button p-label="Buscar" (p-click)="carregar()"></po-button>
        </div>
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

    <po-modal
      #modal
      [p-title]="modalTitulo"
      p-size="xl"
      [p-primary-action]="modalPrimary"
      [p-secondary-action]="modalSecondary">
      <div class="crud-modal">
        <div class="crud-modal__hero">
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo registro' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Receba e mantenha os dados principais da NFS-e em uma estrutura unica e direta de operar.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Campos obrigatorios</h4>
            <p class="crud-section__hint">Preencha os campos essenciais para emissao da NFS-e.</p>
            <div class="po-row">
              <po-datepicker p-label="Data e Hora de Emissao" [(ngModel)]="form.infDPS_dhEmi" p-required="true" class="po-lg-3"></po-datepicker>
              <po-input p-label="Prestador CNPJ" [(ngModel)]="form.infDPS_prest_CNPJ" [p-required]="!form.infDPS_prest_CPF ? 'true' : 'false'" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Prestador CPF" [(ngModel)]="form.infDPS_prest_CPF" [p-required]="!form.infDPS_prest_CNPJ ? 'true' : 'false'" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CNPJ" [(ngModel)]="form.infDPS_toma_CNPJ" [p-required]="!form.infDPS_toma_CPF ? 'true' : 'false'" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CPF" [(ngModel)]="form.infDPS_toma_CPF" [p-required]="!form.infDPS_toma_CNPJ ? 'true' : 'false'" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Nome/Razao" [(ngModel)]="form.infDPS_toma_xNome" p-required="true" class="po-lg-6"></po-input>
              <po-input p-label="Municipio de Prestacao" [(ngModel)]="form.infDPS_serv_locPrest_cLocPrestacao" p-required="true" class="po-lg-3"></po-input>
              <po-lookup
                p-label="Cod. Tributacao Nacional"
                [p-filter-service]="cTribNacLookupService"
                [ngModel]="form.infDPS_serv_cServ_cTribNac"
                (ngModelChange)="atualizarCodigoCTribNac($event)"
                [p-required]="true"
                p-field-label="descricao"
                p-field-value="codigo"
                class="po-lg-3">
              </po-lookup>
              <po-input p-label="Cod. Tributacao Municipal" [(ngModel)]="form.infDPS_serv_cServ_cTribMun" p-required="true" class="po-lg-3"></po-input>
              <po-textarea
                p-label="Descricao do Servico"
                [(ngModel)]="form.infDPS_serv_cServ_xDescServ"
                [p-required]="true"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
              <po-select
                p-label="Natureza da Operacao"
                [ngModel]="form.infDPS_serv_cServ_cNatOp"
                (ngModelChange)="form.infDPS_serv_cServ_cNatOp = $event"
                [p-options]="opcoesCNatOp"
                [p-required]="true"
                class="po-lg-3">
              </po-select>
              <po-select
                p-label="Situacao Tributaria"
                [ngModel]="form.infDPS_serv_cServ_cSitTrib"
                (ngModelChange)="form.infDPS_serv_cServ_cSitTrib = $event"
                [p-options]="opcoesCsitTrib"
                [p-required]="true"
                class="po-lg-3">
              </po-select>
              <po-decimal p-label="Valor Servico" [(ngModel)]="form.infDPS_valores_vServPrest_vServ" p-required="true" class="po-lg-3"></po-decimal>
              <po-select
                p-label="Tributacao ISSQN"
                [ngModel]="form.infDPS_valores_trib_tribMun_tribISSQN"
                (ngModelChange)="form.infDPS_valores_trib_tribMun_tribISSQN = $event"
                [p-options]="opcoesTribISSQN"
                p-required="true"
                class="po-lg-3">
              </po-select>
              <po-decimal p-label="Valor Liquido" [(ngModel)]="form.infDPS_valores_trib_tribMun_vLiq" p-required="true" class="po-lg-3"></po-decimal>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `
})
export class NfseServicosComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: NfseServico[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo NFS-e Servico';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;
  filtroReferencia = '';
  jsonItensPedido = '';
  jsonDocDedRed = '';
  jsonDocumentosIbscbs = '';
  jsonRefsNfse = '';

  form: Partial<NfseServico> = this.criarFormPadrao();

  opcoesProvedor: PoSelectOption[] = [
    { label: 'Padrao', value: 'padrao' }
  ];

  opcoesAmbiente: PoSelectOption[] = [
    { label: 'Homologacao', value: 'homologacao' },
    { label: 'Producao', value: 'producao' }
  ];

  opcoesTpAmb: PoSelectOption[] = [
    { label: '1 - Producao', value: 1 },
    { label: '2 - Homologacao', value: 2 }
  ];

  opcoesMotivoEmisTI: PoSelectOption[] = [
    { label: '1 - Prestador optou por emitir pelo tomador/interm.', value: 1 },
    { label: '2 - Tomador/interm. obrigado a emitir', value: 2 }
  ];

  opcoesRegEspTrib: PoSelectOption[] = [
    { label: '0 - Nenhum', value: 0 },
    { label: '1 - Micro Empresa Municipal', value: 1 },
    { label: '2 - Estimativa', value: 2 },
    { label: '3 - Sociedade de Profissionais', value: 3 },
    { label: '4 - Cooperativa', value: 4 },
    { label: '5 - Micro Empresa EPP (Simples Nacional)', value: 5 },
    { label: '6 - Micro Empresa EPP (fixo)', value: 6 },
    { label: '7 - Produtor Rural Pessoa Fisica', value: 7 }
  ];

  opcoesCNatOp: PoSelectOption[] = [
    { label: '1 - Tributacao no municipio', value: '1' },
    { label: '2 - Tributacao fora do municipio', value: '2' },
    { label: '3 - Isencao', value: '3' },
    { label: '4 - Imune', value: '4' },
    { label: '5 - Exigibilidade suspensa por decisao judicial', value: '5' },
    { label: '6 - Exigibilidade suspensa por proc. administrativo', value: '6' }
  ];

  opcoesCsitTrib: PoSelectOption[] = [
    { label: 'N - Normal', value: 'N' },
    { label: 'R - Retido', value: 'R' },
    { label: 'S - Substituido', value: 'S' },
    { label: 'I - Isento', value: 'I' }
  ];

  opcoesTribISSQN: PoSelectOption[] = [
    { label: '1 - Tributavel', value: 1 },
    { label: '2 - Exigibilidade Suspensa - Judicial', value: 2 },
    { label: '3 - Exigibilidade Suspensa - Adm.', value: 3 },
    { label: '4 - Exportacao de Servico', value: 4 },
    { label: '5 - Imune', value: 5 },
    { label: '6 - Isenta', value: 6 },
    { label: '7 - Nao Incidencia no municipio', value: 7 },
    { label: '8 - Nao Tributavel', value: 8 }
  ];

  opcoesTpImunidade: PoSelectOption[] = [
    { label: '1 - Patrimonio, renda ou servicos dos entes politicos', value: 1 },
    { label: '2 - Entidades de assistencia social', value: 2 },
    { label: '3 - Partidos politicos e fundacoes', value: 3 },
    { label: '4 - Entidades sindicais dos trabalhadores', value: 4 },
    { label: '5 - Instituicoes de educacao e assistencia social', value: 5 }
  ];

  opcoesTpSusp: PoSelectOption[] = [
    { label: '1 - Decisao judicial', value: 1 },
    { label: '2 - Procedimento administrativo', value: 2 }
  ];

  opcoesTpBM: PoSelectOption[] = [
    { label: '1 - Beneficio Municipal', value: 1 },
    { label: '2 - Reducao da base de calculo', value: 2 },
    { label: '3 - Desconto incondicional', value: 3 }
  ];

  opcoesTpRetISSQN: PoSelectOption[] = [
    { label: '1 - Retencao Normal', value: 1 },
    { label: '2 - Retencao Substituicao Tributaria', value: 2 },
    { label: '3 - Retencao por Indicacao do Prestador', value: 3 }
  ];

  opcoesTpRetPisCofins: PoSelectOption[] = [
    { label: '0 - Sem Retencao', value: 0 },
    { label: '1 - Retencao na Fonte', value: 1 }
  ];

  opcoesFinNFSe: PoSelectOption[] = [
    { label: '1 - Normal', value: 1 },
    { label: '2 - Complementar', value: 2 },
    { label: '3 - Ajuste', value: 3 },
    { label: '4 - Substituicao', value: 4 }
  ];

  opcoesSimNao: PoSelectOption[] = [
    { label: '1 - Sim', value: 1 },
    { label: '0 - Nao', value: 0 }
  ];

  opcoesTpOper: PoSelectOption[] = [
    { label: '1 - Prestacao de servico a estabelecimento no pais', value: 1 },
    { label: '2 - Prestacao de servico a consumidor final no pais', value: 2 },
    { label: '3 - Exportacao de servico', value: 3 },
    { label: '4 - Importacao de servico', value: 4 }
  ];

  opcoesTpEnteGov: PoSelectOption[] = [
    { label: '1 - Uniao', value: 1 },
    { label: '2 - Estado', value: 2 },
    { label: '3 - Municipio', value: 3 }
  ];

  opcoesIndDest: PoSelectOption[] = [
    { label: '1 - Dentro do estado de origem', value: 1 },
    { label: '2 - Fora do estado de origem', value: 2 },
    { label: '3 - Exterior', value: 3 }
  ];

  opcoesMdPrestacao: PoSelectOption[] = [
    { label: '1 - Importacao', value: 1 },
    { label: '2 - Exportacao', value: 2 }
  ];

  opcoesVincPrest: PoSelectOption[] = [
    { label: '0 - Sem vinculo', value: 0 },
    { label: '1 - Servico prestado a pessoa vinculada', value: 1 }
  ];

  colunas: PoTableColumn[] = [
    { property: 'provedor', label: 'Provedor' },
    { property: 'ambiente', label: 'Ambiente' },
    { property: 'referencia', label: 'Referencia' },
    { property: 'infDPS_dCompet', label: 'Competencia' },
    { property: 'infDPS_dhEmi', label: 'Emissao' },
    { property: 'infDPS_toma_CNPJ', label: 'Tomador CNPJ' },
    { property: 'infDPS_toma_xNome', label: 'Tomador' },
    { property: 'infDPS_prest_CNPJ', label: 'Prestador CNPJ' },
    { property: 'infDPS_serv_cServ_cTribMun', label: 'Cod. Servico' },
    { property: 'infDPS_serv_cServ_xDescServ', label: 'Descricao Servico' },
    { property: 'infDPS_valores_vServPrest_vServ', label: 'Valor Servico' },
    { property: 'infDPS_valores_trib_tribMun_vISSQN', label: 'Valor ISSQN' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() },
    { label: 'Enviar Nfse', icon: 'ph ph-paper-plane-tilt', action: () => this.enviarNfseDaLista() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: NfseServico) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: NfseServico) => this.excluir(item.id) }
  ];

  modalPrimary = { label: 'Salvar', action: () => this.salvar() };
  modalSecondary = { label: 'Cancelar', action: () => this.modal.close() };
  private readonly payloadFixoEnvioNfse = {
    ambiente: 'homologacao',
    referencia: 'NF-2026-001',
    infDPS: {
      serie: 'NF',
      nDPS: '1',
      dhEmi: '2026-03-21T10:00:00-03:00',
      dCompet: '2026-03-21',
      tpAmb: 2,
      prest: {
        CNPJ: '12345678000195',
        regTrib: {
          opSimpNac: 1,
          regEspTrib: 0
        },
        IM: '123456',
        xNome: 'Empresa Prestadora de Servicos Ltda'
      },
      toma: {
        CNPJ: '98765432000100',
        xNome: 'Empresa Tomadora S.A.',
        end: {
          xLgr: 'Avenida Paulista',
          nro: '1000',
          xCpl: 'Sala 201',
          xBairro: 'Bela Vista',
          cMun: 3550308,
          xMun: 'Sao Paulo',
          CEP: '01310100',
          cPais: 1058,
          xPais: 'Brasil',
          UF: 'SP'
        },
        fone: '1131234567',
        email: 'financeiro@tomadora.com.br'
      },
      serv: {
        cServ: {
          cTribNac: '010600',
          cTribMun: '010600',
          CNAE: '6201500',
          xDescServ: 'Desenvolvimento e manutencao de sistemas de software'
        },
        xDescServ: 'Desenvolvimento de sistema web conforme contrato n 001/2026',
        cMunPrestacao: 3550308
      },
      valores: {
        vServPrest: {
          vServ: 5000.00,
          vReceb: 5000.00
        },
        trib: {
          tribMun: {
            tribISSQN: 1,
            cLocIncid: 3550308,
            cPaisResult: 1058,
            BM: {
              cBM: '001',
              xBM: 'Beneficio Municipal'
            },
            tpRetISSQN: 1,
            aliqISSQN: 2.00,
            vISSQN: 100.00,
            tpEncISSQN: 3
          },
          totTrib: {
            qTotTribSer: 2.00,
            vTotTrib: 100.00
          }
        },
        vDesc: 0.00,
        vOutDed: 0.00,
        vLiq: 5000.00
      }
    }
  };

  constructor(
    private apiService: ApiService,
    public cTribNacLookupService: CTribNacLookupService,
    private notificacao: PoNotificationService
  ) { }

  ngOnInit(): void {
    this.carregar();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.pageSize));
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarNfseServicos(page, this.pageSize, this.filtroReferencia || undefined).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar nfse_servicos.');
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
    this.modalTitulo = 'Novo NFS-e Servico';
    this.form = this.criarFormPadrao();
    this.jsonItensPedido = '';
    this.jsonDocDedRed = '';
    this.jsonDocumentosIbscbs = '';
    this.jsonRefsNfse = '';
    this.modal.open();
  }

  abrirEditar(item: NfseServico): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar NFS-e Servico';
    this.form = { ...item };
    this.modal.open();
  }

  salvar(): void {
    const payload = this.montarPayload();

    if (this.editandoId) {
      this.apiService.atualizarNfseServico(this.editandoId, payload).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('NFS-e servico atualizado.');
          this.carregar(this.paginaAtual);
        },
        error: () => this.notificacao.error('Erro ao atualizar nfse_servico.')
      });
      return;
    }

    this.apiService.criarNfseServico(payload).subscribe({
      next: () => {
        this.modal.close();
        this.notificacao.success('NFS-e servico criado.');
        this.carregar();
      },
      error: () => this.notificacao.error('Erro ao criar nfse_servico.')
    });
  }

  excluir(id: string): void {
    this.apiService.excluirNfseServico(id).subscribe({
      next: () => {
        this.notificacao.success('NFS-e servico excluido.');
        this.carregar(this.paginaAtual);
      },
      error: () => this.notificacao.error('Erro ao excluir nfse_servico.')
    });
  }

  enviarNfse(): void {
    this.apiService.enviarNfseServico(this.payloadFixoEnvioNfse).subscribe({
      next: () => {
        this.notificacao.success(`NFSe enviada para a referencia "${this.payloadFixoEnvioNfse.referencia}".`);
      },
      error: (erro) => {
        const detalhe = erro?.error?.error;
        const mensagemErro = typeof detalhe === 'string'
          ? detalhe
          : erro?.error?.message || 'Erro ao enviar NFSe.';
        this.notificacao.error(mensagemErro);
      }
    });
  }

  private enviarNfseDaLista(): void {
    this.enviarNfse();
  }

  atualizarCodigoCTribNac(valor: unknown): void {
    this.form.infDPS_serv_cServ_cTribNac = this.extrairCodigoCTribNac(valor);
  }

  private extrairCodigoCTribNac(valor: unknown): string {
    if (typeof valor === 'string') {
      return valor;
    }

    if (valor && typeof valor === 'object' && 'codigo' in valor) {
      return String((valor as { codigo: unknown }).codigo ?? '');
    }

    return '';
  }

  private montarPayload(): Partial<NfseServico> {
    return {
      ...this.form,
      infDPS_serv_cServ_cTribNac: this.extrairCodigoCTribNac(this.form.infDPS_serv_cServ_cTribNac)
    };
  }

  private parseJson(valor: string): unknown {
    const conteudo = valor.trim();

    if (!conteudo) {
      return null;
    }

    try {
      return JSON.parse(conteudo);
    } catch {
      this.notificacao.warning('Um dos campos JSON nao esta valido. O conteudo foi enviado como texto.');
      return conteudo;
    }
  }

  private stringifyJson(valor: unknown): string {
    if (valor === undefined || valor === null || valor === '') {
      return '';
    }

    if (typeof valor === 'string') {
      return valor;
    }

    return JSON.stringify(valor, null, 2);
  }

  private criarFormPadrao(): Partial<NfseServico> {
    return {
      provedor: 'padrao',
      ambiente: 'homologacao',
      infDPS_toma_orgaoPublico: false,
      ativo: true,
      // Campos decimais - inicializados com 0
      infDPS_valores_vServPrest_vReceb: 0,
      infDPS_valores_vServPrest_vServ: 0,
    };
  }
}

