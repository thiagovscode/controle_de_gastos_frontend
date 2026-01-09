import api from './api';

export interface ResumoDashboard {
  totalGasto: number;
  totalOrcamento: number;
  percentualUsado: number;
  saldo: number;
  categorias: CategoriaResumo[];
}

export interface CategoriaResumo {
  categoria: string;
  total: number;
  percentual: number;
  variacao: number;
  tendencia: 'SUBIU' | 'DESCEU' | 'ESTAVEL';
  dentroOrcamento: boolean;
}

export interface TendenciaGasto {
  periodo: string;
  total: number;
}

export interface EvolucaoMensal {
  periodo: string;
  receita: number;
  despesa: number;
  percentual: number; // percentual receita / despesa
}

export interface TendenciaGastosResponse {
  periodo: string;
  totalDespesas: number;
  totalReceitas: number;
  saldo: number;
  variacao: number;
  pontos: Array<{
    data: string;
    receita: number;
    despesa: number;
  }>;
}

export interface GastoInvisivel {
  quantidade: number;
  valorTotal: number;
  percentualDoTotal: number;
  exemplos: string[];
}

export const analisesService = {
  resumoDashboard: async (ano?: number, mes?: number): Promise<ResumoDashboard> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    const response = await api.get(`/analises/resumo-dashboard?${params}`);
    return response.data;
  },

  gastosPorCategoria: async (ano?: number, mes?: number): Promise<CategoriaResumo[]> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    const response = await api.get(`/analises/gastos-por-categoria?${params}`);
    return response.data;
  },

  tendenciaGastos: async (ano?: number, mes?: number): Promise<TendenciaGasto[]> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    const response = await api.get<TendenciaGastosResponse>(`/analises/tendencia-gastos?${params}`);

    // Converter os pontos do backend para o formato esperado pelo frontend
    return (response.data.pontos || []).map(ponto => ({
      periodo: ponto.data,
      total: ponto.despesa
    }));
  },

  evolucaoMensal: async (ano?: number): Promise<EvolucaoMensal[]> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    const response = await api.get<TendenciaGastosResponse>(`/analises/tendencia-gastos?${params}`);

    // Converter os pontos para evolução mensal com receita, despesa e percentual
    return (response.data.pontos || []).map(ponto => {
      const total = ponto.receita + ponto.despesa;
      const percentual = total > 0 ? (ponto.receita / ponto.despesa) * 100 : 0;
      return {
        periodo: ponto.data,
        receita: ponto.receita,
        despesa: ponto.despesa,
        percentual: Math.round(percentual * 10) / 10
      };
    }).filter(p => p.receita > 0 || p.despesa > 0); // Só meses com informação
  },

  gastosInvisiveis: async (ano?: number, mes?: number, limiteValor: number = 20): Promise<GastoInvisivel> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    params.append('limiteValor', limiteValor.toString());
    const response = await api.get(`/analises/gastos-invisiveis?${params}`);
    return response.data;
  },
};

