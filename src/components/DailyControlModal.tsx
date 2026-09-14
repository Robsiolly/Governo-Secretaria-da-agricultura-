import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Wheat,
  Plane,
  Clock,
  CheckCircle2,
  Car,
  User,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileDown,
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Eye,
  Check,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { RegistroVeiculo, Secretaria } from '../types';
import { getDateStringFromDate } from '../utils/dateUtils';
import { PdfService } from '../services/pdfService';

interface DailyControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
  onSelecionarRegistro: (reg: RegistroVeiculo) => void;
  onAjustarHorarios: (reg: RegistroVeiculo) => void;
  onAbrirEnviarRelatorio: () => void;
  onAbrirCadastro?: () => void;
  onExcluir?: (id: string) => void;
  filtroSecretariaInicial?: 'TODAS' | Secretaria;
  filtroStatusInicial?: 'TODOS' | 'EM_TRANSITO' | 'FINALIZADO';
}

// Helper para normalizar qualquer formato de data (YYYY-MM-DD, DD/MM/YYYY ou ISO) para YYYY-MM-DD
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

export const DailyControlModal: React.FC<DailyControlModalProps> = ({
  isOpen,
  onClose,
  registros,
  onSelecionarRegistro,
  onAjustarHorarios,
  onAbrirEnviarRelatorio,
  onAbrirCadastro,
  onExcluir,
  filtroSecretariaInicial = 'TODAS',
  filtroStatusInicial = 'TODOS',
}) => {
  const [registroParaExcluir, setRegistroParaExcluir] = useState<RegistroVeiculo | null>(null);

  // Data de hoje em horário local (Brasil YYYY-MM-DD)
  const dataHojeStr = useMemo(() => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }, []);

  const [dataSelecionada, setDataSelecionada] = useState<string>('');
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>('TODAS');
  const [statusAba, setStatusAba] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [busca, setBusca] = useState('');

  // Fechar ao pressionar ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Atualiza os filtros iniciais ao abrir o modal
  React.useEffect(() => {
    if (isOpen) {
      setSecretariaFiltro(filtroSecretariaInicial);
      setStatusAba(filtroStatusInicial);

      // Se houver registros para hoje, seleciona hoje; se não, mostra todas as datas para garantir acesso imediato aos cadastros
      const temRegistrosHoje = registros.some((r) => {
        const d = normalizarData(r.data || (r as any).dataSaida || r.criadoEm);
        return d === dataHojeStr;
      });

      if (temRegistrosHoje) {
        setDataSelecionada(dataHojeStr);
      } else {
        setDataSelecionada(''); // Todas as datas
      }
    }
  }, [isOpen, filtroSecretariaInicial, filtroStatusInicial, registros, dataHojeStr]);

  // Navegação de dias
  const alterarDia = (dias: number) => {
    const baseDate = dataSelecionada ? new Date(dataSelecionada + 'T12:00:00') : new Date();
    baseDate.setDate(baseDate.getDate() + dias);
    setDataSelecionada(getDateStringFromDate(baseDate));
  };

  const aplicarHoje = () => setDataSelecionada(dataHojeStr);
  const aplicarOntem = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDataSelecionada(getDateStringFromDate(d));
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
      // Filtro Secretaria
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) {
        return false;
      }
      // Filtro Status Aba
      if (statusAba !== 'TODOS' && reg.status !== statusAba) {
        return false;
      }
      // Filtro de Busca
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

  // Fallback inteligente: apenas se a data específica selecionada não tiver registros e nenhum filtro de status/busca estiver ativo
  const exibindoFallback =
    dataSelecionada !== '' &&
    statusAba === 'TODOS' &&
    secretariaFiltro === 'TODAS' &&
    !busca.trim() &&
    registrosDaData.length === 0 &&
    registros.length > 0;

  const listaParaExibir = exibindoFallback ? registros : registrosFiltrados;

  // Registros divididos por status para o painel
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

  // Formatação amigável da data exibida
  const dataFormatadaAmigavel = useMemo(() => {
    if (!dataSelecionada) return 'Todas as Datas';
    const parts = dataSelecionada.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dataSelecionada;
  }, [dataSelecionada]);

  // Não renderiza a UI se o modal estiver fechado (após a declaração incondicional de todos os hooks)
  if (!isOpen) return null;

  const handleExportarPdfDia = () => {
    PdfService.gerarRelatorioDiario({
      registros,
      secretariaFiltro,
      dataFiltro: dataSelecionada,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />
        
        {/* Header do Modal */}
        <div className="bg-black/40 border-b border-[#B08D57]/20 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shadow-lg shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Painel de Controle de Cadastros Diários
                </h2>
                <span className="bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40 px-3 py-0.5 rounded-full text-xs font-bold">
                  {dataFormatadaAmigavel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C6A96B]/70 font-medium mt-0.5">
                Relação de veículos em trânsito e retornos concluídos sem necessidade de PDF
              </p>
            </div>
          </div>

          {/* Ações Rápidas no Topo */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {onAbrirCadastro && (
              <button
                type="button"
                onClick={onAbrirCadastro}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer min-h-[40px] border border-[#DFBA73]/30"
                title="Cadastrar novo veículo"
              >
                <Car className="w-4 h-4" />
                <span>+ Novo Cadastro</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportarPdfDia}
              className="flex items-center gap-2 bg-black/50 hover:bg-[#B08D57]/20 text-slate-100 hover:text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border border-[#B08D57]/30 transition-colors cursor-pointer min-h-[40px]"
              title="Baixar PDF deste dia"
            >
              <FileDown className="w-4 h-4 text-[#DFBA73]" />
              <span className="hidden sm:inline">PDF do Dia</span>
            </button>

            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer min-h-[40px]"
              title="Enviar Relatório via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#B08D57]/20 rounded-2xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-white/5 hover:border-[#B08D57]/30"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros de Data e Secretaria */}
        <div className="bg-black/30 border-b border-[#B08D57]/20 p-3.5 sm:p-4 space-y-3 shrink-0">
          
          {/* Controle de Data */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#C6A96B]/80 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#DFBA73]" />
                Data:
              </span>
              
              <div className="flex items-center gap-1 bg-black/60 border border-[#B08D57]/30 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => alterarDia(-1)}
                  className="p-1 text-[#DFBA73] hover:text-white hover:bg-[#B08D57]/20 rounded-xl transition-colors cursor-pointer"
                  title="Dia Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs sm:text-sm px-2 py-0.5 focus:outline-none cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => alterarDia(1)}
                  className="p-1 text-[#DFBA73] hover:text-white hover:bg-[#B08D57]/20 rounded-xl transition-colors cursor-pointer"
                  title="Próximo Dia"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={aplicarHoje}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  dataSelecionada === dataHojeStr
                    ? 'bg-[#B08D57]/20 text-[#DFBA73] border-[#B08D57]/50 shadow-sm'
                    : 'bg-black/40 text-slate-300 border-[#B08D57]/20 hover:bg-[#B08D57]/10'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={aplicarOntem}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/40 text-slate-300 border border-[#B08D57]/20 hover:bg-[#B08D57]/10 cursor-pointer"
              >
                Ontem
              </button>

              <button
                type="button"
                onClick={aplicarTodasDatas}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  dataSelecionada === ''
                    ? 'bg-[#B08D57]/20 text-[#DFBA73] border-[#B08D57]/50 shadow-sm'
                    : 'bg-black/40 text-slate-300 border-[#B08D57]/20 hover:bg-[#B08D57]/10'
                }`}
                title="Mostrar cadastros de todas as datas"
              >
                Todas as Datas ({registros.length})
              </button>
            </div>

            {/* Busca Rápida */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C6A96B]/60" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar FCT, placa, motorista..."
                className="w-full bg-black/60 border border-[#B08D57]/30 rounded-2xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#DFBA73] font-medium"
              />
            </div>
          </div>

          {/* Filtro por Secretaria & Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Botões de Secretaria */}
            <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSecretariaFiltro('TODAS')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  secretariaFiltro === 'TODAS'
                    ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/50 shadow-sm'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-[#B08D57]/20'
                }`}
              >
                Todas as Secretarias
              </button>

              <button
                type="button"
                onClick={() => setSecretariaFiltro('Secretaria da Agricultura')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  secretariaFiltro === 'Secretaria da Agricultura'
                    ? 'bg-[#B08D57]/25 text-white border border-[#B08D57] shadow-sm'
                    : 'bg-black/40 text-slate-300 hover:text-[#DFBA73] border border-[#B08D57]/20'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-[#DFBA73]" />
                <span>Sec. Agricultura</span>
              </button>

              <button
                type="button"
                onClick={() => setSecretariaFiltro('Secretaria do Turismo')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  secretariaFiltro === 'Secretaria do Turismo'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-black/40 text-slate-300 hover:text-emerald-400 border border-[#B08D57]/20'
                }`}
              >
                <Plane className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sec. Turismo</span>
              </button>
            </div>

            {/* Badges de Contagem Rápida Clicáveis */}
            <div className="md:col-span-6 flex items-center justify-between md:justify-end gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setStatusAba('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  statusAba === 'TODOS'
                    ? 'bg-black/60 border-[#B08D57]/50 text-white shadow-md'
                    : 'bg-black/40 border-[#B08D57]/15 text-slate-300 hover:bg-[#B08D57]/10'
                }`}
                title="Clique para ver todos os registros da data"
              >
                <span>Total no Dia:</span>
                <strong className="text-white font-mono text-sm">{registrosDaData.length}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStatusAba(statusAba === 'EM_TRANSITO' ? 'TODOS' : 'EM_TRANSITO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  statusAba === 'EM_TRANSITO'
                    ? 'bg-[#B08D57]/20 border-[#B08D57]/60 text-[#DFBA73] shadow-md font-bold'
                    : 'bg-black/40 border-[#B08D57]/15 text-slate-300 hover:bg-[#B08D57]/10'
                }`}
                title="Clique para filtrar apenas os veículos em trânsito"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse text-[#DFBA73]" />
                <span>Em Trânsito:</span>
                <strong className="font-mono text-sm font-bold text-[#DFBA73]">{registrosEmTransito.length}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStatusAba(statusAba === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  statusAba === 'FINALIZADO'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-md font-bold'
                    : 'bg-black/40 border-[#B08D57]/15 text-slate-300 hover:bg-[#B08D57]/10'
                }`}
                title="Clique para filtrar apenas os retornos concluídos"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chegaram (Pátio):</span>
                <strong className="font-mono text-sm font-bold text-emerald-400">{registrosChegaram.length}</strong>
              </button>
            </div>
          </div>
        </div>

        {/* Abas de Navegação do Status */}
        <div className="bg-black/40 px-4 sm:px-6 py-2.5 border-b border-[#B08D57]/20 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusAba === 'TODOS'
                ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos os Cadastros ({registrosDaData.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusAba('EM_TRANSITO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusAba === 'EM_TRANSITO'
                ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#DFBA73] animate-pulse" />
            <span>Em Trânsito / Na Rua ({registrosEmTransito.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba('FINALIZADO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusAba === 'FINALIZADO'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-md'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chegaram / Retorno Concluído ({registrosChegaram.length})</span>
          </button>
        </div>

        {/* Lista de Registros / Grade Responsiva */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 custom-scrollbar">
          {exibindoFallback && (
            <div className="bg-[#B08D57]/15 border border-[#B08D57]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-200 text-xs sm:text-sm shadow-md">
              <div>
                <strong className="text-white block">Sem registros específicos para {dataFormatadaAmigavel}.</strong>
                <span>Exibindo todos os <strong>{registros.length}</strong> cadastros do sistema para garantir o seu acesso:</span>
              </div>
              <button
                type="button"
                onClick={aplicarTodasDatas}
                className="px-3.5 py-1.5 bg-[#B08D57] hover:bg-[#C6A96B] text-slate-950 font-bold rounded-xl shrink-0 cursor-pointer shadow-sm text-xs"
              >
                Limpar Filtro de Data
              </button>
            </div>
          )}

          {listaParaExibir.length === 0 ? (
            <div className="bg-black/40 border-2 border-dashed border-white/10 rounded-3xl p-6 text-center space-y-3 my-4">
              <div className="w-10 h-10 rounded-2xl bg-black/60 border border-[#B08D57]/20 flex items-center justify-center text-[#DFBA73] mx-auto">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Nenhum registro encontrado no aplicativo</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não há nenhum cadastro de veículo realizado ainda no sistema.
              </p>
              {onAbrirCadastro && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onAbrirCadastro}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 cursor-pointer shadow-md transition-all border border-[#DFBA73]/30"
                  >
                    + Fazer Primeiro Cadastro
                  </button>
                </div>
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
                    className={`bg-black/50 border rounded-xl p-2.5 sm:py-2.5 sm:px-3.5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 border-l-4 ${
                      isEmTransito
                        ? 'border-l-[#DFBA73] border-t-white/5 border-r-white/5 border-b-white/5 bg-[#B08D57]/5'
                        : 'border-l-emerald-500 border-t-white/5 border-r-white/5 border-b-white/5'
                    }`}
                  >
                    {/* Lado Esquerdo: Placa com Super Destaque + Secretaria/FCT + Motorista */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Ícone da Secretaria */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                          isAgri ? 'bg-[#B08D57]/20 border border-[#B08D57]/40' : 'bg-emerald-950 border border-emerald-500/40'
                        }`}
                        title={reg.secretaria}
                      >
                        {isAgri ? <Wheat className="w-4 h-4 text-[#DFBA73]" /> : <Plane className="w-4 h-4 text-emerald-400" />}
                      </div>

                      {/* Placa em Destaque Alto Contraste */}
                      <div className="shrink-0 flex flex-col items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm sm:text-base text-[#DFBA73] bg-black/70 border border-[#B08D57]/40 px-2.5 py-0.5 rounded-lg tracking-wider shadow-inner">
                            {placaVeic}
                          </span>
                          {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                            <span className="font-mono text-xs font-bold text-slate-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                              {reg.fct}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 hidden sm:inline">
                              Turismo
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[170px]">
                          {modeloVeic}
                        </span>
                      </div>

                      <div className="h-7 w-px bg-white/10 hidden sm:block shrink-0" />

                      {/* Nome do Motorista em Destaque + Destino */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[220px] sm:max-w-[300px]">
                            {motoristaNome}
                          </span>
                          <span className="text-slate-500 hidden sm:inline">•</span>
                          <span className="text-xs text-[#C6A96B]/80 font-medium truncate max-w-[180px] sm:max-w-[260px]">
                            {reg.destino || 'Serviço'}
                          </span>
                          {andarLocal && andarLocal !== 'Térreo' && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border tracking-wide shadow-sm ${
                              andarLocal === 'SAA'
                                ? 'bg-[#B08D57]/20 text-[#DFBA73] border-[#B08D57]/50 animate-pulse'
                                : 'bg-black/60 text-[#C6A96B] border-white/10'
                            }`}>
                              <span>Andar {andarLocal}</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
                          <span className="text-slate-400 truncate max-w-[160px]">{reg.secretaria}</span>
                          {dataReg && <span>• Data: <strong className="text-slate-300">{dataReg}</strong></span>}
                          <span className="hidden sm:inline">• Resp: <strong className="text-slate-300">{reg.funcionarioResponsavel}</strong></span>
                          {reg.ocorrencia && (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40 max-w-[200px] truncate"
                              title={`Ocorrência: ${reg.ocorrencia}`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-[#DFBA73] shrink-0" />
                              <span className="truncate">{reg.ocorrencia}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Horários + Status + Ações Compactas */}
                    <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0 pt-1.5 md:pt-0 border-t md:border-t-0 border-white/5">
                      {/* Horários */}
                      <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-[#B08D57]/20 font-mono text-xs shrink-0">
                        <span className="text-[#C6A96B]/60 text-[10px] font-sans uppercase font-bold">Saída:</span>
                        <strong className="text-white">{hSaida}</strong>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-[#C6A96B]/60 text-[10px] font-sans uppercase font-bold">Ret:</span>
                        {hChegada ? (
                          <strong className="text-[#DFBA73]">{hChegada}</strong>
                        ) : (
                          <span className="text-[#DFBA73] font-bold font-sans animate-pulse text-[11px]">Fora</span>
                        )}
                      </div>

                      {/* Badge de Status */}
                      <div className="shrink-0">
                        {isEmTransito ? (
                          <button
                            type="button"
                            onClick={() => setStatusAba('EM_TRANSITO')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40 hover:bg-[#B08D57]/30 transition-colors cursor-pointer shadow-sm"
                            title="Filtrar veículos em trânsito"
                          >
                            <Clock className="w-3 h-3 animate-pulse text-[#DFBA73] shrink-0" />
                            <span>Na Rua</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusAba('FINALIZADO')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 transition-colors cursor-pointer shadow-sm"
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
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-950 bg-gradient-to-r from-[#C6A96B] to-[#B08D57] hover:brightness-110 rounded-lg font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95 border border-[#DFBA73]/40"
                            title="Registrar Retorno do Veículo"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Retorno</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelecionarRegistro(reg)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-black/60 hover:bg-[#B08D57]/20 border border-[#B08D57]/30 rounded-lg font-bold transition-colors cursor-pointer"
                          title="Ver Ficha Completa e Assinatura"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#DFBA73]" />
                          <span className="hidden xs:inline">Ficha</span>
                        </button>

                        {onExcluir && (
                          <button
                            type="button"
                            onClick={() => setRegistroParaExcluir(reg)}
                            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all cursor-pointer active:scale-95"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

        {/* Rodapé do Modal */}
        <div className="bg-black/40 border-t border-[#B08D57]/20 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#C6A96B]/70 text-center sm:text-left">
            Exibindo <strong>{registrosFiltrados.length}</strong> de <strong>{registrosDaData.length}</strong> registro(s) do dia {dataFormatadaAmigavel}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-black/50 hover:bg-[#B08D57]/20 text-white rounded-2xl text-xs sm:text-sm font-bold border border-[#B08D57]/30 transition-colors cursor-pointer min-h-[42px]"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
