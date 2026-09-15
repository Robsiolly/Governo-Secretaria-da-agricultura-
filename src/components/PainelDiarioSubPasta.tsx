import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Wheat, 
  Plane, 
  Search, 
  FileText, 
  Plus, 
  Car,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { RegistroVeiculo, UsuarioAutenticado, Secretaria } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface PainelDiarioSubPastaProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onAjustarHorarios: (registro: RegistroVeiculo) => void;
  onNovoRegistro: () => void;
  onExportarPdf: () => void;
  onExcluir?: (id: string) => void;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const PainelDiarioSubPasta: React.FC<PainelDiarioSubPastaProps> = ({
  registros,
  onVerDetalhes,
  onAjustarHorarios,
  onNovoRegistro,
  onExportarPdf,
  onExcluir,
}) => {
  // Data atual local como padrão
  const hoje = getLocalDateString();
  const [dataSelecionada, setDataSelecionada] = useState<string>(hoje);
  const [secretariaFiltro] = useState<'TODAS' | Secretaria>('TODAS');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [buscaTermo, setBuscaTermo] = useState<string>('');
  const [registroParaExcluir, setRegistroParaExcluir] = useState<RegistroVeiculo | null>(null);

  // Filtragem dos registros pela data do painel diário e status
  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      // Filtro de Data estrito
      if (dataSelecionada && reg.data !== dataSelecionada) {
        return false;
      }

      // Filtro de Secretaria
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) {
        return false;
      }

      // Filtro de Status
      if (statusFiltro !== 'TODOS' && reg.status !== statusFiltro) {
        return false;
      }

      // Filtro de Busca
      if (buscaTermo.trim()) {
        const termo = buscaTermo.toLowerCase().trim();
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
      {/* Sub-pasta Header & Date Selector - Ouro Velho Premium */}
      <div className="bg-[#111317]/85 border border-[#B08D57]/25 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-2xl glass-surface">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/35 to-transparent" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#B08D57]/15 text-[#DFBA73] border border-[#B08D57]/35 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                Painel Diário
              </span>
              <span className="text-xs text-[#C6A96B]/70 font-mono">
                {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Monitoramento Diário de Circulação
            </h2>
            <p className="text-xs sm:text-sm text-[#C6A96B]/70 mt-1">
              Acompanhamento em tempo real dos veículos em trânsito e retornados na data selecionada.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <div className="flex items-center gap-2.5 bg-black/50 border border-[#B08D57]/25 px-3.5 py-2 rounded-2xl focus-within:border-[#B08D57]/60">
              <Calendar className="w-4 h-4 text-[#DFBA73] shrink-0" />
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
              className="flex items-center gap-2 btn-premium-primary px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-[#B08D57]/20 cursor-pointer border border-[#DFBA73]/40 apple-tactile-feedback"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro Hoje</span>
            </button>
          </div>
        </div>

        {/* Mini Cards Estatísticos do Dia Selecionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#B08D57]/15">
          <div className="bg-black/50 border border-[#B08D57]/20 rounded-2xl p-4 flex items-center justify-between shadow-inner card-premium-tilt glass-card">
            <div>
              <span className="text-[11px] text-[#C6A96B]/70 block font-semibold uppercase tracking-wider">Em Trânsito</span>
              <span className="text-xl sm:text-2xl font-bold text-[#DFBA73] font-mono mt-1 block">{emTransitoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/40 text-[#DFBA73]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/50 border border-[#B08D57]/20 rounded-2xl p-4 flex items-center justify-between shadow-inner card-premium-tilt glass-card">
            <div>
              <span className="text-[11px] text-[#C6A96B]/70 block font-semibold uppercase tracking-wider">Retornos</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1 block">{finalizadosCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/50 border border-[#B08D57]/20 rounded-2xl p-4 flex items-center justify-between shadow-inner card-premium-tilt glass-card">
            <div>
              <span className="text-[11px] text-[#C6A96B]/70 block font-semibold uppercase tracking-wider">Agricultura</span>
              <span className="text-xl sm:text-2xl font-bold text-[#DFBA73] font-mono mt-1 block">{agriculturaCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/40 text-[#DFBA73]">
              <Wheat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-black/50 border border-[#B08D57]/20 rounded-2xl p-4 flex items-center justify-between shadow-inner card-premium-tilt glass-card">
            <div>
              <span className="text-[11px] text-[#C6A96B]/70 block font-semibold uppercase tracking-wider">Turismo</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1 block">{turismoCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400">
              <Plane className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca Específica da Sub-pasta */}
      <div className="bg-[#111317]/80 border border-[#B08D57]/20 rounded-3xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 glass-surface">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={buscaTermo}
            onChange={(e) => setBuscaTermo(e.target.value)}
            placeholder="Buscar no painel diário..."
            className="w-full bg-black/50 border border-[#B08D57]/25 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C6A96B]/60 transition-all shadow-inner focus:ring-1 focus:ring-[#B08D57]/25"
          />
          <Search className="w-4 h-4 text-[#C6A96B]/60 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-[#B08D57]/20">
            <button
              type="button"
              onClick={() => setStatusFiltro('TODOS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer chip-filter-premium apple-tactile-feedback ${
                statusFiltro === 'TODOS' ? 'bg-[#B08D57] text-slate-950 font-bold shadow-sm btn-premium-primary' : 'text-[#C6A96B]/70 hover:text-white btn-premium-secondary'
              }`}
            >
              Todos ({registros.filter(r => r.data === dataSelecionada).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('EM_TRANSITO')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer chip-filter-premium apple-tactile-feedback ${
                statusFiltro === 'EM_TRANSITO' ? 'bg-[#B08D57] text-slate-950 font-bold shadow-sm btn-premium-primary' : 'text-[#C6A96B]/70 hover:text-white btn-premium-secondary'
              }`}
            >
              Em Trânsito ({emTransitoCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('FINALIZADO')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer chip-filter-premium apple-tactile-feedback ${
                statusFiltro === 'FINALIZADO' ? 'bg-[#10B981] text-slate-950 font-bold shadow-sm' : 'text-[#C6A96B]/70 hover:text-white btn-premium-secondary'
              }`}
            >
              Concluídos ({finalizadosCount})
            </button>
          </div>

          <button
            type="button"
            onClick={onExportarPdf}
            className="flex items-center gap-1.5 bg-black/50 text-[#DFBA73] hover:text-white px-3.5 py-2.5 rounded-2xl text-xs font-semibold border border-[#B08D57]/25 transition-all cursor-pointer btn-premium-secondary apple-tactile-feedback"
          >
            <FileText className="w-4 h-4 text-[#C6A96B]/80" />
            <span>Gerar PDF Diário</span>
          </button>
        </div>
      </div>

      {/* Listagem de Registros do Painel Diário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 cascade-container">
        {registrosFiltrados.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-[#111317]/60 border border-[#B08D57]/20 rounded-3xl p-6 shadow-xl">
            <Car className="w-12 h-12 text-[#C6A96B]/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">Nenhum registro encontrado para esta data</h3>
            <p className="text-xs text-[#C6A96B]/60 mt-1">Altere a data acima ou cadastre um novo veículo para este dia.</p>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-lg"
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
                className="bg-[#111317]/80 border border-[#B08D57]/20 hover:border-[#B08D57]/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all group backdrop-blur-xl card-premium-tilt glass-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#DFBA73] bg-black/60 px-3 py-1 rounded-full border border-[#B08D57]/30">
                        {reg.fct}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2 group-hover:text-[#DFBA73] transition-colors">
                        {reg.motorista}
                      </h4>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isEmTransito 
                        ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40' 
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                    }`}>
                      {isEmTransito ? 'Em Trânsito' : 'Concluído'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-white/80 my-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#C6A96B]/60 font-medium">Secretaria:</span>
                      <span className="text-white font-semibold flex items-center gap-1.5">
                        {isAgricultura ? <Wheat className="w-3.5 h-3.5 text-[#DFBA73]" /> : <Plane className="text-emerald-400 w-3.5 h-3.5" />}
                        {reg.secretaria}
                      </span>
                    </div>

                    {reg.placa && (
                      <div className="flex items-center gap-2">
                        <span className="text-[#C6A96B]/60 font-medium">Veículo / Placa:</span>
                        <span className="font-mono text-white bg-black/60 px-2.5 py-1 rounded-xl border border-[#B08D57]/20">
                          {reg.modeloVeiculo ? `${reg.modeloVeiculo} • ` : ''}{reg.placa}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[#C6A96B]/60 font-medium">Saída:</span>
                      <span className="text-white font-mono">{reg.horarioSaida || 'N/I'}</span>
                      <span className="text-[#C6A96B]/60 font-medium ml-2">Chegada:</span>
                      <span className="text-white font-mono">{reg.horarioChegada || 'Pendente'}</span>
                    </div>

                    {reg.destino && (
                      <div className="truncate text-white/70 pt-1">
                        <strong className="text-[#DFBA73] font-medium">Destino:</strong> {reg.destino}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-[#B08D57]/15">
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="flex-1 text-[#DFBA73] hover:text-white py-2.5 rounded-2xl text-xs font-semibold cursor-pointer border border-[#B08D57]/25 btn-premium-secondary apple-tactile-feedback"
                  >
                    Ver Detalhes
                  </button>

                  <button
                    type="button"
                    onClick={() => onAjustarHorarios(reg)}
                    className="flex-1 btn-premium-primary py-2.5 rounded-2xl text-xs font-bold cursor-pointer apple-tactile-feedback"
                  >
                    {isEmTransito ? 'Registrar Retorno' : 'Ajustar Horário'}
                  </button>

                  {onExcluir && (
                    <button
                      type="button"
                      onClick={() => setRegistroParaExcluir(reg)}
                      className="p-2.5 text-white/40 hover:text-rose-400 border border-transparent rounded-2xl cursor-pointer btn-premium-secondary apple-tactile-feedback"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {registroParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#111317] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Registro?</h3>
                <p className="text-xs text-slate-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o registro do motorista <strong className="text-white">{registroParaExcluir.motorista}</strong>
              {registroParaExcluir.placa ? ` (Veículo: ${registroParaExcluir.placa})` : ''}?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRegistroParaExcluir(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onExcluir && registroParaExcluir) {
                    onExcluir(registroParaExcluir.id);
                  }
                  setRegistroParaExcluir(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition-all cursor-pointer active:scale-95"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
