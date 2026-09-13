import React, { useMemo } from 'react';
import {
  Wheat,
  Plane,
  Clock,
  CheckCircle2,
  Car,
  Eye,
  Check,
  ArrowRight,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado, FiltrosRegistros } from '../types';

interface DailyCardsViewProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onAjustarHorarios: (registro: RegistroVeiculo) => void;
  onNovoRegistro?: () => void;
  onAbrirModalCompleto?: () => void;
  usuarioAtual?: UsuarioAutenticado | null;
  filtros?: FiltrosRegistros;
  onFiltrosChange?: (novosFiltros: FiltrosRegistros) => void;
}

export const DailyCardsView: React.FC<DailyCardsViewProps> = ({
  registros,
  onVerDetalhes,
  onAjustarHorarios,
  onNovoRegistro,
  onAbrirModalCompleto,
  usuarioAtual,
  filtros,
  onFiltrosChange,
}) => {
  const listaParaExibir = registros;

  const registrosEmTransito = useMemo(() => {
    return listaParaExibir.filter((reg) => reg.status === 'EM_TRANSITO');
  }, [listaParaExibir]);

  const registrosChegaram = useMemo(() => {
    return listaParaExibir.filter((reg) => reg.status === 'FINALIZADO');
  }, [listaParaExibir]);

  const totalAgricultura = useMemo(() => {
    return listaParaExibir.filter(r => r.secretaria === 'Secretaria da Agricultura').length;
  }, [listaParaExibir]);

  const totalTurismo = useMemo(() => {
    return listaParaExibir.filter(r => r.secretaria === 'Secretaria do Turismo').length;
  }, [listaParaExibir]);

  const statusAtual = filtros?.status || 'TODOS';
  const secretariaAtual = filtros?.secretaria || 'TODAS';

  const setStatusAba = (novoStatus: 'TODOS' | 'EM_TRANSITO' | 'FINALIZADO') => {
    if (onFiltrosChange && filtros) {
      onFiltrosChange({ ...filtros, status: novoStatus });
    }
  };

  const setSecretariaFiltro = (novaSec: 'TODAS' | Secretaria) => {
    if (onFiltrosChange && filtros) {
      onFiltrosChange({ ...filtros, secretaria: novaSec });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Apple Liquid Glass Status & Filter Bar */}
      <div className="bg-[#161618]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Indicators & Fast Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              statusAtual === 'TODOS'
                ? 'bg-white text-black border-white shadow-sm font-bold'
                : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-white/60" />
            <span>Total Exibido:</span>
            <strong className="font-mono font-bold">{listaParaExibir.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAtual === 'EM_TRANSITO' ? 'TODOS' : 'EM_TRANSITO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              statusAtual === 'EM_TRANSITO'
                ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 shadow-sm font-bold'
                : 'bg-white/[0.04] border-white/[0.08] text-amber-400/80 hover:text-amber-300 hover:bg-white/[0.08]'
            }`}
            title="Filtrar veículos em trânsito"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Fora (Em Trânsito):</span>
            <strong className="font-mono font-bold">{registrosEmTransito.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAtual === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              statusAtual === 'FINALIZADO'
                ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-sm font-bold'
                : 'bg-white/[0.04] border-white/[0.08] text-emerald-400/80 hover:text-emerald-300 hover:bg-white/[0.08]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chegaram (Pátio):</span>
            <strong className="font-mono font-bold">{registrosChegaram.length}</strong>
          </button>

          <div className="h-4 w-px bg-white/[0.1] mx-0.5 hidden sm:block" />

          {/* Secretaria Badges */}
          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria da Agricultura' ? 'TODAS' : 'Secretaria da Agricultura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              secretariaAtual === 'Secretaria da Agricultura'
                ? 'bg-amber-500/25 border-amber-400/50 text-amber-300 shadow-sm font-bold'
                : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-amber-400'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-amber-400" />
            <span>Agricultura ({totalAgricultura})</span>
          </button>

          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria do Turismo' ? 'TODAS' : 'Secretaria do Turismo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              secretariaAtual === 'Secretaria do Turismo'
                ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-sm font-bold'
                : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-emerald-400'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-emerald-400" />
            <span>Turismo ({totalTurismo})</span>
          </button>
        </div>

        {/* Maximize Button */}
        {onAbrirModalCompleto && (
          <button
            type="button"
            onClick={onAbrirModalCompleto}
            className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.96] text-white/80 hover:text-white rounded-xl border border-white/[0.08] transition-all duration-200 cursor-pointer text-xs font-medium flex items-center gap-1.5 ml-auto"
            title="Expandir em Janela Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Painel Completo</span>
          </button>
        )}
      </div>

      {/* Vehicle Cards List */}
      {listaParaExibir.length === 0 ? (
        <div className="bg-[#161618]/50 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhum registro encontrado</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados.
          </p>
          {onNovoRegistro && (
            <button
              type="button"
              onClick={onNovoRegistro}
              className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md transition-all inline-flex items-center gap-1.5 active:scale-[0.96]"
            >
              <Car className="w-4 h-4" />
              <span>Cadastrar Novo Veículo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {listaParaExibir.map((reg) => {
            const isAgri = reg.secretaria === 'Secretaria da Agricultura';
            const isEmTransito = reg.status === 'EM_TRANSITO';
            const motoristaNome = reg.motorista || (reg as any).nomeMotorista || 'Não informado';
            const placaVeic = reg.placa || (reg as any).placaVeiculo || 'Sem placa';
            const hSaida = reg.horarioSaida || (reg as any).horaSaida || '--:--';
            const hChegada = reg.horarioChegada || (reg as any).horaChegada || '';
            const andarLocal = reg.andar || (reg as any).andarAtendimento || 'Térreo';

            return (
              <div
                key={reg.id}
                className={`bg-[#161618]/60 hover:bg-[#1c1c20]/80 backdrop-blur-xl border rounded-2xl p-3 sm:px-4 shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isEmTransito
                    ? 'border-l-4 border-l-amber-400 border-t-white/[0.08] border-r-white/[0.08] border-b-white/[0.08] bg-amber-500/[0.03]'
                    : 'border-l-4 border-l-emerald-400 border-t-white/[0.08] border-r-white/[0.08] border-b-white/[0.08]'
                }`}
              >
                {/* Left Side: Icon + Placa + Motorista + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Secretaria Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isAgri 
                        ? 'bg-amber-500/15 border border-amber-400/30 text-amber-400' 
                        : 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-400'
                    }`}
                    title={reg.secretaria}
                  >
                    {isAgri ? <Wheat className="w-4 h-4 text-amber-400" /> : <Plane className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {/* Placa & FCT */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-white bg-white/[0.06] border border-white/[0.12] px-2 py-0.5 rounded-lg tracking-wider">
                      {placaVeic}
                    </span>
                    {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                      <span className="font-mono text-[10px] font-semibold text-white/70 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.08] hidden sm:inline">
                        {reg.fct}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-white/50 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.08] hidden sm:inline">
                        Turismo
                      </span>
                    )}
                  </div>

                  <div className="h-4 w-px bg-white/[0.08] hidden sm:block shrink-0" />

                  {/* Driver Name & Destination Info */}
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[160px] sm:max-w-[220px]">
                      {motoristaNome}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/50 truncate flex-wrap">
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate max-w-[130px]">{reg.destino || 'Serviço'}</span>
                      {andarLocal && andarLocal !== 'Térreo' && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold border ${
                          andarLocal === 'SAA'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-white/[0.05] text-white/70 border-white/[0.08]'
                        }`}>
                          Andar {andarLocal}
                        </span>
                      )}
                      {reg.ocorrencia && (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/30"
                          title={`Ocorrência: ${reg.ocorrencia}`}
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span>Ocorrência</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Time capsule & Action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 border-white/[0.06] pt-2 sm:pt-0">
                  {/* Time Pill */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08] font-mono text-[11px] sm:text-xs shrink-0">
                    <span className="text-white/40 font-sans font-bold text-[9px]">S:</span>
                    <strong className="text-white">{hSaida}</strong>
                    <ArrowRight className="w-3 h-3 text-white/30 mx-0.5" />
                    <span className="text-white/40 font-sans font-bold text-[9px]">C:</span>
                    {hChegada ? (
                      <strong className="text-emerald-400">{hChegada}</strong>
                    ) : (
                      <span className="text-amber-400 font-bold font-sans text-[10px]">Em trânsito</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {isEmTransito && (
                      <button
                        type="button"
                        onClick={() => onAjustarHorarios(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.96]"
                        title="Registrar Retorno do Veículo"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Retorno</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onVerDetalhes(reg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.96]"
                      title="Ver Ficha Completa e Assinatura"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

