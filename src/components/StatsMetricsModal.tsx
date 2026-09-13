import React, { useState, useMemo } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Car, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wheat, 
  Plane, 
  Users, 
  MapPin, 
  Calendar,
  Building,
  ArrowUpRight,
  PieChart,
  FileDown,
  Mail,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Layers
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { PdfService } from '../services/pdfService';
import { WhatsAppSelectModal } from './WhatsAppSelectModal';

interface StatsMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
  usuario?: UsuarioAutenticado | null;
  onToast: (msg: string) => void;
}

type PeriodoTipo = 'HOJE' | '7_DIAS' | 'MES_ATUAL' | 'ANO_ATUAL' | 'TODOS' | 'CUSTOM';

export const StatsMetricsModal: React.FC<StatsMetricsModalProps> = ({
  isOpen,
  onClose,
  registros,
  usuario,
  onToast,
}) => {
  const [periodo, setPeriodo] = useState<PeriodoTipo>('MES_ATUAL');
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>('TODAS');
  
  const hojeStr = getLocalDateString();
  const [dataInicioCustom, setDataInicioCustom] = useState(hojeStr);
  const [dataFimCustom, setDataFimCustom] = useState(hojeStr);
  const [copiado, setCopiado] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Rótulo amigável do período
  const periodoRotulo = useMemo(() => {
    switch (periodo) {
      case 'HOJE': return 'Hoje';
      case '7_DIAS': return 'Últimos 7 Dias';
      case 'MES_ATUAL': return 'Mês Atual';
      case 'ANO_ATUAL': return 'Ano Atual';
      case 'TODOS': return 'Todo o Histórico';
      case 'CUSTOM': return `De ${new Date(dataInicioCustom + 'T00:00:00').toLocaleDateString('pt-BR')} até ${new Date(dataFimCustom + 'T00:00:00').toLocaleDateString('pt-BR')}`;
      default: return 'Geral';
    }
  }, [periodo, dataInicioCustom, dataFimCustom]);

  // Filtragem dos registros conforme período e secretaria
  const registrosFiltrados = useMemo(() => {
    const hoje = new Date();
    
    return registros.filter(reg => {
      // Filtro de Secretaria
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) {
        return false;
      }

      if (!reg.data) return true;

      // Filtro de Período
      if (periodo === 'HOJE') {
        return reg.data === hojeStr;
      }

      if (periodo === '7_DIAS') {
        const seteDiasAtras = new Date(hoje);
        seteDiasAtras.setDate(hoje.getDate() - 7);
        const dataReg = new Date(reg.data + 'T00:00:00');
        return dataReg >= seteDiasAtras && dataReg <= hoje;
      }

      if (periodo === 'MES_ATUAL') {
        const mesAtual = (hoje.getMonth() + 1).toString().padStart(2, '0');
        const anoAtual = hoje.getFullYear().toString();
        return reg.data.startsWith(`${anoAtual}-${mesAtual}`);
      }

      if (periodo === 'ANO_ATUAL') {
        const anoAtual = hoje.getFullYear().toString();
        return reg.data.startsWith(anoAtual);
      }

      if (periodo === 'CUSTOM') {
        if (dataInicioCustom && reg.data < dataInicioCustom) return false;
        if (dataFimCustom && reg.data > dataFimCustom) return false;
        return true;
      }

      return true; // TODOS
    });
  }, [registros, periodo, secretariaFiltro, hojeStr, dataInicioCustom, dataFimCustom]);

  // Cálculos e Agregações Estatísticas
  const stats = useMemo(() => {
    const totalViagens = registrosFiltrados.length;
    const emTransito = registrosFiltrados.filter(r => r.status === 'EM_TRANSITO').length;
    const finalizados = registrosFiltrados.filter(r => r.status === 'FINALIZADO').length;

    // Divisão por Secretaria
    const totalAgri = registrosFiltrados.filter(r => r.secretaria === 'Secretaria da Agricultura').length;
    const totalTurismo = registrosFiltrados.filter(r => r.secretaria === 'Secretaria do Turismo').length;

    const pctAgri = totalViagens > 0 ? Math.round((totalAgri / totalViagens) * 100) : 0;
    const pctTurismo = totalViagens > 0 ? Math.round((totalTurismo / totalViagens) * 100) : 0;

    // Motoristas mais ativos
    const contagemMotoristas: Record<string, number> = {};
    registrosFiltrados.forEach(r => {
      const nome = r.motorista?.trim() || 'Não informado';
      contagemMotoristas[nome] = (contagemMotoristas[nome] || 0) + 1;
    });
    const topMotoristas = Object.entries(contagemMotoristas)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Veículos mais demandados (Placa + Modelo)
    const contagemVeiculos: Record<string, { count: number; modelo: string }> = {};
    registrosFiltrados.forEach(r => {
      const placa = r.placa?.trim() || r.fct?.trim() || 'Sem Placa';
      const modelo = r.modeloVeiculo?.trim() || 'Veículo';
      if (!contagemVeiculos[placa]) {
        contagemVeiculos[placa] = { count: 0, modelo };
      }
      contagemVeiculos[placa].count += 1;
    });
    const topVeiculos = Object.entries(contagemVeiculos)
      .map(([placa, info]) => ({ placa, modelo: info.modelo, count: info.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Destinos mais frequentes
    const contagemDestinos: Record<string, number> = {};
    registrosFiltrados.forEach(r => {
      const dest = r.destino?.trim() || 'Não especificado';
      contagemDestinos[dest] = (contagemDestinos[dest] || 0) + 1;
    });
    const topDestinos = Object.entries(contagemDestinos)
      .map(([destino, count]) => ({ destino, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Andares / Locais mais atendidos
    const contagemAndares: Record<string, number> = {};
    registrosFiltrados.forEach(r => {
      const andar = r.andar?.trim() || 'Térreo';
      contagemAndares[andar] = (contagemAndares[andar] || 0) + 1;
    });
    const topAndares = Object.entries(contagemAndares)
      .map(([andar, count]) => ({ andar, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Turnos de Saída (Manhã, Tarde, Noite, Madrugada)
    const turnos = { manha: 0, tarde: 0, noite: 0, madrugada: 0 };
    registrosFiltrados.forEach(r => {
      if (!r.horarioSaida) return;
      const hora = parseInt(r.horarioSaida.split(':')[0], 10);
      if (isNaN(hora)) return;
      if (hora >= 6 && hora < 12) turnos.manha += 1;
      else if (hora >= 12 && hora < 18) turnos.tarde += 1;
      else if (hora >= 18 && hora < 24) turnos.noite += 1;
      else turnos.madrugada += 1;
    });

    return {
      totalViagens,
      emTransito,
      finalizados,
      totalAgri,
      totalTurismo,
      pctAgri,
      pctTurismo,
      topMotoristas,
      topVeiculos,
      topDestinos,
      topAndares,
      turnos,
    };
  }, [registrosFiltrados]);

  // Ações de Exportação e Compartilhamento do Painel de Estatísticas
  const handleBaixarPdf = () => {
    try {
      PdfService.gerarPdfEstatisticas({
        registros: registrosFiltrados,
        secretariaFiltro,
        periodoRotulo,
        usuario,
        stats,
      });
      onToast('Relatório de Estatísticas em PDF gerado com sucesso!');
    } catch (err) {
      console.error(err);
      onToast('Erro ao gerar PDF de estatísticas.');
    }
  };

  const handleEnviarEmail = () => {
    try {
      const assunto = `Estatísticas & Métricas de Frotas - ${periodoRotulo} - ${secretariaFiltro === 'TODAS' ? 'Agricultura & Turismo' : secretariaFiltro}`;
      const corpo = PdfService.gerarTextoEstatisticas({
        periodoRotulo,
        secretariaFiltro,
        usuario,
        stats,
      });

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
      window.location.href = mailtoUrl;
      onToast('Abrindo cliente de e-mail com as estatísticas...');
    } catch (err) {
      console.error(err);
      onToast('Erro ao abrir e-mail.');
    }
  };

  const handleAbrirWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  const handleConfirmarEnvioWhatsApp = async (numeroWhatsApp: string, nomeDestinatario?: string) => {
    const options = {
      registros: registrosFiltrados,
      secretariaFiltro,
      periodoRotulo,
      usuario,
      stats,
    };

    // 1. Sempre gerar o documento PDF em formato Blob e baixar o arquivo .pdf
    const { blob, fileName } = PdfService.obterEstatisticasPdfBlob(options);
    PdfService.gerarPdfEstatisticas(options);

    // 2. Tentar usar Web Share API nativa para enviar o arquivo PDF se suportado
    const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: 'Relatório de Estatísticas de Frotas (PDF)',
          text: `Relatório de Estatísticas & Métricas de Frotas em PDF - ${periodoRotulo}`,
          files: [pdfFile],
        });
        setIsWhatsAppModalOpen(false);
        onToast(`PDF de Estatísticas compartilhado com sucesso para ${nomeDestinatario || 'WhatsApp'}!`);
        return;
      } catch (err) {
        console.log('Compartilhamento nativo de PDF cancelado ou não suportado, usando fallback WhatsApp:', err);
      }
    }

    // 3. Fallback: Abre conversa no WhatsApp com texto estruturado informando o anexo do PDF
    const textoMensagem = PdfService.gerarTextoEstatisticas(options);
    const numLimpo = numeroWhatsApp ? numeroWhatsApp.replace(/\D/g, '') : '';
    let url = '';

    if (numLimpo) {
      url = `https://api.whatsapp.com/send?phone=${numLimpo}&text=${encodeURIComponent(textoMensagem)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensagem)}`;
    }

    window.open(url, '_blank');
    setIsWhatsAppModalOpen(false);
    onToast(`PDF gerado e baixado! Anexe o arquivo ${fileName} na conversa aberta do WhatsApp.`);
  };

  const handleCopiarTexto = async () => {
    const texto = PdfService.gerarTextoEstatisticas({
      periodoRotulo,
      secretariaFiltro,
      usuario,
      stats,
    });

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      onToast('Texto das estatísticas copiado!');
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error(err);
      onToast('Erro ao copiar texto.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-estatisticas-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="modal-estatisticas-container"
        className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl text-slate-100 flex flex-col h-[92vh] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO PRINCIPAL FIXO E COMPACTO */}
        <div className="bg-slate-950 border-b-2 border-slate-800 px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Estatísticas & Métricas de Frotas
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                <span>{periodoRotulo}</span>
                <span>•</span>
                <span>{secretariaFiltro === 'TODAS' ? 'Agricultura & Turismo' : secretariaFiltro}</span>
              </div>
            </div>
          </div>

          {/* Ações de Exportação e Fechar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {/* Tag de Total de Registros em Destaque */}
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 shadow-sm mr-1">
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{stats.totalViagens} {stats.totalViagens === 1 ? 'Registro' : 'Registros'}</span>
            </div>

            {/* Baixar PDF */}
            <button
              type="button"
              onClick={handleBaixarPdf}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-all cursor-pointer min-h-[36px]"
              title="Baixar relatório completo em formato PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>

            {/* Enviar WhatsApp */}
            <button
              type="button"
              onClick={handleAbrirWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all cursor-pointer min-h-[36px]"
              title="Compartilhar PDF ou enviar via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Enviar E-mail */}
            <button
              type="button"
              onClick={handleEnviarEmail}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition-all cursor-pointer min-h-[36px]"
              title="Enviar por E-mail"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden md:inline">E-mail</span>
            </button>

            {/* Copiar Resumo */}
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer min-h-[36px]"
              title="Copiar resumo textual para colar onde quiser"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span className="hidden md:inline">{copiado ? 'Copiado!' : 'Copiar'}</span>
            </button>

            {/* Botão Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 ml-1"
              title="Fechar painel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS FIXA COM SEPARAÇÃO NÍTIDA */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
          {/* Pílulas de Seleção de Período */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Período:</span>
            </span>
            {(
              [
                { id: 'HOJE', label: 'Hoje' },
                { id: '7_DIAS', label: '7 Dias' },
                { id: 'MES_ATUAL', label: 'Este Mês' },
                { id: 'ANO_ATUAL', label: 'Ano Atual' },
                { id: 'TODOS', label: 'Todos' },
                { id: 'CUSTOM', label: 'Personalizado' },
              ] as { id: PeriodoTipo; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriodo(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodo === item.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Filtro por Secretaria */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold text-slate-400 hidden xs:inline">Secretaria:</span>
            <select
              value={secretariaFiltro}
              onChange={(e) => setSecretariaFiltro(e.target.value as any)}
              className="bg-slate-900 border-2 border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer min-h-[36px]"
            >
              <option value="TODAS">Ambas Secretarias</option>
              <option value="Secretaria da Agricultura">Agricultura</option>
              <option value="Secretaria do Turismo">Turismo</option>
            </select>
          </div>

          {/* Seletor Customizado de Datas se ativado */}
          {periodo === 'CUSTOM' && (
            <div className="w-full flex items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">De:</span>
              <input
                type="date"
                value={dataInicioCustom}
                onChange={(e) => setDataInicioCustom(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <span className="font-semibold text-slate-400">Até:</span>
              <input
                type="date"
                value={dataFimCustom}
                onChange={(e) => setDataFimCustom(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (100% ROLÁVEL COM BARRA VISÍVEL E SEM OBSTÁCULOS) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0 bg-slate-900/60">
          {/* Cartões Principais de KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total de Saídas */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total de Viagens</p>
                <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalViagens}</p>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> No período filtrado
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Car className="w-6 h-6" />
              </div>
            </div>

            {/* Em Trânsito */}
            <div className="bg-slate-950 border-2 border-amber-600/40 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Em Trânsito (Na Rua)</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-300">{stats.emTransito}</p>
                <p className="text-[10px] text-amber-400/80 font-medium">Aguardando retorno</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            {/* Finalizadas */}
            <div className="bg-slate-950 border-2 border-emerald-600/40 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Viagens Concluídas</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.finalizados}</p>
                <p className="text-[10px] text-emerald-400/80 font-medium">Retornaram ao pátio</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Eficiência da Frota */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Taxa de Conclusão</p>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {stats.totalViagens > 0 ? Math.round((stats.finalizados / stats.totalViagens) * 100) : 100}%
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Retornos confirmados</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Comparativo de Secretarias */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Distribuição de Demanda por Secretaria</span>
              </h3>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Total de {stats.totalViagens} {stats.totalViagens === 1 ? 'viagem' : 'viagens'}</span>
              </div>
            </div>

            {/* Barra Visual de Proporção */}
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500" 
                style={{ width: `${stats.pctAgri}%` }}
                title={`Agricultura: ${stats.totalAgri} (${stats.pctAgri}%)`}
              />
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
                style={{ width: `${stats.pctTurismo}%` }}
                title={`Turismo: ${stats.totalTurismo} (${stats.pctTurismo}%)`}
              />
            </div>

            {/* Legenda e Detalhes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Secretaria da Agricultura</p>
                    <p className="text-[10px] text-slate-400">Veículos Oficiais & FCT</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-amber-400">{stats.totalAgri}</span>
                  <p className="text-[10px] text-slate-400 font-mono">{stats.pctAgri}% do total</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Secretaria do Turismo</p>
                    <p className="text-[10px] text-slate-400">Viagens & Eventos</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-emerald-400">{stats.totalTurismo}</span>
                  <p className="text-[10px] text-slate-400 font-mono">{stats.pctTurismo}% do total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos em Duas Colunas: Motoristas mais Ativos & Veículos mais Demandados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Motoristas */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Top Motoristas com Mais Saídas</span>
              </h3>

              {stats.topMotoristas.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum registro encontrado no período.</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.topMotoristas.map((item, idx) => {
                    const maxVal = stats.topMotoristas[0]?.count || 1;
                    const percent = Math.round((item.count / maxVal) * 100);
                    return (
                      <div key={item.nome} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] text-amber-400 font-bold">
                              {idx + 1}
                            </span>
                            {item.nome}
                          </span>
                          <span className="font-bold text-amber-400 font-mono">
                            {item.count} {item.count === 1 ? 'viagem' : 'viagens'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Veículos / Placas */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Veículos / Placas Mais Utilizados</span>
              </h3>

              {stats.topVeiculos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum veículo registrado no período.</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.topVeiculos.map((item, idx) => {
                    const maxVal = stats.topVeiculos[0]?.count || 1;
                    const percent = Math.round((item.count / maxVal) * 100);
                    return (
                      <div key={item.placa} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[9px] text-slate-300 font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                              {item.placa}
                            </span>
                            <span className="text-slate-400 truncate max-w-[120px]">{item.modelo}</span>
                          </div>
                          <span className="font-bold text-slate-200 font-mono">
                            {item.count} {item.count === 1 ? 'saída' : 'saídas'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Terceira Linha: Destinos Frequentes + Horários de Pico */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Destinos */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Destinos e Itinerários Mais Comuns</span>
              </h3>

              {stats.topDestinos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Nenhum destino cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stats.topDestinos.map((d) => (
                    <div key={d.destino} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]" title={d.destino}>
                        {d.destino}
                      </span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-600/40">
                        {d.count}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Horários de Movimentação */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Turnos de Maior Fluxo na Portaria</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Manhã</span>
                  <p className="text-base font-black text-amber-400">{stats.turnos.manha}</p>
                  <p className="text-[9px] text-slate-500">06h-12h</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tarde</span>
                  <p className="text-base font-black text-emerald-400">{stats.turnos.tarde}</p>
                  <p className="text-[9px] text-slate-500">12h-18h</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Noite</span>
                  <p className="text-base font-black text-sky-400">{stats.turnos.noite}</p>
                  <p className="text-[9px] text-slate-500">18h-24h</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Madrugada</span>
                  <p className="text-base font-black text-purple-400">{stats.turnos.madrugada}</p>
                  <p className="text-[9px] text-slate-500">00h-06h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ FIXO E COMPACTO */}
        <div className="bg-slate-950 border-t-2 border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">Desenvolvido por Siolly Technology</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">
              Exibindo dados de <strong className="text-slate-200">{periodoRotulo}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal Seletor de Contato do WhatsApp com PDF das Estatísticas */}
      {isWhatsAppModalOpen && (
        <WhatsAppSelectModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          onConfirmSend={handleConfirmarEnvioWhatsApp}
          textoRelatorio={PdfService.gerarTextoEstatisticas({
            periodoRotulo,
            secretariaFiltro,
            usuario,
            stats,
          })}
          dataRelatorio={periodoRotulo}
          usuarioAtual={usuario}
        />
      )}
    </div>
  );
};
