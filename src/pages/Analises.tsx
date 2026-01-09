import React, { useEffect, useState } from 'react';
import { analisesService, ResumoDashboard, CategoriaResumo, TendenciaGasto, GastoInvisivel } from '../services/analisesService';
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

const Analises: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [tendencia, setTendencia] = useState<TendenciaGasto[]>([]);
  const [gastosInvisiveis, setGastosInvisiveis] = useState<GastoInvisivel | null>(null);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalises();
  }, [ano, mes]);

  const loadAnalises = async () => {
    try {
      setLoading(true);
      setError('');
      const [resumoData, categoriasData, tendenciaData, invisiveisData] = await Promise.all([
        analisesService.resumoDashboard(ano, mes),
        analisesService.gastosPorCategoria(ano, mes),
        analisesService.tendenciaGastos(ano, mes),
        analisesService.gastosInvisiveis(ano, mes, 20),
      ]);

      setResumo(resumoData);
      setCategorias(categoriasData);
      setTendencia(tendenciaData);
      setGastosInvisiveis(invisiveisData);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      setError('Erro ao carregar análises. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'SUBIU':
        return '📈';
      case 'DESCEU':
        return '📉';
      case 'ESTAVEL':
        return '➡️';
      default:
        return '➖';
    }
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'SUBIU':
        return 'text-red-600';
      case 'DESCEU':
        return 'text-green-600';
      case 'ESTAVEL':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Análises Financeiras</h1>
        <p className="text-gray-600 mt-1">Insights detalhados sobre seus gastos e evolução</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm text-green-800">
              <strong>Análises Avançadas:</strong> Visualize tendências, compare períodos,
              identifique gastos invisíveis e acompanhe sua evolução financeira ao longo do tempo.
            </div>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Período de Análise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <button onClick={loadAnalises} className="btn-primary w-full">
              🔍 Analisar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600">Total Gasto</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(resumo.totalGasto)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-purple-600">Orçamento</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(resumo.totalOrcamento)}</p>
              </div>
            </div>
          </div>

          <div className="card bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-orange-600">% Usado</p>
                <p className="text-xl font-bold text-orange-900">{resumo.percentualUsado.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-600">Saldo</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(resumo.saldo)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Tendência */}
      {tendencia.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Tendência de Gastos (12 meses)</h2>
          <div style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Análise por Categoria */}
      {categorias.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Análise por Categoria</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gasto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % do Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tendência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
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
                      <span className="text-gray-900">{cat.percentual.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cat.variacao >= 0 ? 'text-red-600' : 'text-green-600'}>
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
                          ⚠️ Acima do orçamento
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Quantidade</p>
              <p className="text-2xl font-bold text-yellow-900">{gastosInvisiveis.quantidade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(gastosInvisiveis.valorTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">% do Total</p>
              <p className="text-2xl font-bold text-yellow-900">{gastosInvisiveis.percentualDoTotal.toFixed(1)}%</p>
            </div>
          </div>
          {gastosInvisiveis.exemplos.length > 0 && (
            <div>
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
          <div className="bg-yellow-100 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-900">
              💡 <strong>Dica:</strong> Pequenos gastos somam! Considere reduzir compras impulsivas
              para economizar {formatCurrency(gastosInvisiveis.valorTotal)} por mês.
            </p>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card bg-purple-50 border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">💡 Insights Financeiros</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Para onde meu dinheiro está indo?</strong> Veja o percentual de cada categoria na tabela acima</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Estou gastando mais ou menos?</strong> Observe a tendência no gráfico e a variação percentual</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Onde estou estourando?</strong> Categorias marcadas com "Acima do orçamento"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Gastos invisíveis:</strong> Pequenas compras que somam muito no final do mês</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analises;

