import React, { useState } from 'react';
import { KeyRound, X, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { UsuarioAutenticado } from '../types';
import { StorageService } from '../services/storageService';

interface ChangePasswordModalProps {
  usuario: UsuarioAutenticado;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensagem: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  usuario,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const atual = senhaAtual.trim();
    const nova = novaSenha.trim();
    const conf = confirmarSenha.trim();

    if (!atual) {
      setErro('Informe sua senha atual.');
      return;
    }

    // Verificar senha atual
    const authCheck = StorageService.autenticar(usuario.matricula, atual);
    if (!authCheck.sucesso) {
      setErro('A senha atual informada está incorreta.');
      return;
    }

    if (!nova) {
      setErro('Informe a nova senha.');
      return;
    }

    if (nova.length < 3) {
      setErro('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (nova !== conf) {
      setErro('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (nova === atual) {
      setErro('A nova senha deve ser diferente da senha atual.');
      return;
    }

    const res = StorageService.atualizarSenha(usuario.id, nova);
    if (res) {
      setSucesso(true);
      setTimeout(() => {
        onSuccess('Senha alterada com sucesso! Utilize sua nova senha no próximo acesso.');
        onClose();
        setSucesso(false);
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      }, 1200);
    } else {
      setErro('Não foi possível atualizar a senha. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 px-6 py-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-emerald-200 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Alterar Senha de Acesso</h2>
              <p className="text-xs text-emerald-200 font-medium">{usuario.nome} • Matrícula: {usuario.matricula}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-2 rounded-xl hover:bg-emerald-800/50 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {sucesso ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Senha Alterada!</h3>
              <p className="text-sm text-slate-300">Sua nova credencial de acesso foi salva com segurança.</p>
            </div>
          ) : (
            <>
              {erro && (
                <div className="bg-rose-950/80 border-2 border-rose-800 text-rose-200 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{erro}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Senha Atual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nova Senha (Mínimo de 3 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all cursor-pointer flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Salvar Nova Senha</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
