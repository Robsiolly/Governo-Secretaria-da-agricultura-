import React from 'react';
import { Wheat, Compass, Clock, CheckCircle2, Car, TrendingUp } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card Agricultura */}
      <div className="bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 p-5 rounded-3xl text-left transition-all shadow-lg flex flex-col justify-between">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria da Agricultura')}
          className="w-full text-left group cursor-pointer"
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
        </button>
        <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800">
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
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer py-1 px-1.5 rounded-lg hover:bg-amber-950/40 transition-colors"
            title="Clique para ver veículos fora da Sec. Agricultura"
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{agriEmTransito} Fora (Em trânsito)</span>
          </button>
          <span className="text-emerald-300 font-semibold px-1.5 py-1">
            {agriRegistros.length - agriEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Card Turismo */}
      <div className="bg-slate-900 border-2 border-slate-700 hover:border-slate-500 p-5 rounded-3xl text-left transition-all shadow-lg flex flex-col justify-between">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria do Turismo')}
          className="w-full text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-100">Sec. Turismo</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-200 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              {turRegistros.length}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800">
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
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer py-1 px-1.5 rounded-lg hover:bg-amber-950/40 transition-colors"
            title="Clique para ver veículos fora da Sec. Turismo"
          >
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{turEmTransito} Fora (Em trânsito)</span>
          </button>
          <span className="text-emerald-300 font-semibold px-1.5 py-1">
            {turRegistros.length - turEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Card Geral: Carros Fora / Em Trânsito */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('EM_TRANSITO')}
        className="bg-slate-900 hover:bg-slate-850 border-2 border-amber-500/50 hover:border-amber-400 p-5 rounded-3xl text-left transition-all group cursor-pointer shadow-lg ring-1 ring-amber-500/20"
        title="Clique para ver todos os registros que estão fora"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-slate-100 block">Fora (Em Trânsito)</span>
              <span className="text-[11px] text-amber-400 font-semibold">Clique para listar</span>
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/40">
            {totalEmTransito}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium flex items-center justify-between">
          <span>Veículos fora aguardando retorno</span>
          <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">Ver →</span>
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
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-100">Retornos Concluídos</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-600/40">
            {totalConcluidos}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium flex items-center justify-between">
          <span>Veículos no pátio e conferidos</span>
          <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">Ver →</span>
        </div>
      </button>
    </div>
  );
};
