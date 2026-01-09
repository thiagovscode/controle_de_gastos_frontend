import api from './api';
import { Transacao, TransacaoRequest } from '../types';

export const transacaoService = {
  listar: async (): Promise<Transacao[]> => {
    const response = await api.get('/transacoes');
    return response.data;
  },

  criar: async (data: TransacaoRequest): Promise<Transacao> => {
    const response = await api.post('/transacoes', data);
    return response.data;
  },

  editar: async (uid: string, data: TransacaoRequest): Promise<Transacao> => {
    const response = await api.put(`/transacoes/${uid}`, data);
    return response.data;
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/transacoes/${uid}`);
  },

  calcularSaldo: async (): Promise<string> => {
    const response = await api.get('/transacoes/saldo');
    return response.data;
  },

  obterResumo: async (ano?: number, mes?: number, cartaoUid?: string) => {
    const params = new URLSearchParams();
    if (ano) params.append('ano', ano.toString());
    if (mes) params.append('mes', mes.toString());
    if (cartaoUid) params.append('cartaoUid', cartaoUid);

    const response = await api.get(`/transacoes/resumo?${params}`);
    return response.data;
  },

  listarPendentes: async (tagUid?: string, categoriaUid?: string) => {
    const params = new URLSearchParams();
    if (tagUid) params.append('tagUid', tagUid);
    if (categoriaUid) params.append('categoriaUid', categoriaUid);

    const response = await api.get(`/transacoes/pendentes?${params}`);
    return response.data;
  },

  importarCSV: async (arquivo: File, cartaoUid?: string): Promise<void> => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    if (cartaoUid) formData.append('cartaoUid', cartaoUid);

    await api.post('/transacoes/importacao', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  toggleOcultar: async (uid: string, ocultar: boolean): Promise<void> => {
    await api.patch(`/transacoes/${uid}/ocultar?ocultar=${ocultar}`);
  },

  getSaldo: async () => {
    const response = await api.get('/transacoes/saldo');
    return response.data;
  },

  getComprasPendentes: async () => {
    const response = await api.get('/transacoes/pendentes');
    return response.data;
  },
};

