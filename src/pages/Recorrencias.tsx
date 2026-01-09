import React, { useEffect, useState } from 'react';
import { Recorrencia, Categoria } from '../types';
import { categoriaService } from '../services/categoriaService';
import api from '../services/api';

const Recorrencias: React.FC = () => {
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    valor: 0,
    categoriaUid: '',
    descricao: '',
    tipo: 'MENSAL' as 'MENSAL' | 'ANUAL',
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recorrenciasData, categoriasData] = await Promise.all([
        api.get('/recorrencias').then(r => r.data),
        categoriaService.listar(),
      ]);
      setRecorrencias(recorrenciasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/recorrencias', formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao criar recorrência:', error);
    }
  };

  const handleToggleStatus = async (uid: string, ativa: boolean) => {
    try {
      await api.patch(`/recorrencias/${uid}/${ativa ? 'inativar' : 'ativar'}`);
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      valor: 0,
      categoriaUid: '',
      descricao: '',
      tipo: 'MENSAL',
      dataInicio: '',
      dataFim: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recorrências</h1>
          <p className="text-gray-600 mt-1">Transações fixas mensais ou anuais</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          Nova Recorrência
        </button>
      </div>

      {/* Lista de Recorrências */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recorrencias.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <p className="text-gray-500">Nenhuma recorrência cadastrada</p>
          </div>
        ) : (
          recorrencias.map((rec) => (
            <div key={rec.uid} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{rec.categoria.nome}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {rec.tipo === 'MENSAL' ? 'Recorrência Mensal' : 'Recorrência Anual'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(rec.uid, rec.ativa)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.ativa
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {rec.ativa ? 'Ativa' : 'Inativa'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-gray-900">
                    R$ {rec.valor.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.tipo === 'MENSAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {rec.tipo}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Início:</span>
                  <span className="font-medium">
                    {new Date(rec.dataInicio).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {rec.dataFim && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fim:</span>
                    <span className="font-medium">
                      {new Date(rec.dataFim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Recorrência</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.categoriaUid}
                  onChange={(e) => setFormData({ ...formData, categoriaUid: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.uid} value={cat.uid}>
                      {cat.nome} ({cat.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Netflix, Aluguel, Salário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'MENSAL' | 'ANUAL' })}
                  className="input-field"
                  required
                >
                  <option value="MENSAL">Mensal</option>
                  <option value="ANUAL">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim (opcional)
                </label>
                <input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recorrencias;

