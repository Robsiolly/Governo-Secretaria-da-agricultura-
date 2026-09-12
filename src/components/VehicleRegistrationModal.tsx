import React, { useState, useEffect } from 'react';
import { X, Wheat, Compass, Save, AlertCircle, Clock, Calendar, Building, User, FileText, Car, Check } from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { SignaturePad } from './SignaturePad';
import { ANDARES_DISPONIVEIS, StorageService } from '../services/storageService';

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (registro: Omit<RegistroVeiculo, 'id' | 'criadoEm'> & { id?: string }) => void;
  registroEdicao?: RegistroVeiculo | null;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  registroEdicao,
  usuarioAtual,
}) => {
  const [secretaria, setSecretaria] = useState<Secretaria>('Secretaria da Agricultura');
  const [data, setData] = useState('');
  const [motorista, setMotorista] = useState('');
  const [fct, setFct] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [horarioChegada, setHorarioChegada] = useState('');
  const [andar, setAndar] = useState<string>('1');
  const [funcionarioResponsavel, setFuncionarioResponsavel] = useState<string>('Diego');
  const [matriculaFuncionario, setMatriculaFuncionario] = useState('OP-002');
  const [assinaturaUrl, setAssinaturaUrl] = useState('');
  const [placa, setPlaca] = useState('');
  const [modeloVeiculo, setModeloVeiculo] = useState('');
  const [destino, setDestino] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const nomesResponsaveis = StorageService.getNomesResponsaveis();

  const selecionarResponsavel = (nome: string) => {
    setFuncionarioResponsavel(nome);
    const operadores = StorageService.getOperadores();
    const usr = operadores.find(u => u.nome.toLowerCase() === nome.toLowerCase());
    if (usr) {
      setMatriculaFuncionario(usr.matricula);
    }
  };

  useEffect(() => {
    if (registroEdicao) {
      setSecretaria(registroEdicao.secretaria);
      setData(registroEdicao.data);
      setMotorista(registroEdicao.motorista);
      setFct(registroEdicao.fct);
      setHorarioSaida(registroEdicao.horarioSaida);
      setHorarioChegada(registroEdicao.horarioChegada || '');
      setAndar(registroEdicao.andar || '1');
      setFuncionarioResponsavel(registroEdicao.funcionarioResponsavel || 'Diego');
      setMatriculaFuncionario(registroEdicao.matriculaFuncionario || 'OP-002');
      setAssinaturaUrl(registroEdicao.assinaturaUrl || '');
      setPlaca(registroEdicao.placa || '');
      setModeloVeiculo(registroEdicao.modeloVeiculo || '');
      setDestino(registroEdicao.destino || '');
    } else {
      // Valores padrão para novo cadastro real
      const hoje = new Date().toISOString().split('T')[0];
      const agora = new Date();
      const horaMinuto = agora.toTimeString().slice(0, 5);

      setData(hoje);
      setHorarioSaida(horaMinuto);
      setHorarioChegada('');
      setMotorista('');
      setFct('');
      setPlaca('');
      setModeloVeiculo('');
      setDestino('');
      setAndar('1');

      if (usuarioAtual) {
        const respEncontrado = nomesResponsaveis.find(r => r.toLowerCase() === usuarioAtual.nome.toLowerCase());
        const nomeFinal = respEncontrado || usuarioAtual.nome || 'Diego';
        setFuncionarioResponsavel(nomeFinal);
        setMatriculaFuncionario(usuarioAtual.matricula || 'OP-002');
        if (usuarioAtual.secretariaPadrao && usuarioAtual.secretariaPadrao !== 'Ambas') {
          setSecretaria(usuarioAtual.secretariaPadrao);
        }
      } else {
        setFuncionarioResponsavel('Diego');
        setMatriculaFuncionario('OP-002');
      }
      setAssinaturaUrl('');
    }
    setErro(null);
  }, [registroEdicao, isOpen, usuarioAtual]);

  if (!isOpen) return null;

  const isTurismo = secretaria === 'Secretaria do Turismo';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    // Validações obrigatórias especificadas pelo usuário
    if (!data) {
      setErro('O campo Data é obrigatório.');
      return;
    }
    if (!motorista.trim()) {
      setErro('O campo Motorista é obrigatório.');
      return;
    }
    // Veículos da Secretaria do Turismo NÃO têm FCT
    if (!isTurismo && !fct.trim()) {
      setErro('Informe o número de registro da FCT autorizado pelo responsável para a Secretaria da Agricultura.');
      return;
    }
    if (!horarioSaida.trim()) {
      setErro('O Horário de Saída é obrigatório.');
      return;
    }
    if (!andar.trim()) {
      setErro('O campo Andar é obrigatório.');
      return;
    }
    if (!funcionarioResponsavel.trim()) {
      setErro('O Funcionário responsável pelo cadastro é obrigatório.');
      return;
    }
    if (!assinaturaUrl) {
      setErro('A Assinatura do Funcionário responsável pelo cadastro é obrigatória. Assine na área indicada.');
      return;
    }

    const statusViagem = horarioChegada.trim() ? 'FINALIZADO' : 'EM_TRANSITO';

    onSalvar({
      ...(registroEdicao?.id ? { id: registroEdicao.id } : {}),
      secretaria,
      data,
      motorista: motorista.trim(),
      fct: isTurismo ? 'N/A' : fct.trim().toUpperCase(),
      horarioSaida: horarioSaida.trim(),
      horarioChegada: horarioChegada.trim(),
      andar: andar.trim(),
      funcionarioResponsavel: funcionarioResponsavel.trim(),
      matriculaFuncionario: matriculaFuncionario.trim(),
      assinaturaUrl,
      placa: placa.trim().toUpperCase(),
      modeloVeiculo: modeloVeiculo.trim(),
      destino: destino.trim(),
      status: statusViagem,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-800 bg-slate-900">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-emerald-400" />
              <span>{registroEdicao ? 'Editar Registro de Veículo' : 'Novo Cadastro de Veículo'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              Secretaria da Agricultura & Secretaria do Turismo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-slate-300 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {erro && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-700 text-rose-100 text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seleção da Secretaria */}
          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-200 mb-2 uppercase tracking-wider">
              Secretaria Responsável *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  secretaria === 'Secretaria da Agricultura'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="secretaria"
                  value="Secretaria da Agricultura"
                  checked={secretaria === 'Secretaria da Agricultura'}
                  onChange={() => setSecretaria('Secretaria da Agricultura')}
                  className="sr-only"
                />
                <div className="w-11 h-11 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/50">
                  <Wheat className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold block">Secretaria da Agricultura</span>
                  <span className="text-xs text-slate-300">Desenvolvimento rural e abastecimento</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  secretaria === 'Secretaria do Turismo'
                    ? 'bg-amber-950/70 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="secretaria"
                  value="Secretaria do Turismo"
                  checked={secretaria === 'Secretaria do Turismo'}
                  onChange={() => setSecretaria('Secretaria do Turismo')}
                  className="sr-only"
                />
                <div className="w-11 h-11 rounded-xl bg-amber-600/30 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/50">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold block">Secretaria do Turismo</span>
                  <span className="text-xs text-slate-300">Promoção de roteiros e eventos</span>
                </div>
              </label>
            </div>
          </div>

          {/* Dados Principais: Data, FCT, Motorista */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium min-h-[50px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className={`w-4 h-4 ${isTurismo ? 'text-slate-500' : 'text-amber-400'}`} />
                  {isTurismo ? 'FCT (Não Aplicável)' : 'Nº da FCT *'}
                </span>
                <span className={`text-[11px] font-medium ${isTurismo ? 'text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md' : 'text-amber-400/90'}`}>
                  {isTurismo ? 'Turismo não possui FCT' : 'Mediante autorização'}
                </span>
              </label>
              {isTurismo ? (
                <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 min-h-[50px] flex items-center gap-2.5 text-slate-400 select-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400/70 shrink-0"></span>
                  <span className="text-xs sm:text-sm font-medium text-slate-300">
                    Veículos da Secretaria do Turismo não têm FCT.
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={fct}
                    onChange={(e) => setFct(e.target.value)}
                    placeholder="Ex: 105 ou FCT-105"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[50px]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Registro inserido com a autorização do responsável.
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-400" />
                  Andar (Selecione 1 a 7) *
                </span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                  Andar Atual: {andar}
                </span>
              </label>

              {/* Botões rápidos de 1 a 7 para acessibilidade */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {ANDARES_DISPONIVEIS.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAndar(num)}
                    className={`py-2 px-1 text-center font-bold text-base sm:text-lg rounded-xl border-2 transition-all cursor-pointer ${
                      andar === num
                        ? 'bg-emerald-600 border-emerald-300 text-white shadow-md scale-105'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Select para confirmação e leitores de tela */}
              <select
                required
                value={andar}
                onChange={(e) => setAndar(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 min-h-[46px]"
              >
                {ANDARES_DISPONIVEIS.map((num) => (
                  <option key={num} value={num} className="bg-slate-900 text-white">
                    Andar {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motorista e Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                Motorista Responsável *
              </label>
              <input
                type="text"
                required
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                placeholder="Nome completo do motorista"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium min-h-[50px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                Veículo & Placa
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Placa: BRA-2026"
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-3 py-3 text-sm sm:text-base text-white font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[50px]"
                />
                <input
                  type="text"
                  value={modeloVeiculo}
                  onChange={(e) => setModeloVeiculo(e.target.value)}
                  placeholder="Modelo: Hilux, Spin..."
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-3 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[50px]"
                />
              </div>
            </div>
          </div>

          {/* Horários: Saída e Chegada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Horário de Saída *
              </label>
              <input
                type="time"
                required
                value={horarioSaida}
                onChange={(e) => setHorarioSaida(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono font-bold focus:outline-none focus:border-emerald-500 min-h-[50px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Horário de Chegada
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  (Em branco se em trânsito)
                </span>
              </label>
              <input
                type="time"
                value={horarioChegada}
                onChange={(e) => setHorarioChegada(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono font-bold focus:outline-none focus:border-emerald-500 min-h-[50px]"
              />
            </div>
          </div>

          {/* Destino / Observação */}
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              Destino / Finalidade da Operação
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ex: Vistoria técnica rural, transporte de comitiva turística..."
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[50px]"
            />
          </div>

          {/* Seção Obrigatória: Funcionário Responsável e Assinatura */}
          <div className="pt-4 border-t-2 border-slate-800 space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-100 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  Mudar Responsável pelo Cadastro (Selecione um Operador) *
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Todos os responsáveis são OPERADORES ({nomesResponsaveis.length} Cadastrados)
                </span>
              </label>

              {/* Botões de Seleção Rápida dos Operadores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
                {nomesResponsaveis.map((nome) => {
                  const isSelecionado = funcionarioResponsavel.toLowerCase() === nome.toLowerCase();
                  return (
                    <button
                      key={nome}
                      type="button"
                      onClick={() => selecionarResponsavel(nome)}
                      className={`px-3 py-2.5 rounded-xl border-2 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelecionado
                          ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg ring-2 ring-emerald-400/30'
                          : 'bg-slate-950 border-slate-750 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {isSelecionado && <Check className="w-4 h-4 text-emerald-200 shrink-0" />}
                      <span>{nome}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Operador Selecionado (Lista Suspensa)
                  </label>
                  <select
                    required
                    value={funcionarioResponsavel}
                    onChange={(e) => selecionarResponsavel(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-emerald-500 min-h-[50px]"
                  >
                    {nomesResponsaveis.map((nome) => (
                      <option key={nome} value={nome} className="bg-slate-900 text-white">
                        {nome} (Operador de Cadastro)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Matrícula Funcional do Operador
                  </label>
                  <input
                    type="text"
                    value={matriculaFuncionario}
                    onChange={(e) => setMatriculaFuncionario(e.target.value)}
                    placeholder="Ex: OP-002"
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[50px]"
                  />
                </div>
              </div>
            </div>

            {/* Canvas de Assinatura */}
            <div>
              <SignaturePad
                initialSignature={assinaturaUrl}
                funcionarioNome={funcionarioResponsavel}
                onSave={(dataUrl) => setAssinaturaUrl(dataUrl)}
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-5 border-t-2 border-slate-800 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-sm sm:text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[50px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-7 py-3 rounded-2xl text-sm sm:text-base font-bold shadow-xl shadow-emerald-950/50 transition-all cursor-pointer min-h-[50px]"
            >
              <Save className="w-5 h-5" />
              <span>{registroEdicao ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
