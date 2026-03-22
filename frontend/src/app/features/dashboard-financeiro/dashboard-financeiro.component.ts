import { Component, OnInit } from '@angular/core';
import { PoNotificationService, PoPageModule } from '@po-ui/ng-components';
import { ApiService } from '../../core/services/api.service';
import { ResumoFinanceiro } from '../../core/models/types';

@Component({
  selector: 'app-dashboard-financeiro',
  standalone: true,
  imports: [PoPageModule],
  template: `
    <po-page-default p-title="Dashboard Financeiro">
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

  private carregarResumo(): void {
    this.apiService.resumoMovimentoFinanceiro().subscribe({
      next: res => {
        this.resumo = res.item ?? this.resumo;
      },
      error: () => {
        this.notificacao.error('Erro ao carregar resumo financeiro.');
      }
    });
  }
}
