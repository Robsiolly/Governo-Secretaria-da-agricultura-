import React, { useState } from 'react';
import { X, Wheat, Plane, FileDown, Edit3, Trash2, CheckCircle2, Clock, Calendar, User, Building, Car, MapPin, PenTool, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface RecordDetailModalProps {
  isOpen?: boolean;
  registro: RegistroVeiculo | null;
  onClose: () => void;
  onEdit?: (registro: RegistroVeiculo) => void;
  onEditar?: (registro: RegistroVeiculo) => void;
  onEditarHorarios?: (registro: RegistroVeiculo) => void;
  onAjustarHorarios?: (registro: RegistroVeiculo) => void;
  onDelete?: (id: string) => void;
  onExcluir?: (id: string) => void;
  onFinalizarViagem?: (id: string, horarioChegada: string) => void;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  registro,
  onClose,
  onEdit,
  onEditar,
  onEditarHorarios,
  onAjustarHorarios,
  onDelete,
  onExcluir,
  onFinalizarViagem,
  usuarioAtual,
}) => {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [horarioRetornoInput, setHorarioRetornoInput] = useState('');
  const [mostrarCampoRetorno, setMostrarCampoRetorno] = useState(false);

  if (!registro) return null;

  const handleEdit = () => {
    if (onEdit) onEdit(registro);
    else if (onEditar) onEditar(registro);
  };

  const handleDelete = (id: string) => {
    if (onDelete) onDelete(id);
    else if (onExcluir) onExcluir(id);
  };

  const isAgri = registro.secretaria === 'Secretaria da Agricultura';
  const dataFormatada = registro.data ? new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

  const handleSalvarRetorno = () => {
    const hora = horarioRetornoInput.trim() || new Date().toTimeString().slice(0, 5);
    if (onFinalizarViagem) {
      onFinalizarViagem(registro.id, hora);
    }
    setMostrarCampoRetorno(false);
  };

  const handleExportarFicha = () => {
    PdfService.gerarFichaIndividual(registro, usuarioAtual);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#B08D57]/20 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md border ${
                isAgri
                  ? 'bg-[#B08D57]/20 text-[#DFBA73] border-[#B08D57]/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
              }`}
            >
              {isAgri ? <Wheat className="w-5 h-5 text-[#DFBA73]" /> : <Plane className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? (
                  <h3 className="text-lg sm:text-xl font-bold text-white font-mono">FCT {registro.fct}</h3>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-xl">
                    Sem FCT (Turismo)
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                    registro.status === 'EM_TRANSITO'
                      ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {registro.status === 'EM_TRANSITO' ? (
                    <>
                      <Clock className="w-3 h-3 animate-pulse text-[#DFBA73]" />
                      <span>Em Trânsito</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Concluído</span>
                    </>
                  )}
                </span>
              </div>
              <span className="text-xs font-medium text-[#C6A96B]/70 block mt-0.5">{registro.secretaria}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportarFicha}
              className="p-2 text-white/50 hover:text-white hover:bg-[#B08D57]/20 rounded-xl transition-all cursor-pointer active:scale-[0.94]"
              title="Exportar Comprovante do Registro em PDF"
            >
              <FileDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 text-white/50 hover:text-white hover:bg-[#B08D57]/20 rounded-xl transition-all cursor-pointer active:scale-[0.94]"
              title="Editar Registro"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-[#B08D57]/20 rounded-xl transition-all cursor-pointer active:scale-[0.94]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Status Alert if in transit */}
          {registro.status === 'EM_TRANSITO' && (
            <div className="bg-[#B08D57]/15 border border-[#B08D57]/35 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#DFBA73] font-semibold">
                <Clock className="w-4 h-4 text-[#DFBA73] shrink-0 animate-pulse" />
                <span>Veículo em trânsito externo (Aguardando retorno na portaria)</span>
              </div>
              {!mostrarCampoRetorno ? (
                <button
                  type="button"
                  onClick={() => {
                    setHorarioRetornoInput(new Date().toTimeString().slice(0, 5));
                    setMostrarCampoRetorno(true);
                  }}
                  className="bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-md active:scale-[0.96] border border-[#DFBA73]/40"
                >
                  Registrar Chegada
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="time"
                    value={horarioRetornoInput}
                    onChange={(e) => setHorarioRetornoInput(e.target.value)}
                    className="bg-black/60 border border-[#B08D57]/40 rounded-xl px-2.5 py-1 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSalvarRetorno}
                    className="bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer active:scale-[0.96]"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarCampoRetorno(false)}
                    className="text-white/50 text-xs hover:text-white cursor-pointer font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botão Dedicado de Acesso para Alterar Horários */}
          {onEditarHorarios && (
            <div className="bg-black/40 border border-[#B08D57]/20 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Ajuste de Horários</span>
                  <span className="text-[11px] text-[#C6A96B]/70">Altere horários de saída ou chegada a qualquer momento</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditarHorarios(registro);
                }}
                className="bg-black/50 hover:bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/30 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-[0.96]"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Ajustar Horários</span>
              </button>
            </div>
          )}

          {/* Dados em Grade */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A96B]/70 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-[#DFBA73]" />
                Data
              </span>
              <span className="text-sm font-semibold text-white block">{dataFormatada}</span>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A96B]/70 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-[#DFBA73]" />
                Horário de Saída
              </span>
              <span className="text-sm font-bold font-mono text-[#DFBA73] block">{registro.horarioSaida || '--:--'}</span>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A96B]/70 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-[#DFBA73]" />
                Horário de Chegada
              </span>
              <span className="text-sm font-bold font-mono text-white block">
                {registro.horarioChegada || (
                  registro.status === 'FINALIZADO' ? (
                    <span className="text-emerald-400 font-medium text-xs">Finalizado</span>
                  ) : (
                    <span className="text-[#DFBA73] italic font-medium text-xs">Em trânsito</span>
                  )
                )}
              </span>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl col-span-2 sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A96B]/70 flex items-center gap-1 mb-1">
                <User className="w-3 h-3 text-[#DFBA73]" />
                Motorista Designado
              </span>
              <span className="text-sm font-semibold text-white block">{registro.motorista}</span>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C6A96B]/70 flex items-center gap-1 mb-1">
                <Building className="w-3 h-3 text-[#DFBA73]" />
                Local / Garagem / Andar
              </span>
              <span className="text-sm font-semibold text-white block">{registro.andar || registro.garagem || '-'}</span>
            </div>
          </div>

          {/* Veículo & Destino se existirem */}
          {(registro.placa || registro.modeloVeiculo || registro.destino) && (
            <div className="bg-black/40 border border-[#B08D57]/15 p-3 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80">
                <Car className="w-4 h-4 text-[#DFBA73] shrink-0" />
                <span>
                  Veículo: <strong className="text-white font-semibold">{registro.placa || 'Sem placa'}</strong> {registro.modeloVeiculo ? `(${registro.modeloVeiculo})` : ''}
                </span>
              </div>
              {registro.destino && (
                <div className="flex items-start gap-2 text-xs sm:text-sm text-white/80">
                  <MapPin className="w-4 h-4 text-[#DFBA73] shrink-0 mt-0.5" />
                  <span>
                    Destino / Rota: <strong className="text-white font-semibold">{registro.destino}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Campo de Ocorrência Registrada */}
          {registro.ocorrencia ? (
            <div className="bg-[#B08D57]/15 border border-[#B08D57]/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#DFBA73] flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4 text-[#DFBA73] shrink-0" />
                  <span>Ocorrência / Anotação da Portaria</span>
                </span>
                <span className="text-[10px] bg-black/40 text-[#DFBA73] border border-[#B08D57]/30 px-2 py-0.5 rounded-full font-medium">
                  Registrada
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 bg-black/40 p-2.5 rounded-xl border border-[#B08D57]/20 whitespace-pre-wrap leading-relaxed">
                {registro.ocorrencia}
              </p>
            </div>
          ) : (
            <div className="bg-black/30 border border-[#B08D57]/15 rounded-2xl p-3 flex items-center justify-between text-xs text-[#C6A96B]/60">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C6A96B]/50" />
                Nenhuma ocorrência registrada.
              </span>
              <button
                type="button"
                onClick={() => onEdit(registro)}
                className="text-[#DFBA73] hover:text-white font-medium cursor-pointer ml-2"
              >
                + Adicionar Ocorrência
              </button>
            </div>
          )}

          {/* Assinatura do Operador Responsável */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-4 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-[#DFBA73] shrink-0" />
                <span>Assinatura do Operador de Cadastro</span>
              </span>
              <span className="inline-flex items-center justify-center gap-1 text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30 leading-none self-start sm:self-auto">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Autenticado</span>
              </span>
            </div>

            <div className="bg-white rounded-xl p-2.5 flex items-center justify-center border border-white/10 shadow-inner">
              {registro.assinaturaUrl ? (
                <img
                  src={registro.assinaturaUrl}
                  alt={`Assinatura do Operador ${registro.funcionarioResponsavel}`}
                  className="max-h-24 w-auto object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 italic py-4">Sem assinatura gráfica</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[#C6A96B]/70 pt-0.5">
              <span>
                Operador: <strong className="text-white font-semibold">{registro.funcionarioResponsavel}</strong>
              </span>
              {registro.matriculaFuncionario && (
                <span>
                  Matrícula: <strong className="text-[#DFBA73] font-mono font-semibold">{registro.matriculaFuncionario}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Exclusão do Registro */}
          {confirmandoExclusao ? (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 flex-wrap animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-rose-200 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Confirma a exclusão definitiva deste registro?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(registro.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer active:scale-[0.96]"
                >
                  Confirmar Exclusão
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="text-xs text-white/60 hover:text-white cursor-pointer font-medium px-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(true)}
                className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir registro</span>
              </button>

              <button
                type="button"
                onClick={handleExportarFicha}
                className="flex items-center gap-1.5 text-xs text-[#DFBA73] hover:text-white font-semibold cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Baixar Ficha Oficial (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
