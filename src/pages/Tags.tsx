import React, { useEffect, useState } from 'react';
import { tagService } from '../services/tagService';
import { Tag } from '../types';

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
  });

  useEffect(() => {
    loadTags();
  }, [showAll]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = showAll
        ? await tagService.listarTodas()
        : await tagService.listar();
      setTags(data);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tagService.criar(formData);
      setShowModal(false);
      resetForm();
      loadTags();
    } catch (error) {
      console.error('Erro ao criar tag:', error);
    }
  };

  const handleToggleStatus = async (uid: string, ativa: boolean) => {
    try {
      if (ativa) {
        await tagService.inativar(uid);
      } else {
        await tagService.ativar(uid);
      }
      loadTags();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir esta tag? Ela será removida de todas as transações.')) {
      try {
        await tagService.deletar(uid);
        loadTags();
      } catch (error) {
        console.error('Erro ao deletar tag:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
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
        <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
          >
            {showAll ? 'Mostrar Ativas' : 'Mostrar Todas'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Nova Tag
          </button>
        </div>
      </div>

      {/* Grid de Tags */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.length === 0 ? (
            <p className="text-gray-500 text-sm col-span-full">Nenhuma tag cadastrada</p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.uid}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  tag.ativa ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className={`font-medium ${tag.ativa ? 'text-gray-900' : 'text-gray-500'}`}>
                    {tag.nome}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(tag.uid, tag.ativa)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tag.ativa
                        ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {tag.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                  <button
                    onClick={() => handleDelete(tag.uid)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Tag</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Tag
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Urgente, Parcelado, Fixo"
                  required
                />
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

export default Tags;

