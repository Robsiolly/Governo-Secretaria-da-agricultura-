import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Car, 
  Wheat, 
  Compass, 
  FileText, 
  Plus, 
  Search, 
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface PainelDiarioSubPastaProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onAjustarHorarios: (registro: RegistroVeiculo) => void;
  onNovoRegistro: () => void;
  onExportarPdf: () => void;
  usuarioAtual: UsuarioAutenticado;
}

export const PainelDiarioSubPasta: React.FC<PainelDiarioSubPastaProps> = ({
  registros,
  onVerDetalhes,
  onAjustarHorarios,
  onNovoRegistro,
  onExportarPdf,
  usuarioAtual,
}) => {
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>('TODAS');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [buscaTermo, setBuscaTermo] = useState<string>('');

  // Filtrar registros do dia e critérios
  const registrosFiltrados = useMemo(() => {
    return registros.filter(reg => {
      // Filtro por Data (se selecionada)
      if (dataSelecionada && reg.data !== dataSelecionada) {
        return false;
      }
      // Filtro por Secretaria
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) {
        return false;
      }
      // Filtro por Status
      if (statusFiltro !== 'TODOS' && reg.status !== statusFiltro) {
        return false;
      }
      // Busca Textual
      if (buscaTermo.trim()) {
        const termo = buscaTermo.toLowerCase();
        const coincide = 
          reg.motorista.toLowerCase().includes(termo) ||
          reg.fct.toLowerCase().includes(termo) ||
          (reg.placa && reg.placa.toLowerCase().includes(termo)) ||
          (reg.destino && reg.destino.toLowerCase().includes(termo));
        if (!coincide) return false;
      }
      return true;
    });
  }, [registros, dataSelecionada, secretariaFiltro, statusFiltro, buscaTermo]);

  const emTransitoCount = useMemo(() => {
    return registros.filter(r => r.data === dataSelecionada && r.status === 'EM_TRANSITO').length;
  }, [registros, dataSelecionada]);

  const finalizadosCount = useMemo(() => {
    return registros.filter(r => r.data === dataSelecionada && r.status === 'FINALIZADO').length;
  }, [registros, dataSelecionada]);

  const agriculturaCount = useMemo(() => {
    return registros.filter(r => r.data === dataSelecionada && r.secretaria === 'Secretaria da Agricultura').length;
  }, [registros, dataSelecionada]);

  const turismoCount = useMemo(() => {
    return registros.filter(r => r.data === dataSelecionada && r.secretaria === 'Secretaria do Turismo').length;
  }, [registros, dataSelecionada]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sub-pasta Header & Date Selector */}
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-[#9a7852]" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Painel Diário
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Painel Diário de Circulação e Controle
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Acompanhamento em tempo real dos veículos em trânsito e retornados na data selecionada.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-750 px-3 py-2 rounded-2xl">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-white font-bold focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro Hoje</span>
            </button>
          </div>
        </div>

        {/* Mini Cards Estatísticos do Dia Selecionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-bold uppercase">Em Trânsito Hoje</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5 block">{emTransitoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-bold uppercase">Retornos Concluídos</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5 block">{finalizadosCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-bold uppercase">Sec. Agricultura</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">{agriculturaCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
              <Wheat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-bold uppercase">Sec. Turismo</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">{turismoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200">
              <Compass className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca Específica da Sub-pasta */}
      <div className="bg-slate-900 border border-slate-750 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={buscaTermo}
            onChange={(e) => setBuscaTermo(e.target.value)}
            placeholder="Buscar no painel diário..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setStatusFiltro('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFiltro === 'TODOS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({registros.filter(r => r.data === dataSelecionada).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('EM_TRANSITO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFiltro === 'EM_TRANSITO' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Trânsito ({emTransitoCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('FINALIZADO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFiltro === 'FINALIZADO' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Concluídos ({finalizadosCount})
            </button>
          </div>

          <button
            type="button"
            onClick={onExportarPdf}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-300" />
            <span>Gerar PDF Diário</span>
          </button>
        </div>
      </div>

      {/* Listagem de Registros do Painel Diário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registrosFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">Nenhum registro encontrado para esta data</h3>
            <p className="text-xs text-slate-500 mt-1">Altere a data acima ou cadastre um novo veículo para este dia.</p>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Veículo</span>
            </button>
          </div>
        ) : (
          registrosFiltrados.map((reg) => {
            const isEmTransito = reg.status === 'EM_TRANSITO';
            const isAgricultura = reg.secretaria === 'Secretaria da Agricultura';

            return (
              <div 
                key={reg.id}
                className="bg-slate-900 border-2 border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {reg.fct}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                        {reg.motorista}
                      </h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isEmTransito 
                        ? 'bg-amber-950 text-amber-300 border border-amber-600/50' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    }`}>
                      {isEmTransito ? 'Em Trânsito' : 'Concluído'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 my-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">Secretaria:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        {isAgricultura ? <Wheat className="w-3.5 h-3.5 text-emerald-400" /> : <Compass className="w-3.5 h-3.5 text-slate-300" />}
                        {reg.secretaria}
                      </span>
                    </div>

                    {reg.placa && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-semibold">Veículo / Placa:</span>
                        <span className="font-mono text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {reg.modeloVeiculo ? `${reg.modeloVeiculo} • ` : ''}{reg.placa}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">Saída:</span>
                      <span className="text-white font-mono">{reg.horarioSaida || 'N/I'}</span>
                      <span className="text-slate-500 font-semibold ml-2">Chegada:</span>
                      <span className="text-white font-mono">{reg.horarioChegada || 'Pendente'}</span>
                    </div>

                    {reg.destino && (
                      <div className="truncate text-slate-400">
                        <strong className="text-slate-300">Destino:</strong> {reg.destino}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    type="button"
                    onClick={() => onAjustarHorarios(reg)}
                    className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 py-2 rounded-xl text-xs font-bold border border-emerald-500/40 transition-colors cursor-pointer"
                  >
                    {isEmTransito ? 'Registrar Retorno' : 'Ajustar Horário'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
