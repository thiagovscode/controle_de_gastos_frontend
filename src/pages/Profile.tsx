import React, { useEffect, useState } from 'react';
import { profileService, UserProfile } from '../services/profileService';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await profileService.updateEmail(newEmail);
      setMessage('Email atualizado com sucesso!');
      setShowEmailModal(false);
      setNewEmail('');
      loadProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao atualizar email');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');

      if (newPassword !== confirmPassword) {
        setError('As senhas não conferem');
        return;
      }

      if (newPassword.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres');
        return;
      }

      await profileService.updatePassword(currentPassword, newPassword);
      setMessage('Senha atualizada com sucesso!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao atualizar senha');
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
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie suas informações de conta</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <strong>Dica de segurança:</strong> Mantenha seu email atualizado para recuperação de senha.
              Use senhas fortes com no mínimo 6 caracteres, combinando letras, números e símbolos.
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

      {/* Informações do Perfil */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Conta</h2>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-700">
              <strong>Nome de Usuário:</strong> Usado para login no sistema
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">O nome de usuário não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed flex-1"
              />
              <button
                onClick={() => setShowEmailModal(true)}
                className="btn-primary"
              >
                Alterar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value="••••••••"
                disabled
                className="input-field bg-gray-100 cursor-not-allowed flex-1"
              />
              <button
                onClick={() => setShowPasswordModal(true)}
                className="btn-primary"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Alterar Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alterar Email</h2>
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-field"
                  placeholder="novo@email.com"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setNewEmail('');
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

      {/* Modal de Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alterar Senha</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
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

export default Profile;

