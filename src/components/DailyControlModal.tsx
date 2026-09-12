import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Wheat,
  Compass,
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
} from 'lucide-react';
import { RegistroVeiculo, Secretaria } from '../types';
import { PdfService } from '../services/pdfService';

interface DailyControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
  onSelecionarRegistro: (reg: RegistroVeiculo) => void;
  onAjustarHorarios: (reg: RegistroVeiculo) => void;
  onAbrirEnviarRelatorio: () => void;
  onAbrirCadastro?: () => void;
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
  filtroSecretariaInicial = 'TODAS',
  filtroStatusInicial = 'TODOS',
}) => {
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
    setDataSelecionada(baseDate.toISOString().split('T')[0]);
  };

  const aplicarHoje = () => setDataSelecionada(dataHojeStr);
  const aplicarOntem = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDataSelecionada(d.toISOString().split('T')[0]);
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header do Modal */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-slate-700 border-2 border-emerald-400/50 flex items-center justify-center text-white shadow-lg shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Painel de Controle de Cadastros Diários
                </h2>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-3 py-0.5 rounded-full text-xs font-bold">
                  {dataFormatadaAmigavel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
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
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer min-h-[40px]"
                title="Cadastrar novo veículo"
              >
                <Car className="w-4 h-4" />
                <span>+ Novo Cadastro</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportarPdfDia}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 transition-colors cursor-pointer min-h-[40px]"
              title="Baixar PDF deste dia"
            >
              <FileDown className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">PDF do Dia</span>
            </button>

            <button
              type="button"
              onClick={onAbrirEnviarRelatorio}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-650 hover:to-slate-750 text-white px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border border-slate-600 shadow-md transition-all cursor-pointer min-h-[40px]"
              title="Enviar Relatório via WhatsApp"
            >
              <Share2 className="w-4 h-4 text-slate-200" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-800"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros de Data e Secretaria */}
        <div className="bg-slate-900 border-b border-slate-800 p-3.5 sm:p-4 space-y-3 shrink-0">
          
          {/* Controle de Data */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-slate-300" />
                Data:
              </span>
              
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => alterarDia(-1)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={aplicarOntem}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 cursor-pointer"
              >
                Ontem
              </button>

              <button
                type="button"
                onClick={aplicarTodasDatas}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  dataSelecionada === ''
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
                title="Mostrar cadastros de todas as datas"
              >
                Todas as Datas ({registros.length})
              </button>
            </div>

            {/* Busca Rápida */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar FCT, placa, motorista..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
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
                    ? 'bg-slate-700 text-white border border-slate-500 shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                Todas as Secretarias
              </button>

              <button
                type="button"
                onClick={() => setSecretariaFiltro('Secretaria da Agricultura')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  secretariaFiltro === 'Secretaria da Agricultura'
                    ? 'bg-emerald-800 text-white border border-emerald-400 shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sec. Agricultura</span>
              </button>

              <button
                type="button"
                onClick={() => setSecretariaFiltro('Secretaria do Turismo')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                  secretariaFiltro === 'Secretaria do Turismo'
                    ? 'bg-slate-700 text-white border border-slate-500 shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-slate-300" />
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
                    ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
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
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
                title="Clique para filtrar apenas os veículos em trânsito"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Em Trânsito:</span>
                <strong className="font-mono text-sm font-bold text-amber-300">{registrosEmTransito.length}</strong>
              </button>

              <button
                type="button"
                onClick={() => setStatusAba(statusAba === 'FINALIZADO' ? 'TODOS' : 'FINALIZADO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                  statusAba === 'FINALIZADO'
                    ? 'bg-emerald-950 border-emerald-500 text-white shadow-md font-bold'
                    : 'bg-slate-950 border-slate-800 text-emerald-300 hover:bg-slate-850'
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
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusAba('TODOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusAba === 'TODOS'
                ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
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
                ? 'bg-slate-800 text-slate-100 border border-slate-600 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Em Trânsito / Na Rua ({registrosEmTransito.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusAba('FINALIZADO')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusAba === 'FINALIZADO'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-md'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chegaram / Retorno Concluído ({registrosChegaram.length})</span>
          </button>
        </div>

        {/* Lista de Registros / Grade Responsiva */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {exibindoFallback && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-200 text-xs sm:text-sm shadow-md">
              <div>
                <strong className="text-white block">Sem registros específicos para {dataFormatadaAmigavel}.</strong>
                <span>Exibindo todos os <strong>{registros.length}</strong> cadastros do sistema para garantir o seu acesso:</span>
              </div>
              <button
                type="button"
                onClick={aplicarTodasDatas}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow-sm text-xs"
              >
                Limpar Filtro de Data
              </button>
            </div>
          )}

          {listaParaExibir.length === 0 ? (
            <div className="bg-slate-950/60 border-2 border-dashed border-slate-800 rounded-3xl p-6 text-center space-y-3 my-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
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
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md transition-all"
                  >
                    + Fazer Primeiro Cadastro
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {listaParaExibir.map((reg) => {
                const isAgri = reg.secretaria === 'Secretaria da Agricultura';
                const isEmTransito = reg.status === 'EM_TRANSITO';
                const motoristaNome = reg.motorista || (reg as any).nomeMotorista || 'Não informado';
                const placaVeic = reg.placa || (reg as any).placaVeiculo || 'Sem placa';
                const modeloVeic = reg.modeloVeiculo || 'Veículo';
                const hSaida = reg.horarioSaida || (reg as any).horaSaida || '--:--';
                const hChegada = reg.horarioChegada || (reg as any).horaChegada || '';
                const andarLocal = reg.andar || (reg as any).andarAtendimento || 'Térreo';

                return (
                  <div
                    key={reg.id}
                    className={`bg-slate-950 border rounded-2xl p-3 sm:p-3.5 shadow-md space-y-2.5 transition-all hover:border-slate-600 ${
                      isEmTransito ? 'border-amber-500/50' : 'border-emerald-500/40'
                    }`}
                  >
                    {/* Cabeçalho do Card (Linha Única) */}
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
                          {isAgri && reg.fct && reg.fct !== 'N/A' ? (
                            <span className="font-mono font-bold text-white text-xs sm:text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              {reg.fct}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-300 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded">
                              Turismo (Sem FCT)
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-medium truncate hidden sm:inline">
                            • {reg.secretaria}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge compacto */}
                      <div className="shrink-0">
                        {isEmTransito ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 animate-pulse text-amber-400" />
                            Em Trânsito
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Chegou (Pátio)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo Principal em Grid Compacta */}
                    <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-xs">
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
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Horários (Saída → Retorno):</span>
                          <div className="flex items-center gap-1 text-white font-mono font-bold text-xs">
                            <span>{hSaida}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                            {hChegada ? (
                              <span className="text-emerald-400">{hChegada}</span>
                            ) : (
                              <span className="text-amber-300 font-sans text-[11px] italic">Em curso...</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino / Andar:</span>
                          <span className="text-slate-300 font-medium block truncate">
                            {reg.destino || 'Serviço Externo'} • <strong className="text-slate-200">{andarLocal}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé Compacto com Informações de Responsável e Ações */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-400 truncate">
                        Resp: <strong className="text-slate-200">{reg.funcionarioResponsavel}</strong>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelecionarRegistro(reg)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>Ficha</span>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Exibindo <strong>{registrosFiltrados.length}</strong> de <strong>{registrosDaData.length}</strong> registro(s) do dia {dataFormatadaAmigavel}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs sm:text-sm font-bold border border-slate-700 transition-colors cursor-pointer min-h-[42px]"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
