import React, { useEffect, useState } from 'react';
import { configService, UserConfig } from '../services/profileService';

const Config: React.FC = () => {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [top5Limit, setTop5Limit] = useState(5);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configService.getConfig();
      setConfig(data);
      setTop5Limit(data.top5Limit);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTop5Limit = async () => {
    try {
      setError('');
      setMessage('');

      if (top5Limit < 1 || top5Limit > 50) {
        setError('O limite deve estar entre 1 e 50');
        return;
      }

      await configService.updateTop5Limit(top5Limit);
      setMessage('Configurações salvas com sucesso!');
      loadConfig();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar configurações');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-1">Personalize a exibição e funcionalidades do sistema</p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-purple-800">
              <strong>Sobre esta página:</strong> Aqui você configura como os dados são exibidos
              no Dashboard. Ajuste o limite de itens nos rankings para melhor visualização conforme sua preferência.
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

      {/* Configurações de Exibição */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exibição do Dashboard</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite de Itens no Top 5
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Defina quantos itens deseja ver nos rankings (Top 5 Cartões, Tags, Categorias)
            </p>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={top5Limit}
                onChange={(e) => setTop5Limit(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={top5Limit}
                  onChange={(e) => setTop5Limit(Number(e.target.value))}
                  className="input-field w-20 text-center"
                />
                <span className="text-sm text-gray-600">itens</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-gray-500">
              <button
                onClick={() => setTop5Limit(5)}
                className={`px-3 py-1 rounded ${top5Limit === 5 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'}`}
              >
                Top 5
              </button>
              <button
                onClick={() => setTop5Limit(10)}
                className={`px-3 py-1 rounded ${top5Limit === 10 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'}`}
              >
                Top 10
              </button>
              <button
                onClick={() => setTop5Limit(15)}
                className={`px-3 py-1 rounded ${top5Limit === 15 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'}`}
              >
                Top 15
              </button>
              <button
                onClick={() => setTop5Limit(20)}
                className={`px-3 py-1 rounded ${top5Limit === 20 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'}`}
              >
                Top 20
              </button>
              <button
                onClick={() => setTop5Limit(50)}
                className={`px-3 py-1 rounded ${top5Limit === 50 ? 'bg-primary-100 text-primary-800' : 'bg-gray-100'}`}
              >
                Top 50
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Dica</h4>
                <p className="text-sm text-blue-800">
                  Valores menores (5-10) facilitam a visualização. Valores maiores (20-50) são úteis para análises detalhadas.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveTop5Limit}
              className="btn-primary"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Preview</h2>
        <p className="text-sm text-gray-600 mb-4">
          Os rankings no Dashboard mostrarão <span className="font-bold text-primary-600">{top5Limit}</span> {top5Limit === 1 ? 'item' : 'itens'} cada
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top {top5Limit} Cartões</h3>
            <div className="space-y-1">
              {Array.from({ length: Math.min(top5Limit, 3) }, (_, i) => (
                <div key={i} className="flex items-center text-xs text-gray-500">
                  <span className="w-4">{i + 1}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded ml-2"></div>
                </div>
              ))}
              {top5Limit > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{top5Limit - 3} itens
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top {top5Limit} Tags</h3>
            <div className="space-y-1">
              {Array.from({ length: Math.min(top5Limit, 3) }, (_, i) => (
                <div key={i} className="flex items-center text-xs text-gray-500">
                  <span className="w-4">{i + 1}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded ml-2"></div>
                </div>
              ))}
              {top5Limit > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{top5Limit - 3} itens
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top {top5Limit} Categorias</h3>
            <div className="space-y-1">
              {Array.from({ length: Math.min(top5Limit, 3) }, (_, i) => (
                <div key={i} className="flex items-center text-xs text-gray-500">
                  <span className="w-4">{i + 1}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded ml-2"></div>
                </div>
              ))}
              {top5Limit > 3 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{top5Limit - 3} itens
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Config;

