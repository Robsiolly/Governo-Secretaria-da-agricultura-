import React from 'react';
import { Wheat, Compass, Clock, CheckCircle2, Car, TrendingUp } from 'lucide-react';
import { RegistroVeiculo } from '../types';

interface AdminSummaryBarProps {
  registros: RegistroVeiculo[];
  onFiltrarSecretaria: (sec: 'Secretaria da Agricultura' | 'Secretaria do Turismo') => void;
  onFiltrarStatus: (status: 'EM_TRANSITO' | 'FINALIZADO') => void;
}

export const AdminSummaryBar: React.FC<AdminSummaryBarProps> = ({
  registros,
  onFiltrarSecretaria,
  onFiltrarStatus,
}) => {
  const agriRegistros = registros.filter(r => r.secretaria === 'Secretaria da Agricultura');
  const turRegistros = registros.filter(r => r.secretaria === 'Secretaria do Turismo');

  const agriEmTransito = agriRegistros.filter(r => r.status === 'EM_TRANSITO').length;
  const turEmTransito = turRegistros.filter(r => r.status === 'EM_TRANSITO').length;

  const totalEmTransito = registros.filter(r => r.status === 'EM_TRANSITO').length;
  const totalConcluidos = registros.filter(r => r.status === 'FINALIZADO').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card Agricultura */}
      <button
        type="button"
        onClick={() => onFiltrarSecretaria('Secretaria da Agricultura')}
        className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 hover:border-emerald-400 p-5 rounded-3xl text-left transition-all group cursor-pointer shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <Wheat className="w-6 h-6" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-100">Sec. Agricultura</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-600/40">
            {agriRegistros.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium">
          <span className="text-amber-300 font-semibold">{agriEmTransito} em trânsito</span>
          <span className="text-emerald-300 font-semibold">{agriRegistros.length - agriEmTransito} no pátio</span>
        </div>
      </button>

      {/* Card Turismo */}
      <button
        type="button"
        onClick={() => onFiltrarSecretaria('Secretaria do Turismo')}
        className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 hover:border-amber-400 p-5 rounded-3xl text-left transition-all group cursor-pointer shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-100">Sec. Turismo</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-600/40">
            {turRegistros.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium">
          <span className="text-amber-300 font-semibold">{turEmTransito} em trânsito</span>
          <span className="text-emerald-300 font-semibold">{turRegistros.length - turEmTransito} no pátio</span>
        </div>
      </button>

      {/* Card Em Trânsito */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('EM_TRANSITO')}
        className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 hover:border-amber-400 p-5 rounded-3xl text-left transition-all group cursor-pointer shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-100">Em Trânsito</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-600/40">
            {totalEmTransito}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium">
          <span>Veículos aguardando retorno na portaria</span>
        </div>
      </button>

      {/* Card Concluídos */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('FINALIZADO')}
        className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-700 hover:border-emerald-400 p-5 rounded-3xl text-left transition-all group cursor-pointer shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-100">Retornos Concluídos</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-600/40">
            {totalConcluidos}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium">
          <span>Veículos no pátio e conferidos</span>
        </div>
      </button>
    </div>
  );
};
