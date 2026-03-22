import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoComboOption, PoFieldModule, PoNotificationService, PoPageModule } from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { ResumoFinanceiro } from '../../core/models/types';

@Component({
  selector: 'app-dashboard-financeiro',
  standalone: true,
  imports: [FormsModule, PoFieldModule, PoPageModule],
  template: `
    <po-page-default p-title="Dashboard Financeiro">
      <div class="filtros-periodo po-row po-mb-3">
        <po-combo
          p-label="Ano"
          [ngModel]="anoSelecionado"
          (ngModelChange)="onAnoChange($event)"
          [p-options]="opcoesAno"
          p-placeholder="Selecione o ano"
          class="po-lg-3 po-md-4 po-sm-6">
        </po-combo>

        <po-combo
          p-label="Mes"
          [ngModel]="mesSelecionado"
          (ngModelChange)="onMesChange($event)"
          [p-options]="opcoesMes"
          p-placeholder="Selecione o mes"
          class="po-lg-3 po-md-4 po-sm-6">
        </po-combo>
      </div>

      <div class="cards-grid">
        <article class="finance-card finance-card--entrada">
          <span class="finance-card__label">Total de Entradas</span>
          <strong class="finance-card__value">{{ formatarMoeda(resumo.totalEntradas) }}</strong>
        </article>

        <article class="finance-card finance-card--saida">
          <span class="finance-card__label">Total de Saidas</span>
          <strong class="finance-card__value">{{ formatarMoeda(resumo.totalSaidas) }}</strong>
        </article>

        <article class="finance-card" [class.finance-card--saldo-positivo]="resumo.saldo >= 0" [class.finance-card--saldo-negativo]="resumo.saldo < 0">
          <span class="finance-card__label">Saldo</span>
          <strong class="finance-card__value">{{ formatarMoeda(resumo.saldo) }}</strong>
        </article>
      </div>
    </po-page-default>
  `,
  styles: [`
    .filtros-periodo {
      align-items: flex-end;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .finance-card {
      border-radius: 12px;
      padding: 20px;
      background: #f5f7fa;
      border: 1px solid #dbe2ea;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .finance-card__label {
      font-size: 14px;
      color: #4d5d6c;
    }

    .finance-card__value {
      font-size: 28px;
      line-height: 1.1;
      color: #1f2d3d;
    }

    .finance-card--entrada {
      background: #ebf9f0;
      border-color: #b8e6c9;
    }

    .finance-card--saida {
      background: #fff1f1;
      border-color: #ffc7c7;
    }

    .finance-card--saldo-positivo {
      background: #eff6ff;
      border-color: #c9dcff;
    }

    .finance-card--saldo-negativo {
      background: #fff6e9;
      border-color: #ffd8a8;
    }
  `]
})
export class DashboardFinanceiroComponent implements OnInit {
  anoSelecionado = new Date().getFullYear();
  mesSelecionado = new Date().getMonth() + 1;

  opcoesAno: PoComboOption[] = this.criarOpcoesAno();
  opcoesMes: PoComboOption[] = [
    { label: 'Janeiro', value: 1 },
    { label: 'Fevereiro', value: 2 },
    { label: 'Marco', value: 3 },
    { label: 'Abril', value: 4 },
    { label: 'Maio', value: 5 },
    { label: 'Junho', value: 6 },
    { label: 'Julho', value: 7 },
    { label: 'Agosto', value: 8 },
    { label: 'Setembro', value: 9 },
    { label: 'Outubro', value: 10 },
    { label: 'Novembro', value: 11 },
    { label: 'Dezembro', value: 12 }
  ];

  resumo: ResumoFinanceiro = {
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0
  };

  constructor(private apiService: ApiService, private notificacao: PoNotificationService) {}

  ngOnInit(): void {
    this.carregarResumo();
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
  }

  onAnoChange(valor: string | number): void {
    const ano = Number(valor);
    if (Number.isNaN(ano)) {
      return;
    }

    this.anoSelecionado = ano;
    this.carregarResumo();
  }

  onMesChange(valor: string | number): void {
    const mes = Number(valor);
    if (Number.isNaN(mes)) {
      return;
    }

    this.mesSelecionado = mes;
    this.carregarResumo();
  }

  private carregarResumo(): void {
    this.apiService.resumoMovimentoFinanceiro(this.anoSelecionado, this.mesSelecionado).subscribe({
      next: res => {
        this.resumo = res.item ?? this.resumo;
      },
      error: () => {
        this.notificacao.error('Erro ao carregar resumo financeiro.');
      }
    });
  }

  private criarOpcoesAno(): PoComboOption[] {
    const anoAtual = new Date().getFullYear();
    const opcoes: PoComboOption[] = [];

    for (let ano = anoAtual + 1; ano >= anoAtual - 10; ano -= 1) {
      opcoes.push({ label: String(ano), value: ano });
    }

    return opcoes;
  }
}
