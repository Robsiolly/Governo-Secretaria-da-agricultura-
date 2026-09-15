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
          setErro('Sistema temporariamente bloqueado por 30 segundos devido a 5 tentativas com erro. Medida de segurança activa.');
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#090A0C] text-white p-6 md:p-12 relative overflow-hidden selection:bg-[#B08D57]/20 selection:text-[#DFBA73]">

      {/* Top Navigation Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-6 border-b border-[#22252C] relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-1.5">
            <div className="w-10 h-10 rounded-lg bg-[#121417] border border-[#22252C] flex items-center justify-center text-[#B08D57]">
              <Wheat className="w-4 h-4 text-[#B08D57]" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#121417] border border-[#22252C] flex items-center justify-center text-emerald-500">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-[10px] tracking-widest uppercase text-[#8E95A1] font-semibold block">
              Secretaria da Agricultura • Secretaria do Turismo
            </span>
            <span className="text-base font-medium text-white">
              Gestão Integrada de Frotas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#121417] border border-[#22252C] px-4 py-2 rounded-lg text-xs text-[#8E95A1]">
          <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
          <span className="font-medium tracking-wide">Ambiente Seguro</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-12 relative z-10">
        <div className="bg-[#121417] border border-[#22252C] rounded-xl p-8 md:p-10 relative">

          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-lg bg-[#1B1E22] border border-[#22252C] text-[#B08D57] mb-4">
              <Lock className="w-6 h-6 text-[#B08D57]" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Controle de Registros
            </h1>
            <p className="text-xs text-[#8E95A1] mt-1.5">
              Portaria e Acesso Operacional
            </p>
          </div>

          {/* Apple Segmented Control */}
          <div className="flex rounded-lg bg-[#090A0C] p-1 border border-[#22252C] mb-8">
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('LOGIN');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-md font-medium text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                abaAtiva === 'LOGIN'
                  ? 'bg-[#B08D57] text-black font-semibold'
                  : 'text-[#8E95A1] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('CRIAR_CONTA');
                setErro(null);
              }}
              className={`flex-1 py-2.5 rounded-md font-medium text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                abaAtiva === 'CRIAR_CONTA'
                  ? 'bg-[#B08D57] text-black font-semibold'
                  : 'text-[#8E95A1] hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Conta</span>
            </button>
          </div>

          {erro && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucessoCriacao && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs font-medium flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{sucessoCriacao}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {abaAtiva === 'LOGIN' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-2">
                    Matrícula Funcional ou E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ex: OP-002 ou Diego"
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none pl-11 font-medium transition-colors"
                    />
                    <UserCheck className="w-4 h-4 text-[#8E95A1] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-2 flex items-center justify-between">
                    <span>Senha de Acesso</span>
                    <span className="text-[9px] text-[#8E95A1] flex items-center gap-1 font-medium">
                      <Lock className="w-2.5 h-2.5" />
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
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none pl-11 tracking-wider transition-colors"
                    />
                    <KeyRound className="w-4 h-4 text-[#8E95A1] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full mt-2 bg-[#B08D57] hover:bg-[#80683F] text-black font-semibold py-3.5 px-6 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {carregando ? (
                    <span className="text-xs uppercase tracking-widest font-bold">Verificando...</span>
                  ) : (
                    <>
                      <span>Entrar como Operador</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Fast Selector */}
              <div className="mt-8 pt-6 border-t border-[#22252C]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold text-[#8E95A1] uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Acesso Rápido ({operadoresCadastrados.length})</span>
                  </span>
                  <span className="text-[10px] text-white/30 tracking-wide font-medium">
                    Toque para selecionar
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {operadoresCadastrados.map((op, idx) => (
                    <button
                      key={`${op.id}-${op.matricula || idx}`}
                      type="button"
                      onClick={() => selecionarOperadorRapido(op)}
                      className="p-3 rounded-lg bg-[#090A0C] hover:bg-[#1B1E22] border border-[#22252C] hover:border-[#B08D57] text-left transition-colors cursor-pointer group"
                    >
                      <span className="font-medium text-xs text-white group-hover:text-[#B08D57] block truncate">
                        {op.nome}
                      </span>
                      <span className="text-[10px] text-[#8E95A1] block font-mono mt-0.5">
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
              <form onSubmit={handleCriarContaSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5">
                    Nome Completo do Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Roberto, Diego ou seu nome"
                    className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none font-medium transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5">
                      Matrícula Funcional *
                    </label>
                    <input
                      type="text"
                      required
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      placeholder="Ex: OP-008"
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-white/20 focus:outline-none font-bold uppercase transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5">
                      Secretaria *
                    </label>
                    <select
                      value={novaSecretaria}
                      onChange={(e) => setNovaSecretaria(e.target.value as Secretaria | 'Ambas')}
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3 py-2.5 text-sm text-white font-medium focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="Ambas">Ambas Secretarias</option>
                      <option value="Secretaria da Agricultura">Agricultura</option>
                      <option value="Secretaria do Turismo">Turismo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5">
                    E-mail Institucional (Opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="operador@governo.gov.br"
                    className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none font-medium transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#22252C]">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5 flex items-center justify-between">
                      <span>Senha *</span>
                      <span className="text-[9px] text-[#8E95A1] flex items-center gap-1 font-medium">
                        <Lock className="w-2.5 h-2.5" />
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
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none font-bold tracking-wider transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold text-[#8E95A1] mb-1.5">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaConfirmarSenha}
                      onChange={(e) => setNovaConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none font-bold tracking-wider transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-[#B08D57] hover:bg-[#80683F] text-black font-semibold py-3.5 px-6 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
      <footer className="w-full max-w-4xl mx-auto py-6 border-t border-[#22252C] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative z-10 text-xs text-[#8E95A1]">
        <p>
          Secretaria da Agricultura e Abastecimento • Secretaria do Turismo
        </p>

        <div className="inline-block px-4 py-1.5 rounded-lg bg-[#121417] border border-[#22252C] font-semibold text-[#B08D57]">
          Desenvolvido por Siolly Technology
        </div>
      </footer>
    </div>
  );
};

