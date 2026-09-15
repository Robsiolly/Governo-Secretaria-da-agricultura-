import React, { useState, useEffect } from 'react';
import { X, Wheat, Plane, Save, AlertCircle, Clock, Calendar, Building, User, FileText, Car, Check, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { SignaturePad } from './SignaturePad';
import { ANDARES_DISPONIVEIS, StorageService } from '../services/storageService';

interface VehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar?: (registro: Omit<RegistroVeiculo, 'id' | 'criadoEm'> & { id?: string }) => void;
  onSave?: (registro: any) => void;
  registroEdicao?: RegistroVeiculo | null;
  registroParaEditar?: RegistroVeiculo | null;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  onSave,
  registroEdicao,
  registroParaEditar,
  usuarioAtual,
}) => {
  const registroAtivo = registroEdicao || registroParaEditar;

  const [secretaria, setSecretaria] = useState<Secretaria>('Secretaria da Agricultura');
  const [data, setData] = useState('');
  const [motorista, setMotorista] = useState('');
  const [fct, setFct] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [horarioChegada, setHorarioChegada] = useState('');
  const [statusViagem, setStatusViagem] = useState<'EM_TRANSITO' | 'FINALIZADO'>('EM_TRANSITO');
  const [garagem, setGaragem] = useState<string>('Kalunga');
  const [andar, setAndar] = useState<string>('');
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
    if (registroAtivo) {
      setSecretaria(registroAtivo.secretaria);
      setData(registroAtivo.data);
      setMotorista(registroAtivo.motorista);
      setFct(registroAtivo.fct);
      setHorarioSaida(registroAtivo.horarioSaida || '');
      setHorarioChegada(registroAtivo.horarioChegada || '');
      setStatusViagem(registroAtivo.status || (registroAtivo.horarioChegada ? 'FINALIZADO' : 'EM_TRANSITO'));

      // Restaurar garagem e andar
      let gInicial = registroAtivo.garagem || '';
      let aInicial = registroAtivo.andar || '';

      if (!gInicial) {
        if (aInicial.toLowerCase().includes('kalunga')) {
          gInicial = 'Kalunga';
        } else if (aInicial.toLowerCase().includes('sub solo') || aInicial.toLowerCase().includes('subsolo')) {
          gInicial = 'Sub Solo';
        }
      }

      let andarExtraido = aInicial;
      if (gInicial && andarExtraido) {
        andarExtraido = andarExtraido
          .replace(gInicial, '')
          .replace(/^[•\-\/\s]+/, '')
          .replace(/^Andar\s+/i, '')
          .replace(/º\s*Andar/i, '')
          .trim();
      }

      setGaragem(gInicial || (aInicial === 'Kalunga' || aInicial === 'Sub Solo' ? aInicial : 'Kalunga'));
      setAndar(andarExtraido);

      setFuncionarioResponsavel(registroAtivo.funcionarioResponsavel || 'Diego');
      setMatriculaFuncionario(registroAtivo.matriculaFuncionario || 'OP-002');
      setAssinaturaUrl(registroAtivo.assinaturaUrl || '');
      setPlaca(registroAtivo.placa || '');
      setModeloVeiculo(registroAtivo.modeloVeiculo || '');
      setDestino(registroAtivo.destino || '');
      setOcorrencia(registroAtivo.ocorrencia || '');
    } else {
      // Valores padrão para novo cadastro real
      const hoje = getLocalDateString();
      const agora = new Date();
      const horaMinuto = agora.toTimeString().slice(0, 5);

      setData(hoje);
      setHorarioSaida(horaMinuto);
      setHorarioChegada('');
      setStatusViagem('EM_TRANSITO');
      setMotorista('');
      setFct('');
      setPlaca('');
      setModeloVeiculo('');
      setDestino('');
      setOcorrencia('');
      setGaragem('Kalunga');
      setAndar('');

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
  }, [registroAtivo, isOpen, usuarioAtual]);

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
    // Validação de localização: aceita Garagem (Kalunga ou Sub Solo), Andar ou ambos
    const garagemInformada = garagem.trim();
    const andarInformado = andar.trim();

    if (!garagemInformada && !andarInformado) {
      setErro('Informe a Garagem de entrada (Kalunga ou Sub Solo) ou o Andar.');
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

    // Formatar a localização preservando tanto a Garagem informada quanto o Andar de destino
    let localizacaoComposta = '';
    if (garagemInformada && andarInformado) {
      const andarFormatado = ['SAA', 'Térreo'].includes(andarInformado)
        ? andarInformado
        : (andarInformado.toLowerCase().startsWith('andar') ? andarInformado : `Andar ${andarInformado}`);
      localizacaoComposta = `${garagemInformada} • ${andarFormatado}`;
    } else if (garagemInformada) {
      localizacaoComposta = garagemInformada;
    } else {
      localizacaoComposta = ['SAA', 'Térreo'].includes(andarInformado)
        ? andarInformado
        : (andarInformado.toLowerCase().startsWith('andar') ? andarInformado : `Andar ${andarInformado}`);
    }

    const payload = {
      ...(registroAtivo?.id ? { id: registroAtivo.id } : {}),
      secretaria,
      data,
      motorista: motorista.trim(),
      fct: isTurismo ? 'N/A' : (fct.trim() ? fct.trim().toUpperCase() : ''),
      horarioSaida: horarioSaida.trim(),
      horarioChegada: horarioChegada.trim(),
      garagem: garagemInformada,
      andar: localizacaoComposta,
      funcionarioResponsavel: funcionarioResponsavel.trim(),
      matriculaFuncionario: matriculaFuncionario.trim(),
      assinaturaUrl,
      placa: placa.trim().toUpperCase(),
      modeloVeiculo: modeloVeiculo.trim(),
      destino: destino.trim(),
      ocorrencia: ocorrencia.trim(),
      status: statusViagem,
    };

    if (onSalvar) {
      onSalvar(payload);
    } else if (onSave) {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#121417] border border-[#22252C] rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#22252C] bg-[#090A0C]/40">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#B08D57]" />
              <span>{registroEdicao ? 'Editar Registro de Veículo' : 'Novo Cadastro de Veículo'}</span>
            </h2>
            <p className="text-xs text-[#8E95A1] mt-0.5 font-medium">
              Secretaria da Agricultura & Secretaria do Turismo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E95A1] hover:text-white rounded-lg hover:bg-[#1B1E22] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {erro && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seleção da Secretaria */}
          <div>
            <label className="block text-[10px] font-semibold text-[#8E95A1] mb-2 uppercase tracking-wider">
              Secretaria Responsável *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  secretaria === 'Secretaria da Agricultura'
                    ? 'bg-[#B08D57]/10 border-[#B08D57]/40 text-white'
                    : 'bg-[#090A0C] border-[#22252C] text-white/70 hover:bg-[#1B1E22]'
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
                <div className="w-9 h-9 rounded bg-[#B08D57]/15 text-[#B08D57] flex items-center justify-center shrink-0 border border-[#B08D57]/30">
                  <Wheat className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold block text-white">Secretaria da Agricultura</span>
                  <span className="text-xs text-[#8E95A1]">Desenvolvimento rural</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  secretaria === 'Secretaria do Turismo'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-[#090A0C] border-[#22252C] text-white/70 hover:bg-[#1B1E22]'
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
                <div className="w-9 h-9 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Plane className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold block text-white">Secretaria do Turismo</span>
                  <span className="text-xs text-[#8E95A1]">Roteiros e eventos</span>
                </div>
              </label>
            </div>
          </div>

          {/* Dados Principais: Data e FCT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B08D57]" />
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className={`w-3.5 h-3.5 ${isTurismo ? 'text-white/30' : 'text-[#B08D57]'}`} />
                  {isTurismo ? 'FCT (Não Aplicável)' : 'Nº da FCT'}
                </span>
                <span className={`text-[10px] font-medium ${isTurismo ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-1.5 py-0.5 rounded' : 'text-[#8E95A1]/70'}`}>
                  {isTurismo ? 'Turismo não possui FCT' : '(Opcional)'}
                </span>
              </label>
              {isTurismo ? (
                <div className="w-full bg-[#090A0C]/40 border border-[#22252C] rounded-lg px-3.5 py-2.5 flex items-center gap-2 text-[#8E95A1]/40 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 shrink-0" />
                  <span className="text-xs font-medium">
                    Não aplicável ao Turismo
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  value={fct}
                  onChange={(e) => setFct(e.target.value)}
                  placeholder="Ex: 105 ou FCT-105"
                  className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono font-semibold placeholder-white/20 focus:outline-none transition-colors"
                />
              )}
            </div>
          </div>

          {/* SELEÇÃO DE GARAGEM E ANDAR DE ENTRADA/DESTINO */}
          <div className="bg-[#090A0C]/50 border border-[#22252C] rounded-lg p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#B08D57]" />
                <span>Local de Entrada & Destino *</span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#B08D57] bg-[#B08D57]/10 border border-[#B08D57]/20 px-2.5 py-1 rounded">
                  {garagem ? `Garagem: ${garagem}` : 'Sem garagem'}
                  {andar ? ` • Andar: ${['SAA', 'Térreo'].includes(andar) ? andar : `${andar}º`}` : ''}
                </span>
              </div>
            </div>

            {/* SELEÇÃO DA GARAGEM: KALUNGA E SUB SOLO */}
            <div>
              <span className="text-[11px] font-semibold text-[#8E95A1] block mb-2">
                1. Garagem de Entrada (Selecione em qual garagem o veículo entrou):
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* Mini Card 1: Kalunga */}
                <button
                  type="button"
                  id="mini-card-kalunga"
                  onClick={() => setGaragem(garagem === 'Kalunga' ? '' : 'Kalunga')}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                    garagem === 'Kalunga'
                      ? 'bg-[#B08D57] border-[#B08D57] text-black shadow-sm'
                      : 'bg-[#090A0C] border-[#22252C] text-white/80 hover:bg-[#1B1E22]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${
                    garagem === 'Kalunga'
                      ? 'bg-black/10 border-black/10 text-black'
                      : 'bg-[#1B1E22] border-[#22252C] text-[#B08D57]'
                  }`}>
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block whitespace-nowrap ${garagem === 'Kalunga' ? 'text-black' : 'text-white'}`}>
                      Kalunga
                    </span>
                    <span className={`text-[10px] block whitespace-nowrap ${garagem === 'Kalunga' ? 'text-black/80' : 'text-[#8E95A1]'}`}>
                      Garagem Kalunga
                    </span>
                  </div>
                  {garagem === 'Kalunga' && (
                    <span className="w-5 h-5 rounded-full bg-black text-[#B08D57] flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </span>
                  )}
                </button>

                {/* Mini Card 2: Sub Solo */}
                <button
                  type="button"
                  id="mini-card-sub-solo"
                  onClick={() => setGaragem(garagem === 'Sub Solo' ? '' : 'Sub Solo')}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                    garagem === 'Sub Solo'
                      ? 'bg-[#B08D57] border-[#B08D57] text-black shadow-sm'
                      : 'bg-[#090A0C] border-[#22252C] text-white/80 hover:bg-[#1B1E22]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${
                    garagem === 'Sub Solo'
                      ? 'bg-black/10 border-black/10 text-black'
                      : 'bg-[#1B1E22] border-[#22252C] text-[#B08D57]'
                  }`}>
                    <Car className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block whitespace-nowrap ${garagem === 'Sub Solo' ? 'text-black' : 'text-white'}`}>
                      Sub Solo
                    </span>
                    <span className={`text-[10px] block whitespace-nowrap ${garagem === 'Sub Solo' ? 'text-black/80' : 'text-[#8E95A1]'}`}>
                      Garagem Subsolo
                    </span>
                  </div>
                  {garagem === 'Sub Solo' && (
                    <span className="w-5 h-5 rounded-full bg-black text-[#B08D57] flex items-center justify-center text-xs font-bold shrink-0">
                      ✓
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* SELEÇÃO DO ANDAR DE DESTINO */}
            <div className="pt-3 border-t border-[#22252C]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#8E95A1]">
                  2. Andar de Destino:
                </span>
                {andar && (
                  <button
                    type="button"
                    onClick={() => setAndar('')}
                    className="text-[10px] text-[#B08D57] hover:text-white font-semibold underline cursor-pointer"
                  >
                    Limpar Andar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                {[
                  { id: 'Térreo', label: 'Térreo' },
                  { id: '1', label: '1º Andar' },
                  { id: '2', label: '2º Andar' },
                  { id: '3', label: '3º Andar' },
                  { id: '4', label: '4º Andar' },
                  { id: '5', label: '5º Andar' },
                  { id: '6', label: '6º Andar' },
                  { id: '7', label: '7º Andar' },
                  { id: 'SAA', label: 'SAA' },
                ].map((item) => {
                  const isSelecionado = andar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAndar(isSelecionado ? '' : item.id)}
                      className={`py-2 px-1 text-center font-bold text-xs rounded transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelecionado
                          ? 'bg-[#B08D57] border-[#B08D57] text-black font-extrabold'
                          : 'bg-[#090A0C] border-[#22252C] text-white/80 hover:bg-[#1B1E22] hover:text-white'
                      }`}
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Motorista e Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B08D57]" />
                Motorista Responsável *
              </label>
              <input
                type="text"
                required
                value={motorista}
                onChange={(e) => setMotorista(e.target.value)}
                placeholder="Nome completo do motorista"
                className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#B08D57]" />
                Veículo & Placa
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Placa: BRA-2026"
                  className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3 py-2.5 text-sm text-white font-mono font-bold placeholder-white/20 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  value={modeloVeiculo}
                  onChange={(e) => setModeloVeiculo(e.target.value)}
                  placeholder="Modelo: Spin, Hilux..."
                  className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Horários: Saída e Chegada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                  Horário de Saída
                </span>
                <span className="text-[10px] text-[#8E95A1]/70">
                  (Opcional)
                </span>
              </label>
              <input
                type="time"
                value={horarioSaida}
                onChange={(e) => setHorarioSaida(e.target.value)}
                className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-[#B08D57] font-mono font-bold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                  Horário de Chegada
                </span>
                <span className="text-[10px] text-[#8E95A1]/70">
                  (Opcional)
                </span>
              </label>
              <input
                type="time"
                value={horarioChegada}
                onChange={(e) => {
                  setHorarioChegada(e.target.value);
                  if (e.target.value) {
                    setStatusViagem('FINALIZADO');
                  }
                }}
                className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status da Viagem */}
          <div className="bg-[#090A0C]/50 border border-[#22252C] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Status da Viagem</span>
              </label>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                statusViagem === 'FINALIZADO'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/20'
              }`}>
                {statusViagem === 'FINALIZADO' ? '✅ Finalizado' : '⏳ Em Trânsito'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatusViagem('EM_TRANSITO')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  statusViagem === 'EM_TRANSITO'
                    ? 'bg-[#B08D57] border-[#B08D57] text-black shadow-sm'
                    : 'bg-[#090A0C] border-[#22252C] text-[#8E95A1] hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Em Trânsito</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusViagem('FINALIZADO')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  statusViagem === 'FINALIZADO'
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                    : 'bg-[#090A0C] border-[#22252C] text-[#8E95A1] hover:text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalizado</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8E95A1]">
              Você pode finalizar o registro a qualquer momento, mesmo sem preencher os horários.
            </p>
          </div>

          {/* Destino / Finalidade */}
          <div>
            <label className="block text-xs font-semibold text-[#8E95A1] mb-1.5">
              Destino / Finalidade da Operação
            </label>
            <input
              type="text"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="Ex: Vistoria técnica rural, transporte de comitiva..."
              className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Campo de Ocorrência */}
          <div className="bg-[#B08D57]/10 border border-[#B08D57]/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-[#B08D57] flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-[#B08D57] shrink-0" />
                <span>Ocorrência / Anotações da Portaria</span>
              </label>
              <span className="text-[10px] text-[#B08D57] bg-[#090A0C] border border-[#B08D57]/20 px-2 py-0.5 rounded font-medium">
                Opcional
              </span>
            </div>
            <textarea
              rows={2}
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              placeholder="Ex: Veículo retornou com avaria..."
              className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg p-3 text-xs sm:text-sm text-white placeholder-white/20 focus:outline-none resize-y transition-colors"
            />
          </div>

          {/* Seção Obrigatória: Funcionário Responsável e Assinatura */}
          <div className="pt-4 border-t border-[#22252C] space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E95A1] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#B08D57]" />
                  Operador Responsável pelo Cadastro *
                </span>
                <span className="text-[11px] text-[#8E95A1] font-medium">
                  {nomesResponsaveis.length} Operadores
                </span>
              </label>

              {/* Botões de Seleção Rápida dos Operadores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {nomesResponsaveis.map((nome) => {
                  const isSelecionado = funcionarioResponsavel.toLowerCase() === nome.toLowerCase();
                  return (
                    <button
                      key={nome}
                      type="button"
                      onClick={() => selecionarResponsavel(nome)}
                      className={`px-3 py-2 rounded-lg border font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelecionado
                          ? 'bg-[#B08D57] text-black border-[#B08D57] font-extrabold'
                          : 'bg-[#090A0C] border-[#22252C] text-white/80 hover:bg-[#1B1E22]'
                      }`}
                    >
                      {isSelecionado && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                      <span className="whitespace-nowrap tracking-wide">{nome}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#8E95A1] mb-1">
                    Operador Selecionado
                  </label>
                  <select
                    required
                    value={funcionarioResponsavel}
                    onChange={(e) => selecionarResponsavel(e.target.value)}
                    className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none transition-colors cursor-pointer"
                  >
                    {nomesResponsaveis.map((nome) => (
                      <option key={nome} value={nome} className="bg-[#121417] text-white">
                        {nome} (Operador)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8E95A1] mb-1">
                    Matrícula Funcional
                  </label>
                  <input
                    type="text"
                    value={matriculaFuncionario}
                    onChange={(e) => setMatriculaFuncionario(e.target.value)}
                    placeholder="Ex: OP-002"
                    className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#B08D57] font-mono placeholder-white/20 focus:outline-none transition-colors font-bold"
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
          <div className="pt-4 border-t border-[#22252C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#8E95A1] hover:text-white border border-[#B08D57]/20 transition-all cursor-pointer btn-premium-secondary apple-tactile-feedback"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer btn-premium-primary apple-tactile-feedback"
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
