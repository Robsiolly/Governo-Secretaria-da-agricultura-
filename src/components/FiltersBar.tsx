import React from 'react';
import { Search, Calendar, X, Wheat, Plane, FileText, Share2 } from 'lucide-react';
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
    <div className="bg-[#161618]/70 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden">
      {/* Specular Top Edge Light */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Row 1: Search Field + Date Selector + Secretaria Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Apple Translucent Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => onChangeFiltros({ ...filtros, busca: e.target.value })}
            placeholder="Buscar por motorista, FCT, placa, destino..."
            className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/30 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none transition-all duration-200 shadow-inner"
          />
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, busca: '' })}
              className="absolute right-3.5 top-3 text-white/40 hover:text-white transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Apple Date Picker Capsule */}
        <div className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] px-3.5 py-2 rounded-2xl transition-all duration-200">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <input
            type="date"
            value={filtros.data}
            onChange={(e) => onChangeFiltros({ ...filtros, data: e.target.value })}
            className="bg-transparent text-xs sm:text-sm text-white font-medium focus:outline-none cursor-pointer"
            title="Filtrar por Data"
          />
          {filtros.data && (
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, data: '' })}
              className="text-white/40 hover:text-white text-xs font-medium ml-1 cursor-pointer transition-colors"
              title="Mostrar todos os dias"
            >
              (Todos)
            </button>
          )}
        </div>

        {/* Apple Segmented Pills for Secretaria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => handleSecretariaChange('TODAS')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.96] ${
              filtros.secretaria === 'TODAS'
                ? 'bg-white text-black shadow-md font-bold'
                : 'bg-white/[0.04] text-white/60 hover:text-white border border-white/[0.08]'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria da Agricultura')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-[0.96] ${
              filtros.secretaria === 'Secretaria da Agricultura'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm font-bold'
                : 'bg-white/[0.04] text-white/60 hover:text-amber-400 border border-white/[0.08]'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-amber-400" />
            <span>Agricultura</span>
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria do Turismo')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-[0.96] ${
              filtros.secretaria === 'Secretaria do Turismo'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm font-bold'
                : 'bg-white/[0.04] text-white/60 hover:text-emerald-400 border border-white/[0.08]'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-emerald-400" />
            <span>Turismo</span>
          </button>
        </div>
      </div>

      {/* Row 2: Counter Summary & Secondary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-white/[0.08] text-xs text-white/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Exibindo <strong className="text-white font-mono">{totalFiltrados}</strong> de <strong className="text-white font-mono">{totalGeral}</strong> registros
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparTodosFiltros}
              className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-medium ml-2 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onAbrirEnviarRelatorio && (
            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.96] text-white/90 hover:text-white px-3.5 py-1.5 rounded-xl font-medium border border-white/[0.08] transition-all duration-200 cursor-pointer text-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-white/60" />
              <span>Relatório</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExportarPdfFiltrado}
            className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.96] text-white/90 hover:text-white px-3.5 py-1.5 rounded-xl font-medium border border-white/[0.08] transition-all duration-200 cursor-pointer text-xs"
          >
            <FileText className="w-3.5 h-3.5 text-white/60" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

