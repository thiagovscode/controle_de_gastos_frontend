import React, { useEffect, useState } from 'react';
import { transacaoService } from '../services/transacaoService';
import { categoriaService } from '../services/categoriaService';
import { cartaoService } from '../services/cartaoService';
import { tagService } from '../services/tagService';
import { Transacao, Categoria, Cartao, Tag, TransacaoRequest } from '../types';
import { format } from 'date-fns';

const Transacoes: React.FC = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Estados de filtro
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroCartao, setFiltroCartao] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroDescricao, setFiltroDescricao] = useState('');
  const [showOcultas, setShowOcultas] = useState(false);

  // Transações filtradas
  const [transacoesFiltradas, setTransacoesFiltradas] = useState<Transacao[]>([]);

  const [formData, setFormData] = useState<TransacaoRequest>({
    valor: 0,
    data: format(new Date(), 'yyyy-MM-dd'),
    categoriaUid: '',
    descricao: '',
    cartaoUid: undefined,
    tipoPagamento: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [transacoes, filtroCategoria, filtroCartao, filtroTag, filtroTipo, filtroDataInicio, filtroDataFim, filtroDescricao, showOcultas]);

  const aplicarFiltros = () => {
    let filtradas = [...transacoes];

    // Filtro de categoria
    if (filtroCategoria) {
      filtradas = filtradas.filter(t => t.categoria.uid === filtroCategoria);
    }

    // Filtro de cartão
    if (filtroCartao) {
      filtradas = filtradas.filter(t => t.cartao?.uid === filtroCartao);
    }

    // Filtro de tag
    if (filtroTag) {
      filtradas = filtradas.filter(t => t.tags?.some(tag => tag.uid === filtroTag));
    }

    // Filtro de tipo (Receita/Despesa)
    if (filtroTipo) {
      filtradas = filtradas.filter(t => t.categoria.tipo === filtroTipo);
    }

    // Filtro de descrição
    if (filtroDescricao) {
      filtradas = filtradas.filter(t =>
        t.descricao?.toLowerCase().includes(filtroDescricao.toLowerCase())
      );
    }

    // Filtro de data início
    if (filtroDataInicio) {
      filtradas = filtradas.filter(t => new Date(t.data) >= new Date(filtroDataInicio));
    }

    // Filtro de data fim
    if (filtroDataFim) {
      filtradas = filtradas.filter(t => new Date(t.data) <= new Date(filtroDataFim));
    }

    // Filtro de transações ocultas
    if (!showOcultas) {
      filtradas = filtradas.filter(t => !t.oculta);
    }

    setTransacoesFiltradas(filtradas);
  };

  const limparFiltros = () => {
    setFiltroCategoria('');
    setFiltroCartao('');
    setFiltroTag('');
    setFiltroTipo('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroDescricao('');
    setShowOcultas(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [transacoesData, categoriasData, cartoesData, tagsData] = await Promise.all([
        transacaoService.listar(),
        categoriaService.listar(),
        cartaoService.listar(),
        tagService.listar(),
      ]);
      setTransacoes(transacoesData);
      setCategorias(categoriasData);
      setCartoes(cartoesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        tagUids: selectedTags.length > 0 ? selectedTags : undefined,
      };

      if (editingTransacao) {
        await transacaoService.editar(editingTransacao.uuid, dataToSend);
      } else {
        await transacaoService.criar(dataToSend);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir esta transação?')) {
      try {
        await transacaoService.deletar(uid);
        loadData();
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
      }
    }
  };

  const handleToggleOculta = async (uid: string, ocultar: boolean) => {
    try {
      await transacaoService.toggleOcultar(uid, ocultar);
      loadData();
    } catch (error) {
      console.error('Erro ao ocultar/exibir transação:', error);
    }
  };

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setFormData({
      valor: transacao.valor,
      data: format(new Date(transacao.data), 'yyyy-MM-dd'),
      categoriaUid: transacao.categoria.uid,
      descricao: transacao.descricao || '',
      cartaoUid: transacao.cartao?.uid,
      tipoPagamento: transacao.tipoPagamento || '',
    });
    setSelectedTags(transacao.tags?.map(t => t.uid) || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      valor: 0,
      data: format(new Date(), 'yyyy-MM-dd'),
      categoriaUid: '',
      descricao: '',
      cartaoUid: undefined,
      tipoPagamento: '',
    });
    setSelectedTags([]);
    setEditingTransacao(null);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const cartaoSelect = form.querySelector('select') as HTMLSelectElement;

    if (fileInput.files && fileInput.files[0]) {
      try {
        await transacaoService.importarCSV(
          fileInput.files[0],
          cartaoSelect.value || undefined
        );
        setShowImportModal(false);
        loadData();
        alert('Importação realizada com sucesso!');
      } catch (error) {
        console.error('Erro ao importar CSV:', error);
        alert('Erro ao importar arquivo');
      }
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary"
          >
            Importar CSV
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Nova Transação
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={limparFiltros}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Filtro Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.uid} value={categoria.uid}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Cartão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cartão
            </label>
            <select
              value={filtroCartao}
              onChange={(e) => setFiltroCartao(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              {cartoes.map((cartao) => (
                <option key={cartao.uid} value={cartao.uid}>
                  {cartao.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <select
              value={filtroTag}
              onChange={(e) => setFiltroTag(e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {tags.map((tag) => (
                <option key={tag.uid} value={tag.uid}>
                  {tag.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </div>

          {/* Filtro Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Filtro Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
      {/* Lista de Transações */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cartão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacoesFiltradas.map((transacao) => (
                <tr key={transacao.uuid} className={`hover:bg-gray-50 ${transacao.oculta ? 'bg-gray-100 opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(transacao.data), 'dd/MM/yyyy')}
                    {transacao.oculta && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-500 text-white rounded text-xs">
                        Oculta
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transacao.descricao || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transacao.categoria.tipo === 'Receita'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transacao.categoria.nome}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {transacao.tags && transacao.tags.length > 0 ? (
                        transacao.tags.map((tag) => (
                          <span
                            key={tag.uid}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {tag.nome}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transacao.cartao?.nome || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transacao.tipoPagamento ? (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {transacao.tipoPagamento}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transacao.categoria.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transacao.categoria.tipo === 'Receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(transacao)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleOculta(transacao.uuid, !transacao.oculta)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      {transacao.oculta ? 'Exibir' : 'Ocultar'}
                    </button>
                    <button
                      onClick={() => handleDelete(transacao.uuid)}
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
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingTransacao ? 'Editar Transação' : 'Nova Transação'}
            </h2>
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
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cartão (opcional)
                </label>
                <select
                  value={formData.cartaoUid || ''}
                  onChange={(e) => setFormData({ ...formData, cartaoUid: e.target.value || undefined })}
                  className="input-field"
                >
                  <option value="">Nenhum</option>
                  {cartoes.map((cartao) => (
                    <option key={cartao.uid} value={cartao.uid}>
                      {cartao.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento (opcional)
                </label>
                <select
                  value={formData.tipoPagamento || ''}
                  onChange={(e) => setFormData({ ...formData, tipoPagamento: e.target.value })}
                  className="input-field"
                >
                  <option value="">Selecione</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="DEBITO">Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="BOLETO">Boleto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (opcional)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma tag disponível</p>
                  ) : (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <label key={tag.uid} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.uid)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, tag.uid]);
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag.uid));
                              }
                            }}
                            className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{tag.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Importar CSV</h2>
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arquivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cartão (opcional)
                </label>
                <select className="input-field">
                  <option value="">Nenhum</option>
                  {cartoes.map((cartao) => (
                    <option key={cartao.uid} value={cartao.uid}>
                      {cartao.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Importar
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
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

export default Transacoes;

