import api from './api';
import { Cartao } from '../types';

export const cartaoService = {
  listar: async (): Promise<Cartao[]> => {
    const response = await api.get('/cartoes');
    return response.data;
  },

  listarTodos: async (): Promise<Cartao[]> => {
    const response = await api.get('/cartoes/todos');
    return response.data;
  },

  buscar: async (uid: string): Promise<Cartao> => {
    const response = await api.get(`/cartoes/${uid}`);
    return response.data;
  },

  criar: async (data: {
    nome: string;
    diaFechamento: number;
    diaVencimento: number;
    limite: number;
  }): Promise<Cartao> => {
    const response = await api.post('/cartoes', data);
    return response.data;
  },

  consultarLimite: async (uid: string) => {
    const response = await api.get(`/cartoes/${uid}/limite`);
    return response.data;
  },

  verificarMelhorDia: async (uid: string) => {
    const response = await api.get(`/cartoes/${uid}/melhor-dia`);
    return response.data;
  },

  registrarPagamentoAntecipado: async (
    uid: string,
    data: {
      valor: number;
      descricao: string;
      data?: string;
    }
  ) => {
    const response = await api.post(`/cartoes/${uid}/pagamento-antecipado`, data);
    return response.data;
  },

  inativar: async (uid: string): Promise<void> => {
    await api.patch(`/cartoes/${uid}/inativar`);
  },

  ativar: async (uid: string): Promise<void> => {
    await api.patch(`/cartoes/${uid}/ativar`);
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/cartoes/${uid}`);
  },
};

