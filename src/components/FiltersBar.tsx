import React from 'react';
import { Search, Calendar, Filter, X, Wheat, Plane, FileText, CheckCircle2, Clock, Share2 } from 'lucide-react';
import { FiltrosRegistros, Secretaria } from '../types';

interface FiltersBarProps {
  filtros: FiltrosRegistros;
  onChangeFiltros: (novosFiltros: FiltrosRegistros) => void;
  totalFiltrados: number;
  totalGeral: number;
  onExportarPdfFiltrado: () => void;
  onAbrirEnviarRelatorio?: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filtros,
  onChangeFiltros,
  totalFiltrados,
  totalGeral,
  onExportarPdfFiltrado,
  onAbrirEnviarRelatorio,
}) => {
  const handleSecretariaChange = (secretaria: 'TODAS' | Secretaria) => {
    onChangeFiltros({ ...filtros, secretaria });
  };

  const limparTodosFiltros = () => {
    onChangeFiltros({
      secretaria: 'TODAS',
      data: '',
      busca: '',
      status: 'TODOS',
    });
  };

  const temFiltroAtivo = filtros.secretaria !== 'TODAS' || filtros.data !== '' || filtros.busca !== '' || filtros.status !== 'TODOS';

  return (
    <div className="bg-[#252525] border border-[#6B6B6B]/30 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D97924]/30 to-transparent" />
      {/* Card de Busca Compacto e Filtros Rápidos */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Campo de Busca Compacto */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => onChangeFiltros({ ...filtros, busca: e.target.value })}
            placeholder="Buscar por motorista, FCT, placa, destino..."
            className="w-full bg-black border border-[#6B6B6B]/40 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-[#6B6B6B] focus:outline-none focus:border-[#D97924] transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-[#6B6B6B] absolute left-3.5 top-3" />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, busca: '' })}
              className="absolute right-3.5 top-3 text-[#6B6B6B] hover:text-white cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Seletor de Data */}
        <div className="flex items-center gap-2 bg-black border border-[#6B6B6B]/40 px-3.5 py-2 rounded-2xl">
          <Calendar className="w-4 h-4 text-[#6B6B6B] shrink-0" />
          <input
            type="date"
            value={filtros.data}
            onChange={(e) => onChangeFiltros({ ...filtros, data: e.target.value })}
            className="bg-transparent text-xs sm:text-sm text-white font-semibold focus:outline-none cursor-pointer"
            title="Filtrar por Data"
          />
          {filtros.data && (
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, data: '' })}
              className="text-[#6B6B6B] hover:text-white text-xs font-semibold ml-1 cursor-pointer"
              title="Mostrar todos os dias (histórico completo)"
            >
              (Todos)
            </button>
          )}
        </div>

        {/* Filtro Rápido de Secretaria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => handleSecretariaChange('TODAS')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filtros.secretaria === 'TODAS'
                ? 'bg-white text-black shadow-lg font-bold'
                : 'bg-black text-[#6B6B6B] hover:text-white border border-[#6B6B6B]/30'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria da Agricultura')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filtros.secretaria === 'Secretaria da Agricultura'
                ? 'bg-[#D97924] text-white shadow-lg font-bold'
                : 'bg-black text-[#6B6B6B] hover:text-[#D97924] border border-[#6B6B6B]/30'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-[#D97924]" />
            <span>Agricultura</span>
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria do Turismo')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filtros.secretaria === 'Secretaria do Turismo'
                ? 'bg-[#3A241D] text-[#D97924] border border-[#5A3A2E] shadow-lg font-bold'
                : 'bg-black text-[#6B6B6B] hover:text-white border border-[#6B6B6B]/30'
            }`}
          >
            <Plane    className="text-emerald-400 w-3.5 h-3.5 text-[#F3F3F1]" />
            <span>Turismo</span>
          </button>
        </div>
      </div>

      {/* Linha Inferior: Contagem e Ações Compactas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#6B6B6B]/30 text-xs text-[#6B6B6B]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Exibindo <strong className="text-white font-mono">{totalFiltrados}</strong> de <strong className="text-white font-mono">{totalGeral}</strong> registros
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparTodosFiltros}
              className="text-rose-400 hover:underline cursor-pointer font-semibold ml-2 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onAbrirEnviarRelatorio && (
            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-xl font-semibold border border-neutral-800 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-300" />
              <span>Relatório</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExportarPdfFiltrado}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-neutral-200 hover:text-white px-3.5 py-1.5 rounded-xl font-semibold border border-neutral-800 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-300" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
