import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { transacaoService } from '../services/transacaoService';
import { analisesService, CategoriaResumo, TendenciaGasto, GastoInvisivel } from '../services/analisesService';
import { categoriaService } from '../services/categoriaService';
import { tagService } from '../services/tagService';
import { Dashboard, Categoria, Tag } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [saldo, setSaldo] = useState<string>('');
  const [saldoPendente, setSaldoPendente] = useState<number>(0);
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [tendencia, setTendencia] = useState<TendenciaGasto[]>([]);
  const [gastosInvisiveis, setGastosInvisiveis] = useState<GastoInvisivel | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado dos filtros
  const [showFilters, setShowFilters] = useState(false);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tagFiltro, setTagFiltro] = useState('');
  const [tipoPagamentoFiltro, setTipoPagamentoFiltro] = useState('');

  // Listas para filtros
  const [listaCategories, setListaCategories] = useState<Categoria[]>([]);
  const [listaTags, setListaTags] = useState<Tag[]>([]);

  // Dados de projeção
  const [projecaoRecorrentes, setProjecaoRecorrentes] = useState<any[]>([]);
  const [projecaoParceladas, setProjecaoParceladas] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [ano, mes, categoriaFiltro, tagFiltro, tipoPagamentoFiltro]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        dashData,
        saldoData,
        comprasParceladas,
        categoriasData,
        tendenciaData,
        invisiveisData,
        categoriasLista,
        tagsLista
      ] = await Promise.all([
        dashboardService.getResumoDashboard(ano, mes),
        transacaoService.getSaldo(),
        transacaoService.getComprasPendentes(),
        analisesService.gastosPorCategoria(ano, mes),
        analisesService.tendenciaGastos(ano),
        analisesService.gastosInvisiveis(ano, mes, 20),
        categoriaService.listar(),
        tagService.listar()
      ]);

      setDashboard(dashData);
      setSaldo(saldoData.saldo);
      setCategorias(categoriasData);
      setTendencia(tendenciaData);
      setGastosInvisiveis(invisiveisData);
      setListaCategories(categoriasLista.filter((c: Categoria) => c.tipo === 'Despesa'));
      setListaTags(tagsLista);

      // Calcular saldo pendente com filtros
      let pendentesFiltrados = comprasParceladas;

      if (categoriaFiltro) {
        pendentesFiltrados = pendentesFiltrados.filter((p: any) =>
          p.categoriaUid === categoriaFiltro
        );
      }

      if (tagFiltro) {
        pendentesFiltrados = pendentesFiltrados.filter((p: any) =>
          p.tags?.some((t: any) => t.uid === tagFiltro)
        );
      }

      const totalPendente = pendentesFiltrados.reduce((acc: number, item: any) =>
        acc + (item.valorPendente || 0), 0
      );
      setSaldoPendente(totalPendente);

      // Processar projeção
      processarProjecao([], comprasParceladas);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processarProjecao = (recorrentes: any[], parceladas: any[]) => {
    const proximosMeses = 6;
    const hoje = new Date();
    const projecaoRec: any[] = [];
    const projecaoPar: any[] = [];

    for (let i = 0; i < proximosMeses; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesAno = `${data.toLocaleString('pt-BR', { month: 'short' })}/${data.getFullYear().toString().slice(-2)}`;

      let totalRecorrente = 0;
      let totalParcelada = 0;

      // Calcular parceladas para este mês (com filtros)
      parceladas
        .filter((p: any) => {
          const dataTransacao = new Date(p.data);
          return dataTransacao.getMonth() === data.getMonth() &&
                 dataTransacao.getFullYear() === data.getFullYear();
        })
        .forEach((p: any) => {
          if (categoriaFiltro && p.categoriaUid !== categoriaFiltro) return;
          if (tagFiltro && !p.tags?.some((t: any) => t.uid === tagFiltro)) return;

          totalParcelada += p.valorPendente || 0;
        });

      projecaoRec.push({ mes: mesAno, valor: totalRecorrente });
      projecaoPar.push({ mes: mesAno, valor: totalParcelada });
    }

    setProjecaoRecorrentes(projecaoRec);
    setProjecaoParceladas(projecaoPar);
  };

  const limparFiltros = () => {
    setCategoriaFiltro('');
    setTagFiltro('');
    setTipoPagamentoFiltro('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'SUBIU': return '📈';
      case 'DESCEU': return '📉';
      case 'ESTAVEL': return '➡️';
      default: return '➖';
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'SUBIU': return 'text-red-600';
      case 'DESCEU': return 'text-green-600';
      case 'ESTAVEL': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Configuração do gráfico de tendência
  const chartData = {
    labels: tendencia.map(t => t.periodo),
    datasets: [
      {
        label: 'Gastos Mensais',
        data: tendencia.map(t => t.total),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  // Configuração do gráfico de projeção
  const projecaoChartData = {
    labels: projecaoRecorrentes.map(p => p.mes),
    datasets: [
      {
        label: 'Gastos Recorrentes',
        data: projecaoRecorrentes.map(p => p.valor),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Compras Parceladas',
        data: projecaoParceladas.map(p => p.valor),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Total Comprometido',
        data: projecaoRecorrentes.map((p, i) => p.valor + (projecaoParceladas[i]?.valor || 0)),
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  };

  const projecaoChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filtrosAtivos = [
    categoriaFiltro && 'Categoria',
    tagFiltro && 'Tag',
    tipoPagamentoFiltro && 'Pagamento'
  ].filter(Boolean).length;

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <p className="text-gray-600 mt-1">Visão completa das suas finanças com análises avançadas</p>
      </div>

      {/* Botão de Filtros */}
      <div className="card">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900">Filtros</span>
            {filtrosAtivos > 0 && (
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                {filtrosAtivos}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Painel de Filtros Expansível */}
        {showFilters && (
          <div className="p-4 border-t border-gray-200 animate-in slide-in-from-top">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                  className="input-field"
                >
                  {anos.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="input-field"
                >
                  {meses.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
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
                  <option value="">Todas</option>
                  {listaCategories.map((cat) => (
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
                  <option value="">Todas</option>
                  {listaTags.map((tag) => (
                    <option key={tag.uid} value={tag.uid}>{tag.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
                <select
                  value={tipoPagamentoFiltro}
                  onChange={(e) => setTipoPagamentoFiltro(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos</option>
                  <option value="PIX">PIX</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </div>
            </div>
            {filtrosAtivos > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={limparFiltros}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpar Filtros
                </button>
                <span className="text-xs text-gray-500">
                  {[
                    categoriaFiltro && `Categoria: ${listaCategories.find(c => c.uid === categoriaFiltro)?.nome}`,
                    tagFiltro && `Tag: ${listaTags.find(t => t.uid === tagFiltro)?.nome}`,
                    tipoPagamentoFiltro && `Pagamento: ${tipoPagamentoFiltro}`
                  ].filter(Boolean).join(' • ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards de Resumo Principais */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-600">Receitas</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(dashboard.totalReceita)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-red-600">Despesas</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(dashboard.totalDespesa)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-orange-600">Saldo Pendente</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(saldoPendente)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600">Saldo Disponível</p>
                <p className="text-2xl font-bold text-blue-900">{saldo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Tendência */}
      {tendencia.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Evolução dos Gastos (12 meses)</h2>
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Gráfico de Projeção */}
      {projecaoRecorrentes.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            💰 Projeção de Gastos Comprometidos (Próximos 6 meses)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Visualize seus gastos futuros: recorrentes (fixos mensais) e parcelados (compras a prazo)
            {filtrosAtivos > 0 &&
              <span className="text-primary-600 font-medium"> • Filtros aplicados</span>
            }
          </p>
          <div style={{ height: '350px' }}>
            <Line data={projecaoChartData} options={projecaoChartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm font-medium text-blue-900">Gastos Recorrentes</span>
              </div>
              <p className="text-xs text-blue-700">Despesas fixas mensais</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm font-medium text-orange-900">Compras Parceladas</span>
              </div>
              <p className="text-xs text-orange-700">Parcelas pendentes</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded dashed"></div>
                <span className="text-sm font-medium text-red-900">Total Comprometido</span>
              </div>
              <p className="text-xs text-red-700">Soma total</p>
            </div>
          </div>
        </div>
      )}

      {/* Análise por Categoria */}
      {categorias.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Para onde meu dinheiro está indo?</h2>
          <p className="text-sm text-gray-600 mb-4">Análise detalhada por categoria com comparação ao mês anterior</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gasto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% do Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tendência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categorias.map((cat, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{cat.categoria}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{formatCurrency(cat.total)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min(cat.percentual, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{cat.percentual.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cat.variacao >= 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {cat.variacao >= 0 ? '+' : ''}{cat.variacao.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTendenciaColor(cat.tendencia)}>
                        {getTendenciaIcon(cat.tendencia)} {cat.tendencia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cat.dentroOrcamento ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          ✅ No orçamento
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          ⚠️ Acima
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gastos Invisíveis */}
      {gastosInvisiveis && gastosInvisiveis.quantidade > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Gastos Invisíveis (Até R$ 20)</h2>
          <p className="text-sm text-gray-600 mb-4">Pequenos gastos que somam muito no final do mês</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="text-3xl font-bold text-yellow-900">{gastosInvisiveis.quantidade}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-yellow-900">{formatCurrency(gastosInvisiveis.valorTotal)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">% do Total</p>
              <p className="text-3xl font-bold text-yellow-900">{gastosInvisiveis.percentualDoTotal.toFixed(1)}%</p>
            </div>
          </div>
          {gastosInvisiveis.exemplos.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Exemplos:</p>
              <div className="flex flex-wrap gap-2">
                {gastosInvisiveis.exemplos.map((exemplo, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {exemplo}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="bg-yellow-100 rounded-lg p-3">
            <p className="text-sm text-yellow-900">
              💡 <strong>Dica:</strong> Pequenos gastos somam! Considere reduzir compras impulsivas
              para economizar {formatCurrency(gastosInvisiveis.valorTotal)} por mês.
            </p>
          </div>
        </div>
      )}

      {/* Top 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top 5 Cartões */}
        {dashboard?.top5GastosCartoes && dashboard.top5GastosCartoes.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Top 5 Cartões</h3>
            <div className="space-y-3">
              {dashboard.top5GastosCartoes.map((item, index) => (
                <div key={item.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{item.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.valor)}</p>
                    <p className="text-xs text-gray-500">{item.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 Tags */}
        {dashboard?.top5GastosTags && dashboard.top5GastosTags.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Top 5 Tags</h3>
            <div className="space-y-3">
              {dashboard.top5GastosTags.map((item, index) => (
                <div key={item.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{item.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.valor)}</p>
                    <p className="text-xs text-gray-500">{item.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 Categorias */}
        {dashboard?.top5GastosCategorias && dashboard.top5GastosCategorias.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📂 Top 5 Categorias</h3>
            <div className="space-y-3">
              {dashboard.top5GastosCategorias.map((item, index) => (
                <div key={item.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                    <span className="text-sm text-gray-700">{item.nome}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(item.valor)}</p>
                    <p className="text-xs text-gray-500">{item.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">💡 Insights Financeiros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
          <div className="flex items-start gap-2">
            <span className="text-lg">📊</span>
            <div>
              <strong>Para onde meu dinheiro está indo?</strong>
              <p className="text-purple-700">Veja o percentual de cada categoria na tabela acima</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📈</span>
            <div>
              <strong>Estou gastando mais ou menos?</strong>
              <p className="text-purple-700">Observe a tendência no gráfico e a variação percentual</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <strong>Onde estou estourando?</strong>
              <p className="text-purple-700">Categorias marcadas com "Acima do orçamento"</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🔍</span>
            <div>
              <strong>Gastos invisíveis:</strong>
              <p className="text-purple-700">Pequenas compras que somam muito no final do mês</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

