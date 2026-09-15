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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
      {/* Widget 1: Sec. Agricultura */}
      <div className="bg-[#121417] border border-[#22252C] hover:border-[#B08D57]/30 p-6 rounded-xl text-left transition-colors duration-150 flex flex-col justify-between relative overflow-hidden">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria da Agricultura')}
          className="w-full text-left cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#B08D57] shrink-0">
                <Wheat className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8E95A1]">Agri.</span>
            </div>
            <span className="text-2xl font-semibold text-white">
              {agriRegistros.length}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between text-xs pt-4 border-t border-[#22252C]">
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
            className="text-[#B08D57] hover:text-[#C6A96B] font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-[#B08D57]/10 transition-colors"
            title="Ver veículos fora da Sec. Agricultura"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{agriEmTransito} Fora</span>
          </button>
          <span className="text-[#8E95A1] font-medium px-2 py-1">
            {agriRegistros.length - agriEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Widget 2: Sec. Turismo */}
      <div className="bg-[#121417] border border-[#22252C] hover:border-[#10B981]/30 p-6 rounded-xl text-left transition-colors duration-150 flex flex-col justify-between relative overflow-hidden">
        <button
          type="button"
          onClick={() => onFiltrarSecretaria('Secretaria do Turismo')}
          className="w-full text-left cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#10B981] shrink-0">
                <Plane className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#8E95A1]">Turismo</span>
            </div>
            <span className="text-2xl font-semibold text-[#10B981]">
              {turRegistros.length}
            </span>
          </div>
        </button>
        <div className="flex items-center justify-between text-xs pt-4 border-t border-[#22252C]">
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
            className="text-[#10B981] hover:text-emerald-400 font-semibold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-[#10B981]/10 transition-colors"
            title="Ver veículos fora da Sec. Turismo"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{turEmTransito} Fora</span>
          </button>
          <span className="text-[#8E95A1] font-medium px-2 py-1">
            {turRegistros.length - turEmTransito} no pátio
          </span>
        </div>
      </div>

      {/* Widget 3: Fora (Em Trânsito) */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('EM_TRANSITO')}
        className="bg-[#121417] border border-[#22252C] hover:border-[#B08D57] p-6 rounded-xl text-left transition-colors duration-150 group cursor-pointer active:scale-[0.99] relative overflow-hidden"
        title="Clique para ver todos os registros em trânsito"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#B08D57] shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-white/90 block">Em Trânsito</span>
              <span className="text-[10px] text-[#8E95A1] font-medium tracking-wide">Fora do pátio</span>
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#B08D57]">
            {totalEmTransito}
          </span>
        </div>
        <div className="text-xs text-[#8E95A1] font-medium flex items-center justify-between pt-4 border-t border-[#22252C]">
          <span>Aguardando retorno</span>
          <span className="text-[#B08D57] font-semibold">Ver →</span>
        </div>
      </button>

      {/* Widget 4: Retornos Concluídos */}
      <button
        type="button"
        onClick={() => onFiltrarStatus('FINALIZADO')}
        className="bg-[#121417] border border-[#22252C] hover:border-[#B08D57] p-6 rounded-xl text-left transition-colors duration-150 group cursor-pointer active:scale-[0.99] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-white/90 block">Concluídos</span>
              <span className="text-[10px] text-[#8E95A1] font-medium tracking-wide">No pátio</span>
            </div>
          </div>
          <span className="text-2xl font-semibold text-white">
            {totalConcluidos}
          </span>
        </div>
        <div className="text-xs text-[#8E95A1] font-medium flex items-center justify-between pt-4 border-t border-[#22252C]">
          <span>Veículos conferidos</span>
          <span className="text-white/80 font-semibold">Ver →</span>
        </div>
      </button>
    </div>
  );
};
