import React, { useState } from 'react';
import { X, Wheat, Plane, FileDown, Edit3, Trash2, CheckCircle2, Clock, Calendar, User, Building, Car, MapPin, PenTool, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface RecordDetailModalProps {
  registro: RegistroVeiculo | null;
  onClose: () => void;
  onEdit: (registro: RegistroVeiculo) => void;
  onEditarHorarios?: (registro: RegistroVeiculo) => void;
  onDelete: (id: string) => void;
  onFinalizarViagem: (id: string, horarioChegada: string) => void;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  registro,
  onClose,
  onEdit,
  onEditarHorarios,
  onDelete,
  onFinalizarViagem,
  usuarioAtual,
}) => {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [horarioRetornoInput, setHorarioRetornoInput] = useState('');
  const [mostrarCampoRetorno, setMostrarCampoRetorno] = useState(false);

  if (!registro) return null;

  const isAgri = registro.secretaria === 'Secretaria da Agricultura';
  const dataFormatada = registro.data ? new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

  const handleSalvarRetorno = () => {
    const hora = horarioRetornoInput.trim() || new Date().toTimeString().slice(0, 5);
    onFinalizarViagem(registro.id, hora);
    setMostrarCampoRetorno(false);
  };

  const handleExportarFicha = () => {
    PdfService.gerarFichaIndividual(registro, usuarioAtual);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                isAgri
                  ? 'bg-gradient-to-br from-[#3A241D] to-[#5A3A2E] border-2 border-[#D97924]/40'
                  : 'bg-gradient-to-br from-[#8c6d46] to-[#6e5230] border-2 border-[#b08d57]/50'
              }`}
            >
              {isAgri ? <Wheat className="w-6 h-6 text-[#D97924]" /> : <Plane className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                {isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? (
                  <h3 className="text-xl sm:text-2xl font-black text-white font-mono">FCT: {registro.fct}</h3>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-[#d4b896] bg-[#362619] border border-[#a8855d]/60 px-3 py-1 rounded-xl">
                    Sem FCT (Turismo)
                  </span>
                )}
                <span
                  className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                    registro.status === 'EM_TRANSITO'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {registro.status === 'EM_TRANSITO' ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                      <span>Em Trânsito</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Concluído</span>
                    </>
                  )}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-300 block mt-0.5">{registro.secretaria}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportarFicha}
              className="p-3 text-slate-300 hover:text-[#d4b896] hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Exportar Comprovante do Registro em PDF"
            >
              <FileDown className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(registro)}
              className="p-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              title="Editar Registro"
            >
              <Edit3 className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-3 text-slate-300 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Alert if in transit */}
          {registro.status === 'EM_TRANSITO' && (
            <div className="bg-amber-950/70 border-2 border-amber-600/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 text-sm sm:text-base text-amber-100 font-bold">
                <Clock className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
                <span>Veículo em rota externa (Aguardando retorno na portaria)</span>
              </div>
              {!mostrarCampoRetorno ? (
                <button
                  type="button"
                  onClick={() => {
                    setHorarioRetornoInput(new Date().toTimeString().slice(0, 5));
                    setMostrarCampoRetorno(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-md min-h-[44px]"
                >
                  Registrar Chegada
                </button>
              ) : (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <input
                    type="time"
                    value={horarioRetornoInput}
                    onChange={(e) => setHorarioRetornoInput(e.target.value)}
                    className="bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSalvarRetorno}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarCampoRetorno(false)}
                    className="text-slate-300 text-sm hover:underline cursor-pointer font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botão Dedicado de Acesso para Alterar Horários */}
          {onEditarHorarios && (
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">Precisa alterar ou corrigir horários?</span>
                  <span className="text-xs text-slate-300 font-medium">Ajuste o horário de saída ou o horário de chegada a qualquer momento</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditarHorarios(registro);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Acessar e Ajustar Horários</span>
              </button>
            </div>
          )}

          {/* Dados em Grade */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                Data
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">{dataFormatada}</span>
            </div>

            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Horário de Saída
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-400 block">{registro.horarioSaida}</span>
            </div>

            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Horário de Chegada
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-white block">
                {registro.horarioChegada || (
                  <span className="text-amber-400 italic font-semibold text-sm">Em trânsito</span>
                )}
              </span>
            </div>

            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl col-span-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <User className="w-4 h-4 text-sky-400" />
                Motorista Designado
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">{registro.motorista}</span>
            </div>

            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Building className="w-4 h-4 text-purple-400" />
                Andar / Setor
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">{registro.andar}</span>
            </div>
          </div>

          {/* Veículo & Destino se existirem */}
          {(registro.placa || registro.modeloVeiculo || registro.destino) && (
            <div className="bg-slate-950 border-2 border-slate-800 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200">
                <Car className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Veículo: <strong className="text-white font-bold">{registro.placa || 'Sem placa'}</strong> {registro.modeloVeiculo ? `(${registro.modeloVeiculo})` : ''}
                </span>
              </div>
              {registro.destino && (
                <div className="flex items-start gap-2.5 text-sm sm:text-base text-slate-200">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Destino / Rota: <strong className="text-white font-bold">{registro.destino}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Campo de Ocorrência Registrada */}
          {registro.ocorrencia ? (
            <div className="bg-amber-950/40 border-2 border-amber-600/60 rounded-2xl p-4 sm:p-5 space-y-2 shadow-lg shadow-amber-950/30">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Ocorrência / Anotação da Portaria</span>
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Registrada pelo Operador
                </span>
              </div>
              <p className="text-sm sm:text-base text-white font-medium bg-slate-950/80 p-3.5 rounded-xl border border-amber-600/30 whitespace-pre-wrap leading-relaxed">
                {registro.ocorrencia}
              </p>
            </div>
          ) : (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-500" />
                Nenhuma ocorrência ou avaria anotada para esta viagem.
              </span>
              <button
                type="button"
                onClick={() => onEdit(registro)}
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer ml-2 whitespace-nowrap"
              >
                + Adicionar Ocorrência
              </button>
            </div>
          )}

          {/* Assinatura do Operador Responsável */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="leading-tight">Assinatura do Operador Responsável pelo Cadastro</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400 font-black bg-amber-950/80 px-3 py-1.5 rounded-full border border-amber-500/50 leading-none shadow-inner shrink-0 whitespace-nowrap self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="pt-[1px]">Autenticado</span>
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 flex items-center justify-center border-2 border-slate-300 shadow-inner">
              {registro.assinaturaUrl ? (
                <img
                  src={registro.assinaturaUrl}
                  alt={`Assinatura do Operador ${registro.funcionarioResponsavel}`}
                  className="max-h-28 w-auto object-contain"
                />
              ) : (
                <span className="text-sm text-slate-400 italic py-6">Sem assinatura gráfica registrada</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-300 pt-1">
              <span>
                Operador Responsável: <strong className="text-white font-bold">{registro.funcionarioResponsavel}</strong>
              </span>
              {registro.matriculaFuncionario && (
                <span>
                  Matrícula: <strong className="text-amber-400 font-mono font-bold">{registro.matriculaFuncionario}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Exclusão do Registro */}
          {confirmandoExclusao ? (
            <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-700 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 text-sm text-rose-100 font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Confirma a exclusão definitiva deste registro de veículo?</span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(registro.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold cursor-pointer min-h-[40px]"
                >
                  Confirmar Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="text-sm text-slate-300 hover:underline cursor-pointer font-bold px-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-bold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir este registro</span>
              </button>

              <button
                type="button"
                onClick={handleExportarFicha}
                className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Baixar Ficha Oficial (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
