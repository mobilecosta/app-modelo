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
  PoTableColumn,
  PoTableModule
} from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { EmpresaCertificado } from '../../core/models/types';

@Component({
  selector: 'app-empresascertificados',
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
    <po-page-default p-title="empresascertificados" [p-actions]="pageActions">
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
          <span class="crud-modal__eyebrow">{{ editandoId ? 'Edicao' : 'Novo certificado' }}</span>
          <h3>{{ modalTitulo }}</h3>
          <p>Selecione um arquivo .pfx. O frontend converte automaticamente o certificado para Base64 antes de salvar.</p>
        </div>

        <div class="crud-modal__content">
          <section class="crud-section">
            <h4 class="crud-section__title">Dados do certificado</h4>
            <p class="crud-section__hint">Informe CNPJ, senha e selecione o arquivo PFX.</p>
            <div class="po-row">
              <po-input
                p-label="CNPJ"
                [(ngModel)]="form.cnpj"
                p-placeholder="00.000.000/0000-00"
                p-required="true"
                class="po-lg-4"
                (ngModelChange)="onCnpjChange($event)">
              </po-input>

              <po-password
                p-label="Senha do certificado"
                [(ngModel)]="form.senha_certificado"
                p-required="true"
                class="po-lg-4">
              </po-password>

              <po-switch
                p-label="Ativo"
                [(ngModel)]="form.ativo"
                class="po-lg-4">
              </po-switch>

              <div class="po-lg-12 empresascertificados__upload">
                <label class="empresascertificados__upload-label" for="arquivo-pfx">Arquivo do certificado (.pfx)</label>
                <input
                  id="arquivo-pfx"
                  type="file"
                  accept=".pfx,application/x-pkcs12"
                  (change)="onArquivoSelecionado($event)" />
                <small class="empresascertificados__upload-help">
                  {{ arquivoInfoTexto }}
                </small>
              </div>
            </div>
          </section>
        </div>
      </div>
    </po-modal>
  `,
  styles: [`
    .empresascertificados__upload {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }

    .empresascertificados__upload-label {
      font-size: 14px;
      font-weight: 600;
      color: #2f2f2f;
    }

    .empresascertificados__upload-help {
      color: #666;
    }
  `]
})
export class EmpresascertificadosComponent implements OnInit {
  @ViewChild('modal') modal!: PoModalComponent;

  itens: EmpresaCertificado[] = [];
  carregando = false;
  editandoId: string | null = null;
  modalTitulo = 'Novo certificado da empresa';
  paginaAtual = 1;
  readonly pageSize = 10;
  totalRegistros = 0;
  arquivoSelecionadoNome = '';

  form: Partial<EmpresaCertificado> = this.criarFormPadrao();

  colunas: PoTableColumn[] = [
    { property: 'cnpj', label: 'CNPJ' },
    { property: 'ativo', label: 'Ativo', type: 'boolean' },
    { property: 'updated_at', label: 'Atualizado em' }
  ];

  pageActions: PoPageAction[] = [
    { label: 'Novo', icon: 'ph ph-plus', action: () => this.abrirNovo() }
  ];

  tabelaActions = [
    { label: 'Editar', action: (item: EmpresaCertificado) => this.abrirEditar(item) },
    { label: 'Excluir', action: (item: EmpresaCertificado) => this.excluir(item.id) }
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

  get arquivoInfoTexto(): string {
    if (this.arquivoSelecionadoNome) {
      return `Arquivo selecionado: ${this.arquivoSelecionadoNome}`;
    }

    if (this.editandoId && this.form.certificado_pfx_base64) {
      return 'Certificado atual mantido. Selecione outro arquivo para substituir.';
    }

    return 'Nenhum arquivo selecionado.';
  }

  carregar(page = 1): void {
    this.carregando = true;
    this.apiService.listarEmpresasCertificados(page, this.pageSize).subscribe({
      next: res => {
        this.itens = res.items ?? [];
        this.paginaAtual = res.page ?? page;
        this.totalRegistros = res.total ?? 0;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.notificacao.error('Erro ao carregar empresascertificados.');
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
    this.modalTitulo = 'Novo certificado da empresa';
    this.form = this.criarFormPadrao();
    this.arquivoSelecionadoNome = '';
    this.modal.open();
  }

  abrirEditar(item: EmpresaCertificado): void {
    this.editandoId = item.id;
    this.modalTitulo = 'Editar certificado da empresa';
    this.form = { ...item };
    this.arquivoSelecionadoNome = '';
    this.modal.open();
  }

  onCnpjChange(value: string): void {
    this.form.cnpj = this.formatarCnpj(value);
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pfx')) {
      this.notificacao.warning('Selecione um arquivo com extensao .pfx.');
      input.value = '';
      return;
    }

    this.lerArquivoComoBase64(file)
      .then(base64 => {
        this.form.certificado_pfx_base64 = base64;
        this.arquivoSelecionadoNome = file.name;
        this.notificacao.success('Certificado carregado e convertido para Base64.');
      })
      .catch(() => {
        this.notificacao.error('Nao foi possivel ler o arquivo selecionado.');
      });
  }

  salvar(): void {
    if (!this.cnpjValido || !this.form.senha_certificado) {
      this.notificacao.warning('Informe CNPJ valido e senha do certificado.');
      return;
    }

    if (!this.form.certificado_pfx_base64) {
      this.notificacao.warning('Selecione o arquivo .pfx para gerar o Base64.');
      return;
    }

    const payload: Partial<EmpresaCertificado> = {
      cnpj: this.normalizarCnpj(this.form.cnpj),
      senha_certificado: this.form.senha_certificado,
      certificado_pfx_base64: this.form.certificado_pfx_base64,
      ativo: this.form.ativo ?? true
    };

    if (this.editandoId) {
      this.apiService.atualizarEmpresaCertificado(this.editandoId, payload).subscribe({
        next: () => {
          this.modal.close();
          this.notificacao.success('Empresa certificado atualizada.');
          this.carregar(this.paginaAtual);
        },
        error: () => this.notificacao.error('Erro ao atualizar empresa certificado.')
      });
      return;
    }

    this.apiService.criarEmpresaCertificado(payload).subscribe({
      next: () => {
        this.modal.close();
        this.notificacao.success('Empresa certificado criada.');
        this.carregar(1);
      },
      error: () => this.notificacao.error('Erro ao criar empresa certificado.')
    });
  }

  excluir(id: string): void {
    this.apiService.excluirEmpresaCertificado(id).subscribe({
      next: () => {
        this.notificacao.success('Empresa certificado excluida.');
        this.carregar(this.paginaAtual);
      },
      error: () => this.notificacao.error('Erro ao excluir empresa certificado.')
    });
  }

  private lerArquivoComoBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const resultado = typeof reader.result === 'string' ? reader.result : '';
        const base64 = resultado.includes(',') ? resultado.split(',')[1] : resultado;

        if (!base64) {
          reject(new Error('Base64 vazio'));
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  private criarFormPadrao(): Partial<EmpresaCertificado> {
    return {
      ativo: true
    };
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
