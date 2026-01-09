import React, { useEffect, useState } from 'react';
import { categorizacaoService, RegraCategorizacao, RegraCategorizacaoForm } from '../services/categorizacaoService';
import { categoriaService } from '../services/categoriaService';
import { Categoria } from '../types';

const CategorizadorAutomatico: React.FC = () => {
  const [regras, setRegras] = useState<RegraCategorizacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegra, setEditingRegra] = useState<RegraCategorizacao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [testDescricao, setTestDescricao] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recategorizando, setRecategorizando] = useState(false);

  const [formData, setFormData] = useState<RegraCategorizacaoForm>({
    prefixo: '',
    categoriaUid: '',
    descricao: '',
    caseSensitive: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regrasData, categoriasData] = await Promise.all([
        categorizacaoService.listar(),
        categoriaService.listar(),
      ]);
      setRegras(regrasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await categorizacaoService.listar(searchTerm);
      setRegras(result);
    } catch (error) {
      console.error('Erro ao buscar:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (editingRegra) {
        await categorizacaoService.editar(editingRegra.uid, formData);
        showMessage('Regra atualizada com sucesso!');
      } else {
        await categorizacaoService.criar(formData);
        showMessage('Regra criada com sucesso!');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar regra');
    }
  };

  const handleEdit = (regra: RegraCategorizacao) => {
    setEditingRegra(regra);
    setFormData({
      prefixo: regra.prefixo,
      categoriaUid: regra.categoriaUid,
      descricao: regra.descricao || '',
      caseSensitive: regra.caseSensitive,
    });
    setShowModal(true);
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir esta regra?')) {
      try {
        await categorizacaoService.deletar(uid);
        showMessage('Regra excluída com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        setError('Erro ao deletar regra');
      }
    }
  };

  const handleTest = async () => {
    try {
      const result = await categorizacaoService.testar(testDescricao);
      setTestResult(result);
    } catch (error) {
      console.error('Erro ao testar:', error);
    }
  };

  const handleRecategorizar = async () => {
    if (!window.confirm('Deseja recategorizar todas as transações existentes com base nas regras atuais? Isso pode levar alguns momentos.')) {
      return;
    }

    try {
      setRecategorizando(true);
      setError('');
      const result = await categorizacaoService.recategorizarTransacoes();
      showMessage(`${result.recategorizadas} transação(ões) recategorizada(s) com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao recategorizar:', error);
      setError(error.response?.data?.message || 'Erro ao recategorizar transações');
    } finally {
      setRecategorizando(false);
    }
  };

  const resetForm = () => {
    setFormData({
      prefixo: '',
      categoriaUid: '',
      descricao: '',
      caseSensitive: false,
    });
    setEditingRegra(null);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
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
      {/* Header com Informação Contextual */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categorizador Automático</h1>
        <p className="text-gray-600 mt-2">
          Configure regras para categorizar suas transações automaticamente ao importar extratos
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <strong>Como funciona:</strong> Quando uma transação contém o prefixo cadastrado,
              ela será automaticamente categorizada. Por exemplo: transações com "ELEKTRO"
              serão categorizadas como "Contas de Casa".
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Barra de Ações */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Pesquisar por prefixo ou descrição..."
            className="input-field pr-10"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleRecategorizar}
          disabled={recategorizando || regras.length === 0}
          className="btn-secondary whitespace-nowrap flex items-center gap-2"
          title="Aplicar regras a todas as transações existentes"
        >
          {recategorizando ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recategorizando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recategorizar Existentes
            </>
          )}
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          + Nova Regra
        </button>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              loadData();
            }}
            className="btn-secondary"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Testador de Regras */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">🧪 Testador de Regras</h3>
        <p className="text-sm text-gray-600 mb-3">
          Digite uma descrição de transação para ver qual categoria seria aplicada
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={testDescricao}
            onChange={(e) => setTestDescricao(e.target.value)}
            placeholder="Ex: ELEKTRO ENERGIA 12/2025"
            className="input-field flex-1"
          />
          <button onClick={handleTest} className="btn-primary">
            Testar
          </button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg ${testResult.match ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'}`}>
            {testResult.match ? (
              <>
                <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Match encontrado!
                </div>
                <p className="text-sm text-green-700">
                  Prefixo: <strong>"{testResult.regra}"</strong> → Categoria: <strong>{testResult.categoriaNome}</strong>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                ❌ Nenhuma regra encontrada. Será categorizado como "Outros"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lista de Regras */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Regras Configuradas ({regras.length})
          </h2>
        </div>

        {regras.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 mb-4">Nenhuma regra cadastrada ainda</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Criar Primeira Regra
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prefixo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Sensitive
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regras.map((regra) => (
                  <tr key={regra.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {regra.prefixo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {regra.categoriaNome}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {regra.descricao || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {regra.caseSensitive ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Sim
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(regra)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(regra.uid)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="card bg-purple-50 border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">💡 Dicas de Uso</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Prefixos curtos:</strong> Use prefixos específicos como "elektro" ao invés de "el" para evitar falsos positivos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Case Insensitive:</strong> Recomendado deixar desativado para capturar variações como "ELEKTRO", "Elektro", "elektro"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Teste antes:</strong> Use o testador para verificar se a regra funciona como esperado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Exemplos comuns:</strong> "netflix" → Lazer, "uber" → Transporte, "ifood" → Alimentação</span>
          </li>
        </ul>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingRegra ? 'Editar Regra' : 'Nova Regra'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefixo *
                </label>
                <input
                  type="text"
                  value={formData.prefixo}
                  onChange={(e) => setFormData({ ...formData, prefixo: e.target.value })}
                  className="input-field"
                  placeholder="Ex: elektro, netflix, uber"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Palavra-chave que identifica a transação
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
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
                  placeholder="Ex: Conta de energia elétrica"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional: ajuda a identificar a regra
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.caseSensitive}
                    onChange={(e) => setFormData({ ...formData, caseSensitive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Diferenciar maiúsculas/minúsculas (Case Sensitive)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Recomendado: deixar desmarcado
                </p>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingRegra ? 'Salvar Alterações' : 'Criar Regra'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setError('');
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

export default CategorizadorAutomatico;

