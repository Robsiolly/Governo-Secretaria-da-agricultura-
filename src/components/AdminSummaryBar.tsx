import React from 'react';
import { Wheat, Plane, Clock, CheckCircle2 } from 'lucide-react';
import { RegistroVeiculo } from '../types';

interface AdminSummaryBarProps {
  registros: RegistroVeiculo[];
  onFiltrarSecretaria: (sec: 'Secretaria da Agricultura' | 'Secretaria do Turismo') => void;
  onFiltrarStatus: (status: 'EM_TRANSITO' | 'FINALIZADO') => void;
  onFiltrarSecretariaEStatus?: (sec: 'Secretaria da Agricultura' | 'Secretaria do Turismo', status: 'EM_TRANSITO' | 'FINALIZADO') => void;
}

export const AdminSummaryBar: React.FC<AdminSummaryBarProps> = ({
  registros,
  onFiltrarSecretaria,
  onFiltrarStatus,
  onFiltrarSecretariaEStatus,
}) => {
  const agriRegistros = registros.filter(r => r.secretaria === 'Secretaria da Agricultura');
  const turRegistros = registros.filter(r => r.secretaria === 'Secretaria do Turismo');

  const agriEmTransito = agriRegistros.filter(r => r.status === 'EM_TRANSITO').length;
  const turEmTransito = turRegistros.filter(r => r.status === 'EM_TRANSITO').length;

  const totalEmTransito = registros.filter(r => r.status === 'EM_TRANSITO').length;
  const totalConcluidos = registros.filter(r => r.status === 'FINALIZADO').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Widget 1: Sec. Agricultura */}
      <div className="bg-[#161618]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-amber-400/40 p-5 rounded-3xl text-left transition-all duration-200 shadow-xl flex flex-col justify-between group">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria da Agricultura')}
          className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white/90">Sec. Agricultura</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
              {agriRegistros.length}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onFiltrarSecretariaEStatus) {
                onFiltrarSecretariaEStatus('Secretaria da Agricultura', 'EM_TRANSITO');
              } else {
                onFiltrarStatus('EM_TRANSITO');
              }
            }}
            className="text-amber-400/90 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-500/10 active:scale-[0.96] transition-all"
            title="Ver veículos fora da Sec. Agricultura"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{agriEmTransito} Fora</span>
          </button>
          <span className="text-white/40 font-medium px-2 py-1">
            {agriRegistros.length - agriEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Widget 2: Sec. Turismo */}
      <div className="bg-[#161618]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-emerald-400/40 p-5 rounded-3xl text-left transition-all duration-200 shadow-xl flex flex-col justify-between group">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria do Turismo')}
          className="w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Plane className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-white/90">Sec. Turismo</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
              {turRegistros.length}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onFiltrarSecretariaEStatus) {
                onFiltrarSecretariaEStatus('Secretaria do Turismo', 'EM_TRANSITO');
              } else {
                onFiltrarStatus('EM_TRANSITO');
              }
            }}
            className="text-emerald-400/90 hover:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-500/10 active:scale-[0.96] transition-all"
            title="Ver veículos fora da Sec. Turismo"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{turEmTransito} Fora</span>
          </button>
          <span className="text-white/40 font-medium px-2 py-1">
            {turRegistros.length - turEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Widget 3: Fora (Em Trânsito) */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('EM_TRANSITO')}
        className="bg-[#161618]/70 backdrop-blur-2xl border border-amber-500/30 hover:border-amber-400 p-5 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xl active:scale-[0.98]"
        title="Clique para ver todos os registros em trânsito"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white/90 block">Em Trânsito</span>
              <span className="text-[11px] text-amber-400/80 font-medium">Fora do pátio</span>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
            {totalEmTransito}
          </span>
        </div>
        <div className="text-xs text-white/50 font-medium flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <span>Aguardando retorno</span>
          <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">Ver →</span>
        </div>
      </button>

      {/* Widget 4: Retornos Concluídos */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('FINALIZADO')}
        className="bg-[#161618]/70 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.2] p-5 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xl active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white/90 block">Concluídos</span>
              <span className="text-[11px] text-white/40 font-medium">No pátio</span>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalConcluidos}
          </span>
        </div>
        <div className="text-xs text-white/50 font-medium flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <span>Veículos conferidos</span>
          <span className="text-white/80 font-medium group-hover:translate-x-0.5 transition-transform">Ver →</span>
        </div>
      </button>
    </div>
  );
};

