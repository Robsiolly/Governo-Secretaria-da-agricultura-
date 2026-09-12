import React, { useState, useEffect } from 'react';
import { X, UserPlus, ShieldCheck, KeyRound, User, Mail, Building, Check, AlertCircle, Users, Lock, Trash2, Edit2 } from 'lucide-react';
import { ContaOperador, Secretaria, UsuarioAutenticado } from '../types';
import { StorageService } from '../services/storageService';

interface CreateOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperadorCriado: (operador: UsuarioAutenticado) => void;
  usuarioAtual?: UsuarioAutenticado;
}

export const CreateOperatorModal: React.FC<CreateOperatorModalProps> = ({
  isOpen,
  onClose,
  onOperadorCriado,
  usuarioAtual,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'cadastrar' | 'gerenciar'>('cadastrar');
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [secretaria, setSecretaria] = useState<Secretaria | 'Ambas'>('Ambas');
  const [cargo, setCargo] = useState('Operador de Cadastro');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [operadorEmEdicaoId, setOperadorEmEdicaoId] = useState<string | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<string | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [operadoresExistentes, setOperadoresExistentes] = useState<ContaOperador[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOperadoresExistentes(StorageService.getOperadores());
      setErro(null);
      setSucesso(null);
    } else {
      limparFormulario();
      setAbaAtiva('cadastrar');
      setConfirmarExclusaoId(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    limparFormulario();
    setAbaAtiva('cadastrar');
    setConfirmarExclusaoId(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const nomeFormatado = nome.trim();
    const matriculaFormatada = matricula.trim().toUpperCase();
    const emailFormatado = email.trim().toLowerCase();
    const senhaFormatada = senha.trim();

    if (!nomeFormatado) {
      setErro('Informe o nome do Operador.');
      return;
    }
    if (!matriculaFormatada) {
      setErro('Informe a matrícula funcional do Operador.');
      return;
    }
    if (!operadorEmEdicaoId && !senhaFormatada) {
      setErro('Defina uma senha de acesso para o Operador.');
      return;
    }
    if (senhaFormatada && senhaFormatada.length < 6) {
      setErro('A senha deve ter pelo menos 6 dígitos/caracteres para maior segurança.');
      return;
    }
    if (senhaFormatada && senhaFormatada !== confirmarSenha.trim()) {
      setErro('A senha e a confirmação de senha não coincidem.');
      return;
    }

    try {
      const dadosSalvar: any = {
        id: operadorEmEdicaoId || undefined,
        nome: nomeFormatado,
        matricula: matriculaFormatada,
        email: emailFormatado || `${matriculaFormatada.toLowerCase()}@governo.gov.br`,
        secretariaPadrao: secretaria,
        cargo: cargo || 'Operador de Cadastro',
        nivelAcesso: 'OPERADOR',
      };

      if (senhaFormatada) {
        dadosSalvar.senha = senhaFormatada;
      }

      const novoOperador = StorageService.salvarOperador(dadosSalvar);
      setOperadoresExistentes(StorageService.getOperadores());

      setSucesso(
        operadorEmEdicaoId
          ? `Operador ${novoOperador.nome} atualizado com sucesso!`
          : `Operador ${novoOperador.nome} (${novoOperador.matricula}) cadastrado com sucesso pelo Administrador Roberto!`
      );

      setTimeout(() => {
        onOperadorCriado(novoOperador);
        limparFormulario();
        setAbaAtiva('gerenciar');
      }, 900);
    } catch {
      setErro('Ocorreu um erro ao salvar o operador no sistema local.');
    }
  };

  const limparFormulario = () => {
    setNome('');
    setMatricula('');
    setEmail('');
    setSecretaria('Ambas');
    setCargo('Operador de Cadastro');
    setSenha('');
    setConfirmarSenha('');
    setOperadorEmEdicaoId(null);
    setErro(null);
    setSucesso(null);
  };

  const iniciarEdicao = (op: ContaOperador) => {
    setOperadorEmEdicaoId(op.id);
    setNome(op.nome);
    setMatricula(op.matricula);
    setEmail(op.email || '');
    setSecretaria(op.secretariaPadrao || 'Ambas');
    setCargo(op.cargo || 'Operador de Cadastro');
    setSenha('');
    setConfirmarSenha('');
    setAbaAtiva('cadastrar');
    setErro(null);
    setSucesso(null);
  };

  const excluirOperador = (id: string, nomeOp: string) => {
    if (id === 'op-roberto-adm' || nomeOp.toLowerCase().includes('roberto')) {
      setErro('Não é permitido excluir o Administrador principal do sistema.');
      setConfirmarExclusaoId(null);
      return;
    }
    const removido = StorageService.excluirOperador(id);
    if (removido) {
      setOperadoresExistentes(StorageService.getOperadores());
      setSucesso(`Operador ${nomeOp} removido com sucesso.`);
      setConfirmarExclusaoId(null);
    } else {
      setErro('Não é possível remover o Administrador ou o último operador ativo do sistema.');
      setConfirmarExclusaoId(null);
    }
  };

  if (!isOpen) return null;

  if (usuarioAtual && usuarioAtual.nivelAcesso !== 'ADMINISTRADOR') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl w-full max-w-md p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-950 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white tracking-tight">Acesso Restrito ao Administrador</h3>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Apenas o <strong>Administrador (Roberto)</strong> tem permissão para cadastrar, editar ou gerenciar contas de operadores no sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Administração e CRUD de Operadores
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Painel do Administrador Roberto</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              limparFormulario();
              setAbaAtiva('cadastrar');
            }}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-sm transition-all cursor-pointer border-t-2 border-x-2 ${
              abaAtiva === 'cadastrar'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/60'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {operadorEmEdicaoId ? 'Editar Operador & Senha' : 'Cadastrar Novo Operador'}
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('gerenciar')}
            className={`px-5 py-2.5 rounded-t-2xl font-bold text-sm transition-all cursor-pointer border-t-2 border-x-2 flex items-center gap-2 ${
              abaAtiva === 'gerenciar'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/60'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gerenciar Operadores ({operadoresExistentes.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {erro && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-950/90 border border-rose-700 text-rose-100 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-100 text-sm font-semibold flex items-start gap-3 animate-in fade-in">
              <Check className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}

          {abaAtiva === 'cadastrar' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {operadorEmEdicaoId
                    ? 'Atualize os dados e a senha do operador. O Administrador Roberto gerencia as credenciais do sistema.'
                    : 'Cadastre um novo operador definindo sua matrícula funcional e senha inicial de acesso.'}
                </p>
              </div>

              {/* Nome e Matrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    Nome do Operador *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Diego"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-400" />
                    Matrícula Funcional *
                  </label>
                  <input
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ex: OP-008"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-base text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold uppercase"
                  />
                </div>
              </div>

              {/* E-mail e Secretaria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@governo.gov.br"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2">
                    Secretaria de Atuação *
                  </label>
                  <select
                    value={secretaria}
                    onChange={(e) => setSecretaria(e.target.value as Secretaria | 'Ambas')}
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Ambas">Ambas (Agricultura e Turismo)</option>
                    <option value="Secretaria da Agricultura">Secretaria da Agricultura</option>
                    <option value="Secretaria do Turismo">Secretaria do Turismo</option>
                  </select>
                </div>
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-bold text-slate-200 mb-2">
                  Cargo / Função no Controle de Frotas
                </label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Operador de Cadastro"
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Senha e Confirmação */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      {operadorEmEdicaoId ? 'Nova Senha (Opcional)' : 'Definir Senha de Acesso *'}
                    </span>
                    <span className="text-xs text-emerald-400/90 flex items-center gap-1 font-semibold">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Sigilosa
                    </span>
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!operadorEmEdicaoId}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={operadorEmEdicaoId ? 'Deixe em branco para manter' : 'Crie uma senha de acesso'}
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required={!!senha}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha criada"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                {operadorEmEdicaoId && (
                  <button
                    type="button"
                    onClick={limparFormulario}
                    className="px-5 py-3 rounded-2xl border-2 border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-sm cursor-pointer"
                  >
                    Cancelar Edição
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3 rounded-2xl border-2 border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-sm cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/60 cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>{operadorEmEdicaoId ? 'Salvar Alterações' : 'Cadastrar Operador'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Lista de Operadores Autorizados</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Gerenciamento completo (CRUD) e senhas administradas por Roberto.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    limparFormulario();
                    setAbaAtiva('cadastrar');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Novo Operador</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {operadoresExistentes.map((op) => (
                  <div
                    key={op.id}
                    className="bg-slate-950 border-2 border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                        {op.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{op.nome}</h4>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                            {op.matricula}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {op.secretariaPadrao || 'Ambas'} • {op.email || 'Sem e-mail'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {confirmarExclusaoId === op.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-700 p-1.5 rounded-xl">
                          <span className="text-[11px] font-bold text-rose-200 px-1">Excluir?</span>
                          <button
                            type="button"
                            onClick={() => excluirOperador(op.id, op.nome)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmarExclusaoId(null)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(op)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 transition-colors cursor-pointer"
                            title="Editar operador e senha"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmarExclusaoId(op.id)}
                            className="p-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-900 text-rose-300 hover:text-white transition-colors cursor-pointer"
                            title="Excluir operador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
