import api from './api';
import { Transacao, TransacaoRequest } from '../types';

export const transacaoService = {
  listar: async (oculta?: boolean): Promise<Transacao[]> => {
    const params = new URLSearchParams();
    if (oculta !== undefined) {
      params.append('oculta', oculta.toString());
    }
    const url = params.toString() ? `/transacoes?${params}` : '/transacoes';
    const response = await api.get(url);
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

  importarCSV: async (arquivo: File, cartaoUid?: string, dataCriacao?: string): Promise<void> => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    if (cartaoUid) formData.append('cartaoUid', cartaoUid);
    if (dataCriacao) formData.append('dataCriacao', dataCriacao);

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

  adicionarTagsEmLote: async (transacoesUids: string[], tagsUids: string[]): Promise<void> => {
    await api.post('/transacoes/tags/adicionar-em-lote', {
      transacoesUids,
      tagsUids
    });
  },
};

