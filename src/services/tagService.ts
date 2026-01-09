import api from './api';
import { Tag } from '../types';

export const tagService = {
  listar: async (): Promise<Tag[]> => {
    const response = await api.get('/tag');
    return response.data;
  },

  listarTodas: async (): Promise<Tag[]> => {
    const response = await api.get('/tag/todas');
    return response.data;
  },

  criar: async (data: { nome: string }): Promise<Tag> => {
    const response = await api.post('/tag', data);
    return response.data;
  },

  inativar: async (uid: string): Promise<void> => {
    await api.patch(`/tag/${uid}/inativar`);
  },

  ativar: async (uid: string): Promise<void> => {
    await api.patch(`/tag/${uid}/ativar`);
  },

  deletar: async (uid: string): Promise<void> => {
    await api.delete(`/tag/${uid}`);
  },
};

