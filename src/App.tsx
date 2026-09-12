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
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Footer } from './components/Footer';
import { CheckCircle2, FileText, Plus, RefreshCw } from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [registros, setRegistros] = useState<RegistroVeiculo[]>([]);
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalNovoOperadorOpen, setIsModalNovoOperadorOpen] = useState(false);
  const [isModalEnviarRelatorioOpen, setIsModalEnviarRelatorioOpen] = useState(false);
  const [isModalAlterarSenhaOpen, setIsModalAlterarSenhaOpen] = useState(false);
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroVeiculo | null>(null);
  const [registroSelecionadoDetalhes, setRegistroSelecionadoDetalhes] = useState<RegistroVeiculo | null>(null);
  const [registroAjusteHorarios, setRegistroAjusteHorarios] = useState<RegistroVeiculo | null>(null);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

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

      // Filtro por Busca livre
      if (filtros.busca.trim()) {
        const termo = filtros.busca.toLowerCase();
        const coincide =
          reg.motorista.toLowerCase().includes(termo) ||
          reg.fct.toLowerCase().includes(termo) ||
          (reg.placa && reg.placa.toLowerCase().includes(termo)) ||
          (reg.andar && reg.andar.toLowerCase().includes(termo)) ||
          (reg.funcionarioResponsavel && reg.funcionarioResponsavel.toLowerCase().includes(termo)) ||
          (reg.modeloVeiculo && reg.modeloVeiculo.toLowerCase().includes(termo)) ||
          (reg.destino && reg.destino.toLowerCase().includes(termo));

        if (!coincide) return false;
      }

      return true;
    });
  }, [registros, filtros]);

  // Se não estiver logado, exibe a tela de login institucional segura
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
          onFiltrarSecretaria={(sec) => setFiltros(prev => ({ ...prev, secretaria: sec }))}
          onFiltrarStatus={(st) => setFiltros(prev => ({ ...prev, status: st }))}
        />

        {/* Barra de Filtros com secretaria e data específica */}
        <FiltersBar
          filtros={filtros}
          onChangeFiltros={setFiltros}
          totalFiltrados={registrosFiltrados.length}
          totalGeral={registros.length}
          onExportarPdfFiltrado={handleExportarPdf}
          onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
        />

        {/* Listagem de Registros */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Registros de Tráfego e Circulação</span>
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

      {/* Rodapé com crédito para Roberto */}
      <Footer />
    </div>
  );
}
