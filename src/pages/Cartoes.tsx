import React, { useEffect, useState } from 'react';
import { cartaoService } from '../services/cartaoService';
import { Cartao } from '../types';

const Cartoes: React.FC = () => {
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState<string | null>(null);
  const [melhorDiaInfo, setMelhorDiaInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    nome: '',
    diaFechamento: 1,
    diaVencimento: 10,
    limite: 0,
  });

  const [pagamentoData, setPagamentoData] = useState({
    valor: 0,
    descricao: 'Pagamento Antecipado',
    data: '',
  });

  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    try {
      setLoading(true);
      const data = await cartaoService.listar();
      setCartoes(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cartaoService.criar(formData);
      setShowModal(false);
      resetForm();
      loadCartoes();
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Deseja realmente excluir este cartão?')) {
      try {
        await cartaoService.deletar(uid);
        loadCartoes();
      } catch (error) {
        console.error('Erro ao deletar cartão:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      diaFechamento: 1,
      diaVencimento: 10,
      limite: 0,
    });
  };

  const verificarMelhorDia = async (uid: string) => {
    try {
      const info = await cartaoService.verificarMelhorDia(uid);
      setMelhorDiaInfo(info);
      setTimeout(() => setMelhorDiaInfo(null), 5000);
    } catch (error) {
      console.error('Erro ao verificar melhor dia:', error);
    }
  };

  const handlePagamentoAntecipado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCartao) return;

    try {
      await cartaoService.registrarPagamentoAntecipado(selectedCartao, pagamentoData);
      setShowPagamentoModal(false);
      setPagamentoData({ valor: 0, descricao: 'Pagamento Antecipado', data: '' });
      loadCartoes();
      alert('Pagamento antecipado registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Cartões</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          Novo Cartão
        </button>
      </div>

      {/* Alerta de Melhor Dia */}
      {melhorDiaInfo && (
        <div className={`card ${melhorDiaInfo.eMelhorDia ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-sm">{melhorDiaInfo.mensagem}</p>
        </div>
      )}

      {/* Grid de Cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cartoes.map((cartao) => (
          <div key={cartao.uid} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{cartao.nome}</h3>
              <button
                onClick={() => handleDelete(cartao.uid)}
                className="text-red-600 hover:text-red-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fechamento:</span>
                <span className="font-medium">Dia {cartao.diaFechamento}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vencimento:</span>
                <span className="font-medium">Dia {cartao.diaVencimento}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Limite:</span>
                <span className="font-medium">R$ {cartao.limite ? cartao.limite.toFixed(2).replace('.', ',') : '0,00'}</span>
              </div>

              {cartao.limiteInfo && cartao.limiteInfo.limiteTotal && (
                <>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Limite Usado:</span>
                      <span className={`font-medium ${cartao.limiteInfo.percentualUsado > 80 ? 'text-red-600' : 'text-green-600'}`}>
                        {cartao.limiteInfo.percentualUsado.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${cartao.limiteInfo.percentualUsado > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(cartao.limiteInfo.percentualUsado, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>R$ {cartao.limiteInfo.valorComprometido.toFixed(2).replace('.', ',')}</span>
                      <span>Disponível: R$ {cartao.limiteInfo.limiteDisponivel.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <button
                      onClick={() => verificarMelhorDia(cartao.uid)}
                      className="w-full btn-secondary text-sm py-2"
                    >
                      Melhor Dia para Compra
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCartao(cartao.uid);
                        setShowPagamentoModal(true);
                      }}
                      className="w-full btn-primary text-sm py-2"
                    >
                      Pagamento Antecipado
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criar Cartão */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Novo Cartão</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Nubank Gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia de Fechamento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaFechamento}
                  onChange={(e) => setFormData({ ...formData, diaFechamento: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia de Vencimento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaVencimento}
                  onChange={(e) => setFormData({ ...formData, diaVencimento: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite do Cartão
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limite}
                  onChange={(e) => setFormData({ ...formData, limite: Number(e.target.value) })}
                  className="input-field"
                  required
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

      {/* Modal de Pagamento Antecipado */}
      {showPagamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagamento Antecipado</h2>
            <form onSubmit={handlePagamentoAntecipado} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pagamentoData.valor}
                  onChange={(e) => setPagamentoData({ ...pagamentoData, valor: Number(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={pagamentoData.descricao}
                  onChange={(e) => setPagamentoData({ ...pagamentoData, descricao: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPagamentoModal(false)}
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

export default Cartoes;

