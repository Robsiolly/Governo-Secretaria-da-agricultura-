import React, { useState, useEffect, useMemo } from 'react';
import { RegistroVeiculo, UsuarioAutenticado, FiltrosRegistros, Secretaria } from './types';
import { getLocalDateString } from './utils/dateUtils';
import { StorageService } from './services/storageService';
import { FirebaseSyncService } from './services/firebaseSyncService';
import { PdfService } from './services/pdfService';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { FiltersBar } from './components/FiltersBar';
import { PainelDiarioSubPasta } from './components/PainelDiarioSubPasta';
import { RecordsTable } from './components/RecordsTable';
import { VehicleRegistrationModal } from './components/VehicleRegistrationModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { QuickTimeModal } from './components/QuickTimeModal';
import { CreateOperatorModal } from './components/CreateOperatorModal';
import { SendReportModal } from './components/SendReportModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DailyControlModal } from './components/DailyControlModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { StatsMetricsModal } from './components/StatsMetricsModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { DailyCardsView } from './components/DailyCardsView';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Footer } from './components/Footer';
import { CheckCircle2, FileText, Plus, Calendar, LayoutGrid, List, FolderGit2 } from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [registros, setRegistros] = useState<RegistroVeiculo[]>([]);
  const [subPastaAtiva, setSubPastaAtiva] = useState<'GESTAO' | 'PAINEL_DIARIO'>('GESTAO');
  const [modoVisualizacao, setModoVisualizacao] = useState<'CARTOES' | 'TABELA'>('CARTOES');
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalNovoOperadorOpen, setIsModalNovoOperadorOpen] = useState(false);
  const [isModalEnviarRelatorioOpen, setIsModalEnviarRelatorioOpen] = useState(false);
  const [isModalAlterarSenhaOpen, setIsModalAlterarSenhaOpen] = useState(false);
  const [isModalPainelDiarioOpen, setIsModalPainelDiarioOpen] = useState(false);
  const [isModalResumoTurnoOpen, setIsModalResumoTurnoOpen] = useState(false);
  const [isModalEstatisticasOpen, setIsModalEstatisticasOpen] = useState(false);
  const [isModalExportarExcelOpen, setIsModalExportarExcelOpen] = useState(false);
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroVeiculo | null>(null);
  const [registroSelecionadoDetalhes, setRegistroSelecionadoDetalhes] = useState<RegistroVeiculo | null>(null);
  const [registroAjusteHorarios, setRegistroAjusteHorarios] = useState<RegistroVeiculo | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  const [painelFiltroSecretaria, setPainelFiltroSecretaria] = useState<'TODAS' | Secretaria>('TODAS');
  const [painelFiltroStatus, setPainelFiltroStatus] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');

  const [filtros, setFiltros] = useState<FiltrosRegistros>({
    secretaria: 'TODAS',
    data: getLocalDateString(),
    busca: '',
    status: 'TODOS',
  });

  // Carregar autenticação inicial e registros com sincronização ao vivo (Local + Cloud Firebase)
  useEffect(() => {
    const carregarDados = () => {
      const user = StorageService.getUsuarioAutenticado();
      if (user) {
        setUsuario(user);
      }
      const regs = StorageService.getRegistros();
      setRegistros(regs);
    };

    carregarDados();

    // Iniciar escuta do banco de dados Firebase Firestore em tempo real
    FirebaseSyncService.iniciarSincronizacaoAoVivo();

    // Sincronização ao vivo instantânea entre abas e componentes da mesma tela
    const handleSincronizacao = () => {
      carregarDados();
    };

    window.addEventListener('storage', handleSincronizacao);
    window.addEventListener('app_data_changed', handleSincronizacao);

    return () => {
      window.removeEventListener('storage', handleSincronizacao);
      window.removeEventListener('app_data_changed', handleSincronizacao);
    };
  }, []);

  const exibirToast = (mensagem: string) => {
    setToastMensagem(mensagem);
    setTimeout(() => {
      setToastMensagem(null);
    }, 4000);
  };

  const handleLoginSuccess = (usr: UsuarioAutenticado) => {
    setUsuario(usr);
    exibirToast(`Bem-vindo, ${usr.nome}! Acesso autenticado com sucesso.`);
  };

  const handleLogout = () => {
    StorageService.setUsuarioAutenticado(null);
    setUsuario(null);
  };

  const handleSalvarRegistro = (dadosRegistro: Omit<RegistroVeiculo, 'id' | 'criadoEm'> & { id?: string }) => {
    const registroSalvo = StorageService.salvarRegistro(dadosRegistro);
    setRegistros(StorageService.getRegistros());
    exibirToast(`Registro ${registroSalvo.fct} gravado com sucesso!`);
    setIsModalCadastroOpen(false);
    setRegistroEmEdicao(null);
  };

  const handleExcluirRegistro = (id: string) => {
    StorageService.excluirRegistro(id);
    setRegistros(StorageService.getRegistros());
    setRegistroSelecionadoDetalhes(null);
    exibirToast('Registro excluído com sucesso.');
  };

  const handleFinalizarViagem = (id: string, horarioChegada: string) => {
    const reg = registros.find(r => r.id === id);
    if (!reg) return;

    StorageService.salvarRegistro({
      ...reg,
      horarioChegada,
      status: 'FINALIZADO',
    });

    setRegistros(StorageService.getRegistros());
    if (registroSelecionadoDetalhes?.id === id) {
      setRegistroSelecionadoDetalhes({
        ...registroSelecionadoDetalhes,
        horarioChegada,
        status: 'FINALIZADO',
      });
    }
    exibirToast(`Chegada registrada para ${reg.fct} às ${horarioChegada}.`);
  };

  const handleSalvarHorarios = (id: string, horarioSaida: string, horarioChegada: string, ocorrencia?: string) => {
    const reg = registros.find(r => r.id === id);
    if (!reg) return;

    const statusAtualizado = horarioChegada.trim() ? 'FINALIZADO' : 'EM_TRANSITO';

    const regAtualizado = StorageService.salvarRegistro({
      ...reg,
      horarioSaida,
      horarioChegada: horarioChegada.trim() || undefined,
      ocorrencia: ocorrencia !== undefined ? ocorrencia : reg.ocorrencia,
      status: statusAtualizado,
    });

    setRegistros(StorageService.getRegistros());
    if (registroSelecionadoDetalhes?.id === id) {
      setRegistroSelecionadoDetalhes(regAtualizado);
    }
    exibirToast(`Horários de saída/chegada de ${reg.fct} atualizados com sucesso!`);
  };

  const handleExportarPdf = () => {
    PdfService.gerarRelatorioDiario({
      registros: registrosFiltrados,
      secretariaFiltro: filtros.secretaria,
      dataFiltro: filtros.data,
      usuario,
    });
    exibirToast('Relatório Diário em PDF gerado e pronto para download!');
  };

  // Filtragem
  const registrosFiltrados = useMemo(() => {
    return registros.filter(reg => {
      // Filtro por Secretaria
      if (filtros.secretaria !== 'TODAS' && reg.secretaria !== filtros.secretaria) {
        return false;
      }

      // Filtro por Data Específica
      if (filtros.data && reg.data !== filtros.data) {
        return false;
      }

      // Filtro por Status
      if (filtros.status !== 'TODOS' && reg.status !== filtros.status) {
        return false;
      }

      // Busca Textual
      if (filtros.busca.trim()) {
        const termo = filtros.busca.toLowerCase();
        const coincide =
          reg.motorista.toLowerCase().includes(termo) ||
          reg.fct.toLowerCase().includes(termo) ||
          (reg.placa && reg.placa.toLowerCase().includes(termo)) ||
          (reg.modeloVeiculo && reg.modeloVeiculo.toLowerCase().includes(termo)) ||
          (reg.destino && reg.destino.toLowerCase().includes(termo)) ||
          (reg.ocorrencia && reg.ocorrencia.toLowerCase().includes(termo)) ||
          (reg.matriculaFuncionario && reg.matriculaFuncionario.toLowerCase().includes(termo)) ||
          reg.funcionarioResponsavel.toLowerCase().includes(termo);

        if (!coincide) return false;
      }

      return true;
    });
  }, [registros, filtros]);

  // Se não estiver logado, exibe tela de login governamental
  if (!usuario) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-black text-[#F3F3F1] flex flex-col selection:bg-white selection:text-black relative overflow-hidden">
      {/* Ambient BMW/Apple Stage Glow with enhanced glass lighting */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[350px] bg-[#5A3A2E]/25 rounded-full blur-[150px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[300px] bg-[#D97924]/15 rounded-full blur-[170px] pointer-events-none" />

      {/* Toast Notification */}
      {toastMensagem && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#252525]/90 border border-[#6B6B6B]/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-2xl">
          <CheckCircle2 className="w-4 h-4 text-[#D97924] shrink-0" />
          <span>{toastMensagem}</span>
        </div>
      )}

      {/* Header com identificação das duas secretarias */}
      <Header
        usuario={usuario}
        onNovoRegistro={() => {
          setRegistroEmEdicao(null);
          setIsModalCadastroOpen(true);
        }}
        onNovoOperador={() => setIsModalNovoOperadorOpen(true)}
        onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
        onResumoTurno={() => setIsModalResumoTurnoOpen(true)}
        onExportarPdf={handleExportarPdf}
        onEstatisticas={() => setIsModalEstatisticasOpen(true)}
        onExportarExcel={() => setIsModalExportarExcelOpen(true)}
        onAlterarSenha={() => setIsModalAlterarSenhaOpen(true)}
        onLogout={handleLogout}
        totalRegistros={registros.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">
        {/* Banner de Instalação PWA no Celular */}
        <PwaInstallPrompt />

        {/* Abas de Navegação Principal / Sub-Pastas do App com Efeito Vidro Avançado (Glassmorphism) */}
        <div className="bg-[#252525]/70 border border-[#6B6B6B]/30 p-2.5 rounded-3xl flex items-center justify-between gap-2 shadow-2xl backdrop-blur-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSubPastaAtiva('GESTAO')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                subPastaAtiva === 'GESTAO'
                  ? 'bg-white text-black shadow-2xl font-bold'
                  : 'text-[#6B6B6B] hover:text-white bg-black/40 border border-[#6B6B6B]/30 backdrop-blur-md'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Gestão de Registros & Busca</span>
            </button>

            <button
              type="button"
              onClick={() => setSubPastaAtiva('PAINEL_DIARIO')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                subPastaAtiva === 'PAINEL_DIARIO'
                  ? 'bg-white text-black shadow-2xl font-bold'
                  : 'text-[#6B6B6B] hover:text-white bg-black/40 border border-[#6B6B6B]/30 backdrop-blur-md'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#D97924]" />
              <span>Painel Diário</span>
            </button>
          </div>
        </div>

        {subPastaAtiva === 'PAINEL_DIARIO' ? (
          <PainelDiarioSubPasta
            registros={registros}
            onVerDetalhes={(reg) => setRegistroSelecionadoDetalhes(reg)}
            onAjustarHorarios={(reg) => setRegistroAjusteHorarios(reg)}
            onNovoRegistro={() => {
              setRegistroEmEdicao(null);
              setIsModalCadastroOpen(true);
            }}
            onExportarPdf={handleExportarPdf}
            usuarioAtual={usuario}
          />
        ) : (
          <>
            {/* Card de Busca Compacto e Filtros */}
            <FiltersBar
              filtros={filtros}
              onChangeFiltros={setFiltros}
              totalFiltrados={registrosFiltrados.length}
              totalGeral={registros.length}
              onExportarPdfFiltrado={handleExportarPdf}
              onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
            />

            {/* Listagem de Registros */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-750 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>Listagem de Veículos Cadastrados</span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                        {modoVisualizacao === 'CARTOES' ? 'Cartões' : 'Tabela'}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao('CARTOES')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modoVisualizacao === 'CARTOES'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cartões</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModoVisualizacao('TABELA')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modoVisualizacao === 'TABELA'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Tabela</span>
                    </button>
                  </div>
                </div>
              </div>

              {modoVisualizacao === 'CARTOES' ? (
                <DailyCardsView
                  registros={registrosFiltrados}
                  onVerDetalhes={(reg) => setRegistroSelecionadoDetalhes(reg)}
                  onAjustarHorarios={(reg) => setRegistroAjusteHorarios(reg)}
                  onNovoRegistro={() => {
                    setRegistroEmEdicao(null);
                    setIsModalCadastroOpen(true);
                  }}
                  onAbrirModalCompleto={() => setSubPastaAtiva('PAINEL_DIARIO')}
                  usuarioAtual={usuario}
                  filtros={filtros}
                  onFiltrosChange={setFiltros}
                />
              ) : (
                <RecordsTable
                  registros={registrosFiltrados}
                  onVerDetalhes={(reg) => setRegistroSelecionadoDetalhes(reg)}
                  onEditar={(reg) => {
                    setRegistroEmEdicao(reg);
                    setIsModalCadastroOpen(true);
                  }}
                  onEditarHorarios={(reg) => setRegistroAjusteHorarios(reg)}
                  onExcluir={handleExcluirRegistro}
                  onNovoRegistro={() => {
                    setRegistroEmEdicao(null);
                    setIsModalCadastroOpen(true);
                  }}
                  usuarioAtual={usuario}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal de Cadastro / Edição com campos solicitados e assinatura */}
      <VehicleRegistrationModal
        isOpen={isModalCadastroOpen}
        onClose={() => {
          setIsModalCadastroOpen(false);
          setRegistroEmEdicao(null);
        }}
        onSalvar={handleSalvarRegistro}
        registroEdicao={registroEmEdicao}
        usuarioAtual={usuario}
      />

      {/* Modal de Detalhes do Registro com Assinatura em alta definição */}
      <RecordDetailModal
        registro={registroSelecionadoDetalhes}
        onClose={() => setRegistroSelecionadoDetalhes(null)}
        onEdit={(reg) => {
          setRegistroSelecionadoDetalhes(null);
          setRegistroEmEdicao(reg);
          setIsModalCadastroOpen(true);
        }}
        onEditarHorarios={(reg) => setRegistroAjusteHorarios(reg)}
        onDelete={handleExcluirRegistro}
        onFinalizarViagem={handleFinalizarViagem}
        usuarioAtual={usuario}
      />

      {/* Modal de Acesso Rápido para Alterar Horários de Saída e Chegada */}
      <QuickTimeModal
        registro={registroAjusteHorarios}
        isOpen={!!registroAjusteHorarios}
        onClose={() => setRegistroAjusteHorarios(null)}
        onSalvarHorarios={handleSalvarHorarios}
      />

      {/* Modal para Criar Conta de Operador e Senha */}
      <CreateOperatorModal
        isOpen={isModalNovoOperadorOpen}
        onClose={() => setIsModalNovoOperadorOpen(false)}
        usuarioAtual={usuario}
        onOperadorCriado={(novoOp) => {
          if (usuario && usuario.id === novoOp.id) {
            setUsuario(novoOp);
            StorageService.setUsuarioAutenticado(novoOp);
          }
          exibirToast(`Conta de Operador salva: ${novoOp.nome} (${novoOp.matricula})`);
        }}
      />

      {/* Modal para Emitir e Enviar Relatório de Qualquer Dia */}
      <SendReportModal
        isOpen={isModalEnviarRelatorioOpen}
        onClose={() => setIsModalEnviarRelatorioOpen(false)}
        registrosTotais={registros}
        usuario={usuario}
        dataInicial={filtros.data || ''}
        secretariaInicial={filtros.secretaria}
        onToast={exibirToast}
      />

      {/* Modal para Alterar Senha do Operador */}
      <ChangePasswordModal
        isOpen={isModalAlterarSenhaOpen}
        onClose={() => setIsModalAlterarSenhaOpen(false)}
        usuario={usuario}
        onSuccess={exibirToast}
      />

      {/* Modal do Painel de Controle de Cadastros Diários */}
      <DailyControlModal
        isOpen={isModalPainelDiarioOpen}
        onClose={() => setIsModalPainelDiarioOpen(false)}
        registros={registros}
        filtroSecretariaInicial={painelFiltroSecretaria}
        filtroStatusInicial={painelFiltroStatus}
        onSelecionarRegistro={(reg) => {
          setRegistroSelecionadoDetalhes(reg);
        }}
        onAjustarHorarios={(reg) => {
          setRegistroAjusteHorarios(reg);
        }}
        onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
        onAbrirCadastro={() => setIsModalCadastroOpen(true)}
      />

      <ShiftSummaryModal
        isOpen={isModalResumoTurnoOpen}
        onClose={() => setIsModalResumoTurnoOpen(false)}
        registros={registros}
      />

      {/* Modal de Estatísticas & Métricas de Viagens */}
      <StatsMetricsModal
        isOpen={isModalEstatisticasOpen}
        onClose={() => setIsModalEstatisticasOpen(false)}
        registros={registros}
        usuario={usuario}
        onToast={exibirToast}
      />

      {/* Modal para Exportação para Excel (.CSV / .XLS) */}
      <ExportExcelModal
        isOpen={isModalExportarExcelOpen}
        onClose={() => setIsModalExportarExcelOpen(false)}
        registros={registros}
        onToast={exibirToast}
      />

      {/* Rodapé com crédito para Roberto */}
      <Footer />


    </div>
  );
}
