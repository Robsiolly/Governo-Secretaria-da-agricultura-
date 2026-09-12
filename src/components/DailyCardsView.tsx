import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Wheat,
  Compass,
  Clock,
  CheckCircle2,
  Car,
  Eye,
  Check,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileText,
  Maximize2
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface DailyCardsViewProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onAjustarHorarios: (registro: RegistroVeiculo) => void;
  onNovoRegistro?: () => void;
  onAbrirModalCompleto?: () => void;
  usuarioAtual?: UsuarioAutenticado | null;
  filtroSecretariaInicial?: 'TODAS' | Secretaria;
  filtroStatusInicial?: 'TODOS' | 'EM_TRANSITO' | 'FINALIZADO';
}

// Helper para normalizar datas YYYY-MM-DD, DD/MM/YYYY ou ISO
const normalizarData = (dataStr: string | undefined): string => {
  if (!dataStr) return '';
  const d = dataStr.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.slice(0, 10);
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(d)) {
    const [dia, mes, ano] = d.slice(0, 10).split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return d;
};

export const DailyCardsView: React.FC<DailyCardsViewProps> = ({
  registros,
  onVerDetalhes,
  onAjustarHorarios,
  onNovoRegistro,
  onAbrirModalCompleto,
  usuarioAtual,
  filtroSecretariaInicial = 'TODAS',
  filtroStatusInicial = 'TODOS',
}) => {
  // Data de hoje em horário local do Brasil (YYYY-MM-DD)
  const dataHojeStr = useMemo(() => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }, []);

  const [dataSelecionada, setDataSelecionada] = useState<string>('');
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>(filtroSecretariaInicial);
  const [statusAba, setStatusAba] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>(filtroStatusInicial);
  const [busca, setBusca] = useState('');

  // Atualizar quando props mudarem
  React.useEffect(() => {
    if (filtroSecretariaInicial) setSecretariaFiltro(filtroSecretariaInicial);
  }, [filtroSecretariaInicial]);

  React.useEffect(() => {
    if (filtroStatusInicial) setStatusAba(filtroStatusInicial);
  }, [filtroStatusInicial]);

  // Navegação de dias
  const alterarDia = (dias: number) => {
    const baseDate = dataSelecionada ? new Date(dataSelecionada + 'T12:00:00') : new Date();
    baseDate.setDate(baseDate.getDate() + dias);
    const ano = baseDate.getFullYear();
    const mes = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dia = String(baseDate.getDate()).padStart(2, '0');
    setDataSelecionada(`${ano}-${mes}-${dia}`);
  };

  const aplicarHoje = () => setDataSelecionada(dataHojeStr);
  const aplicarOntem = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    setDataSelecionada(`${ano}-${mes}-${dia}`);
  };
  const aplicarTodasDatas = () => setDataSelecionada('');

  // Filtragem dos registros da data selecionada
  const registrosDaData = useMemo(() => {
    if (!dataSelecionada) return registros;
    return registros.filter((reg) => {
      const regData = normalizarData(reg.data || (reg as any).dataSaida || reg.criadoEm);
      return regData === dataSelecionada;
    });
  }, [registros, dataSelecionada]);

  // Filtragem adicional por Secretaria e Busca
  const registrosFiltrados = useMemo(() => {
    return registrosDaData.filter((reg) => {
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) {
        return false;
      }
      if (statusAba !== 'TODOS' && reg.status !== statusAba) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const motoristaNome = reg.motorista || (reg as any).nomeMotorista || '';
        const placaCod = reg.placa || (reg as any).placaVeiculo || '';
        const textoBusca = `${reg.fct || ''} ${motoristaNome} ${reg.modeloVeiculo || ''} ${placaCod} ${reg.destino || ''} ${reg.funcionarioResponsavel || ''}`.toLowerCase();
        return textoBusca.includes(termo);
      }
      return true;
    });
  }, [registrosDaData, secretariaFiltro, statusAba, busca]);

  // Fallback inteligente: apenas se um filtro de data específico estiver ativo e não houver registros naquela data,
  // mas NUNCA quando o usuário ativamente filtrou por status (como EM_TRANSITO) ou busca
  const exibindoFallback =
    dataSelecionada !== '' &&
    statusAba === 'TODOS' &&
    secretariaFiltro === 'TODAS' &&
    !busca.trim() &&
    registrosDaData.length === 0 &&
    registros.length > 0;

  const listaParaExibir = exibindoFallback ? registros : registrosFiltrados;

  // Estatísticas calculadas
  const registrosEmTransito = useMemo(() => {
    return registrosDaData.filter((reg) => {
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) return false;
      return reg.status === 'EM_TRANSITO';
    });
  }, [registrosDaData, secretariaFiltro]);

  const registrosChegaram = useMemo(() => {
    return registrosDaData.filter((reg) => {
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) return false;
      return reg.status === 'FINALIZADO';
    });
  }, [registrosDaData, secretariaFiltro]);

  const totalAgricultura = useMemo(() => {
    return registrosDaData.filter(r => r.secretaria === 'Secretaria da Agricultura').length;
  }, [registrosDaData]);

  const totalTurismo = useMemo(() => {
    return registrosDaData.filter(r => r.secretaria === 'Secretaria do Turismo').length;
  }, [registrosDaData]);

  const dataFormatadaAmigavel = useMemo(() => {
    if (!dataSelecionada) return 'Todas as Datas';
    const parts = dataSelecionada.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataSelecionada;
  }, [dataSelecionada]);

  return (
    <div className="space-y-4">
      {/* Barra Superior de Controles e Filtros do Painel */}
      <div className="bg-slate-900 border-2 border-slate-750 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Linha 1: Seletor de Data e Busca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Data:</span>
            </span>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-750 rounded-xl p-1">
              <button
                type="button"
                onClick={() => alterarDia(-1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="bg-transparent text-white text-xs font-bold px-2 py-1 outline-none cursor-pointer"
              />

              <button
                type="button"
                onClick={() => alterarDia(1)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={aplicarHoje}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dataSelecionada === dataHojeStr
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={aplicarOntem}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
            >
              Ontem
            </button>

            <button
              type="button"
              onClick={aplicarTodasDatas}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !dataSelecionada
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
              }`}
            >
              Todas as Datas ({registros.length})
            </button>
          </div>

          {/* Busca e Botão Janela Cheia */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar FCT, motorista, placa..."
                className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {onAbrirModalCompleto && (
              <button
                type="button"
                onClick={onAbrirModalCompleto}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Expandir em Janela Modal Completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Linha 2: Badges Clicáveis de Resumo e Filtro */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              statusAba === 'TODOS'
                ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            Total do Período: <strong className="text-white font-mono ml-1">{registrosDaData.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAba === 'EM_TRANSITO' ? 'TODOS' : 'EM_TRANSITO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              statusAba === 'EM_TRANSITO'
                ? 'bg-amber-950 border-amber-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-amber-300 hover:bg-slate-850'
            }`}
            title="Clique para filtrar apenas veículos que estão fora"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Fora (Em Trânsito):</span>
            <strong className="font-mono text-amber-400">{registrosEmTransito.length}</strong>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba(statusAba === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              statusAba === 'FINALIZADO'
                ? 'bg-emerald-950 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-emerald-300 hover:bg-slate-850'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chegaram (Pátio):</span>
            <strong className="font-mono text-emerald-400">{registrosChegaram.length}</strong>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Filtros rápidos por secretaria */}
          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaFiltro === 'Secretaria da Agricultura' ? 'TODAS' : 'Secretaria da Agricultura')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              secretariaFiltro === 'Secretaria da Agricultura'
                ? 'bg-emerald-900 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-emerald-300 hover:bg-slate-850'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agricultura ({totalAgricultura})</span>
          </button>

          <button
            type="button"
            onClick={() => setSecretariaFiltro(secretariaFiltro === 'Secretaria do Turismo' ? 'TODAS' : 'Secretaria do Turismo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              secretariaFiltro === 'Secretaria do Turismo'
                ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-300" />
            <span>Turismo ({totalTurismo})</span>
          </button>
        </div>
      </div>

      {/* Aviso de fallback inteligente caso o filtro específico de data não tenha registros */}
      {exibindoFallback && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-200 text-xs sm:text-sm shadow-lg">
          <div>
            <strong className="text-white block text-sm">Sem registros com data {dataFormatadaAmigavel}.</strong>
            <span>Exibindo todos os <strong>{registros.length}</strong> cadastros do sistema para que você tenha acesso imediato:</span>
          </div>
          <button
            type="button"
            onClick={aplicarTodasDatas}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow transition-colors text-xs"
          >
            Limpar Filtro de Data
          </button>
        </div>
      )}

      {/* Grade de Cartões Pequenos de Cada Registro */}
      {listaParaExibir.length === 0 ? (
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Nenhum registro encontrado no aplicativo</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Ainda não há registros cadastrados para exibição no painel diário.
          </p>
          {onNovoRegistro && (
            <button
              type="button"
              onClick={onNovoRegistro}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>Cadastrar Primeiro Veículo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {listaParaExibir.map((reg) => {
            const isAgri = reg.secretaria === 'Secretaria da Agricultura';
            const isEmTransito = reg.status === 'EM_TRANSITO';
            const motoristaNome = reg.motorista || (reg as any).nomeMotorista || 'Não informado';
            const placaVeic = reg.placa || (reg as any).placaVeiculo || 'Sem placa';
            const modeloVeic = reg.modeloVeiculo || 'Veículo';
            const hSaida = reg.horarioSaida || (reg as any).horaSaida || '--:--';
            const hChegada = reg.horarioChegada || (reg as any).horaChegada || '';
            const andarLocal = reg.andar || (reg as any).andarAtendimento || 'Térreo';
            const dataReg = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';

            return (
              <div
                key={reg.id}
                className={`bg-slate-900 border-2 rounded-2xl p-3.5 shadow-lg space-y-2.5 transition-all hover:border-slate-600 ${
                  isEmTransito ? 'border-amber-500/50' : 'border-emerald-500/40'
                }`}
              >
                {/* Topo do Card */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        isAgri ? 'bg-emerald-800' : 'bg-slate-700'
                      }`}
                    >
                      {isAgri ? <Wheat className="w-4 h-4" /> : <Compass className="w-4 h-4 text-slate-200" />}
                    </div>

                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-black text-white text-xs sm:text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-750">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-300 bg-slate-950 border border-slate-750 px-1.5 py-0.5 rounded">
                          Turismo (Sem FCT)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge de Status */}
                  <div className="shrink-0">
                    {isEmTransito ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusAba('EM_TRANSITO');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900/90 transition-colors cursor-pointer"
                        title="Filtrar apenas veículos que estão fora"
                      >
                        <Clock className="w-3 h-3 animate-pulse text-amber-400" />
                        Fora (Em Trânsito)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusAba('FINALIZADO');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/90 transition-colors cursor-pointer"
                        title="Filtrar veículos com retornos concluídos"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Chegou
                      </button>
                    )}
                  </div>
                </div>

                {/* Bloco de Informações Principais */}
                <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Motorista:</span>
                      <strong className="text-white font-bold block truncate">{motoristaNome}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Veículo / Placa:</span>
                      <span className="text-slate-200 font-semibold block truncate">
                        {modeloVeic} <strong className="font-mono font-bold text-emerald-300">{placaVeic}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Horários:</span>
                      <div className="flex items-center gap-1 text-white font-mono font-bold text-xs">
                        <span>{hSaida}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        {hChegada ? (
                          <span className="text-emerald-400">{hChegada}</span>
                        ) : (
                          <span className="text-amber-300 font-sans text-[11px] italic">Na rua...</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino / Andar:</span>
                      <span className="text-slate-300 font-medium block truncate">
                        {reg.destino || 'Serviço'} • <strong className="text-slate-200">{andarLocal}</strong>
                      </span>
                    </div>
                  </div>

                  {dataReg && (
                    <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Data: <strong className="text-slate-300">{dataReg}</strong></span>
                      <span>Resp: <strong className="text-slate-300">{reg.funcionarioResponsavel}</strong></span>
                    </div>
                  )}
                </div>

                {/* Rodapé com Botões de Ação */}
                <div className="flex items-center justify-end gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-emerald-400" />
                    <span>Ficha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 rounded-lg font-bold transition-colors cursor-pointer"
                    title="Baixar PDF Individual"
                  >
                    <FileDown className="w-3 h-3" />
                    <span>PDF</span>
                  </button>

                  {isEmTransito && (
                    <button
                      type="button"
                      onClick={() => onAjustarHorarios(reg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow transition-all cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Retorno</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
