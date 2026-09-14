import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, UserCheck, ArrowRight, Wheat, Plane, AlertCircle, UserPlus, Check, Users } from 'lucide-react';
import { UsuarioAutenticado, Secretaria } from '../types';
import { StorageService } from '../services/storageService';

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
  const [tentativasFalhas, setTentativasFalhas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState<number | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  // Efeito para contagem regressiva de bloqueio anti brute-force
  React.useEffect(() => {
    if (!bloqueadoAte) return;

    const interval = setInterval(() => {
      const agora = Date.now();
      const restante = Math.ceil((bloqueadoAte - agora) / 1000);
      if (restante <= 0) {
        setBloqueadoAte(null);
        setSegundosRestantes(0);
        setErro(null);
      } else {
        setSegundosRestantes(restante);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bloqueadoAte]);

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

    // Verificação de bloqueio anti força-bruta
    if (bloqueadoAte && Date.now() < bloqueadoAte) {
      setErro(`Muitas tentativas incorretas. Aguarde ${segundosRestantes} segundos por segurança.`);
      return;
    }

    setCarregando(true);

    setTimeout(() => {
      const resultado = StorageService.autenticar(identificador, senha);
      if (resultado.sucesso && resultado.usuario) {
        setTentativasFalhas(0);
        onLoginSuccess(resultado.usuario);
      } else {
        const novasFalhas = tentativasFalhas + 1;
        setTentativasFalhas(novasFalhas);

        if (novasFalhas >= 5) {
          const tempoBloqueio = Date.now() + 30000; // 30 segundos de bloqueio
          setBloqueadoAte(tempoBloqueio);
          setSegundosRestantes(30);
          setErro('Sistema temporariamente bloqueado por 30 segundos devido a 5 tentativas com erro. Medida de segurança ativa.');
        } else {
          setErro(resultado.erro || `Falha na autenticação. Tentativa ${novasFalhas} de 5.`);
        }
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
    if (senhaFmt.length < 6) {
      setErro('Para a segurança do sistema, a senha deve ter pelo menos 6 caracteres.');
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
        nivelAcesso: 'OPERADOR',
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
    setSenha('');
    setErro(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#050608] text-white p-4 md:p-8 relative overflow-hidden selection:bg-[#B08D57]/30 selection:text-[#DFBA73]">
      {/* Specular Radial Background Glows - Ouro Velho & Champagne */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-[#B08D57]/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 border-b border-[#B08D57]/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shadow-md">
              <Wheat className="w-4 h-4 text-[#DFBA73]" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-[11px] tracking-wider uppercase text-[#DFBA73] font-semibold block">
              Secretaria da Agricultura • Secretaria do Turismo
            </span>
            <span className="text-sm font-semibold text-white">
              Gestão Integrada de Frotas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#12141A]/80 border border-[#B08D57]/25 px-3.5 py-1.5 rounded-full text-xs text-[#DFBA73] shadow-sm backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
          <span className="font-medium">Ambiente Seguro</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg mx-auto my-auto py-6 relative z-10">
        <div className="bg-[#111317]/85 border border-[#B08D57]/25 shadow-2xl rounded-3xl p-6 sm:p-9 backdrop-blur-3xl relative overflow-hidden">
          {/* Specular Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/30 to-transparent" />

          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3.5 rounded-2xl bg-[#B08D57]/15 border border-[#B08D57]/30 text-[#DFBA73] mb-3 shadow-inner">
              <Lock className="w-6 h-6 text-[#DFBA73]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Controle de Registros
            </h1>
            <p className="text-xs text-[#C6A96B]/80 mt-1">
              Portaria e Acesso Operacional
            </p>
          </div>

          {/* Apple Segmented Control */}
          <div className="flex rounded-2xl bg-black/50 p-1 border border-[#B08D57]/20 mb-6">
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('LOGIN');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                abaAtiva === 'LOGIN'
                  ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 shadow-md font-bold'
                  : 'text-[#C6A96B]/70 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('CRIAR_CONTA');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                abaAtiva === 'CRIAR_CONTA'
                  ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 shadow-md font-bold'
                  : 'text-[#C6A96B]/70 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </div>

          {erro && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucessoCriacao && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{sucessoCriacao}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {abaAtiva === 'LOGIN' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1.5">
                    Matrícula Funcional ou E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ex: OP-002 ou Diego"
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none pl-11 font-medium transition-all duration-200 shadow-inner"
                    />
                    <UserCheck className="w-4 h-4 text-[#C6A96B]/60 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1.5 flex items-center justify-between">
                    <span>Senha de Acesso</span>
                    <span className="text-[10px] text-[#DFBA73] flex items-center gap-1 font-medium">
                      <Lock className="w-3 h-3 text-[#DFBA73]" />
                      Sigilosa
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
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none pl-11 font-bold tracking-wider transition-all duration-200 shadow-inner"
                    />
                    <KeyRound className="w-4 h-4 text-[#C6A96B]/60 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full mt-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-[#B08D57]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#DFBA73]/40"
                >
                  {carregando ? (
                    <span>Verificando credenciais...</span>
                  ) : (
                    <>
                      <span>Entrar como Operador</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Selector */}
              <div className="mt-6 pt-4 border-t border-[#B08D57]/15">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-semibold text-[#DFBA73] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#DFBA73]" />
                    <span>Acesso Rápido ({operadoresCadastrados.length})</span>
                  </span>
                  <span className="text-[11px] text-white/40 font-medium">
                    Toque para selecionar
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {operadoresCadastrados.map((op, idx) => (
                    <button
                      key={`${op.id}-${op.matricula || idx}`}
                      type="button"
                      onClick={() => selecionarOperadorRapido(op)}
                      className="p-2.5 rounded-2xl bg-black/40 hover:bg-[#B08D57]/15 border border-[#B08D57]/20 hover:border-[#B08D57]/50 text-left transition-all duration-200 cursor-pointer group active:scale-[0.96]"
                    >
                      <span className="font-semibold text-xs text-white group-hover:text-[#DFBA73] block truncate">
                        {op.nome}
                      </span>
                      <span className="text-[10px] text-[#C6A96B]/60 block font-mono mt-0.5">
                        {op.matricula}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER FORM */}
          {abaAtiva === 'CRIAR_CONTA' && (
            <div>
              <form onSubmit={handleCriarContaSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1">
                    Nome Completo do Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Roberto, Diego ou seu nome"
                    className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none font-medium transition-all duration-200 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1">
                      Matrícula Funcional *
                    </label>
                    <input
                      type="text"
                      required
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      placeholder="Ex: OP-008"
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-2.5 text-sm text-white font-mono placeholder-white/30 focus:outline-none font-bold uppercase transition-all duration-200 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1">
                      Secretaria *
                    </label>
                    <select
                      value={novaSecretaria}
                      onChange={(e) => setNovaSecretaria(e.target.value as Secretaria | 'Ambas')}
                      className="w-full bg-[#12141A] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none transition-all duration-200 cursor-pointer shadow-inner"
                    >
                      <option value="Ambas">Ambas Secretarias</option>
                      <option value="Secretaria da Agricultura">Agricultura</option>
                      <option value="Secretaria do Turismo">Turismo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1">
                    E-mail Institucional (Opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="operador@governo.gov.br"
                    className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none font-medium transition-all duration-200 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#B08D57]/15">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1 flex items-center justify-between">
                      <span>Senha *</span>
                      <span className="text-[10px] text-[#DFBA73] flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5 text-[#DFBA73]" />
                        Sigilosa
                      </span>
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none font-bold tracking-wider transition-all duration-200 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-1">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaConfirmarSenha}
                      onChange={(e) => setNovaConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-black/40 hover:bg-black/60 focus:bg-[#161820] border border-[#B08D57]/25 focus:border-[#C6A96B]/60 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none font-bold tracking-wider transition-all duration-200 shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-[#B08D57]/20 flex items-center justify-center gap-2 cursor-pointer border border-[#DFBA73]/40"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Conta de Operador</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-4 border-t border-[#B08D57]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative z-10 text-xs text-white/40">
        <p>
          Secretaria da Agricultura e Abastecimento • Secretaria do Turismo
        </p>
        <div className="inline-block px-3.5 py-1 rounded-xl bg-[#B08D57]/10 border border-[#B08D57]/25 font-semibold text-[#DFBA73]">
          Desenvolvido por Siolly Technology
        </div>
      </footer>
    </div>
  );
};
