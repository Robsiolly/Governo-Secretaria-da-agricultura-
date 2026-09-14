import React, { useState, useMemo } from 'react';
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
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado, FiltrosRegistros } from '../types';

interface DailyCardsViewProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onAjustarHorarios: (registro: RegistroVeiculo) => void;
  onExcluir?: (id: string) => void;
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
  onExcluir,
  onNovoRegistro,
  onAbrirModalCompleto,
  usuarioAtual,
  filtros,
  onFiltrosChange,
}) => {
  const [registroParaExcluir, setRegistroParaExcluir] = useState<RegistroVeiculo | null>(null);
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
      {/* Ouro Velho Liquid Glass Status & Filter Bar */}
      <div className="bg-[#111317]/80 backdrop-blur-2xl border border-[#B08D57]/20 rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
        {/* Status Indicators & Fast Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              statusAtual === 'TODOS'
                ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 border-[#DFBA73]/50 shadow-sm font-bold'
                : 'bg-black/40 border-[#B08D57]/20 text-white/70 hover:text-white hover:bg-black/60'
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
                ? 'bg-[#B08D57]/30 border-[#B08D57]/60 text-[#DFBA73] shadow-sm font-bold'
                : 'bg-black/40 border-[#B08D57]/20 text-[#DFBA73]/80 hover:text-[#DFBA73] hover:bg-black/60'
            }`}
            title="Filtrar veículos em trânsito"
          >
            <Clock className="w-3.5 h-3.5 text-[#DFBA73]" />
            <span>Fora (Em Trânsito):</span>
            <strong className="font-mono font-bold">{registrosEmTransito.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAtual === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              statusAtual === 'FINALIZADO'
                ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-sm font-bold'
                : 'bg-black/40 border-white/[0.08] text-emerald-400/80 hover:text-emerald-300 hover:bg-black/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chegaram (Pátio):</span>
            <strong className="font-mono font-bold">{registrosChegaram.length}</strong>
          </button>

          <div className="h-4 w-px bg-[#B08D57]/20 mx-0.5 hidden sm:block" />

          {/* Secretaria Badges */}
          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria da Agricultura' ? 'TODAS' : 'Secretaria da Agricultura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              secretariaAtual === 'Secretaria da Agricultura'
                ? 'bg-[#B08D57]/30 border-[#B08D57]/60 text-[#DFBA73] shadow-sm font-bold'
                : 'bg-black/40 border-[#B08D57]/20 text-white/60 hover:text-[#DFBA73]'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-[#DFBA73]" />
            <span>Agricultura ({totalAgricultura})</span>
          </button>

          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria do Turismo' ? 'TODAS' : 'Secretaria do Turismo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.96] ${
              secretariaAtual === 'Secretaria do Turismo'
                ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-300 shadow-sm font-bold'
                : 'bg-black/40 border-white/[0.08] text-white/60 hover:text-emerald-400'
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
            className="px-3 py-1.5 bg-[#B08D57]/10 hover:bg-[#B08D57]/20 active:scale-[0.96] text-[#DFBA73] hover:text-white rounded-xl border border-[#B08D57]/25 transition-all duration-200 cursor-pointer text-xs font-medium flex items-center gap-1.5 ml-auto"
            title="Expandir em Janela Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Painel Completo</span>
          </button>
        )}
      </div>

      {/* Vehicle Cards List */}
      {listaParaExibir.length === 0 ? (
        <div className="bg-[#111317]/60 backdrop-blur-xl border border-[#B08D57]/20 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73] mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhum registro encontrado</h3>
          <p className="text-xs text-[#C6A96B]/70 max-w-sm mx-auto">
            Não há registros correspondentes aos filtros selecionados.
          </p>
          {onNovoRegistro && (
            <button
              type="button"
              onClick={onNovoRegistro}
              className="px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 cursor-pointer shadow-md transition-all inline-flex items-center gap-1.5 active:scale-[0.96] border border-[#DFBA73]/40"
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
                className={`bg-[#111317]/80 hover:bg-[#161822]/90 backdrop-blur-xl border rounded-2xl p-3 sm:px-4 shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden ${
                  isEmTransito
                    ? 'border-l-4 border-l-[#B08D57] border-t-[#B08D57]/20 border-r-[#B08D57]/20 border-b-[#B08D57]/20 bg-[#B08D57]/[0.04]'
                    : 'border-l-4 border-l-emerald-400 border-t-white/[0.08] border-r-white/[0.08] border-b-white/[0.08]'
                }`}
              >
                {/* Left Side: Icon + Placa + Motorista + Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Secretaria Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isAgri 
                        ? 'bg-[#B08D57]/15 border border-[#B08D57]/40 text-[#DFBA73]' 
                        : 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-400'
                    }`}
                    title={reg.secretaria}
                  >
                    {isAgri ? <Wheat className="w-4 h-4 text-[#DFBA73]" /> : <Plane className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {/* Placa & FCT */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-white bg-black/50 border border-[#B08D57]/30 px-2 py-0.5 rounded-lg tracking-wider">
                      {placaVeic}
                    </span>
                    {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                      <span className="font-mono text-[10px] font-semibold text-[#DFBA73] bg-[#B08D57]/10 px-1.5 py-0.5 rounded-md border border-[#B08D57]/25 hidden sm:inline">
                        {reg.fct}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 hidden sm:inline">
                        Turismo
                      </span>
                    )}
                  </div>

                  <div className="h-4 w-px bg-[#B08D57]/20 hidden sm:block shrink-0" />

                  {/* Driver Name & Destination Info */}
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white break-words sm:truncate max-w-full sm:max-w-[280px]">
                      {motoristaNome}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#C6A96B]/70 flex-wrap">
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate max-w-[130px]">{reg.destino || 'Serviço'}</span>
                      {andarLocal && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap shrink-0 shadow-sm ${
                          andarLocal.includes('Kalunga') || andarLocal.includes('Sub Solo') || andarLocal === 'SAA'
                            ? 'bg-[#B08D57]/25 text-[#DFBA73] border-[#B08D57]/45'
                            : 'bg-white/[0.06] text-white/85 border-white/[0.12]'
                        }`}>
                          {andarLocal.includes('Kalunga') || andarLocal.includes('Sub Solo') || andarLocal === 'SAA' || andarLocal.toLowerCase().startsWith('andar') ? andarLocal : `Andar ${andarLocal}`}
                        </span>
                      )}
                      {reg.ocorrencia && (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40"
                          title={`Ocorrência: ${reg.ocorrencia}`}
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-[#DFBA73] shrink-0" />
                          <span>Ocorrência</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Time capsule & Action buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-[#B08D57]/15 pt-2.5 sm:pt-0">
                  {/* Time Pill com Saída e Chegada explícitos */}
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#B08D57]/25 text-xs shadow-inner max-w-full">
                    <div className="flex items-center gap-1">
                      <span className="text-[#C6A96B] font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Saída:
                      </span>
                      <strong className="font-mono font-bold text-white text-xs sm:text-sm">
                        {hSaida}
                      </strong>
                    </div>

                    <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#DFBA73]/40 mx-0.5 shrink-0" />

                    <div className="flex items-center gap-1">
                      <span className="text-[#C6A96B] font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Chegada:
                      </span>
                      {hChegada ? (
                        <strong className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                          {hChegada}
                        </strong>
                      ) : (
                        <span className="text-[#DFBA73] font-bold text-[10px] sm:text-[11px] bg-[#B08D57]/15 px-1.5 py-0.5 rounded-md border border-[#B08D57]/30 whitespace-nowrap">
                          Em trânsito
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto sm:ml-1">
                    {isEmTransito && (
                      <button
                        type="button"
                        onClick={() => onAjustarHorarios(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs text-slate-950 bg-gradient-to-r from-[#C6A96B] to-[#B08D57] hover:brightness-110 rounded-lg font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.96]"
                        title="Registrar Retorno do Veículo"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Retorno</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onVerDetalhes(reg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] sm:text-xs text-[#DFBA73] hover:text-white bg-[#B08D57]/10 hover:bg-[#B08D57]/20 border border-[#B08D57]/25 rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.96]"
                      title="Ver Ficha Completa e Assinatura"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>

                    {onExcluir && (
                      <button
                        type="button"
                        onClick={() => setRegistroParaExcluir(reg)}
                        className="p-1.5 sm:p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.96]"
                        title="Excluir Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {registroParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#111317] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Registro?</h3>
                <p className="text-xs text-slate-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o registro do motorista <strong className="text-white">{registroParaExcluir.motorista}</strong>
              {registroParaExcluir.placa ? ` (Veículo: ${registroParaExcluir.placa})` : ''}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRegistroParaExcluir(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onExcluir && registroParaExcluir) {
                    onExcluir(registroParaExcluir.id);
                  }
                  setRegistroParaExcluir(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition-all cursor-pointer active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
