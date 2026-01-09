import api from './api';

export interface MetaCofre {
  uid: string;
  nome: string;
  descricao?: string;
  valorObjetivo: number;
  valorAtual: number;
  valorMensal: number;
  percentualAtingido: number;
  valorFaltante: number;
  diaDeposito: number;
  dataInicio?: string;
  dataLimite?: string;
  mesesRestantes?: number;
  ativa: boolean;
  concluida: boolean;
  status: 'EM_DIA' | 'ATRASADO' | 'CONCLUIDO';
}

export interface MetaCofreForm {
  nome: string;
  descricao?: string;
  valorObjetivo: number;
  valorMensal: number;
  diaDeposito: number;
  dataInicio?: string;
  dataLimite?: string;
}

export interface DepositoCofre {
  uid: string;
  valor: number;
  data: string;
  observacao?: string;
}

export interface LembreteProgresso {
  uid: string;
  titulo: string;
  descricao: string;
  data: string;
}

export const metasService = {
  listar: async (): Promise<MetaCofre[]> => {
    const response = await api.get('/metas-cofre');
    return response.data;
  },

  buscar: async (uid: string): Promise<MetaCofre> => {
    const response = await api.get(`/metas-cofre/${uid}`);
    return response.data;
  },

  criar: async (data: MetaCofreForm): Promise<MetaCofre> => {
    const response = await api.post('/metas-cofre', data);
    return response.data;
  },

  depositar: async (uid: string, valor: number, observacao?: string): Promise<MetaCofre> => {
    const response = await api.post(`/metas-cofre/${uid}/depositar`, {
      valor,
      observacao,
    });
    return response.data;
  },

  historico: async (uid: string): Promise<DepositoCofre[]> => {
    const response = await api.get(`/metas-cofre/${uid}/historico`);
    return response.data;
  },

  lembretesProgresso: async (uid: string): Promise<LembreteProgresso[]> => {
    const response = await api.get(`/metas-cofre/${uid}/lembretes-progresso`);
    return response.data;
  },

  concluir: async (uid: string): Promise<void> => {
    await api.put(`/metas-cofre/${uid}/concluir`);
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/metas-cofre/${uid}`);
  },
};

