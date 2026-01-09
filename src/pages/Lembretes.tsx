import React, { useEffect, useState } from 'react';
import { lembretesService, Lembrete, LembretesAgrupados } from '../services/lembretesService';

const Lembretes: React.FC = () => {
  const [lembretesAgrupados, setLembretesAgrupados] = useState<LembretesAgrupados | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLembretes();
  }, []);

  const loadLembretes = async () => {
    try {
      setLoading(true);
      const data = await lembretesService.proximos();
      setLembretesAgrupados(data);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
      setError('Erro ao carregar lembretes');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarLembretesFatura = async () => {
    try {
      setError('');
      await lembretesService.criarLembretesFatura();
      showMessage('Lembretes de fatura criados com sucesso!');
      loadLembretes();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao criar lembretes');
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir este lembrete?')) {
      try {
        await lembretesService.deletar(uid);
        showMessage('Lembrete excluído com sucesso!');
        loadLembretes();
      } catch (error) {
        setError('Erro ao excluir lembrete');
      }
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO_META':
        return '💰';
      case 'PAGAMENTO_FATURA':
        return '💳';
      case 'PROGRESSO_META':
        return '🎉';
      case 'RECORRENCIA':
        return '🔄';
      default:
        return '📌';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO_META':
        return 'Depósito em Meta';
      case 'PAGAMENTO_FATURA':
        return 'Pagamento de Fatura';
      case 'PROGRESSO_META':
        return 'Conquista de Meta';
      case 'RECORRENCIA':
        return 'Transação Recorrente';
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'DEPOSITO_META':
        return 'bg-blue-100 text-blue-800';
      case 'PAGAMENTO_FATURA':
        return 'bg-red-100 text-red-800';
      case 'PROGRESSO_META':
        return 'bg-green-100 text-green-800';
      case 'RECORRENCIA':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderLembrete = (lembrete: Lembrete, showDelete: boolean = true) => (
    <div key={lembrete.uid} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{getTipoIcon(lembrete.tipo)}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{lembrete.titulo}</h3>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTipoColor(lembrete.tipo)}`}>
                {getTipoLabel(lembrete.tipo)}
              </span>
            </div>
            {showDelete && lembrete.tipo !== 'PROGRESSO_META' && (
              <button
                onClick={() => handleDelete(lembrete.uid)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-gray-700 mb-2">{lembrete.descricao}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📅 Dia {lembrete.dia} de cada mês</span>
            {lembrete.diasAteVencimento !== undefined && (
              <span className={lembrete.venceHoje ? 'text-red-600 font-bold' : ''}>
                {lembrete.venceHoje ? '⚠️ Vence hoje!' : `⏰ ${lembrete.diasAteVencimento} dias`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalLembretes = lembretesAgrupados
    ? Object.values(lembretesAgrupados).flat().length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lembretes</h1>
        <p className="text-gray-600 mt-1">Acompanhe suas pendências e conquistas</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <strong>Como funciona:</strong> Os lembretes são criados automaticamente quando você:
              adiciona metas (lembrete de depósito), cadastra cartões (lembrete de fatura),
              ou atinge marcos de progresso (25%, 50%, 75%, 100% das metas).
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

      {/* Botão Criar Lembretes de Fatura */}
      <div className="flex justify-end">
        <button onClick={handleCriarLembretesFatura} className="btn-primary">
          💳 Criar Lembretes de Faturas
        </button>
      </div>

      {/* Contador */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div>
            <p className="text-sm text-gray-600">Total de Lembretes</p>
            <p className="text-3xl font-bold text-primary-600">{totalLembretes}</p>
          </div>
        </div>
      </div>

      {totalLembretes === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-500 mb-4">Nenhum lembrete ativo no momento</p>
          <button onClick={handleCriarLembretesFatura} className="btn-primary">
            Criar Lembretes de Faturas
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Lembretes de Hoje */}
          {lembretesAgrupados?.HOJE && lembretesAgrupados.HOJE.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-red-600">⚠️ Hoje</h2>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {lembretesAgrupados.HOJE.length}
                </span>
              </div>
              <div className="space-y-3">
                {lembretesAgrupados.HOJE.map(lembrete => renderLembrete(lembrete))}
              </div>
            </div>
          )}

          {/* Próximos 7 Dias */}
          {lembretesAgrupados?.PROXIMOS_7_DIAS && lembretesAgrupados.PROXIMOS_7_DIAS.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-orange-600">📅 Próximos 7 Dias</h2>
                <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {lembretesAgrupados.PROXIMOS_7_DIAS.length}
                </span>
              </div>
              <div className="space-y-3">
                {lembretesAgrupados.PROXIMOS_7_DIAS.map(lembrete => renderLembrete(lembrete))}
              </div>
            </div>
          )}

          {/* Este Mês */}
          {lembretesAgrupados?.ESTE_MES && lembretesAgrupados.ESTE_MES.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-blue-600">📆 Este Mês</h2>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {lembretesAgrupados.ESTE_MES.length}
                </span>
              </div>
              <div className="space-y-3">
                {lembretesAgrupados.ESTE_MES.map(lembrete => renderLembrete(lembrete))}
              </div>
            </div>
          )}

          {/* Conquistas de Metas */}
          {lembretesAgrupados?.PROGRESSO_METAS && lembretesAgrupados.PROGRESSO_METAS.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-green-600">🎉 Conquistas</h2>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {lembretesAgrupados.PROGRESSO_METAS.length}
                </span>
              </div>
              <div className="space-y-3">
                {lembretesAgrupados.PROGRESSO_METAS.map(lembrete => renderLembrete(lembrete, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dicas */}
      <div className="card bg-purple-50 border-purple-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">💡 Dicas</h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Lembretes de Meta:</strong> Criados automaticamente ao criar uma meta, no dia do depósito mensal</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Lembretes de Fatura:</strong> Use o botão acima para criar lembretes para todos os cartões cadastrados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Conquistas:</strong> Aparecem automaticamente ao atingir 25%, 50%, 75% e 100% das metas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Excluir:</strong> Você pode excluir lembretes de depósito e fatura, mas conquistas ficam salvas</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Lembretes;

