import React from 'react';
import { Search, Calendar, Filter, X, Wheat, Compass, FileText, CheckCircle2, Clock, Share2 } from 'lucide-react';
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
    <div className="bg-slate-900 border border-slate-750 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
      {/* Card de Busca Compacto e Filtros Rápidos */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Campo de Busca Compacto */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => onChangeFiltros({ ...filtros, busca: e.target.value })}
            placeholder="🔍 Buscar registro (motorista, FCT, placa, destino...)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, busca: '' })}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro Rápido de Secretaria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => handleSecretariaChange('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filtros.secretaria === 'TODAS'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Todas Sec.
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria da Agricultura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filtros.secretaria === 'Secretaria da Agricultura'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agricultura</span>
          </button>
          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria do Turismo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filtros.secretaria === 'Secretaria do Turismo'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-300" />
            <span>Turismo</span>
          </button>
        </div>
      </div>

      {/* Linha Inferior: Contagem e Ações Compactas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Exibindo <strong className="text-white">{totalFiltrados}</strong> de <strong className="text-white">{totalGeral}</strong> registros
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparTodosFiltros}
              className="text-rose-400 hover:underline cursor-pointer font-bold ml-2 flex items-center gap-1"
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
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-white px-3 py-1.5 rounded-xl font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-200" />
              <span>Relatório</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExportarPdfFiltrado}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-300" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
