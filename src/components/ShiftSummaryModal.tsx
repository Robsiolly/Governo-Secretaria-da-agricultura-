import React, { useMemo } from 'react';
import { X, Clock, CarFront, FileText, CheckCircle2 } from 'lucide-react';
import { RegistroVeiculo, Secretaria } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose, registros }) => {
  const resumo = useMemo(() => {
    const hoje = getLocalDateString();
    const registrosHoje = registros.filter(r => r.data === hoje);
    const emTransito = registrosHoje.filter(r => r.status === 'EM_TRANSITO');
    
    const agriFora = emTransito.filter(r => r.secretaria === 'Secretaria da Agricultura');
    const turFora = emTransito.filter(r => r.secretaria === 'Secretaria do Turismo');

    return {
      totalHoje: registrosHoje.length,
      totalFora: emTransito.length,
      agriFora,
      turFora
    };
  }, [registros]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />

        {/* Header */}
        <div className="bg-black/40 border-b border-[#B08D57]/20 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Resumo do Turno</h2>
              <p className="text-xs text-[#C6A96B]/70">Passagem de bastão da portaria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white bg-black/40 hover:bg-[#B08D57]/20 rounded-xl transition-colors border border-transparent hover:border-[#B08D57]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-[#B08D57]/15 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
              <span className="text-3xl font-black text-white">{resumo.totalHoje}</span>
              <span className="text-xs font-semibold text-[#C6A96B]/70 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#DFBA73]" /> Total Hoje
              </span>
            </div>
            <div className="bg-[#B08D57]/10 border border-[#B08D57]/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1 shadow-inner">
              <span className="text-3xl font-black text-[#DFBA73]">{resumo.totalFora}</span>
              <span className="text-xs font-semibold text-[#DFBA73]/90 uppercase tracking-wider flex items-center gap-1">
                <CarFront className="w-3.5 h-3.5" /> Veículos Fora
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#B08D57]/20 pb-2">
              <span className="w-2 h-2 rounded-full bg-[#DFBA73] animate-pulse"></span>
              Veículos em Trânsito (Falta Retornar)
            </h3>
            
            {resumo.totalFora === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-emerald-500/10 border border-emerald-400/30 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-emerald-300 font-bold">Tudo certo!</p>
                <p className="text-emerald-400/80 text-sm mt-1">Nenhum veículo em trânsito neste momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumo.agriFora.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#DFBA73] uppercase tracking-wider pl-1">Agricultura</h4>
                    <div className="space-y-2">
                      {resumo.agriFora.map(reg => (
                        <div key={reg.id} className="bg-black/40 border border-[#B08D57]/20 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{reg.fct}</p>
                            <p className="text-xs text-neutral-400 truncate">{reg.motorista} • {reg.destino}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-[#C6A96B]/60">Saída</p>
                            <p className="text-sm font-bold font-mono text-[#DFBA73]">{reg.horarioSaida}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumo.turFora.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider pl-1">Turismo</h4>
                    <div className="space-y-2">
                      {resumo.turFora.map(reg => (
                        <div key={reg.id} className="bg-black/40 border border-white/10 p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm truncate">{reg.fct || 'Turismo'}</p>
                            <p className="text-xs text-neutral-400 truncate">{reg.motorista} • {reg.destino}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-neutral-500">Saída</p>
                            <p className="text-sm font-bold font-mono text-white">{reg.horarioSaida}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-[#B08D57]/20 p-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-black/50 hover:bg-[#B08D57]/20 border border-[#B08D57]/30 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
