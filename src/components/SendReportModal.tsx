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
  Compass,
  ChevronLeft,
  ChevronRight,
  Car,
  Clock,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

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
  const hojeStr = new Date().toISOString().split('T')[0];
  const [dataSelecionada, setDataSelecionada] = useState<string>(dataInicial || hojeStr);
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>(secretariaInicial);
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [copiado, setCopiado] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);

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
    setDataSelecionada(d.toISOString().split('T')[0]);
  };

  const definirHoje = () => {
    setDataSelecionada(hojeStr);
  };

  const definirOntem = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    setDataSelecionada(ontem.toISOString().split('T')[0]);
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

  // 3. Enviar por WhatsApp
  const handleEnviarWhatsApp = () => {
    const texto = PdfService.gerarTextoRelatorio({
      registros: registrosFiltrados,
      secretariaFiltro,
      dataFiltro: dataSelecionada,
      usuario,
    });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    onToast('Abrindo WhatsApp com o relatório do dia selecionado...');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="modal-enviar-relatorio-container"
        className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-950 px-6 py-5 border-b-2 border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Emitir e Enviar Relatório por Dia
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Selecione qualquer dia para acessar os dados e enviar o relatório oficial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* AVISO DE SIGILO DAS SENHAS */}
          <div className="bg-emerald-950/40 border-2 border-emerald-600/40 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-200">
              <strong className="text-emerald-300 font-bold block mb-0.5">
                Segurança e Sigilo de Credenciais Ativos
              </strong>
              As senhas criadas pelos operadores são estritamente sigilosas e criptografadas.
              Nenhuma senha de operador é mostrada ou incluída nos relatórios impressos, digitais, em PDF ou enviados.
            </div>
          </div>

          {/* PAINEL DE SELEÇÃO DE DATA */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
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
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={definirOntem}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                >
                  Ontem
                </button>
                <button
                  type="button"
                  onClick={definirTodosDias}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dataSelecionada === ''
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
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
                  className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-700 cursor-pointer shrink-0 transition-colors"
                  title="Dia anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-4 py-2.5 text-base text-white font-bold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer min-h-[44px]"
                />

                <button
                  type="button"
                  onClick={() => alterarDia(1)}
                  className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-700 cursor-pointer shrink-0 transition-colors"
                  title="Próximo dia"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-5 text-sm font-semibold text-amber-300 capitalize bg-amber-950/30 border border-amber-500/30 px-3.5 py-2.5 rounded-2xl text-center">
                {dataFormatadaExibicao}
              </div>
            </div>

            {/* Filtros complementares: Secretaria e Situação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Secretaria:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSecretariaFiltro('TODAS')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      secretariaFiltro === 'TODAS'
                        ? 'bg-slate-700 text-white shadow-sm'
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
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-emerald-300'
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
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <Compass className="w-3 h-3" />
                    <span>Turismo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Situação da Frota:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStatusFiltro('TODOS')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      statusFiltro === 'TODOS'
                        ? 'bg-slate-700 text-white shadow-sm'
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
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    Em Trânsito
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFiltro('FINALIZADO')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      statusFiltro === 'FINALIZADO'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-emerald-300'
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
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Veículos no Dia
              </div>
              <div className="text-2xl font-black text-white">{totalNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">cadastrados</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />
                Em Trânsito
              </div>
              <div className="text-2xl font-black text-amber-300">{totalEmTransitoNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">aguardando retorno</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalizados
              </div>
              <div className="text-2xl font-black text-emerald-300">{totalFinalizadosNoDia}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">viagens concluídas</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                Operadores
              </div>
              <div className="text-2xl font-black text-sky-300">{operadoresDoDia.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">atuantes no dia</div>
            </div>
          </div>

          {/* LISTA PREVIA DOS VEÍCULOS DO DIA SELECIONADO */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Informações dos Veículos do Dia ({totalNoDia})
              </h3>
              <span className="text-xs text-slate-400">
                Auditado por Operadores de Cadastro
              </span>
            </div>

            {totalNoDia === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
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
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            {r.secretaria === 'Secretaria da Agricultura' && r.fct && r.fct !== 'N/A' && r.fct !== '-' ? (
                              <strong className="text-white font-bold text-sm">FCT: {r.fct}</strong>
                            ) : (
                              <span className="text-amber-300 font-semibold text-xs bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                                Sem FCT
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                r.secretaria === 'Secretaria da Agricultura'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border-amber-800'
                              }`}
                            >
                              {r.secretaria === 'Secretaria da Agricultura' ? 'Agricultura' : 'Turismo'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isFinalizado
                                  ? 'bg-emerald-900/60 text-emerald-200'
                                  : 'bg-amber-900/60 text-amber-200'
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
                          Saída: <span className="text-white font-semibold">{r.horarioSaida || '-'}</span> | Chegada:{' '}
                          <span className="text-white font-semibold">{r.horarioChegada || 'Em trânsito'}</span>
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
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              2. Como deseja Enviar ou Compartilhar o Relatório?
            </h3>
            <p className="text-xs text-slate-400">
              Escolha o canal de envio com todas as informações consolidadas da data selecionada:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Botão 1: Compartilhar Arquivo PDF (WhatsApp / Apps) */}
              <button
                type="button"
                onClick={handleCompartilharPdf}
                disabled={compartilhando}
                className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
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
                className="flex items-center justify-center gap-2.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar p/ E-mail</span>
              </button>

              {/* Botão 4: Baixar PDF Oficial */}
              <button
                type="button"
                onClick={handleBaixarPdf}
                className="flex items-center justify-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-all min-h-[48px]"
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
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 cursor-pointer transition-colors"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copiado para a área de transferência!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Texto do Relatório</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-950 px-6 py-4 border-t-2 border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-300">2026 Desenvolvido por Roberto</span>
            <span>•</span>
            <span>Documento Oficial Auditado</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
