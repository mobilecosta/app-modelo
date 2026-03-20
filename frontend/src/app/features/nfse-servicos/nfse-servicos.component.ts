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
    PoDividerModule,
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
            <h4 class="crud-section__title">Raiz + infDPS</h4>
            <p class="crud-section__hint">Campos do nivel principal do JSON e atributos diretos do objeto infDPS.</p>
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
              <po-input p-label="Referencia" [(ngModel)]="form.referencia" class="po-lg-3"></po-input>
              <po-number p-label="Tipo de Ambiente" [(ngModel)]="form.infDPS_tpAmb" class="po-lg-3"></po-number>
              <po-input p-label="Data e Hora de Emissao" [(ngModel)]="form.infDPS_dhEmi" class="po-lg-3"></po-input>
              <po-input p-label="Versao do Aplicativo" [(ngModel)]="form.infDPS_verAplic" class="po-lg-3"></po-input>
              <po-input p-label="Data de Competencia" [(ngModel)]="form.infDPS_dCompet" class="po-lg-3"></po-input>
              <po-number p-label="Motivo Emissao Tomador/Interm." [(ngModel)]="form.infDPS_cMotivoEmisTI" class="po-lg-3"></po-number>
              <po-input p-label="Chave da NFS-e Rejeitada" [(ngModel)]="form.infDPS_chNFSeRej" class="po-lg-3"></po-input>
              <po-switch p-label="Ativo" [(ngModel)]="form.ativo" class="po-lg-3"></po-switch>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.subst</h4>
            <p class="crud-section__hint">Campos do bloco de substituicao 'infDPS.subst'.</p>
            <div class="po-row">
              <po-input p-label="Chave da NFS-e Substituida" [(ngModel)]="form.infDPS_subst_chSubstda" class="po-lg-4"></po-input>
              <po-input p-label="Cod. Motivo de Substituicao" [(ngModel)]="form.infDPS_subst_cMotivo" class="po-lg-4"></po-input>
              <po-input p-label="Descricao do Motivo" [(ngModel)]="form.infDPS_subst_xMotivo" class="po-lg-4"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.prest</h4>
            <p class="crud-section__hint">Campos do prestador e do bloco 'regTrib'.</p>
            <div class="po-row">
              <po-input p-label="Prestador CNPJ" [(ngModel)]="form.infDPS_prest_CNPJ" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Prestador CPF" [(ngModel)]="form.infDPS_prest_CPF" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-number p-label="Regime Especial de Tributacao" [(ngModel)]="form.infDPS_prest_regTrib_regEspTrib" class="po-lg-3"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.toma</h4>
            <p class="crud-section__hint">Campos do tomador, incluindo identificacao, contato e endereco.</p>
            <div class="po-row">
              <po-input p-label="ID do Tomador" [(ngModel)]="form.infDPS_toma_pessoa_id" class="po-lg-3"></po-input>
              <po-switch p-label="Orgao Publico" [(ngModel)]="form.infDPS_toma_orgaoPublico" class="po-lg-3"></po-switch>
              <po-input p-label="Tomador CNPJ" [(ngModel)]="form.infDPS_toma_CNPJ" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Tomador CPF" [(ngModel)]="form.infDPS_toma_CPF" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-input p-label="Tomador NIF" [(ngModel)]="form.infDPS_toma_NIF" class="po-lg-3"></po-input>
              <po-number p-label="Tomador Cod. Nao NIF" [(ngModel)]="form.infDPS_toma_cNaoNIF" class="po-lg-3"></po-number>
              <po-input p-label="Tomador CAEPF" [(ngModel)]="form.infDPS_toma_CAEPF" class="po-lg-3"></po-input>
              <po-input p-label="Tomador IM" [(ngModel)]="form.infDPS_toma_IM" class="po-lg-3"></po-input>
              <po-input p-label="Tomador IE" [(ngModel)]="form.infDPS_toma_IE" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Nome/Razao" [(ngModel)]="form.infDPS_toma_xNome" class="po-lg-6"></po-input>
              <po-input p-label="Municipio (Tomador)" [(ngModel)]="form.infDPS_toma_end_endNac_cMun" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Tomador)" [(ngModel)]="form.infDPS_toma_end_endNac_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Pais Exterior (Tomador)" [(ngModel)]="form.infDPS_toma_end_endExt_cPais" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal (Tomador)" [(ngModel)]="form.infDPS_toma_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Tomador)" [(ngModel)]="form.infDPS_toma_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Tomador)" [(ngModel)]="form.infDPS_toma_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Tomador)" [(ngModel)]="form.infDPS_toma_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logradouro (Tomador)" [(ngModel)]="form.infDPS_toma_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Tomador)" [(ngModel)]="form.infDPS_toma_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Tomador)" [(ngModel)]="form.infDPS_toma_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Tomador)" [(ngModel)]="form.infDPS_toma_end_xBairro" class="po-lg-3"></po-input>
              <po-input p-label="Tomador Fone" [(ngModel)]="form.infDPS_toma_fone" class="po-lg-3"></po-input>
              <po-email p-label="Tomador Email" [(ngModel)]="form.infDPS_toma_email" class="po-lg-3"></po-email>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.interm</h4>
            <p class="crud-section__hint">Campos do intermediario, com identificacao, contato e endereco.</p>
            <div class="po-row">
              <po-input p-label="Intermediario CNPJ" [(ngModel)]="form.infDPS_interm_CNPJ" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario CPF" [(ngModel)]="form.infDPS_interm_CPF" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario NIF" [(ngModel)]="form.infDPS_interm_NIF" class="po-lg-3"></po-input>
              <po-number p-label="Intermed. Cod. Nao NIF" [(ngModel)]="form.infDPS_interm_cNaoNIF" class="po-lg-3"></po-number>
              <po-input p-label="Intermediario CAEPF" [(ngModel)]="form.infDPS_interm_CAEPF" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario IM" [(ngModel)]="form.infDPS_interm_IM" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario IE" [(ngModel)]="form.infDPS_interm_IE" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario Nome/Razao" [(ngModel)]="form.infDPS_interm_xNome" class="po-lg-6"></po-input>
              <po-input p-label="Municipio (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endNac_cMun" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endNac_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Pais Ext. (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endExt_cPais" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Intermediario)" [(ngModel)]="form.infDPS_interm_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Intermediario)" [(ngModel)]="form.infDPS_interm_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logra. (Intermediario)" [(ngModel)]="form.infDPS_interm_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Intermediario)" [(ngModel)]="form.infDPS_interm_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Intermediario)" [(ngModel)]="form.infDPS_interm_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Intermediario)" [(ngModel)]="form.infDPS_interm_end_xBairro" class="po-lg-3"></po-input>
              <po-input p-label="Intermediario Fone" [(ngModel)]="form.infDPS_interm_fone" class="po-lg-3"></po-input>
              <po-email p-label="Intermediario Email" [(ngModel)]="form.infDPS_interm_email" class="po-lg-3"></po-email>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.serv</h4>
            <p class="crud-section__hint">Campos dos blocos 'locPrest', 'cServ', 'comExt', 'lsadppu', 'explRod' e 'infoCompl'.</p>
            <div class="po-row">
              <po-input p-label="Municipio de Prestacao" [(ngModel)]="form.infDPS_serv_locPrest_cLocPrestacao" class="po-lg-3"></po-input>
              <po-input p-label="Pais de Prestacao" [(ngModel)]="form.infDPS_serv_locPrest_cPaisPrestacao" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Tributacao Nacional" [(ngModel)]="form.infDPS_serv_cServ_cTribNac" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Tributacao Municipal" [(ngModel)]="form.infDPS_serv_cServ_cTribMun" class="po-lg-3"></po-input>
              <po-input p-label="CNAE" [(ngModel)]="form.infDPS_serv_cServ_CNAE" class="po-lg-3"></po-input>
              <po-input p-label="NBS" [(ngModel)]="form.infDPS_serv_cServ_cNBS" class="po-lg-3"></po-input>
              <po-input p-label="Natureza da Operacao" [(ngModel)]="form.infDPS_serv_cServ_cNatOp" class="po-lg-3"></po-input>
              <po-input p-label="Situacao Tributaria" [(ngModel)]="form.infDPS_serv_cServ_cSitTrib" class="po-lg-3"></po-input>
              <po-number p-label="Modo de Prestacao (Comex)" [(ngModel)]="form.infDPS_serv_comExt_mdPrestacao" class="po-lg-3"></po-number>
              <po-number p-label="Vinculo Prestacional" [(ngModel)]="form.infDPS_serv_comExt_vincPrest" class="po-lg-3"></po-number>
              <po-input p-label="Tipo de Moeda" [(ngModel)]="form.infDPS_serv_comExt_tpMoeda" class="po-lg-3"></po-input>
              <po-number p-label="Valor Servico (Moeda Ext.)" [(ngModel)]="form.infDPS_serv_comExt_vServMoeda" class="po-lg-3"></po-number>
              <po-input p-label="Mec. Apoio (Prestador)" [(ngModel)]="form.infDPS_serv_comExt_mecAFComexP" class="po-lg-3"></po-input>
              <po-input p-label="Mec. Apoio (Tomador)" [(ngModel)]="form.infDPS_serv_comExt_mecAFComexT" class="po-lg-3"></po-input>
              <po-number p-label="Movimentacao Temp. Bens" [(ngModel)]="form.infDPS_serv_comExt_movTempBens" class="po-lg-3"></po-number>
              <po-input p-label="Numero DI" [(ngModel)]="form.infDPS_serv_comExt_nDI" class="po-lg-3"></po-input>
              <po-input p-label="Numero RE" [(ngModel)]="form.infDPS_serv_comExt_nRE" class="po-lg-3"></po-input>
              <po-number p-label="MDIC" [(ngModel)]="form.infDPS_serv_comExt_mdic" class="po-lg-3"></po-number>
              <po-number p-label="Categoria (LSADPPU)" [(ngModel)]="form.infDPS_serv_lsadppu_categ" class="po-lg-3"></po-number>
              <po-number p-label="Objeto (LSADPPU)" [(ngModel)]="form.infDPS_serv_lsadppu_objeto" class="po-lg-3"></po-number>
              <po-input p-label="Extensao (LSADPPU)" [(ngModel)]="form.infDPS_serv_lsadppu_extensao" class="po-lg-3"></po-input>
              <po-input p-label="Numero de Postes" [(ngModel)]="form.infDPS_serv_lsadppu_nPostes" class="po-lg-3"></po-input>
              <po-input p-label="Categ. Veiculo (Pedagio)" [(ngModel)]="form.infDPS_serv_explRod_categVeic" class="po-lg-3"></po-input>
              <po-input p-label="Numero de Eixos" [(ngModel)]="form.infDPS_serv_explRod_nEixos" class="po-lg-3"></po-input>
              <po-number p-label="Rodagem" [(ngModel)]="form.infDPS_serv_explRod_rodagem" class="po-lg-3"></po-number>
              <po-input p-label="Sentido" [(ngModel)]="form.infDPS_serv_explRod_sentido" class="po-lg-3"></po-input>
              <po-input p-label="Placa" [(ngModel)]="form.infDPS_serv_explRod_placa" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Acesso (Pedagio)" [(ngModel)]="form.infDPS_serv_explRod_codAcessoPed" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Contrato (Pedagio)" [(ngModel)]="form.infDPS_serv_explRod_codContrato" class="po-lg-3"></po-input>
              <po-input p-label="ID Doc. Tecnico" [(ngModel)]="form.infDPS_serv_infoCompl_idDocTec" class="po-lg-3"></po-input>
              <po-input p-label="Documento Referencia" [(ngModel)]="form.infDPS_serv_infoCompl_docRef" class="po-lg-3"></po-input>
              <po-input p-label="Numero do Pedido" [(ngModel)]="form.infDPS_serv_infoCompl_xPed" class="po-lg-3"></po-input>
              <po-textarea
                p-label="Descricao do Servico"
                [(ngModel)]="form.infDPS_serv_cServ_xDescServ"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
              <po-textarea
                p-label="Informacoes Complementares"
                [(ngModel)]="form.infDPS_serv_infoCompl_xInfComp"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Obra</h4>
            <p class="crud-section__hint">Campos de obra.</p>
            <div class="po-row">
              <po-input p-label="Insc. Imob. Fisc. (Obra)" [(ngModel)]="form.infDPS_serv_obra_inscImobFisc" class="po-lg-3"></po-input>
              <po-input p-label="Codigo da Obra" [(ngModel)]="form.infDPS_serv_obra_cObra" class="po-lg-3"></po-input>
              <po-input p-label="CIB da Obra" [(ngModel)]="form.infDPS_serv_obra_cCIB" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal Ext. (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logra. (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Obra)" [(ngModel)]="form.infDPS_serv_obra_end_xBairro" class="po-lg-3"></po-input>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.serv.atvEvento</h4>
            <p class="crud-section__hint">Campos de evento.</p>
            <div class="po-row">
              <po-input p-label="Nome do Evento" [(ngModel)]="form.infDPS_serv_atvEvento_xNome" class="po-lg-4"></po-input>
              <po-input p-label="ID Ativ. do Evento" [(ngModel)]="form.infDPS_serv_atvEvento_idAtvEvt" class="po-lg-4"></po-input>
              <po-input p-label="ID do Evento" [(ngModel)]="form.infDPS_serv_atvEvento_id" class="po-lg-4"></po-input>
              <po-input p-label="Data Inic. do Evento" [(ngModel)]="form.infDPS_serv_atvEvento_dtIni" class="po-lg-3"></po-input>
              <po-input p-label="Data Fim do Evento" [(ngModel)]="form.infDPS_serv_atvEvento_dtFim" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal Ext. (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logra. (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Evento)" [(ngModel)]="form.infDPS_serv_atvEvento_end_xBairro" class="po-lg-3"></po-input>
              <po-textarea
                p-label="Descricao do Evento"
                [(ngModel)]="form.infDPS_serv_atvEvento_desc"
                [p-rows]="3"
                class="po-lg-12">
              </po-textarea>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.valores</h4>
            <p class="crud-section__hint">Campos dos blocos 'vServPrest', 'vDescCondIncond', 'vDedRed' e 'trib'.</p>
            <div class="po-row">
              <po-number p-label="Valor Recebido" [(ngModel)]="form.infDPS_valores_vServPrest_vReceb" class="po-lg-3"></po-number>
              <po-number p-label="Valor Servico" [(ngModel)]="form.infDPS_valores_vServPrest_vServ" class="po-lg-3"></po-number>
              <po-number p-label="Desc. Incond." [(ngModel)]="form.infDPS_valores_vDescCondIncond_vDescIncond" class="po-lg-3"></po-number>
              <po-number p-label="Desc. Cond." [(ngModel)]="form.infDPS_valores_vDescCondIncond_vDescCond" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Ded./Red." [(ngModel)]="form.infDPS_valores_vDedRed_pDR" class="po-lg-3"></po-number>
              <po-number p-label="Valor Ded./Red." [(ngModel)]="form.infDPS_valores_vDedRed_vDR" class="po-lg-3"></po-number>
              <po-number p-label="Tributacao ISSQN" [(ngModel)]="form.infDPS_valores_trib_tribMun_tribISSQN" class="po-lg-3"></po-number>
              <po-input p-label="Pais de Resultado" [(ngModel)]="form.infDPS_valores_trib_tribMun_cPaisResult" class="po-lg-3"></po-input>
              <po-number p-label="Tipo de Imunidade" [(ngModel)]="form.infDPS_valores_trib_tribMun_tpImunidade" class="po-lg-3"></po-number>
              <po-number p-label="Tipo de Suspensao" [(ngModel)]="form.infDPS_valores_trib_tribMun_exigSusp_tpSusp" class="po-lg-3"></po-number>
              <po-input p-label="Numero do Processo" [(ngModel)]="form.infDPS_valores_trib_tribMun_exigSusp_nProcesso" class="po-lg-3"></po-input>
              <po-number p-label="Tipo Benef. Mun." [(ngModel)]="form.infDPS_valores_trib_tribMun_BM_tpBM" class="po-lg-3"></po-number>
              <po-input p-label="Numero Benef. Mun." [(ngModel)]="form.infDPS_valores_trib_tribMun_BM_nBM" class="po-lg-3"></po-input>
              <po-number p-label="Valor Reducao BM" [(ngModel)]="form.infDPS_valores_trib_tribMun_BM_vRedBCBM" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Reducao BM" [(ngModel)]="form.infDPS_valores_trib_tribMun_BM_pRedBCBM" class="po-lg-3"></po-number>
              <po-number p-label="Tipo Retencao ISSQN" [(ngModel)]="form.infDPS_valores_trib_tribMun_tpRetISSQN" class="po-lg-3"></po-number>
              <po-number p-label="Aliquota ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_pAliq" class="po-lg-3"></po-number>
              <po-input p-label="Municipio Incidencia" [(ngModel)]="form.infDPS_valores_trib_tribMun_cLocIncid" class="po-lg-3"></po-input>
              <po-number p-label="Base ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_vBC" class="po-lg-3"></po-number>
              <po-number p-label="Valor ISS" [(ngModel)]="form.infDPS_valores_trib_tribMun_vISSQN" class="po-lg-3"></po-number>
              <po-number p-label="Valor Liquido" [(ngModel)]="form.infDPS_valores_trib_tribMun_vLiq" class="po-lg-3"></po-number>
              <po-input p-label="CST PIS/COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_CST" class="po-lg-3"></po-input>
              <po-number p-label="PIS/COFINS Base" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vBCPisCofins" class="po-lg-3"></po-number>
              <po-number p-label="Aliq. PIS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_pAliqPis" class="po-lg-3"></po-number>
              <po-number p-label="Aliq. COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_pAliqCofins" class="po-lg-3"></po-number>
              <po-number p-label="Valor PIS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vPis" class="po-lg-3"></po-number>
              <po-number p-label="Valor COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_vCofins" class="po-lg-3"></po-number>
              <po-number p-label="Tipo Ret. PIS/COFINS" [(ngModel)]="form.infDPS_valores_trib_tribFed_piscofins_tpRetPisCofins" class="po-lg-3"></po-number>
              <po-number p-label="Ret. CP" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetCP" class="po-lg-3"></po-number>
              <po-number p-label="Ret. IRRF" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetIRRF" class="po-lg-3"></po-number>
              <po-number p-label="Ret. CSLL" [(ngModel)]="form.infDPS_valores_trib_tribFed_vRetCSLL" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Fed." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribFed" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Est." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribEst" class="po-lg-3"></po-number>
              <po-number p-label="Tot. Trib. Mun." [(ngModel)]="form.infDPS_valores_trib_totTrib_vTotTrib_vTotTribMun" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Tot. Trib. Fed." [(ngModel)]="form.infDPS_valores_trib_totTrib_pTotTrib_pTotTribFed" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Tot. Trib. Est." [(ngModel)]="form.infDPS_valores_trib_totTrib_pTotTrib_pTotTribEst" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Tot. Trib. Mun." [(ngModel)]="form.infDPS_valores_trib_totTrib_pTotTrib_pTotTribMun" class="po-lg-3"></po-number>
              <po-number p-label="Ind. Total Trib." [(ngModel)]="form.infDPS_valores_trib_totTrib_indTotTrib" class="po-lg-3"></po-number>
              <po-number p-label="Perc. Tot. SN" [(ngModel)]="form.infDPS_valores_trib_totTrib_pTotTribSN" class="po-lg-3"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">infDPS.IBSCBS</h4>
            <p class="crud-section__hint">Campos dos blocos 'gRefNFSe', 'dest', 'imovel' e 'valores.trib.gIBSCBS'.</p>
            <div class="po-row">
              <po-number p-label="Finalidade da NFS-e" [(ngModel)]="form.infDPS_IBSCBS_finNFSe" class="po-lg-3"></po-number>
              <po-number p-label="Consumidor Final" [(ngModel)]="form.infDPS_IBSCBS_indFinal" class="po-lg-3"></po-number>
              <po-input p-label="Indicador Operacao" [(ngModel)]="form.infDPS_IBSCBS_cIndOp" class="po-lg-3"></po-input>
              <po-number p-label="Tipo de Operacao" [(ngModel)]="form.infDPS_IBSCBS_tpOper" class="po-lg-3"></po-number>
              <po-number p-label="Tipo Ente Gov" [(ngModel)]="form.infDPS_IBSCBS_tpEnteGov" class="po-lg-3"></po-number>
              <po-number p-label="Ind. Destino" [(ngModel)]="form.infDPS_IBSCBS_indDest" class="po-lg-3"></po-number>
              <po-input p-label="Destinatario CNPJ" [(ngModel)]="form.infDPS_IBSCBS_dest_CNPJ" p-mask="99.999.999/9999-99" class="po-lg-3"></po-input>
              <po-input p-label="Destinatario CPF" [(ngModel)]="form.infDPS_IBSCBS_dest_CPF" p-mask="999.999.999-99" class="po-lg-3"></po-input>
              <po-input p-label="Destinatario NIF" [(ngModel)]="form.infDPS_IBSCBS_dest_NIF" class="po-lg-3"></po-input>
              <po-number p-label="Dest. Cod. Nao NIF" [(ngModel)]="form.infDPS_IBSCBS_dest_cNaoNIF" class="po-lg-3"></po-number>
              <po-input p-label="Destinatario Nome/Razao" [(ngModel)]="form.infDPS_IBSCBS_dest_xNome" class="po-lg-6"></po-input>
              <po-email p-label="Destinatario Email" [(ngModel)]="form.infDPS_IBSCBS_dest_email" class="po-lg-3"></po-email>
              <po-input p-label="Destinatario Fone" [(ngModel)]="form.infDPS_IBSCBS_dest_fone" class="po-lg-3"></po-input>
              <po-input p-label="Municipio (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endNac_cMun" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endNac_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Pais Ext. (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endExt_cPais" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logra. (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Destinatario)" [(ngModel)]="form.infDPS_IBSCBS_dest_end_xBairro" class="po-lg-3"></po-input>
              
              <po-divider p-label="Imovel" class="po-xl-12 po-lg-12 po-md-12 po-sm-12"></po-divider>
              
              <po-input p-label="Insc. Imob. Fisc. (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_inscImobFisc" class="po-lg-3"></po-input>
              <po-input p-label="CIB do Imovel" [(ngModel)]="form.infDPS_IBSCBS_imovel_cCIB" class="po-lg-3"></po-input>
              <po-input p-label="CEP (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_CEP" p-mask="99999-999" class="po-lg-3"></po-input>
              <po-input p-label="Cod. Postal Ext. (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_endExt_cEndPost" class="po-lg-3"></po-input>
              <po-input p-label="Cidade Ext. (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_endExt_xCidade" class="po-lg-3"></po-input>
              <po-input p-label="Estado Ext. (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_endExt_xEstProvReg" class="po-lg-3"></po-input>
              <po-input p-label="Logradouro (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_xLgr" class="po-lg-4"></po-input>
              <po-input p-label="Tipo Logra. (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_tpLgr" class="po-lg-2"></po-input>
              <po-input p-label="Numero (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_nro" class="po-lg-2"></po-input>
              <po-input p-label="Complemento (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_xCpl" class="po-lg-3"></po-input>
              <po-input p-label="Bairro (Imovel)" [(ngModel)]="form.infDPS_IBSCBS_imovel_end_xBairro" class="po-lg-3"></po-input>
              <po-input p-label="CST (IBS/CBS)" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_CST" class="po-lg-3"></po-input>
              <po-input p-label="Class. Tributaria (IBS/CBS)" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_cClassTrib" class="po-lg-3"></po-input>
              <po-input p-label="Credito Presumido" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_cCredPres" class="po-lg-3"></po-input>
              <po-input p-label="CST Trib. Regular" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gTribRegular_CSTReg" class="po-lg-3"></po-input>
              <po-input p-label="Class. Trib. Regular" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gTribRegular_cClassTribReg" class="po-lg-6"></po-input>
              <po-number p-label="Perc. Dif. UF" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifUF" class="po-lg-2"></po-number>
              <po-number p-label="Perc. Dif. Municipio" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifMun" class="po-lg-2"></po-number>
              <po-number p-label="Perc. Dif. CBS" [(ngModel)]="form.infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifCBS" class="po-lg-2"></po-number>
            </div>
          </section>

          <section class="crud-section">
            <h4 class="crud-section__title">Arrays e Documentos JSON</h4>
            <p class="crud-section__hint">Campos com arrays e documentos complexos, preservando as quebras do JSON original.</p>
            <div class="po-row">
              <po-textarea
                p-label="NFSe Referenciadas (IBS/CBS)"
                [(ngModel)]="jsonRefsNfse"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Itens do Pedido"
                [(ngModel)]="jsonItensPedido"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Doc. Deducao/Reducao"
                [(ngModel)]="jsonDocDedRed"
                [p-rows]="4"
                class="po-lg-4">
              </po-textarea>
              <po-textarea
                p-label="Doc. Ree. Rep. Res. (IBS/CBS)"
                [(ngModel)]="jsonDocumentosIbscbs"
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
