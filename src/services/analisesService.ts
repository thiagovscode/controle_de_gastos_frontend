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
    const response = await api.get(`/analises/tendencia-gastos?${params}`);
    return response.data;
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

