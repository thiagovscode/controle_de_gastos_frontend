import api from './api';
import { Dashboard, MetaCategoria } from '../types';

export const dashboardService = {
  obter: async (ano?: number, mes?: number, userUid?: string): Promise<Dashboard> => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    if (userUid) params.append('userUid', userUid);

    const response = await api.get(`/dashboard?${params}`);
    return response.data;
  },

  obterTop5: async (tipo: 'CARTAO' | 'TAG' | 'CATEGORIA', ano?: number, mes?: number) => {
    const params = new URLSearchParams();
    params.append('tipo', tipo);
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());

    const response = await api.get(`/dashboard/top5?${params}`);
    return response.data;
  },

  criarMeta: async (data: MetaCategoria) => {
    const response = await api.post('/dashboard/metas', data);
    return response.data;
  },

  deletarMeta: async (uid: string): Promise<void> => {
    await api.delete(`/dashboard/metas/${uid}`);
  },
};

