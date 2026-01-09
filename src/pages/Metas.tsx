import React, { useEffect, useState } from 'react';
import { metasService, MetaCofre, DepositoCofre, LembreteProgresso } from '../services/metasService';
import { categoriaService } from '../services/categoriaService';
import { Categoria } from '../types';

const Metas: React.FC = () => {
  const [metas, setMetas] = useState<MetaCofre[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<MetaCofre | null>(null);
  const [historico, setHistorico] = useState<DepositoCofre[]>([]);
  const [lembretesProgresso, setLembretesProgresso] = useState<LembreteProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaCofre | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valorObjetivo: '',
    valorMensal: '',
    diaDeposito: '',
    dataInicio: '',
    dataLimite: '',
  });

  const [depositData, setDepositData] = useState({
    valor: '',
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metasData, categoriasData] = await Promise.all([
        metasService.listar(),
        categoriaService.listar(),
      ]);
      setMetas(metasData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMetaDetails = async (meta: MetaCofre) => {
    try {
      const [hist, lembretes] = await Promise.all([
        metasService.historico(meta.uid),
        metasService.lembretesProgresso(meta.uid),
      ]);
      setHistorico(hist);
      setLembretesProgresso(lembretes);
      setSelectedMeta(meta);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const metaData = {
        nome: formData.nome,
        descricao: formData.descricao,
        valorObjetivo: parseFloat(formData.valorObjetivo),
        valorMensal: parseFloat(formData.valorMensal),
        diaDeposito: parseInt(formData.diaDeposito),
        dataInicio: formData.dataInicio || undefined,
        dataLimite: formData.dataLimite || undefined,
      };

      if (editingMeta) {
        await metasService.atualizar(editingMeta.uid, metaData);
        showMessage('Meta atualizada com sucesso!');
      } else {
        await metasService.criar(metaData);
        showMessage('Meta criada com sucesso!');
      }

      setShowModal(false);
      resetForm();
      setEditingMeta(null);
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || (editingMeta ? 'Erro ao atualizar meta' : 'Erro ao criar meta'));
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeta) return;

    try {
      setError('');
      const updated = await metasService.depositar(
        selectedMeta.uid,
        parseFloat(depositData.valor),
        depositData.observacao
      );

      showMessage(
        updated.concluida
          ? '🎉 Parabéns! Meta concluída!'
          : 'Depósito realizado com sucesso!'
      );

      setShowDepositModal(false);
      setDepositData({ valor: '', observacao: '' });
      loadData();

      // Recarregar detalhes se modal estiver aberto
      if (showDetailModal) {
        loadMetaDetails(updated);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao depositar');
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir esta meta? Todo o histórico será perdido.')) {
      try {
        await metasService.deletar(uid);
        showMessage('Meta excluída com sucesso!');
        loadData();
        if (showDetailModal) setShowDetailModal(false);
      } catch (error) {
        setError('Erro ao excluir meta');
      }
    }
  };

  const handleEdit = (meta: MetaCofre) => {
    setEditingMeta(meta);
    setFormData({
      nome: meta.nome,
      descricao: meta.descricao || '',
      valorObjetivo: meta.valorObjetivo.toString(),
      valorMensal: meta.valorMensal.toString(),
      diaDeposito: meta.diaDeposito.toString(),
      dataInicio: meta.dataInicio || '',
      dataLimite: meta.dataLimite || '',
    });
    setShowModal(true);
    if (showDetailModal) setShowDetailModal(false);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      valorObjetivo: '',
      valorMensal: '',
      diaDeposito: '',
      dataInicio: '',
      dataLimite: '',
    });
    setEditingMeta(null);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'bg-green-100 text-green-800';
      case 'EM_DIA': return 'bg-blue-100 text-blue-800';
      case 'ATRASADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_DIA': return 'Em dia';
      case 'ATRASADO': return 'Atrasado';
      default: return status;
    }
  };

  // Calcular valor total comprometido nas metas
  const valorTotalMetas = metas.reduce((sum, meta) => sum + meta.valorAtual, 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Metas (Cofres)</h1>
        <p className="text-gray-600 mt-1">Defina objetivos financeiros e acompanhe seu progresso</p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-purple-800">
              <strong>Como funciona:</strong> Crie metas para seus objetivos financeiros (ex: carro, viagem).
              A cada depósito, o sistema registra como despesa no seu extrato e soma ao saldo da meta.
              Você receberá lembretes motivacionais ao atingir 25%, 50%, 75% e 100% da meta!
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

      {/* Card de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-600">Total em Metas</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(valorTotalMetas)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-green-600">Metas Ativas</p>
              <p className="text-2xl font-bold text-green-900">{metas.filter(m => m.ativa && !m.concluida).length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-purple-600">Concluídas</p>
              <p className="text-2xl font-bold text-purple-900">{metas.filter(m => m.concluida).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Criar Meta */}
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Nova Meta
        </button>
      </div>

      {/* Grid de Metas */}
      {metas.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 mb-4">Nenhuma meta cadastrada ainda</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Criar Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metas.map((meta) => (
            <div key={meta.uid} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div onClick={() => loadMetaDetails(meta)}>
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{meta.nome}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(meta.status)}`}>
                    {getStatusLabel(meta.status)}
                  </span>
                </div>

                {/* Descrição */}
                {meta.descricao && (
                  <p className="text-sm text-gray-600 mb-4">{meta.descricao}</p>
                )}

                {/* Valores */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Atual:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(meta.valorAtual)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(meta.valorObjetivo)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Faltam:</span>
                    <span className="font-bold text-red-600">{formatCurrency(meta.valorFaltante)}</span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-bold text-primary-600">{meta.percentualAtingido.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(meta.percentualAtingido, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Info Adicional */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>💰 Depósito mensal: {formatCurrency(meta.valorMensal)}</p>
                  <p>📅 Próximo depósito: dia {meta.diaDeposito}</p>
                  {meta.mesesRestantes !== undefined && meta.mesesRestantes > 0 && (
                    <p>⏱️ Faltam {meta.mesesRestantes} {meta.mesesRestantes === 1 ? 'mês' : 'meses'}</p>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                {!meta.concluida && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMeta(meta);
                      setShowDepositModal(true);
                    }}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    💵 Depositar
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadMetaDetails(meta);
                  }}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  📊 Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Meta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Meta</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Meta *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input-field"
                    placeholder="Ex: Comprar um carro"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Juntar para entrada do carro novo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Objetivo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorObjetivo}
                    onChange={(e) => setFormData({ ...formData, valorObjetivo: e.target.value })}
                    className="input-field"
                    placeholder="30000.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Depósito Mensal *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorMensal}
                    onChange={(e) => setFormData({ ...formData, valorMensal: e.target.value })}
                    className="input-field"
                    placeholder="1500.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia do Depósito *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaDeposito}
                    onChange={(e) => setFormData({ ...formData, diaDeposito: e.target.value })}
                    className="input-field"
                    placeholder="28"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dia do mês para lembrete de depósito
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Limite (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.dataLimite}
                    onChange={(e) => setFormData({ ...formData, dataLimite: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Data objetivo para atingir a meta
                  </p>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingMeta ? 'Atualizar Meta' : 'Criar Meta'}
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

      {/* Modal Depositar */}
      {showDepositModal && selectedMeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Depositar em: {selectedMeta.nome}
            </h2>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Lembrete:</strong> Este depósito será registrado como despesa
                no seu extrato (categoria "Poupança")
              </p>
            </div>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Depósito *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={depositData.valor}
                  onChange={(e) => setDepositData({ ...depositData, valor: e.target.value })}
                  className="input-field"
                  placeholder={`Sugestão: ${formatCurrency(selectedMeta.valorMensal)}`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observação
                </label>
                <textarea
                  value={depositData.observacao}
                  onChange={(e) => setDepositData({ ...depositData, observacao: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Ex: Janeiro 2026"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Confirmar Depósito
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositData({ valor: '', observacao: '' });
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

      {/* Modal Detalhes da Meta */}
      {showDetailModal && selectedMeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeta.nome}</h2>
                {selectedMeta.descricao && (
                  <p className="text-gray-600 mt-1">{selectedMeta.descricao}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(selectedMeta.status)}`}>
                {getStatusLabel(selectedMeta.status)}
              </span>
            </div>

            {/* Progresso Visual */}
            <div className="card bg-gradient-to-r from-primary-50 to-purple-50 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Progresso Atual</p>
                <p className="text-4xl font-bold text-primary-600">
                  {selectedMeta.percentualAtingido.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-primary-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(selectedMeta.percentualAtingido, 100)}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Atual</p>
                  <p className="font-bold text-gray-900">{formatCurrency(selectedMeta.valorAtual)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Objetivo</p>
                  <p className="font-bold text-gray-900">{formatCurrency(selectedMeta.valorObjetivo)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Faltam</p>
                  <p className="font-bold text-red-600">{formatCurrency(selectedMeta.valorFaltante)}</p>
                </div>
              </div>
            </div>

            {/* Lembretes de Progresso */}
            {lembretesProgresso.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🎉 Conquistas e Marcos
                </h3>
                <div className="space-y-2">
                  {lembretesProgresso.map((lembrete) => (
                    <div key={lembrete.uid} className="card bg-green-50 border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900">{lembrete.titulo}</p>
                          <p className="text-sm text-green-700 mt-1">{lembrete.descricao}</p>
                          <p className="text-xs text-green-600 mt-1">{formatDate(lembrete.data)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Depósitos */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📜 Histórico de Depósitos</h3>
              {historico.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum depósito realizado ainda</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {historico.map((dep) => (
                    <div key={dep.uid} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(dep.valor)}</p>
                        {dep.observacao && (
                          <p className="text-sm text-gray-600">{dep.observacao}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(dep.data)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {!selectedMeta.concluida && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowDepositModal(true);
                  }}
                  className="btn-primary flex-1"
                >
                  💵 Fazer Depósito
                </button>
              )}
              <button
                onClick={() => handleEdit(selectedMeta)}
                className="btn-secondary flex-1 text-blue-600 hover:bg-blue-50"
              >
                ✏️ Editar Meta
              </button>
              <button
                onClick={() => handleDelete(selectedMeta.uid)}
                className="btn-secondary flex-1 text-red-600 hover:bg-red-50"
              >
                🗑️ Excluir Meta
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metas;

