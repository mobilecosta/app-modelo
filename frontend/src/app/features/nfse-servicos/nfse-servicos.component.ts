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
import { ApiService } from '../../core/services/api.service';
import { NfseServico } from '../../core/models/types';

@Component({
  selector: 'app-nfse-servicos',
  standalone: true,
  imports: [
    FormsModule,
    PoButtonModule,
    PoFieldModule,
    PoModalModule,
    PoPageModule,
    PoTableModule
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
            <h4 class="crud-section__title">Selecao e Enum</h4>
            <p class="crud-section__hint">Campos categorizados na documentacao como enum ou codigos de classificacao com preenchimento controlado.</p>
            <div class="po-row">
              <po-select
                p-label="Provedor"
                [ngModel]="form.provedor"
                (ngModelChange)="form.provedor = $event"
                [p-options]="opcoesProvedor"
                class="po-lg-3">
              </po-select>
              <po-select
                p-label="Ambiente"
                [ngModel]="form.ambiente"
                (ngModelChange)="form.ambiente = $event"
                [p-options]="opcoesAmbiente"
                class="po-lg-3">
              </po-select>
              <po-number p-label="tpAmb" [(ngModel)]="form.infDPS_tpAmb" class="po-lg-3"></po-number>
              <po-number p-label="Reg. Especial Tributario" [(ngModel)]="form.infDPS_prest_regTrib_regEspTrib" class="po-lg-3"></po-number>
              <po-number p-label="Motivo Emissao TI" [(ngModel)]="form.infDPS_cMotivoEmisTI" class="po-lg-3"></po-number>
              <po-number p-label="Modo Prestacao" [(ngModel)]="form.infDPS_serv_comExt_mdPrestacao" class="po-lg-3"></po-number>
              <po-number p-label="Vinc. Prestacao" [(ngModel)]="form.infDPS_serv_comExt_vincPrest" class="po-lg-3"></po-number>
              <po-number p-label="Mov. Temp. Bens" [(ngModel)]="form.infDPS_serv_comExt_movTempBens" class="po-lg-3"></po-number>
              <po-number p-label="MDIC" [(ngModel)]="form.infDPS_serv_comExt_mdic" class="po-lg-3"></po-number>
              <po-number p-label="LSADPPU Categoria" [(ngModel)]="form.infDPS_serv_lsadppu_categ" class="po-lg-3"></po-number>
              <po-number p-label="LSADPPU Objeto" [(ngModel)]="form.infDPS_serv_lsadppu_objeto" class="po-lg-3"></po-number>
              <po-number p-label="Trib. ISSQN" [(ngModel)]="form.infDPS_valores_trib_tribMun_tribISSQN" class="po-lg-3"></po-number>
              <po-number p-label="Tipo Imunidade" [(ngModel)]="form.infDPS_valores_trib_tribMun_tpImunidade" class="po-lg-3"></po-number>
              <po-number p-label="Tipo Ret. ISSQN" [(ngModel)]="form.infDPS_valores_trib_tribMun_tpRetISSQN" class="po-lg-3"></po-number>
              <po-number p-label="Ind. Total Trib." [(ngModel)]="form.infDPS_valores_trib_totTrib_indTotTrib" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS Fin NFSe" [(ngModel)]="form.infDPS_IBSCBS_finNFSe" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS Ind. Final" [(ngModel)]="form.infDPS_IBSCBS_indFinal" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS Tp Oper" [(ngModel)]="form.infDPS_IBSCBS_tpOper" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS Tp Ente Gov" [(ngModel)]="form.infDPS_IBSCBS_tpEnteGov" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS Ind. Dest" [(ngModel)]="form.infDPS_IBSCBS_indDest" class="po-lg-3"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Datas e Horarios</h4>
            <p class="crud-section__hint">Campos temporais da documentacao mantidos em formato texto ou data para facilitar a recepcao do payload.</p>
            <div class="po-row">
              <po-input p-label="Data/Hora Emissao" [(ngModel)]="form.infDPS_dhEmi" class="po-lg-4"></po-input>
              <po-input p-label="Competencia" [(ngModel)]="form.infDPS_dCompet" class="po-lg-4"></po-input>
              <po-input p-label="Ativ. Evento Dt. Inicio" [(ngModel)]="form.infDPS_serv_atvEvento_dtIni" class="po-lg-4"></po-input>
              <po-input p-label="Ativ. Evento Dt. Fim" [(ngModel)]="form.infDPS_serv_atvEvento_dtFim" class="po-lg-4"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Textos e Identificadores</h4>
            <p class="crud-section__hint">Campos textuais, documentos e identificadores recebidos da documentacao da DPS.</p>
            <div class="po-row">
              <po-input p-label="Referencia" [(ngModel)]="form.referencia" class="po-lg-3"></po-input>
              <po-input p-label="Versao Aplicacao" [(ngModel)]="form.infDPS_verAplic" class="po-lg-3"></po-input>
              <po-input p-label="Chave NFSe Rejeitada" [(ngModel)]="form.infDPS_chNFSeRej" class="po-lg-3"></po-input>
              <po-input p-label="Substituida" [(ngModel)]="form.infDPS_subst_chSubstda" class="po-lg-3"></po-input>
              <po-input p-label="Subst. Codigo Motivo" [(ngModel)]="form.infDPS_subst_cMotivo" class="po-lg-4"></po-input>
              <po-input p-label="Subst. Motivo" [(ngModel)]="form.infDPS_subst_xMotivo" class="po-lg-8"></po-input>
              <po-input p-label="Prestador CNPJ" [(ngModel)]="form.infDPS_prest_CNPJ" class="po-lg-3"></po-input>
              <po-input p-label="Prestador CPF" [(ngModel)]="form.infDPS_prest_CPF" class="po-lg-3"></po-input>
              <po-input p-label="Pessoa ID" [(ngModel)]="form.infDPS_toma_pessoa_id" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CNPJ" [(ngModel)]="form.infDPS_toma_CNPJ" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CPF" [(ngModel)]="form.infDPS_toma_CPF" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Nome" [(ngModel)]="form.infDPS_toma_xNome" class="po-lg-6"></po-input>
              <po-email p-label="Tomador Email" [(ngModel)]="form.infDPS_toma_email" class="po-lg-3"></po-email>
              <po-input p-label="Tomador Fone" [(ngModel)]="form.infDPS_toma_fone" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Municipio" [(ngModel)]="form.infDPS_toma_end_endNac_cMun" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CEP" [(ngModel)]="form.infDPS_toma_end_endNac_CEP" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Logradouro" [(ngModel)]="form.infDPS_toma_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tomador Numero" [(ngModel)]="form.infDPS_toma_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Intermediario CNPJ" [(ngModel)]="form.infDPS_interm_CNPJ" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario CPF" [(ngModel)]="form.infDPS_interm_CPF" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario Nome" [(ngModel)]="form.infDPS_interm_xNome" class="po-lg-6"></po-input>
              <po-input p-label="Cod. Trib. Nacional" [(ngModel)]="form.infDPS_serv_cServ_cTribNac" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Trib. Municipal" [(ngModel)]="form.infDPS_serv_cServ_cTribMun" class="po-lg-3"></po-input>
              <po-input p-label="CNAE" [(ngModel)]="form.infDPS_serv_cServ_CNAE" class="po-lg-3"></po-input>
              <po-input p-label="NBS" [(ngModel)]="form.infDPS_serv_cServ_cNBS" class="po-lg-3"></po-input>
              <po-input p-label="Natureza Operacao" [(ngModel)]="form.infDPS_serv_cServ_cNatOp" class="po-lg-3"></po-input>
              <po-input p-label="Situacao Tributaria" [(ngModel)]="form.infDPS_serv_cServ_cSitTrib" class="po-lg-3"></po-input>
              <po-input p-label="Tipo Moeda" [(ngModel)]="form.infDPS_serv_comExt_tpMoeda" class="po-lg-3"></po-input>
              <po-input p-label="Numero DI" [(ngModel)]="form.infDPS_serv_comExt_nDI" class="po-lg-3"></po-input>
              <po-input p-label="Numero RE" [(ngModel)]="form.infDPS_serv_comExt_nRE" class="po-lg-3"></po-input>
              <po-input p-label="IBSCBS cIndOp" [(ngModel)]="form.infDPS_IBSCBS_cIndOp" class="po-lg-3"></po-input>
              <po-textarea
                p-label="Descricao do Servico"
                [(ngModel)]="form.infDPS_serv_cServ_xDescServ"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
              <po-textarea
                p-label="Informacao Complementar"
                [(ngModel)]="form.infDPS_serv_infoCompl_xInfComp"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Campos Numericos</h4>
            <p class="crud-section__hint">Campos numericos da documentacao, incluindo valores, aliquotas e indicadores quantitativos.</p>
            <div class="po-row">
              <po-number p-label="Valor Servico Moeda" [(ngModel)]="form.infDPS_serv_comExt_vServMoeda" class="po-lg-3"></po-number>
              <po-number p-label="Valor Recebido" [(ngModel)]="form.infDPS_valores_vServPrest_vReceb" class="po-lg-3"></po-number>
              <po-number p-label="Valor Servico" [(ngModel)]="form.infDPS_valores_vServPrest_vServ" class="po-lg-3"></po-number>
              <po-number p-label="Desc. Incond." [(ngModel)]="form.infDPS_valores_vDescCondIncond_vDescIncond" class="po-lg-3"></po-number>
              <po-number p-label="Desc. Cond." [(ngModel)]="form.infDPS_valores_vDescCondIncond_vDescCond" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Ded./Red." [(ngModel)]="form.infDPS_valores_vDedRed_pDR" class="po-lg-3"></po-number>
              <po-number p-label="Valor Ded./Red." [(ngModel)]="form.infDPS_valores_vDedRed_vDR" class="po-lg-3"></po-number>
              <po-number p-label="Aliquota ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_pAliq" class="po-lg-3"></po-number>
              <po-number p-label="Base ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_vBC" class="po-lg-3"></po-number>
              <po-number p-label="Valor ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_vISSQN" class="po-lg-3"></po-number>
              <po-number p-label="Valor Liquido" [(ngModel)]="form.infDPS_valores_trib_tribMun_vLiq" class="po-lg-3"></po-number>
              <po-number p-label="PIS/COFINS Base" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vBCPisCofins" class="po-lg-3"></po-number>
              <po-number p-label="Aliq. PIS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_pAliqPis" class="po-lg-3"></po-number>
              <po-number p-label="Aliq. COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_pAliqCofins" class="po-lg-3"></po-number>
              <po-number p-label="Valor PIS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vPis" class="po-lg-3"></po-number>
              <po-number p-label="Valor COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vCofins" class="po-lg-3"></po-number>
              <po-number p-label="Ret. CP" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetCP" class="po-lg-3"></po-number>
              <po-number p-label="Ret. IRRF" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetIRRF" class="po-lg-3"></po-number>
              <po-number p-label="Ret. CSLL" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetCSLL" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Fed." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribFed" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Est." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribEst" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Mun." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribMun" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Tot. SN" [(ngModel)]="form.infDPS_valores_trib_totTrib_pTotTribSN" class="po-lg-3"></po-number>
              <po-number p-label="IBSCBS pDifUF" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifUF" class="po-lg-4"></po-number>
              <po-number p-label="IBSCBS pDifMun" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifMun" class="po-lg-4"></po-number>
              <po-number p-label="IBSCBS pDifCBS" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifCBS" class="po-lg-4"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Booleanos</h4>
            <p class="crud-section__hint">Campos booleanos identificados na documentacao e controles do cadastro.</p>
            <div class="po-row">
              <po-switch p-label="Orgao Publico" [(ngModel)]="form.infDPS_toma_orgaoPublico" class="po-lg-6"></po-switch>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-6"></po-switch>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Estruturados JSON</h4>
            <p class="crud-section__hint">Listas e grupos complexos da documentacao mantidos como JSON para preservar a estrutura original.</p>
            <div class="po-row">
              <po-textarea
                p-label="Itens do Pedido (JSON)"
                [(ngModel)]="jsonItensPedido"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Documentos Deducao (JSON)"
                [(ngModel)]="jsonDocDedRed"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Documentos IBS/CBS (JSON)"
                [(ngModel)]="jsonDocumentosIbscbs"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Referencias NFSe (JSON)"
                [(ngModel)]="jsonRefsNfse"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
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

  colunas: PoTableColumn[] = [
    { property: 'referencia', label: 'Referencia' },
    { property: 'ambiente', label: 'Ambiente' },
    { property: 'infDPS_toma_xNome', label: 'Tomador' },
    { property: 'infDPS_prest_CNPJ', label: 'Prestador CNPJ' },
    { property: 'infDPS_serv_cServ_xDescServ', label: 'Descricao' },
    { property: 'infDPS_valores_vServPrest_vServ', label: 'Valor Servico' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: NfseServico) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: NfseServico) => this.excluir(item.id) }
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
    this.jsonItensPedido = this.stringifyJson(item.infDPS_serv_infoCompl_gItemPed_xItemPed);
    this.jsonDocDedRed = this.stringifyJson(item.infDPS_valores_vDedRed_documentos_docDedRed);
    this.jsonDocumentosIbscbs = this.stringifyJson(item.infDPS_IBSCBS_valores_gReeRepRes_documentos);
    this.jsonRefsNfse = this.stringifyJson(item.infDPS_IBSCBS_gRefNFSe_refNFSe);
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

  private montarPayload(): Partial<NfseServico> {
    return {
      ...this.form,
      infDPS_serv_infoCompl_gItemPed_xItemPed: this.parseJson(this.jsonItensPedido),
      infDPS_valores_vDedRed_documentos_docDedRed: this.parseJson(this.jsonDocDedRed),
      infDPS_IBSCBS_valores_gReeRepRes_documentos: this.parseJson(this.jsonDocumentosIbscbs),
      infDPS_IBSCBS_gRefNFSe_refNFSe: this.parseJson(this.jsonRefsNfse)
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
      ativo: true
    };
  }
}
