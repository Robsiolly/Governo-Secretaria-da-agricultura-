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
  FileDown
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado, FiltrosRegistros } from '../types';
import { PdfService } from '../services/pdfService';

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
  // Se filtros forem fornecidos pelo componente pai (App.tsx), os registros já chegam filtrados.
  const listaParaExibir = registros;

  // Estatísticas calculadas sobre a lista exibida
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
    <div className="space-y-4">
      {/* Barra de Status e Contadores Rápidos do Painel (Unificada com a barra de busca do app) */}
      <div className="bg-slate-900 border-2 border-slate-750 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Badges Rápidos de Filtro e Indicadores de Quantidade */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusAtual === 'TODOS'
                ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            Total Exibido: <strong className="text-white font-mono ml-1">{listaParaExibir.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAtual === 'EM_TRANSITO' ? 'TODOS' : 'EM_TRANSITO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              statusAtual === 'EM_TRANSITO'
                ? 'bg-amber-950 border-amber-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-amber-300 hover:bg-slate-850'
            }`}
            title="Clique para filtrar apenas veículos que estão fora"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Fora (Em Trânsito):</span>
            <strong className="font-mono text-amber-400">{registrosEmTransito.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAtual === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              statusAtual === 'FINALIZADO'
                ? 'bg-amber-950 border-amber-9500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-850'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Chegaram (Pátio):</span>
            <strong className="font-mono text-amber-400">{registrosChegaram.length}</strong>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Filtros rápidos por secretaria */}
          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria da Agricultura' ? 'TODAS' : 'Secretaria da Agricultura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              secretariaAtual === 'Secretaria da Agricultura'
                ? 'bg-[#3A241D] border-[#D97924] text-white shadow-md'
                : 'bg-black border-[#6B6B6B]/30 text-[#D97924] hover:bg-neutral-900'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-[#D97924]" />
            <span>Agricultura ({totalAgricultura})</span>
          </button>

          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaAtual === 'Secretaria do Turismo' ? 'TODAS' : 'Secretaria do Turismo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              secretariaAtual === 'Secretaria do Turismo'
                ? 'bg-emerald-950 border-emerald-500 text-white shadow-md'
                : 'bg-black border-[#6B6B6B]/30 text-emerald-400 hover:bg-neutral-900'
            }`}
          >
            <Plane    className="text-emerald-400 w-3.5 h-3.5 text-emerald-400" />
            <span>Turismo ({totalTurismo})</span>
          </button>
        </div>

        {/* Botão de Janela Cheia se disponível */}
        {onAbrirModalCompleto && (
          <button
            type="button"
            onClick={onAbrirModalCompleto}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ml-auto"
            title="Expandir em Janela Modal Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Painel Completo</span>
          </button>
        )}
      </div>

      {/* Lista Compacta de Registros Diários (Cartões em Lista com Destaque para Placa e Motorista) */}
      {listaParaExibir.length === 0 ? (
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Car className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">Nenhum registro encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não há registros correspondentes aos filtros selecionados.
          </p>
          {onNovoRegistro && (
            <button
              type="button"
              onClick={onNovoRegistro}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-9500 text-white cursor-pointer shadow-lg transition-all inline-flex items-center gap-1.5"
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
            const modeloVeic = reg.modeloVeiculo || 'Veículo';
            const hSaida = reg.horarioSaida || (reg as any).horaSaida || '--:--';
            const hChegada = reg.horarioChegada || (reg as any).horaChegada || '';
            const andarLocal = reg.andar || (reg as any).andarAtendimento || 'Térreo';
            const dataReg = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';

            return (
              <div
                key={reg.id}
                className={`bg-slate-900/95 hover:bg-slate-850 border rounded-xl p-2.5 sm:py-2.5 sm:px-3.5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 border-l-4 ${
                  isEmTransito
                    ? 'border-l-amber-400 border-t-slate-800 border-r-slate-800 border-b-slate-800 bg-amber-950/10'
                    : 'border-l-amber-9500 border-t-slate-800 border-r-slate-800 border-b-slate-800'
                }`}
              >
                {/* Lado Esquerdo: Placa com Super Destaque + Secretaria/FCT + Motorista */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Ícone da Secretaria */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isAgri ? 'bg-[#3A241D] border border-[#D97924]/40' : 'bg-emerald-950 border border-emerald-500/40'
                    }`}
                    title={reg.secretaria}
                  >
                    {isAgri ? <Wheat className="w-4 h-4 text-[#D97924]" /> : <Plane    className="text-emerald-400 w-4 h-4 text-[#D97924]" />}
                  </div>

                  {/* Placa em Destaque Alto Contraste */}
                  <div className="shrink-0 flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm sm:text-base text-amber-400 bg-slate-950 border-2 border-amber-9500/50 px-2.5 py-0.5 rounded-lg tracking-wider shadow-inner">
                        {placaVeic}
                      </span>
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
                          Turismo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[170px]">
                      {modeloVeic}
                    </span>
                  </div>

                  <div className="h-7 w-px bg-slate-800 hidden sm:block shrink-0" />

                      {/* Nome do Motorista em Destaque + Destino */}
                    <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm sm:text-base text-white truncate max-w-[220px] sm:max-w-[300px]">
                        {motoristaNome}
                      </span>
                      <span className="text-slate-500 hidden sm:inline">•</span>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[180px] sm:max-w-[260px]">
                        {reg.destino || 'Serviço'}
                      </span>
                      {andarLocal && andarLocal !== 'Térreo' && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border tracking-wide shadow-sm ${
                          andarLocal === 'SAA'
                            ? 'bg-amber-500/30 text-amber-300 border-amber-400 animate-pulse'
                            : 'bg-slate-800 text-amber-400 border-slate-700'
                        }`}>
                          <span>Andar {andarLocal}</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
                      <span className="text-slate-400 truncate max-w-[160px]">{reg.secretaria}</span>
                      {dataReg && <span>• Data: <strong className="text-slate-300">{dataReg}</strong></span>}
                      <span className="hidden sm:inline">• Resp: <strong className="text-slate-300">{reg.funcionarioResponsavel}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Horários + Status + Ações Compactas */}
                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  {/* Horários */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-xs shrink-0">
                    <span className="text-slate-400 text-[10px] font-sans uppercase font-bold">Saída:</span>
                    <strong className="text-white">{hSaida}</strong>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-400 text-[10px] font-sans uppercase font-bold">Ret:</span>
                    {hChegada ? (
                      <strong className="text-amber-400">{hChegada}</strong>
                    ) : (
                      <span className="text-amber-400 font-bold font-sans animate-pulse text-[11px]">Fora</span>
                    )}
                  </div>

                  {/* Badge de Status */}
                  <div className="shrink-0">
                    {isEmTransito ? (
                      <button
                        type="button"
                        onClick={() => setStatusAba('EM_TRANSITO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-950/90 text-amber-300 border border-amber-500/60 hover:bg-amber-900 transition-colors cursor-pointer shadow-sm"
                        title="Filtrar veículos em trânsito"
                      >
                        <Clock className="w-3 h-3 animate-pulse text-amber-400 shrink-0" />
                        <span>Na Rua</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatusAba('FINALIZADO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/90 text-amber-400 border border-amber-9500/50 hover:bg-amber-950 transition-colors cursor-pointer shadow-sm"
                        title="Filtrar veículos com retorno concluído"
                      >
                        <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>No Pátio</span>
                      </button>
                    )}
                  </div>

                  {/* Ações Compactas */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEmTransito && (
                      <button
                        type="button"
                        onClick={() => onAjustarHorarios(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-9500 rounded-lg font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Registrar Retorno do Veículo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Retorno</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onVerDetalhes(reg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                      title="Ver Ficha Completa e Assinatura"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden xs:inline">Ficha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-lg transition-colors cursor-pointer"
                      title="Baixar Ficha Individual em PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
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
