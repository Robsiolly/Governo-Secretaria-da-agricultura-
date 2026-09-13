import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Car, 
  Wheat, 
  Plane, 
  FileText, 
  Plus, 
  Search, 
  ArrowRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
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
  const [dataSelecionada, setDataSelecionada] = useState<string>(getLocalDateString());
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sub-pasta Header & Date Selector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-neutral-700 via-white/30 to-neutral-700" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Painel Diário
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Monitoramento Diário de Circulação
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Acompanhamento em tempo real dos veículos em trânsito e retornados na data selecionada.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-2.5 bg-black border border-neutral-800 px-3.5 py-2 rounded-2xl">
              <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-white font-semibold focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro Hoje</span>
            </button>
          </div>
        </div>

        {/* Mini Cards Estatísticos do Dia Selecionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800">
          <div className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">Em Trânsito Hoje</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1 block">{emTransitoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">Retornos Concluídos</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1 block">{finalizadosCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-9500/30 text-amber-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">Sec. Agricultura</span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">{agriculturaCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-400">
              <Wheat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black border border-neutral-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">Sec. Turismo</span>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">{turismoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sky-400">
              <Plane    className="text-emerald-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca Específica da Sub-pasta */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={buscaTermo}
            onChange={(e) => setBuscaTermo(e.target.value)}
            placeholder="Buscar no painel diário..."
            className="w-full bg-black border border-neutral-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-black p-1 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setStatusFiltro('TODOS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFiltro === 'TODOS' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({registros.filter(r => r.data === dataSelecionada).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('EM_TRANSITO')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFiltro === 'EM_TRANSITO' ? 'bg-amber-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Em Trânsito ({emTransitoCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('FINALIZADO')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFiltro === 'FINALIZADO' ? 'bg-amber-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Concluídos ({finalizadosCount})
            </button>
          </div>

          <button
            type="button"
            onClick={onExportarPdf}
            className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-neutral-200 hover:text-white px-3.5 py-2.5 rounded-2xl text-xs font-semibold border border-neutral-800 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-neutral-300" />
            <span>Gerar PDF Diário</span>
          </button>
        </div>
      </div>

      {/* Listagem de Registros do Painel Diário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registrosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <Car className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-neutral-300">Nenhum registro encontrado para esta data</h3>
            <p className="text-xs text-neutral-500 mt-1">Altere a data acima ou cadastre um novo veículo para este dia.</p>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="mt-5 inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-lg"
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
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-neutral-300 bg-black px-3 py-1 rounded-full border border-neutral-800">
                        {reg.fct}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2 group-hover:text-amber-400 transition-colors">
                        {reg.motorista}
                      </h4>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isEmTransito 
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40' 
                        : 'bg-amber-950/60 text-amber-400 border border-amber-9500/40'
                    }`}>
                      {isEmTransito ? 'Em Trânsito' : 'Concluído'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-300 my-4">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-medium">Secretaria:</span>
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        {isAgricultura ? <Wheat className="w-3.5 h-3.5 text-[#D97924]" /> : <Plane    className="text-emerald-400 w-3.5 h-3.5 text-[#D97924]" />}
                        {reg.secretaria}
                      </span>
                    </div>

                    {reg.placa && (
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-medium">Veículo / Placa:</span>
                        <span className="font-mono text-white bg-black px-2.5 py-1 rounded-xl border border-neutral-800">
                          {reg.modeloVeiculo ? `${reg.modeloVeiculo} • ` : ''}{reg.placa}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-medium">Saída:</span>
                      <span className="text-white font-mono">{reg.horarioSaida || 'N/I'}</span>
                      <span className="text-neutral-500 font-medium ml-2">Chegada:</span>
                      <span className="text-white font-mono">{reg.horarioChegada || 'Pendente'}</span>
                    </div>

                    {reg.destino && (
                      <div className="truncate text-neutral-400 pt-1">
                        <strong className="text-neutral-300 font-medium">Destino:</strong> {reg.destino}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="flex-1 bg-black hover:bg-neutral-800 text-neutral-200 hover:text-white py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border border-neutral-800"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    type="button"
                    onClick={() => onAjustarHorarios(reg)}
                    className="flex-1 bg-white hover:bg-neutral-200 text-black py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md"
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
