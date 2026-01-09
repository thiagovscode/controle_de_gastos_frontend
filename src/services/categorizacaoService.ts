import api from './api';

export interface RegraCategorizacao {
  uid: string;
  prefixo: string;
  categoriaUid: string;
  categoriaNome: string;
  descricao?: string;
  ativa: boolean;
  caseSensitive: boolean;
}

export interface RegraCategorizacaoForm {
  prefixo: string;
  categoriaUid: string;
  descricao?: string;
  caseSensitive?: boolean;
}

export interface TesteCategorizacaoResult {
  match: boolean;
  regra?: string;
  categoriaUid?: string;
  categoriaNome?: string;
}

export const categorizacaoService = {
  listar: async (busca?: string): Promise<RegraCategorizacao[]> => {
    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    const response = await api.get(`/config/categorizacao?${params}`);
    return response.data;
  },

  buscar: async (uid: string): Promise<RegraCategorizacao> => {
    const response = await api.get(`/config/categorizacao/${uid}`);
    return response.data;
  },

  criar: async (data: RegraCategorizacaoForm): Promise<RegraCategorizacao> => {
    const response = await api.post('/config/categorizacao', data);
    return response.data;
  },

  editar: async (uid: string, data: RegraCategorizacaoForm): Promise<RegraCategorizacao> => {
    const response = await api.put(`/config/categorizacao/${uid}`, data);
    return response.data;
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/config/categorizacao/${uid}`);
  },


  testar: async (descricao: string): Promise<TesteCategorizacaoResult> => {
    const response = await api.post('/config/categorizacao/testar', { descricao });
    return response.data;
  },
};

