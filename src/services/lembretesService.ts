import api from './api';

export interface Lembrete {
  uid: string;
  tipo: string;
  dia: number;
  titulo: string;
  descricao: string;
  referenciaUid?: string;
  ativo: boolean;
  venceHoje: boolean;
  diasAteVencimento?: number;
}

export interface LembretesAgrupados {
  HOJE: Lembrete[];
  PROXIMOS_7_DIAS: Lembrete[];
  ESTE_MES: Lembrete[];
  PROGRESSO_METAS: Lembrete[];
}

export const lembretesService = {
  listar: async (): Promise<Lembrete[]> => {
    const response = await api.get('/lembretes');
    return response.data;
  },

  hoje: async (): Promise<Lembrete[]> => {
    const response = await api.get('/lembretes/hoje');
    return response.data;
  },

  proximos: async (): Promise<LembretesAgrupados> => {
    const response = await api.get('/lembretes/proximos');
    return response.data;
  },

  progressoMetas: async (): Promise<Lembrete[]> => {
    const response = await api.get('/lembretes/progresso-metas');
    return response.data;
  },

  criarLembretesFatura: async (): Promise<void> => {
    await api.post('/lembretes/criar-lembrete-fatura');
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/lembretes/${uid}`);
  },
};

