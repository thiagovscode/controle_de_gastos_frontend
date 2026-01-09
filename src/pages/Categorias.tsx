import React, { useEffect, useState } from 'react';
import { categoriaService } from '../services/categoriaService';
import { Categoria } from '../types';

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Despesa' as 'Receita' | 'Despesa',
  });

  useEffect(() => {
    loadCategorias();
  }, [showAll]);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = showAll
        ? await categoriaService.listarTodas()
        : await categoriaService.listar();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoriaService.criar(formData);
      setShowModal(false);
      resetForm();
      loadCategorias();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleToggleStatus = async (uid: string, ativa: boolean) => {
    try {
      if (ativa) {
        await categoriaService.inativar(uid);
      } else {
        await categoriaService.ativar(uid);
      }
      loadCategorias();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'Despesa',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const categoriasReceita = categorias.filter(c => c.tipo === 'Receita');
  const categoriasDespesa = categorias.filter(c => c.tipo === 'Despesa');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
          >
            {showAll ? 'Mostrar Ativas' : 'Mostrar Todas'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas */}
        <div className="card">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Receitas
          </h2>
          <div className="space-y-2">
            {categoriasReceita.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma categoria de receita</p>
            ) : (
              categoriasReceita.map((cat) => (
                <div
                  key={cat.uid}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    cat.ativa ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`font-medium ${cat.ativa ? 'text-gray-900' : 'text-gray-500'}`}>
                    {cat.nome}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(cat.uid, cat.ativa)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cat.ativa
                        ? 'bg-green-200 text-green-800 hover:bg-green-300'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {cat.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Despesas */}
        <div className="card">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Despesas
          </h2>
          <div className="space-y-2">
            {categoriasDespesa.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhuma categoria de despesa</p>
            ) : (
              categoriasDespesa.map((cat) => (
                <div
                  key={cat.uid}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    cat.ativa ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`font-medium ${cat.ativa ? 'text-gray-900' : 'text-gray-500'}`}>
                    {cat.nome}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(cat.uid, cat.ativa)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cat.ativa
                        ? 'bg-red-200 text-red-800 hover:bg-red-300'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {cat.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Categoria</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Alimentação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Receita' | 'Despesa' })}
                  className="input-field"
                >
                  <option value="Despesa">Despesa</option>
                  <option value="Receita">Receita</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Criar
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

export default Categorias;

