import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Share2,
  FileText,
  Download,
  Copy,
  Check,
  Mail,
  MessageCircle,
  ShieldCheck,
  Wheat,
  Plane,
  ChevronLeft,
  ChevronRight,
  Car,
  Clock,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString, getDateStringFromDate } from '../utils/dateUtils';
import { PdfService } from '../services/pdfService';
import { WhatsAppSelectModal } from './WhatsAppSelectModal';

interface SendReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrosTotais: RegistroVeiculo[];
  usuario: UsuarioAutenticado | null;
  dataInicial?: string;
  secretariaInicial?: 'TODAS' | Secretaria;
  onToast: (msg: string) => void;
}

export const SendReportModal: React.FC<SendReportModalProps> = ({
  isOpen,
  onClose,
  registrosTotais,
  usuario,
  dataInicial,
  secretariaInicial = 'TODAS',
  onToast,
}) => {
  // Data padrão: dataInicial, ou hoje
  const hojeStr = getLocalDateString();
  const [dataSelecionada, setDataSelecionada] = useState<string>(dataInicial || hojeStr);
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>(secretariaInicial);
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [copiado, setCopiado] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Se o modal foi aberto com nova data inicial, atualiza se necessário
  React.useEffect(() => {
    if (dataInicial) {
      setDataSelecionada(dataInicial);
    }
  }, [dataInicial]);

  // Filtragem dos registros conforme a data e secretaria selecionadas
  const registrosFiltrados = useMemo(() => {
    return registrosTotais.filter((r) => {
      // Filtro de data: se informada, compara estritamente
      if (dataSelecionada && r.data !== dataSelecionada) {
        return false;
      }
      // Filtro de secretaria
      if (secretariaFiltro !== 'TODAS' && r.secretaria !== secretariaFiltro) {
        return false;
      }
      // Filtro de status
      if (statusFiltro !== 'TODOS' && r.status !== statusFiltro) {
        return false;
      }
      return true;
    });
  }, [registrosTotais, dataSelecionada, secretariaFiltro, statusFiltro]);

  // Estatísticas dos registros daquele dia selecionado
  const totalNoDia = registrosFiltrados.length;
  const totalEmTransitoNoDia = registrosFiltrados.filter((r) => r.status === 'EM_TRANSITO').length;
  const totalFinalizadosNoDia = registrosFiltrados.filter((r) => r.status === 'FINALIZADO').length;

  // Operadores que registraram nesse dia (apenas nomes e matrículas, NUNCA senhas!)
  const operadoresDoDia = useMemo(() => {
    const map = new Map<string, string>();
    registrosFiltrados.forEach((r) => {
      if (r.funcionarioResponsavel) {
        map.set(r.funcionarioResponsavel, r.matriculaFuncionario || 'OP');
      }
    });
    return Array.from(map.entries()).map(([nome, matricula]) => ({ nome, matricula }));
  }, [registrosFiltrados]);

  if (!isOpen) return null;

  // Navegar dia anterior / próximo
  const alterarDia = (dias: number) => {
    if (!dataSelecionada) {
      setDataSelecionada(hojeStr);
      return;
    }
    const d = new Date(dataSelecionada + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    setDataSelecionada(getDateStringFromDate(d));
  };

  const definirHoje = () => {
    setDataSelecionada(hojeStr);
  };

  const definirOntem = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    setDataSelecionada(getDateStringFromDate(ontem));
  };

  const definirTodosDias = () => {
    setDataSelecionada('');
  };

  // 1. Download do PDF Oficial
  const handleBaixarPdf = () => {
    try {
      PdfService.gerarRelatorioDiario({
        registros: registrosFiltrados,
        secretariaFiltro,
        dataFiltro: dataSelecionada,
        usuario,
      });
      onToast('Relatório em PDF gerado e baixado com sucesso!');
    } catch (err) {
      console.error(err);
      onToast('Erro ao gerar relatório em PDF.');
    }
  };

  // 2. Compartilhar arquivo PDF via Web Share API
  const handleCompartilharPdf = async () => {
    setCompartilhando(true);
    try {
      const { blob, fileName } = PdfService.obterRelatorioPdfBlob({
        registros: registrosFiltrados,
        secretariaFiltro,
        dataFiltro: dataSelecionada,
        usuario,
      });

      const file = new File([blob], fileName, { type: 'application/pdf' });
      const tituloRelatorio = `Relatório de Veículos - ${dataSelecionada ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR') : 'Geral'}`;
      const textoResumo = PdfService.gerarTextoRelatorio({
        registros: registrosFiltrados,
        secretariaFiltro,
        dataFiltro: dataSelecionada,
        usuario,
      });

      // Verifica se navegador suporta compartilhar arquivos
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: tituloRelatorio,
          text: `Relatório oficial de tráfego de frotas (${dataSelecionada || 'Período Completo'}).`,
        });
        onToast('Relatório compartilhado com sucesso!');
      } else if (navigator.share) {
        // Fallback: compartilha texto resumido
        await navigator.share({
          title: tituloRelatorio,
          text: textoResumo,
        });
        onToast('Resumo do relatório compartilhado!');
      } else {
        // Fallback se não suportar Web Share: baixa o PDF e avisa
        PdfService.gerarRelatorioDiario({
          registros: registrosFiltrados,
          secretariaFiltro,
          dataFiltro: dataSelecionada,
          usuario,
        });
        onToast('Navegador não suporta compartilhamento direto. PDF baixado!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error(err);
        onToast('Compartilhamento cancelado ou não suportado.');
      }
    } finally {
      setCompartilhando(false);
    }
  };

  // 3. Enviar PDF por WhatsApp (Gera e Baixa o Arquivo PDF Oficial + Compartilha no WhatsApp)
  const handleEnviarWhatsApp = () => {
    setIsWhatsAppModalOpen(true);
  };

  const handleConfirmarEnvioWhatsApp = async (numeroWhatsApp: string, nomeDestinatario?: string) => {
    const options = {
      registros: registrosFiltrados,
      secretariaFiltro,
      dataFiltro: dataSelecionada,
      usuario,
    };

    // 1. Sempre gerar o documento PDF em formato Blob e acionar o download do arquivo .pdf
    const { blob, fileName } = PdfService.obterRelatorioPdfBlob(options);
    PdfService.gerarRelatorioDiario(options);

    // 2. Tentar usar a Web Share API nativa para enviar o ARQUIVO PDF diretamente no WhatsApp (dispositivos móveis e navegadores suportados)
    const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: 'Relatório Oficial de Frotas (PDF)',
          text: `Relatório de Registros de Veículos em PDF - ${dataSelecionada || 'Todos'}`,
          files: [pdfFile],
        });
        setIsWhatsAppModalOpen(false);
        onToast(`Arquivo PDF enviado com sucesso para ${nomeDestinatario || 'WhatsApp'}!`);
        return;
      } catch (err) {
        console.log('Compartilhamento nativo de arquivo PDF cancelado ou não suportado, usando fallback:', err);
      }
    }

    // 3. Fallback: Se a Web Share API não estiver disponível (ex: navegadores Desktop), abre a conversa informando que o arquivo PDF foi baixado
    let url = '';
    const numLimpo = numeroWhatsApp ? numeroWhatsApp.replace(/\D/g, '') : '';
    const mensagemPdf = encodeURIComponent(
      `📄 *RELATÓRIO OFICIAL EM PDF GERADO*\n\n` +
      `O arquivo *${fileName}* foi gerado e baixado no meu dispositivo.\n` +
      `Estou anexando o documento PDF nesta conversa para análise.`
    );

    if (numLimpo) {
      url = `https://api.whatsapp.com/send?phone=${numLimpo}&text=${mensagemPdf}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${mensagemPdf}`;
    }

    window.open(url, '_blank');
    setIsWhatsAppModalOpen(false);
    onToast(`PDF baixado! Anexe o arquivo ${fileName} na conversa aberta do WhatsApp.`);
  };

  // 4. Enviar por E-mail
  const handleEnviarEmail = () => {
    const dataFormatada = dataSelecionada
      ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')
      : 'Período Geral';
    const assunto = `Relatório de Veículos - ${dataFormatada} - ${secretariaFiltro === 'TODAS' ? 'Agricultura e Turismo' : secretariaFiltro}`;
    const corpo = PdfService.gerarTextoRelatorio({
      registros: registrosFiltrados,
      secretariaFiltro,
      dataFiltro: dataSelecionada,
      usuario,
    });

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailtoUrl;
    onToast('Abrindo cliente de e-mail com o relatório...');
  };

  // 5. Copiar Texto
  const handleCopiarTexto = async () => {
    const texto = PdfService.gerarTextoRelatorio({
      registros: registrosFiltrados,
      secretariaFiltro,
      dataFiltro: dataSelecionada,
      usuario,
    });

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      onToast('Texto do relatório copiado para a área de transferência!');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      onToast('Não foi possível copiar o texto automaticamente.');
    }
  };

  const dataFormatadaExibicao = dataSelecionada
    ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Todos os Dias Cadastrados';

  return (
    <div
      id="modal-enviar-relatorio-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl overflow-y-auto"
    >
      <div
        id="modal-enviar-relatorio-container"
        className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
      >
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />

        {/* Cabeçalho do Modal */}
        <div className="bg-black/40 px-6 py-5 border-b border-[#B08D57]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73]">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Emitir e Enviar Relatório por Dia
              </h2>
              <p className="text-xs sm:text-sm text-[#C6A96B]/70">
                Selecione qualquer dia para acessar os dados e enviar o relatório oficial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-black/50 hover:bg-[#B08D57]/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5 hover:border-[#B08D57]/30"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* AVISO DE SIGILO DAS SENHAS */}
          <div className="bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#DFBA73] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300">
              <strong className="text-[#DFBA73] font-bold block mb-0.5">
                Segurança e Sigilo de Credenciais Ativos
              </strong>
              As senhas criadas pelos operadores são estritamente sigilosas e criptografadas.
              Nenhuma senha de operador é mostrada ou incluída nos relatórios impressos, digitais, em PDF ou enviados.
            </div>
          </div>

          {/* PAINEL DE SELEÇÃO DE DATA */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B08D57]/15 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#DFBA73]" />
                <span className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  1. Selecione o Dia do Relatório:
                </span>
              </div>

              {/* Botões de Atalho */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={definirHoje}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dataSelecionada === hojeStr
                      ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 font-black shadow-sm'
                      : 'bg-black/50 text-slate-300 hover:text-white border border-[#B08D57]/20'
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={definirOntem}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/50 text-slate-300 hover:text-white border border-[#B08D57]/20 transition-all cursor-pointer"
                >
                  Ontem
                </button>
                <button
                  type="button"
                  onClick={definirTodosDias}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dataSelecionada === ''
                      ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 font-black shadow-sm'
                      : 'bg-black/50 text-slate-300 hover:text-white border border-[#B08D57]/20'
                  }`}
                >
                  Todos os Dias
                </button>
              </div>
            </div>

            {/* Controle de Data com Setas de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-7 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alterarDia(-1)}
                  className="w-11 h-11 rounded-2xl bg-black/50 hover:bg-[#B08D57]/20 text-slate-200 flex items-center justify-center border border-[#B08D57]/20 cursor-pointer shrink-0 transition-colors"
                  title="Dia anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="w-full bg-black/60 border border-[#B08D57]/25 focus:border-[#DFBA73] rounded-2xl px-4 py-2.5 text-base text-white font-bold focus:outline-none transition-colors cursor-pointer min-h-[44px]"
                />

                <button
                  type="button"
                  onClick={() => alterarDia(1)}
                  className="w-11 h-11 rounded-2xl bg-black/50 hover:bg-[#B08D57]/20 text-slate-200 flex items-center justify-center border border-[#B08D57]/20 cursor-pointer shrink-0 transition-colors"
                  title="Próximo dia"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-5 text-sm font-semibold text-[#DFBA73] capitalize bg-[#B08D57]/15 border border-[#B08D57]/30 px-3.5 py-2.5 rounded-2xl text-center">
                {dataFormatadaExibicao}
              </div>
            </div>

            {/* Filtros complementares: Secretaria e Situação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Secretaria:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-1 rounded-xl border border-[#B08D57]/15">
                  <button
                    type="button"
                    onClick={() => setSecretariaFiltro('TODAS')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      secretariaFiltro === 'TODAS'
                        ? 'bg-[#B08D57]/30 text-[#DFBA73] border border-[#B08D57]/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ambas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecretariaFiltro('Secretaria da Agricultura')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      secretariaFiltro === 'Secretaria da Agricultura'
                        ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-[#DFBA73]'
                    }`}
                  >
                    <Wheat className="w-3 h-3" />
                    <span>Agri.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecretariaFiltro('Secretaria do Turismo')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      secretariaFiltro === 'Secretaria do Turismo'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    <Plane className="text-emerald-400 w-3 h-3" />
                    <span>Turismo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Situação da Frota:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-black/60 p-1 rounded-xl border border-[#B08D57]/15">
                  <button
                    type="button"
                    onClick={() => setStatusFiltro('TODOS')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      statusFiltro === 'TODOS'
                        ? 'bg-[#B08D57]/30 text-[#DFBA73] border border-[#B08D57]/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFiltro('EM_TRANSITO')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      statusFiltro === 'EM_TRANSITO'
                        ? 'bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-[#DFBA73]'
                    }`}
                  >
                    Em Trânsito
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFiltro('FINALIZADO')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      statusFiltro === 'FINALIZADO'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    Finalizados
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DADOS RESUMIDOS DO DIA SELECIONADO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-[#C6A96B]/70 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5 text-[#DFBA73]" />
                Veículos no Dia
              </div>
              <div className="text-2xl font-bold text-white">{totalNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">cadastrados</div>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-[#DFBA73] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Em Trânsito
              </div>
              <div className="text-2xl font-bold text-[#DFBA73]">{totalEmTransitoNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">aguardando retorno</div>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalizados
              </div>
              <div className="text-2xl font-bold text-emerald-400">{totalFinalizadosNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">viagens concluídas</div>
            </div>

            <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-[#C6A96B]/80 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
                Operadores
              </div>
              <div className="text-2xl font-bold text-white">{operadoresDoDia.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">atuantes no dia</div>
            </div>
          </div>

          {/* LISTA PREVIA DOS VEÍCULOS DO DIA SELECIONADO */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#DFBA73] uppercase tracking-wider">
                Informações dos Veículos do Dia ({totalNoDia})
              </h3>
              <span className="text-xs text-[#C6A96B]/60">
                Auditado por Operadores de Cadastro
              </span>
            </div>

            {totalNoDia === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-black/30 rounded-xl border border-dashed border-[#B08D57]/20">
                Nenhum registro de veículo encontrado para a data{' '}
                <strong className="text-slate-200">
                  {dataSelecionada ? new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR') : 'selecionada'}
                </strong>
                .
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {registrosFiltrados.map((r, idx) => {
                  const isFinalizado = r.status === 'FINALIZADO';
                  return (
                    <div
                      key={`${r.id}-${idx}`}
                      className="bg-black/40 border border-[#B08D57]/15 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#C6A96B]/70 w-5">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            {r.secretaria === 'Secretaria da Agricultura' && r.fct && r.fct !== 'N/A' && r.fct !== '-' ? (
                              <strong className="text-white font-bold text-sm">FCT: {r.fct}</strong>
                            ) : (
                              <span className="text-emerald-400 font-semibold text-xs bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                                Sem FCT
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                r.secretaria === 'Secretaria da Agricultura'
                                  ? 'bg-[#B08D57]/20 text-[#DFBA73] border-[#B08D57]/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                              }`}
                            >
                              {r.secretaria === 'Secretaria da Agricultura' ? 'Agricultura' : 'Turismo'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isFinalizado
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                  : 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40'
                              }`}
                            >
                              {isFinalizado ? 'Finalizado' : 'Em Trânsito'}
                            </span>
                          </div>
                          <div className="text-slate-300 mt-0.5">
                            Motorista: <strong className="text-slate-100">{r.motorista}</strong>
                            {r.placa && ` • Placa: ${r.placa}`}
                            {r.andar && ` • Andar ${r.andar}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-slate-300">
                          Saída: <span className="text-[#DFBA73] font-mono font-semibold">{r.horarioSaida || '-'}</span> | Chegada:{' '}
                          <span className="text-white font-mono font-semibold">{r.horarioChegada || 'Em trânsito'}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Operador: <span className="text-slate-200 font-medium">{r.funcionarioResponsavel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CANAIS PARA ENVIAR O RELATÓRIO DO DIA */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#DFBA73]" />
              2. Como deseja Enviar ou Compartilhar o Relatório?
            </h3>
            <p className="text-xs text-[#C6A96B]/70">
              Escolha o canal de envio com todas as informações consolidadas da data selecionada:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Botão 1: Compartilhar Arquivo PDF (WhatsApp / Apps) */}
              <button
                type="button"
                onClick={handleCompartilharPdf}
                disabled={compartilhando}
                className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px] border border-[#DFBA73]/40"
              >
                <Share2 className="w-4 h-4" />
                <span>{compartilhando ? 'Processando...' : 'Compartilhar PDF'}</span>
              </button>

              {/* Botão 2: Enviar por WhatsApp */}
              <button
                type="button"
                onClick={handleEnviarWhatsApp}
                className="flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar p/ WhatsApp</span>
              </button>

              {/* Botão 3: Enviar por E-mail */}
              <button
                type="button"
                onClick={handleEnviarEmail}
                className="flex items-center justify-center gap-2.5 bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-white border border-[#B08D57]/40 px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                <Mail className="w-4 h-4 text-[#DFBA73]" />
                <span>Enviar p/ E-mail</span>
              </button>

              {/* Botão 4: Baixar PDF Oficial */}
              <button
                type="button"
                onClick={handleBaixarPdf}
                className="flex items-center justify-center gap-2.5 bg-black/60 hover:bg-black/90 text-[#DFBA73] border border-[#B08D57]/40 px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF Oficial</span>
              </button>
            </div>

            {/* Opção secundária: Copiar Relatório em Texto */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCopiarTexto}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-black/50 hover:bg-[#B08D57]/20 px-3.5 py-2 rounded-xl border border-[#B08D57]/20 cursor-pointer transition-colors"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copiado para a área de transferência!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#C6A96B]/60" />
                    <span>Copiar Texto do Relatório</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-black/40 px-6 py-4 border-t border-[#B08D57]/20 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#C6A96B]/70 flex items-center gap-2">
            <span className="font-semibold text-[#DFBA73]">Desenvolvido por Siolly Technology</span>
            <span>•</span>
            <span>Documento Oficial Auditado</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-white font-bold text-sm cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal para Escolha do Destinatário do WhatsApp */}
      <WhatsAppSelectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onConfirmSend={handleConfirmarEnvioWhatsApp}
        textoRelatorio={PdfService.gerarTextoRelatorio({
          registros: registrosFiltrados,
          secretariaFiltro,
          dataFiltro: dataSelecionada,
          usuario,
        })}
        dataRelatorio={dataSelecionada}
        usuarioAtual={usuario}
      />
    </div>
  );
};
