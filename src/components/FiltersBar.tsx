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
  onAbrirPainelDiario?: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filtros,
  onChangeFiltros,
  totalFiltrados,
  totalGeral,
  onExportarPdfFiltrado,
  onAbrirEnviarRelatorio,
  onAbrirPainelDiario,
}) => {
  const handleSecretariaChange = (secretaria: 'TODAS' | Secretaria) => {
    onChangeFiltros({ ...filtros, secretaria });
  };

  const handleDataChange = (data: string) => {
    onChangeFiltros({ ...filtros, data });
  };

  const aplicarDataHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    onChangeFiltros({ ...filtros, data: hoje });
  };

  const aplicarDataOntem = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];
    onChangeFiltros({ ...filtros, data: ontemStr });
  };

  const limparFiltroData = () => {
    onChangeFiltros({ ...filtros, data: '' });
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
    <div className="bg-slate-900 border-2 border-slate-750 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Linha 1: Filtro de Secretaria (Segmented Pills) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-base font-bold uppercase tracking-wider text-slate-200">
            Filtrar Secretaria:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleSecretariaChange('TODAS')}
            className={`px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center text-center ${
              filtros.secretaria === 'TODAS'
                ? 'bg-slate-700 text-white shadow-md border-2 border-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-slate-800'
            }`}
          >
            Todas as Secretarias
          </button>

          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria da Agricultura')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              filtros.secretaria === 'Secretaria da Agricultura'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/60 border-2 border-emerald-400'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 border-2 border-slate-800'
            }`}
          >
            <Wheat className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Sec. Agricultura</span>
          </button>

          <button
            type="button"
            onClick={() => handleSecretariaChange('Secretaria do Turismo')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              filtros.secretaria === 'Secretaria do Turismo'
                ? 'bg-slate-700 text-white shadow-md border-2 border-slate-500'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="truncate">Sec. Turismo</span>
          </button>
        </div>
      </div>

      {/* Linha 2: Filtro de Data Específica, Busca e Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
        {/* Seletor de Data Específica */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs sm:text-base font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-300 shrink-0" />
              Filtrar por Data:
            </span>
            {filtros.data && (
              <button
                type="button"
                onClick={limparFiltroData}
                className="text-xs text-rose-400 hover:underline cursor-pointer font-bold"
              >
                Limpar data
              </button>
            )}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="date"
              value={filtros.data}
              onChange={(e) => handleDataChange(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-base text-white focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer min-h-[44px]"
            />
            <div className="grid grid-cols-2 gap-1.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={aplicarDataHoje}
                className="px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors min-h-[44px] text-center"
                title="Filtrar por hoje"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={aplicarDataOntem}
                className="px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors min-h-[44px] text-center"
                title="Filtrar por ontem"
              >
                Ontem
              </button>
            </div>
          </div>
        </div>

        {/* Campo de Busca Livre */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            Buscar Registro Geral:
          </label>
          <div className="relative">
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => onChangeFiltros({ ...filtros, busca: e.target.value })}
              placeholder="Motorista, FCT, Placa, Andar..."
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl pl-11 pr-10 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-colors min-h-[48px]"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            {filtros.busca && (
              <button
                type="button"
                onClick={() => onChangeFiltros({ ...filtros, busca: '' })}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status da Frota */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <label className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Situação da Viagem:
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border-2 border-slate-800 min-h-[48px] items-center">
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, status: 'TODOS' })}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl text-center transition-all cursor-pointer ${
                filtros.status === 'TODOS' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, status: 'EM_TRANSITO' })}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl text-center transition-all cursor-pointer ${
                filtros.status === 'EM_TRANSITO' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Em Trânsito
            </button>
            <button
              type="button"
              onClick={() => onChangeFiltros({ ...filtros, status: 'FINALIZADO' })}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl text-center transition-all cursor-pointer ${
                filtros.status === 'FINALIZADO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-emerald-300'
              }`}
            >
              Finalizados
            </button>
          </div>
        </div>
      </div>

      {/* Linha 3: Barra de Resumo e Botão de Exportação de Relatório Filtrado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-sm text-slate-300 border-t border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            Exibindo <strong className="text-white text-base">{totalFiltrados}</strong> de <strong className="text-white text-base">{totalGeral}</strong> registros
          </span>

          {temFiltroAtivo && (
            <button
              type="button"
              onClick={limparTodosFiltros}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:underline cursor-pointer ml-3 font-bold"
            >
              <X className="w-4 h-4" />
              Limpar todos os filtros
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {onAbrirPainelDiario && (
            <button
              type="button"
              onClick={onAbrirPainelDiario}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-emerald-300 px-4 py-3 rounded-2xl text-sm sm:text-base font-bold border-2 border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer min-h-[48px]"
              title="Abrir tela interativa de controle dos cadastros diários"
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Painel Diário de Controle</span>
            </button>
          )}

          {onAbrirEnviarRelatorio && (
            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-750 hover:bg-slate-700 text-white px-4 py-3 rounded-2xl text-sm sm:text-base font-bold border-2 border-slate-600 shadow-md transition-all cursor-pointer min-h-[48px]"
              title="Emitir e enviar relatório para qualquer dia selecionado"
            >
              <Share2 className="w-5 h-5 text-slate-200" />
              <span>
                {filtros.data
                  ? `Enviar Relatório (${new Date(filtros.data + 'T00:00:00').toLocaleDateString('pt-BR')})`
                  : 'Emitir & Enviar Relatório'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onExportarPdfFiltrado}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-4 py-3 rounded-2xl text-sm sm:text-base font-bold border-2 border-slate-700 transition-all cursor-pointer min-h-[48px]"
            title="Exportar documento oficial em PDF"
          >
            <FileText className="w-5 h-5 text-slate-300" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
