import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, UserCheck, ArrowRight, Wheat, Plane, AlertCircle, UserPlus, Check, Users, Building, Mail } from 'lucide-react';
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-black text-[#F3F3F1] p-4 md:p-8 relative overflow-hidden">
      {/* Ambient BMW/Apple Stage Glow */}
      <div className="absolute top-0 left-1/2 w-[700px] h-[350px] bg-[#5A3A2E]/20 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] bg-[#D97924]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Superior */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 border-b border-[#252525] relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-xl bg-[#3A241D] border border-[#5A3A2E] flex items-center justify-center text-[#D97924] shadow-lg">
              <Wheat className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#252525] border border-[#6B6B6B]/40 flex items-center justify-center text-[#F3F3F1] shadow-lg">
              <Plane    className="text-emerald-400 w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-[11px] tracking-widest uppercase text-[#D97924] font-bold block">
              Secretaria da Agricultura e Abastecimento
            </span>
            <span className="text-sm font-semibold text-white">
              Gestão Integrada de Frotas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#252525] border border-[#6B6B6B]/30 px-3.5 py-1.5 rounded-full text-xs text-[#F3F3F1] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#D97924]" />
          <span className="hidden sm:inline font-medium">Ambiente Seguro</span>
          <span className="sm:hidden font-medium">Seguro</span>
        </div>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-lg mx-auto my-auto py-6 relative z-10">
        <div className="bg-[#252525] border border-[#6B6B6B]/30 shadow-2xl rounded-3xl p-6 sm:p-10 backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5A3A2E] via-[#D97924] to-[#3A241D]" />

          {/* Cabeçalho do Card */}
          <div className="text-center mb-6">
            <div className="inline-flex p-4 rounded-2xl bg-[#3A241D] border border-[#5A3A2E] text-[#D97924] mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Controle de Registros
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1 font-medium">
              Secretaria da Agricultura e Secretaria do Turismo
            </p>
            <div className="mt-3 inline-block bg-[#3A241D] border border-[#5A3A2E] text-[#D97924] px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              Acesso Exclusivo para Operadores
            </div>
          </div>

          {/* Abas: Entrar vs Criar Conta */}
          <div className="flex rounded-2xl bg-black p-1.5 border border-[#6B6B6B]/30 mb-6">
            <button
              type="button"
              onClick={() => {
                setAbaAtiva('LOGIN');
                setErro(null);
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                abaAtiva === 'LOGIN'
                  ? 'bg-white text-black shadow-xl font-bold'
                  : 'text-[#6B6B6B] hover:text-white'
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
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                abaAtiva === 'CRIAR_CONTA'
                  ? 'bg-white text-black shadow-xl font-bold'
                  : 'text-[#6B6B6B] hover:text-white'
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
            <div className="mb-5 p-4 rounded-2xl bg-amber-950/90 border border-amber-9500 text-amber-950 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <Check className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <span>{sucessoCriacao}</span>
            </div>
          )}

          {/* ABA 1: FORMULÁRIO DE LOGIN */}
          {abaAtiva === 'LOGIN' && (
            <div>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                    Matrícula Funcional ou E-mail do Operador
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      placeholder="Ex: OP-002 ou Diego"
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3.5 text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] pl-11 font-medium shadow-inner transition-all"
                    />
                    <UserCheck className="w-5 h-5 text-[#6B6B6B] absolute left-3.5 top-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5 flex items-center justify-between">
                    <span>Senha de Acesso</span>
                    <span className="text-[11px] text-[#D97924] flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-[#D97924]" />
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
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3.5 text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] pl-11 font-bold tracking-wider shadow-inner transition-all"
                    />
                    <KeyRound className="w-5 h-5 text-[#6B6B6B] absolute left-3.5 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full mt-3 bg-[#D97924] hover:bg-[#c2681e] text-white font-bold py-3.5 px-6 rounded-2xl text-base transition-all shadow-xl shadow-[#D97924]/20 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 min-h-[50px]"
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
              <div className="mt-7 pt-5 border-t border-[#6B6B6B]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D97924]" />
                    <span>Acesso Rápido ({operadoresCadastrados.length})</span>
                  </span>
                  <span className="text-xs text-[#6B6B6B] font-medium">
                    Toque para selecionar
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {operadoresCadastrados.map((op, idx) => (
                    <button
                      key={`${op.id}-${op.matricula || idx}`}
                      type="button"
                      onClick={() => selecionarOperadorRapido(op)}
                      className="p-3 rounded-2xl bg-black hover:bg-[#3A241D]/40 border border-[#6B6B6B]/30 hover:border-[#D97924] text-left transition-all cursor-pointer group shadow-inner"
                    >
                      <span className="font-semibold text-xs text-white group-hover:text-[#D97924] block truncate">
                        {op.nome}
                      </span>
                      <span className="text-[11px] text-[#6B6B6B] block font-mono mt-0.5">
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
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                    Nome Completo do Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Roberto, Diego ou seu nome"
                    className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] font-medium shadow-inner transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                      Matrícula Funcional *
                    </label>
                    <input
                      type="text"
                      required
                      value={novaMatricula}
                      onChange={(e) => setNovaMatricula(e.target.value)}
                      placeholder="Ex: OP-008"
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] font-bold uppercase shadow-inner transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                      Secretaria *
                    </label>
                    <select
                      value={novaSecretaria}
                      onChange={(e) => setNovaSecretaria(e.target.value as Secretaria | 'Ambas')}
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-3 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-[#D97924] shadow-inner transition-all"
                    >
                      <option value="Ambas">Ambas Secretarias</option>
                      <option value="Secretaria da Agricultura">Agricultura</option>
                      <option value="Secretaria do Turismo">Turismo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                    E-mail Institucional (Opcional)
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="operador@governo.gov.br"
                    className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] font-medium shadow-inner transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#6B6B6B]/30">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5 flex items-center justify-between">
                      <span>Senha de Acesso *</span>
                      <span className="text-[11px] text-[#D97924] flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3 text-[#D97924]" />
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
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] font-bold tracking-wider shadow-inner transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#6B6B6B] mb-1.5">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={novaConfirmarSenha}
                      onChange={(e) => setNovaConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] font-bold tracking-wider shadow-inner transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 bg-[#D97924] hover:bg-[#c2681e] text-white font-bold py-3.5 px-6 rounded-2xl text-base transition-all shadow-xl shadow-[#D97924]/20 flex items-center justify-center gap-3 cursor-pointer min-h-[50px]"
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
      <footer className="w-full max-w-4xl mx-auto py-5 border-t border-[#252525] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left relative z-10">
        <p className="text-xs text-[#6B6B6B]">
          Secretaria da Agricultura e Abastecimento • Secretaria do Turismo • Todos os direitos reservados
        </p>
        <div className="inline-block px-4 py-1.5 rounded-2xl bg-[#252525] border border-[#6B6B6B]/30 text-xs font-bold text-[#D97924] shadow-md shrink-0">
          Desenvolvido por Siolly Technology
        </div>
      </footer>
    </div>
  );
};
