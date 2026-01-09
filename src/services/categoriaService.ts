import api from './api';
import { Categoria } from '../types';

export const categoriaService = {
  listar: async (): Promise<Categoria[]> => {
    const response = await api.get('/categorias');
    return response.data;
  },

  listarTodas: async (): Promise<Categoria[]> => {
    const response = await api.get('/categorias/todas');
    return response.data;
  },

  criar: async (data: { nome: string; tipo: 'Receita' | 'Despesa' }): Promise<Categoria> => {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  inativar: async (uid: string): Promise<void> => {
    await api.patch(`/categorias/${uid}/inativar`);
  },

  ativar: async (uid: string): Promise<void> => {
    await api.patch(`/categorias/${uid}/ativar`);
  },
};

