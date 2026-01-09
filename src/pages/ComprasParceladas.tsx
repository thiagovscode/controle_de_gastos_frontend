import React, { useEffect, useState } from 'react';
import { transacaoService } from '../services/transacaoService';
import { categoriaService } from '../services/categoriaService';
import { cartaoService } from '../services/cartaoService';
import { tagService } from '../services/tagService';
import { Categoria, Cartao, Tag } from '../types';

interface CompraParcelada {
  uuid: string;
  descricao: string;
  categoriaUid: string;
  tags: string[];
  cartaoUid: string;
  parcelaAtual: number;
  totalParcelas: number;
  valorParcela: number;
  valorPendente: number;
}

const ComprasParceladas: React.FC = () => {
  const [compras, setCompras] = useState<CompraParcelada[]>([]);
  const [comprasFiltradas, setComprasFiltradas] = useState<CompraParcelada[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [cartaoFiltro, setCartaoFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tagFiltro, setTagFiltro] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [cartaoFiltro, categoriaFiltro, tagFiltro, compras]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [comprasData, categoriasData, cartoesData, tagsData] = await Promise.all([
        transacaoService.getComprasPendentes(),
        categoriaService.listar(),
        cartaoService.listar(),
        tagService.listar(),
      ]);
      setCompras(comprasData);
      setCategorias(categoriasData);
      setCartoes(cartoesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Erro ao carregar compras parceladas:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtradas = [...compras];

    if (cartaoFiltro) {
      filtradas = filtradas.filter(c => c.cartaoUid === cartaoFiltro);
    }

    if (categoriaFiltro) {
      filtradas = filtradas.filter(c => c.categoriaUid === categoriaFiltro);
    }

    if (tagFiltro) {
      filtradas = filtradas.filter(c => c.tags.includes(tagFiltro));
    }

    setComprasFiltradas(filtradas);
  };

  const limparFiltros = () => {
    setCartaoFiltro('');
    setCategoriaFiltro('');
    setTagFiltro('');
  };

  const getCategoriaNome = (uid: string) => {
    return categorias.find(c => c.uid === uid)?.nome || 'Sem categoria';
  };

  const getCartaoNome = (uid: string) => {
    return cartoes.find(c => c.uid === uid)?.nome || 'Sem cartão';
  };

  const getTagsNomes = (tagUids: string[]) => {
    return tagUids.map(uid => tags.find(t => t.uid === uid)?.nome || '').filter(n => n);
  };

  const calcularMesesRestantes = (parcelaAtual: number, totalParcelas: number) => {
    return totalParcelas - parcelaAtual;
  };

  const calcularDataFinal = (parcelaAtual: number, totalParcelas: number) => {
    const mesesRestantes = calcularMesesRestantes(parcelaAtual, totalParcelas);
    const dataFinal = new Date();
    dataFinal.setMonth(dataFinal.getMonth() + mesesRestantes);
    return dataFinal.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const totalGeral = comprasFiltradas.reduce((acc, c) => acc + c.valorPendente, 0);
  const totalPorCartao = cartoes.map(cartao => ({
    nome: cartao.nome,
    total: comprasFiltradas
      .filter(c => c.cartaoUid === cartao.uid)
      .reduce((acc, c) => acc + c.valorPendente, 0)
  })).filter(c => c.total > 0);

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
          <h1 className="text-3xl font-bold text-gray-900">💳 Compras Parceladas</h1>
          <p className="text-gray-600 mt-1">Acompanhe suas parcelas pendentes</p>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Total Pendente</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                R$ {totalGeral.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Compras</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {comprasFiltradas.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Cartões Ativos</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {totalPorCartao.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
            <select
              value={cartaoFiltro}
              onChange={(e) => setCartaoFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os cartões</option>
              {cartoes.map(cartao => (
                <option key={cartao.uid} value={cartao.uid}>{cartao.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.uid} value={cat.uid}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              value={tagFiltro}
              onChange={(e) => setTagFiltro(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as tags</option>
              {tags.map(tag => (
                <option key={tag.uid} value={tag.uid}>{tag.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={limparFiltros}
              className="btn-secondary w-full"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Total por Cartão */}
      {totalPorCartao.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Resumo por Cartão</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {totalPorCartao.map(item => (
              <div key={item.nome} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 font-medium">{item.nome}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  R$ {item.total.toFixed(2).replace('.', ',')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Compras Parceladas */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Compras Parceladas</h2>

        {comprasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">📭 Nenhuma compra parcelada encontrada</p>
            <p className="text-gray-400 text-sm mt-2">
              {cartaoFiltro || categoriaFiltro || tagFiltro
                ? 'Tente ajustar os filtros'
                : 'Suas compras parceladas aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comprasFiltradas.map(compra => (
              <div key={compra.uuid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{compra.descricao}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getCartaoNome(compra.cartaoUid)}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {getCategoriaNome(compra.categoriaUid)}
                      </span>
                      {getTagsNomes(compra.tags).map(tag => (
                        <span key={tag} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600">Valor Pendente</p>
                    <p className="text-xl font-bold text-orange-600">
                      R$ {compra.valorPendente.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Parcela Atual</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {compra.parcelaAtual} / {compra.totalParcelas}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor da Parcela</p>
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {compra.valorParcela.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Meses Restantes</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {calcularMesesRestantes(compra.parcelaAtual, compra.totalParcelas)} meses
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Término Previsto</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {calcularDataFinal(compra.parcelaAtual, compra.totalParcelas)}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{((compra.parcelaAtual / compra.totalParcelas) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(compra.parcelaAtual / compra.totalParcelas) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprasParceladas;

