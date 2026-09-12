import React, { useState, useEffect, useMemo } from 'react';
import { RegistroVeiculo, UsuarioAutenticado, FiltrosRegistros, Secretaria } from './types';
import { StorageService } from './services/storageService';
import { FirebaseSyncService } from './services/firebaseSyncService';
import { PdfService } from './services/pdfService';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { FiltersBar } from './components/FiltersBar';
import { AdminSummaryBar } from './components/AdminSummaryBar';
import { RecordsTable } from './components/RecordsTable';
import { VehicleRegistrationModal } from './components/VehicleRegistrationModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { QuickTimeModal } from './components/QuickTimeModal';
import { CreateOperatorModal } from './components/CreateOperatorModal';
import { SendReportModal } from './components/SendReportModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DailyControlModal } from './components/DailyControlModal';
import { DailyCardsView } from './components/DailyCardsView';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Footer } from './components/Footer';
import { CheckCircle2, FileText, Plus, Calendar, LayoutGrid, List } from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [registros, setRegistros] = useState<RegistroVeiculo[]>([]);
  const [modoVisualizacao, setModoVisualizacao] = useState<'CARTOES' | 'TABELA'>('CARTOES');
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalNovoOperadorOpen, setIsModalNovoOperadorOpen] = useState(false);
  const [isModalEnviarRelatorioOpen, setIsModalEnviarRelatorioOpen] = useState(false);
  const [isModalAlterarSenhaOpen, setIsModalAlterarSenhaOpen] = useState(false);
  const [isModalPainelDiarioOpen, setIsModalPainelDiarioOpen] = useState(false);
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroVeiculo | null>(null);
  const [registroSelecionadoDetalhes, setRegistroSelecionadoDetalhes] = useState<RegistroVeiculo | null>(null);
  const [registroAjusteHorarios, setRegistroAjusteHorarios] = useState<RegistroVeiculo | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  const [painelFiltroSecretaria, setPainelFiltroSecretaria] = useState<'TODAS' | Secretaria>('TODAS');
  const [painelFiltroStatus, setPainelFiltroStatus] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');

  const [filtros, setFiltros] = useState<FiltrosRegistros>({
    secretaria: 'TODAS',
    data: '',
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

  const handleSalvarHorarios = (id: string, horarioSaida: string, horarioChegada: string) => {
    const reg = registros.find(r => r.id === id);
    if (!reg) return;

    const statusAtualizado = horarioChegada.trim() ? 'FINALIZADO' : 'EM_TRANSITO';

    const regAtualizado = StorageService.salvarRegistro({
      ...reg,
      horarioSaida,
      horarioChegada: horarioChegada.trim() || undefined,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Toast Notification */}
      {toastMensagem && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/60 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
        onExportarPdf={handleExportarPdf}
        onAlterarSenha={() => setIsModalAlterarSenhaOpen(true)}
        onLogout={handleLogout}
        totalRegistros={registros.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Banner de Instalação PWA no Celular */}
        <PwaInstallPrompt />

        {/* Painel Resumo Rápido de Frota e Tráfego */}
        <AdminSummaryBar
          registros={registros}
          onFiltrarSecretaria={(sec) => {
            setFiltros(prev => ({ ...prev, secretaria: sec, status: 'TODOS' }));
            setPainelFiltroSecretaria(sec);
            setPainelFiltroStatus('TODOS');
            setModoVisualizacao('CARTOES');
            setIsModalPainelDiarioOpen(true);
          }}
          onFiltrarStatus={(st) => {
            setFiltros(prev => ({ ...prev, status: st, secretaria: 'TODAS' }));
            setPainelFiltroSecretaria('TODAS');
            setPainelFiltroStatus(st);
            setModoVisualizacao('CARTOES');
            setIsModalPainelDiarioOpen(true);
          }}
          onFiltrarSecretariaEStatus={(sec, st) => {
            setFiltros(prev => ({ ...prev, secretaria: sec, status: st }));
            setPainelFiltroSecretaria(sec);
            setPainelFiltroStatus(st);
            setModoVisualizacao('CARTOES');
            setIsModalPainelDiarioOpen(true);
          }}
        />

        {/* Barra de Filtros com secretaria e data específica */}
        <FiltersBar
          filtros={filtros}
          onChangeFiltros={setFiltros}
          totalFiltrados={registrosFiltrados.length}
          totalGeral={registros.length}
          onExportarPdfFiltrado={handleExportarPdf}
          onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
          onAbrirPainelDiario={() => {
            setModoVisualizacao('CARTOES');
            setIsModalPainelDiarioOpen(true);
          }}
        />

        {/* Listagem de Registros com Alternância: Painel Diário (Cartões) ou Tabela Completa */}
        <div className="space-y-4">
          {/* Banner com Seletor Direto de Modo de Exibição */}
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
                <Calendar className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <span>Visualização dos Registros</span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                    {modoVisualizacao === 'CARTOES' ? 'Painel Diário (Lista Resumida)' : 'Tabela Completa'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Exibição instantânea dos registros diários em lista compacta ou tabela detalhada
                </p>
              </div>
            </div>

            {/* Alternador de visualização direto */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-750 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('CARTOES')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    modoVisualizacao === 'CARTOES'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Painel em Lista</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModoVisualizacao('TABELA')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    modoVisualizacao === 'TABELA'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Tabela Detalhada</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPainelFiltroSecretaria('TODAS');
                  setPainelFiltroStatus('TODOS');
                  setModoVisualizacao('CARTOES');
                  setIsModalPainelDiarioOpen(true);
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Abrir em Janela Flutuante"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Janela Modal</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {modoVisualizacao === 'CARTOES' ? 'Painel Diário de Circulação (Cartões)' : 'Registros de Tráfego em Tabela'}
              </span>
            </h2>

            <button
              type="button"
              onClick={() => {
                setRegistroEmEdicao(null);
                setIsModalCadastroOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-base text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 px-4 py-2.5 rounded-2xl font-bold transition-all shadow-md cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <span>Cadastrar Novo Veículo</span>
            </button>
          </div>

          {/* Renderização do Painel Diário em Cartões ou Tabela Completa */}
          {modoVisualizacao === 'CARTOES' ? (
            <DailyCardsView
              registros={registros}
              onVerDetalhes={(reg) => setRegistroSelecionadoDetalhes(reg)}
              onAjustarHorarios={(reg) => setRegistroAjusteHorarios(reg)}
              onNovoRegistro={() => {
                setRegistroEmEdicao(null);
                setIsModalCadastroOpen(true);
              }}
              onAbrirModalCompleto={() => {
                setPainelFiltroSecretaria('TODAS');
                setPainelFiltroStatus('TODOS');
                setIsModalPainelDiarioOpen(true);
              }}
              usuarioAtual={usuario}
              filtroSecretariaInicial={painelFiltroSecretaria}
              filtroStatusInicial={painelFiltroStatus}
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
          exibirToast(`Conta de Operador criada: ${novoOp.nome} (${novoOp.matricula})`);
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

      {/* Rodapé com crédito para Roberto */}
      <Footer />

      {/* Botão Flutuante Rápido de Acesso ao Painel Diário */}
      <button
        type="button"
        onClick={() => {
          setPainelFiltroSecretaria('TODAS');
          setPainelFiltroStatus('TODOS');
          setModoVisualizacao('CARTOES');
          setIsModalPainelDiarioOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-2xl shadow-emerald-950/90 border-2 border-emerald-300/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Clique aqui para abrir o Painel Diário de Controle"
      >
        <Calendar className="w-5 h-5 text-white animate-bounce" />
        <span className="hidden xs:inline">Painel Diário</span>
      </button>
    </div>
  );
}
