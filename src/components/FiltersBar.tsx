import React from 'react';
import { Search, Calendar, X, Wheat, Plane, FileText, Share2 } from 'lucide-react';
import { FiltrosRegistros, Secretaria } from '../types';

interface FiltersBarProps {
  filtros: FiltrosRegistros;
  onChangeFiltros: (filtros: FiltrosRegistros) => void;
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
    <div className="bg-[#121417] border border-[#22252C] rounded-xl p-5 space-y-4 relative overflow-hidden glass-surface">
      {/* Row 1: Search Field + Date Selector + Secretaria Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => onChangeFiltros({ ...filtros, busca: e.target.value })}
            placeholder="Buscar por motorista, FCT, placa, destino..."
            className="w-full bg-[#090A0C] border border-[#22252C] focus:border-[#B08D57] rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-350 focus:ring-1 focus:ring-[#B08D57]/30"
          />
          <Search className="w-4 h-4 text-[#8E95A1] absolute left-3.5 top-3" />
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
        <div className="flex items-center gap-2 bg-[#090A0C] border border-[#22252C] px-3.5 py-2.5 rounded-lg transition-all focus-within:border-[#B08D57]/50 focus-within:ring-1 focus-within:ring-[#B08D57]/25">
          <Calendar className="w-4 h-4 text-[#8E95A1] shrink-0" />
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
              className="text-[#B08D57] hover:text-[#C6A96B] text-xs font-semibold ml-1 cursor-pointer transition-colors"
              title="Mostrar todos os dias"
            >
              (Todos)
            </button>
          )}
        </div>

        {/* Secretaria Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleSecretariaChange('TODAS')}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap chip-filter-premium apple-tactile-feedback ${
              filtros.secretaria === 'TODAS'
                ? 'bg-[#B08D57] text-black font-semibold'
                : 'bg-[#090A0C] text-[#8E95A1] hover:text-white border border-[#22252C]'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria da Agricultura')}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 chip-filter-premium apple-tactile-feedback ${
              filtros.secretaria === 'Secretaria da Agricultura'
                ? 'bg-[#B08D57]/20 text-[#B08D57] border border-[#B08D57]/40 font-semibold'
                : 'bg-[#090A0C] text-[#8E95A1] hover:text-white border border-[#22252C]'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Agricultura</span>
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria do Turismo')}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 chip-filter-premium apple-tactile-feedback ${
              filtros.secretaria === 'Secretaria do Turismo'
                ? 'bg-[#10B981]/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                : 'bg-[#090A0C] text-[#8E95A1] hover:text-white border border-[#22252C]'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-emerald-500" />
            <span>Turismo</span>
          </button>
        </div>
      </div>

      {/* Row 2: Counter Summary & Secondary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#22252C] text-xs text-[#8E95A1]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Exibindo <strong className="text-[#B08D57] font-mono font-semibold">{totalFiltrados}</strong> de <strong className="text-white font-mono font-semibold">{totalGeral}</strong> registros
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparTodosFiltros}
              className="text-rose-400 hover:text-rose-300 transition-all cursor-pointer font-semibold ml-2 flex items-center gap-1 btn-premium-secondary apple-tactile-feedback px-2.5 py-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onAbrirEnviarRelatorio && (
            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex items-center gap-1.5 bg-[#090A0C] text-[#8E95A1] hover:text-white px-3.5 py-2 rounded-lg font-medium border border-[#22252C] transition-all cursor-pointer text-xs btn-premium-secondary apple-tactile-feedback"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Relatório</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportarPdfFiltrado}
            className="flex items-center gap-1.5 bg-[#090A0C] text-[#8E95A1] hover:text-white px-3.5 py-2 rounded-lg font-medium border border-[#22252C] transition-all cursor-pointer text-xs btn-premium-secondary apple-tactile-feedback"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
