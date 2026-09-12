import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, UserCheck, ArrowRight, Wheat, Compass, AlertCircle, UserPlus, Check, Users, Building, Mail } from 'lucide-react';
import { UsuarioAutenticado, Secretaria } from '../types';
import { StorageService } from '../services/storageService';
import { GovSpLogo } from './GovSpLogo';

interface LoginScreenProps {
  onLoginSuccess: (usuario: UsuarioAutenticado) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [abaAtiva, setAbaAtiva] = useState<'LOGIN' | 'CRIAR_CONTA'>('LOGIN');

  // Estado Login
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Estado Criar Conta
  const [novoNome, setNovoNome] = useState('');
  const [novaMatricula, setNovaMatricula] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSecretaria, setNovaSecretaria] = useState<Secretaria | 'Ambas'>('Ambas');
  const [novaSenha, setNovaSenha] = useState('');
  const [novaConfirmarSenha, setNovaConfirmarSenha] = useState('');
  const [sucessoCriacao, setSucessoCriacao] = useState<string | null>(null);

  const operadoresCadastrados = StorageService.getOperadores();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    setTimeout(() => {
      const resultado = StorageService.autenticar(identificador, senha);
      if (resultado.sucesso && resultado.usuario) {
        onLoginSuccess(resultado.usuario);
      } else {
        setErro(resultado.erro || 'Falha na autenticação. Verifique os dados digitados.');
        setCarregando(false);
      }
    }, 300);
  };

  const handleCriarContaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoCriacao(null);

    const nomeFmt = novoNome.trim();
    const matFmt = novaMatricula.trim().toUpperCase();
    const emailFmt = novoEmail.trim().toLowerCase();
    const senhaFmt = novaSenha.trim();

    if (!nomeFmt) {
      setErro('Informe o nome completo do operador.');
      return;
    }
    if (!matFmt) {
      setErro('Informe a matrícula funcional do operador.');
      return;
    }
    if (!senhaFmt) {
      setErro('Defina uma senha de acesso.');
      return;
    }
    if (senhaFmt.length < 3) {
      setErro('A senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (senhaFmt !== novaConfirmarSenha.trim()) {
      setErro('A senha e a confirmação de senha não coincidem.');
      return;
    }

    try {
      const novaConta = StorageService.salvarOperador({
        nome: nomeFmt,
        matricula: matFmt,
        email: emailFmt || `${matFmt.toLowerCase()}@governo.gov.br`,
        secretariaPadrao: novaSecretaria,
        cargo: 'Operador de Cadastro',
        nivelAcesso: 'OPERADOR', // Todos os responsáveis são Operadores
        senha: senhaFmt,
      });

      setSucessoCriacao(`Conta de Operador para ${novaConta.nome} criada com sucesso!`);
      
      setTimeout(() => {
        const { senha: _, ...usuarioAutenticado } = novaConta;
        StorageService.setUsuarioAutenticado(usuarioAutenticado);
        onLoginSuccess(usuarioAutenticado);
      }, 800);
    } catch {
      setErro('Não foi possível registrar o operador. Tente novamente.');
    }
  };

  const selecionarOperadorRapido = (op: typeof operadoresCadastrados[0]) => {
    setIdentificador(op.matricula);
    setSenha(''); // A senha é estritamente sigilosa e NUNCA é preenchida ou exibida
    setErro(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header Superior */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-md">
              <Wheat className="w-5 h-5" />
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#8c6d46]/90 border border-[#b08d57]/40 flex items-center justify-center text-[#f5ebe0] shadow-md">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xs tracking-wider uppercase text-emerald-400 font-semibold block">
              Governo do Estado • Gestão de Frotas
            </span>
            <span className="text-sm font-bold text-slate-200">
              Agricultura & Turismo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Ambiente Seguro dos Operadores</span>
          <span className="sm:hidden">Seguro</span>
        </div>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-lg mx-auto my-auto py-6">
        <div className="bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-3xl p-6 sm:p-10 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#9a7852]" />

          {/* Cabeçalho do Card */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3.5 rounded-2xl bg-slate-800 border-2 border-slate-700 text-emerald-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Controle de Registros
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              Secretaria da Agricultura e Secretaria do Turismo
            </p>
            <div className="mt-3 inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold">
              Todos os responsáveis pelo cadastro são OPERADORES
            </div>
          </div>

          {/* Abas: Entrar vs Criar Conta */}
          <div className="flex rounded-2xl bg-slate-950 p-1.5 border-2 border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('LOGIN');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                abaAtiva === 'LOGIN'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Entrar no Sistema</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('CRIAR_CONTA');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                abaAtiva === 'CRIAR_CONTA'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta de Operador</span>
            </button>
          </div>

          {erro && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-950/90 border border-rose-700 text-rose-100 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucessoCriacao && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-100 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <Check className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <span>{sucessoCriacao}</span>
            </div>
          )}

          {/* ABA 1: FORMULÁRIO DE LOGIN */}
          {abaAtiva === 'LOGIN' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5">
                    Matrícula Funcional ou E-mail do Operador
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ex: OP-002 ou Diego"
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 pl-11 font-medium"
                    />
                    <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                    <span>Senha de Acesso</span>
                    <span className="text-xs text-emerald-400/90 flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Senha Sigilosa e Protegida
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Digite sua senha de operador"
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 pl-11 font-bold tracking-wider"
                    />
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl text-base transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 min-h-[50px]"
                >
                  {carregando ? (
                    <span>Verificando credenciais...</span>
                  ) : (
                    <>
                      <span>Entrar como Operador</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Acesso Rápido com Operadores Cadastrados */}
              <div className="mt-7 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Acesso Rápido de Operadores ({operadoresCadastrados.length})</span>
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Identificação segura
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {operadoresCadastrados.map((op, idx) => (
                    <button
                      key={`${op.id}-${op.matricula || idx}`}
                      type="button"
                      onClick={() => selecionarOperadorRapido(op)}
                      className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border-2 border-slate-750 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                    >
                      <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 block truncate">
                        {op.nome}
                      </span>
                      <span className="text-xs text-slate-400 block font-mono">
                        {op.matricula}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: FORMULÁRIO DE CRIAR CONTA DE OPERADOR */}
          {abaAtiva === 'CRIAR_CONTA' && (
            <div>
              <form onSubmit={handleCriarContaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5">
                    Nome Completo do Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Roberto, Diego ou seu nome"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5">
                      Matrícula Funcional *
                    </label>
                    <input
                      type="text"
                      required
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      placeholder="Ex: OP-008"
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5">
                      Secretaria *
                    </label>
                    <select
                      value={novaSecretaria}
                      onChange={(e) => setNovaSecretaria(e.target.value as Secretaria | 'Ambas')}
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-3 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-emerald-400"
                    >
                      <option value="Ambas">Ambas Secretarias</option>
                      <option value="Secretaria da Agricultura">Agricultura</option>
                      <option value="Secretaria do Turismo">Turismo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-1.5">
                    E-mail Institucional (Opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="operador@governo.gov.br"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                      <span>Senha de Acesso *</span>
                      <span className="text-xs text-emerald-400/90 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        Sigilosa
                      </span>
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Crie sua senha"
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-200 mb-1.5">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaConfirmarSenha}
                      onChange={(e) => setNovaConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold tracking-wider"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl text-base transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-3 cursor-pointer min-h-[50px]"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Cadastrar Conta de Operador</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé Oficial */}
      <footer className="w-full max-w-4xl mx-auto py-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-xs text-slate-400">
          Controle de Registros Secretaria da Agricultura e Secretaria do Turismo • Todos os direitos reservados
        </p>
        <div className="inline-block px-4 py-1.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-emerald-300 shadow-md shrink-0">
          Desenvolvido por Siolly Technology
        </div>
      </footer>
    </div>
  );
};
