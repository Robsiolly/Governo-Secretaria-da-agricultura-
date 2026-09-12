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

      {/* Lista Compacta de Registros Diários (Cartões em Lista com Destaque para Placa e Motorista) */}
      {listaParaExibir.length === 0 ? (
        <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Car className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">Nenhum registro encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não há registros correspondentes aos filtros selecionados.
          </p>
          {onNovoRegistro && (
            <button
              type="button"
              onClick={onNovoRegistro}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg transition-all inline-flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Cadastrar Novo Veículo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
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
                className={`bg-slate-900/95 hover:bg-slate-850 border rounded-xl p-2.5 sm:py-2.5 sm:px-3.5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 border-l-4 ${
                  isEmTransito
                    ? 'border-l-amber-400 border-t-slate-800 border-r-slate-800 border-b-slate-800 bg-amber-950/10'
                    : 'border-l-emerald-500 border-t-slate-800 border-r-slate-800 border-b-slate-800'
                }`}
              >
                {/* Lado Esquerdo: Placa com Super Destaque + Secretaria/FCT + Motorista */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Ícone da Secretaria */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isAgri ? 'bg-emerald-800 border border-emerald-500/40' : 'bg-slate-750 border border-slate-600'
                    }`}
                    title={reg.secretaria}
                  >
                    {isAgri ? <Wheat className="w-4 h-4 text-emerald-200" /> : <Compass className="w-4 h-4 text-slate-200" />}
                  </div>

                  {/* Placa em Destaque Alto Contraste */}
                  <div className="shrink-0 flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-sm sm:text-base text-emerald-300 bg-slate-950 border-2 border-emerald-500/50 px-2.5 py-0.5 rounded-lg tracking-wider shadow-inner">
                        {placaVeic}
                      </span>
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
                          Turismo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[170px]">
                      {modeloVeic}
                    </span>
                  </div>

                  <div className="h-7 w-px bg-slate-800 hidden sm:block shrink-0" />

                  {/* Nome do Motorista em Destaque + Destino */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm sm:text-base text-white truncate max-w-[220px] sm:max-w-[300px]">
                        {motoristaNome}
                      </span>
                      <span className="text-slate-500 hidden sm:inline">•</span>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[180px] sm:max-w-[260px]">
                        {reg.destino || 'Serviço'} {andarLocal && andarLocal !== 'Térreo' && `(${andarLocal})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
                      <span className="text-slate-400 truncate max-w-[160px]">{reg.secretaria}</span>
                      {dataReg && <span>• Data: <strong className="text-slate-300">{dataReg}</strong></span>}
                      <span className="hidden sm:inline">• Resp: <strong className="text-slate-300">{reg.funcionarioResponsavel}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Horários + Status + Ações Compactas */}
                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                  {/* Horários */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-xs shrink-0">
                    <span className="text-slate-400 text-[10px] font-sans uppercase font-bold">Saída:</span>
                    <strong className="text-white">{hSaida}</strong>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-400 text-[10px] font-sans uppercase font-bold">Ret:</span>
                    {hChegada ? (
                      <strong className="text-emerald-400">{hChegada}</strong>
                    ) : (
                      <span className="text-amber-400 font-bold font-sans animate-pulse text-[11px]">Fora</span>
                    )}
                  </div>

                  {/* Badge de Status */}
                  <div className="shrink-0">
                    {isEmTransito ? (
                      <button
                        type="button"
                        onClick={() => setStatusAba('EM_TRANSITO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-950/90 text-amber-300 border border-amber-500/60 hover:bg-amber-900 transition-colors cursor-pointer shadow-sm"
                        title="Filtrar veículos em trânsito"
                      >
                        <Clock className="w-3 h-3 animate-pulse text-amber-400 shrink-0" />
                        <span>Na Rua</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStatusAba('FINALIZADO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
                        title="Filtrar veículos com retorno concluído"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>No Pátio</span>
                      </button>
                    )}
                  </div>

                  {/* Ações Compactas */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEmTransito && (
                      <button
                        type="button"
                        onClick={() => onAjustarHorarios(reg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                        title="Registrar Retorno do Veículo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Retorno</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onVerDetalhes(reg)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                      title="Ver Ficha Completa e Assinatura"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden xs:inline">Ficha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                      className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-lg transition-colors cursor-pointer"
                      title="Baixar Ficha Individual em PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
