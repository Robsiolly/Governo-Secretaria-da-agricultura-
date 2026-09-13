import React, { useState, useEffect } from 'react';
import { X, Wheat, Plane, Save, AlertCircle, Clock, Calendar, Building, User, FileText, Car, Check, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
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
  const [ocorrencia, setOcorrencia] = useState('');
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
      setOcorrencia(registroEdicao.ocorrencia || '');
    } else {
      // Valores padrão para novo cadastro real
      const hoje = getLocalDateString();
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
      setOcorrencia('');
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
      ocorrencia: ocorrencia.trim(),
      status: statusViagem,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#161618]/90 border border-white/[0.1] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>{registroEdicao ? 'Editar Registro de Veículo' : 'Novo Cadastro de Veículo'}</span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5 font-medium">
              Secretaria da Agricultura & Secretaria do Turismo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-2xl hover:bg-white/[0.08] active:scale-[0.94] transition-all cursor-pointer border border-transparent hover:border-white/[0.08]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {erro && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seleção da Secretaria */}
          <div>
            <label className="block text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-wider">
              Secretaria Responsável *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                  secretaria === 'Secretaria da Agricultura'
                    ? 'bg-amber-500/15 border-amber-400/40 text-white shadow-md'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
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
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white">Secretaria da Agricultura</span>
                  <span className="text-xs text-white/50">Desenvolvimento rural e abastecimento</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                  secretaria === 'Secretaria do Turismo'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-white shadow-md'
                    : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
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
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Plane className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white">Secretaria do Turismo</span>
                  <span className="text-xs text-white/50">Promoção de roteiros e eventos</span>
                </div>
              </label>
            </div>
          </div>

          {/* Dados Principais: Data, FCT, Andar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none font-medium transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${isTurismo ? 'text-white/30' : 'text-amber-400'}`} />
                  {isTurismo ? 'FCT (Não Aplicável)' : 'Nº da FCT *'}
                </span>
                <span className={`text-[10px] font-medium ${isTurismo ? 'text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 rounded-md' : 'text-amber-400/80'}`}>
                  {isTurismo ? 'Turismo não possui FCT' : 'Autorizada'}
                </span>
              </label>
              {isTurismo ? (
                <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-white/40 select-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400/60 shrink-0" />
                  <span className="text-xs font-medium">
                    Não aplicável ao Turismo
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={fct}
                  onChange={(e) => setFct(e.target.value)}
                  placeholder="Ex: 105 ou FCT-105"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white font-mono font-bold placeholder-white/30 focus:outline-none transition-all shadow-inner"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  Andar / Setor *
                </span>
                <span className="text-[10px] text-amber-400 font-semibold bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-md">
                  Atual: {andar}
                </span>
              </label>

              {/* Botões rápidos de 1 a 7 e SAA */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mb-1.5">
                {ANDARES_DISPONIVEIS.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAndar(num)}
                    className={`py-1.5 px-0.5 text-center font-bold text-xs rounded-xl border transition-all cursor-pointer active:scale-[0.94] ${
                      andar === num
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm font-black'
                        : num === 'SAA'
                        ? 'bg-amber-500/15 border-amber-400/30 text-amber-300 hover:text-white'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {num === 'SAA' ? 'SAA' : num}
                  </button>
                ))}
              </div>

              {/* Select para confirmação */}
              <select
                required
                value={andar}
                onChange={(e) => setAndar(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none transition-all cursor-pointer shadow-inner"
              >
                {ANDARES_DISPONIVEIS.map((num) => (
                  <option key={num} value={num} className="bg-[#1c1c1e] text-white">
                    {num === 'SAA' ? 'Andar SAA (Prioritário)' : `Andar ${num}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motorista e Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Motorista Responsável *
              </label>
              <input
                type="text"
                required
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                placeholder="Nome completo do motorista"
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none font-medium transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Veículo & Placa
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Placa: BRA-2026"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3 py-2.5 text-sm text-white font-mono font-bold placeholder-white/30 focus:outline-none transition-all shadow-inner"
                />
                <input
                  type="text"
                  value={modeloVeiculo}
                  onChange={(e) => setModeloVeiculo(e.target.value)}
                  placeholder="Modelo: Hilux, Spin..."
                  className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Horários: Saída e Chegada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Horário de Saída *
              </label>
              <input
                type="time"
                required
                value={horarioSaida}
                onChange={(e) => setHorarioSaida(e.target.value)}
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Horário de Chegada
                </span>
                <span className="text-[10px] text-white/40">
                  (Em branco se em trânsito)
                </span>
              </label>
              <input
                type="time"
                value={horarioChegada}
                onChange={(e) => setHorarioChegada(e.target.value)}
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Destino / Finalidade */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">
              Destino / Finalidade da Operação
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ex: Vistoria técnica rural, transporte de comitiva turística..."
              className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Campo de Ocorrência / Anotações do Operador */}
          <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Ocorrência / Anotações da Portaria</span>
              </label>
              <span className="text-[10px] text-amber-300/80 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full font-medium">
                Opcional
              </span>
            </div>
            <textarea
              rows={2}
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              placeholder="Ex: Veículo retornou com farol trincado; atraso na liberação por vistoria..."
              className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-amber-400/30 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none resize-y transition-all shadow-inner"
            />
          </div>

          {/* Seção Obrigatória: Funcionário Responsável e Assinatura */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Operador Responsável pelo Cadastro *
                </span>
                <span className="text-[11px] text-white/40 font-medium">
                  {nomesResponsaveis.length} Operadores
                </span>
              </label>

              {/* Botões de Seleção Rápida dos Operadores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 mb-3">
                {nomesResponsaveis.map((nome) => {
                  const isSelecionado = funcionarioResponsavel.toLowerCase() === nome.toLowerCase();
                  return (
                    <button
                      key={nome}
                      type="button"
                      onClick={() => selecionarResponsavel(nome)}
                      className={`px-2.5 py-2 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.96] ${
                        isSelecionado
                          ? 'bg-white text-black border-white shadow-md font-bold'
                          : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      {isSelecionado && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                      <span className="truncate">{nome}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">
                    Operador Selecionado
                  </label>
                  <select
                    required
                    value={funcionarioResponsavel}
                    onChange={(e) => selecionarResponsavel(e.target.value)}
                    className="w-full bg-[#1c1c1e] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none transition-all cursor-pointer shadow-inner"
                  >
                    {nomesResponsaveis.map((nome) => (
                      <option key={nome} value={nome} className="bg-[#1c1c1e] text-white">
                        {nome} (Operador de Cadastro)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">
                    Matrícula Funcional
                  </label>
                  <input
                    type="text"
                    value={matriculaFuncionario}
                    onChange={(e) => setMatriculaFuncionario(e.target.value)}
                    placeholder="Ex: OP-002"
                    className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-white/30 focus:outline-none transition-all shadow-inner"
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
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] transition-all cursor-pointer active:scale-[0.96]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-[0.96]"
            >
              <Save className="w-4 h-4" />
              <span>{registroEdicao ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

