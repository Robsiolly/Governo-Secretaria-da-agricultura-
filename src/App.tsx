import React, { useState, useEffect } from 'react';
import { RegistroVeiculo, UsuarioAutenticado, FiltrosRegistros } from './types';
import { 
  obterRegistros, 
  salvarRegistro, 
  excluirRegistro, 
  obterSessao, 
  encerrarSessao 
} from './services/storageService';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { RecordsTable } from './components/RecordsTable';
import { DailyCardsView } from './components/DailyCardsView';
import { VehicleRegistrationModal } from './components/VehicleRegistrationModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { QuickTimeModal } from './components/QuickTimeModal';
import { LoginScreen } from './components/LoginScreen';
import { CreateOperatorModal } from './components/CreateOperatorModal';
import { SendReportModal } from './components/SendReportModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { StatsMetricsModal } from './components/StatsMetricsModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { PainelDiarioSubPasta } from './components/PainelDiarioSubPasta';
import { gerarRelatorioGeralPDF } from './services/pdfService';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Footer } from './components/Footer';
import { CheckCircle2, FileText, Plus, Calendar, LayoutGrid, List, FolderGit2 } from 'lucide-react';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [registros, setRegistros] = useState<RegistroVeiculo[]>([]);
  const [subPastaAtiva, setSubPastaAtiva] = useState<'GESTAO' | 'PAINEL_DIARIO'>('GESTAO');
  const [modoVisualizacao, setModoVisualizacao] = useState<'CARTOES' | 'TABELA'>('CARTOES');
  
  const [filtros, setFiltros] = useState<FiltrosRegistros>({
    secretaria: 'TODAS',
    data: '',
    busca: '',
    status: 'TODOS',
  });

  // Modals state
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalOperadorOpen, setIsModalOperadorOpen] = useState(false);
  const [isModalEnviarRelatorioOpen, setIsModalEnviarRelatorioOpen] = useState(false);
  const [isModalResumoTurnoOpen, setIsModalResumoTurnoOpen] = useState(false);
  const [isModalEstatisticasOpen, setIsModalEstatisticasOpen] = useState(false);
  const [isModalExportExcelOpen, setIsModalExportExcelOpen] = useState(false);
  const [isModalAlterarSenhaOpen, setIsModalAlterarSenhaOpen] = useState(false);
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroVeiculo | null>(null);
  const [registroSelecionadoDetalhes, setRegistroSelecionadoDetalhes] = useState<RegistroVeiculo | null>(null);
  const [registroAjusteHorarios, setRegistroAjusteHorarios] = useState<RegistroVeiculo | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Carregar sessão
  useEffect(() => {
    const usuarioSalvo = obterSessao();
    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
    }
  }, []);

  // Carregar dados e sincronizar registros
  useEffect(() => {
    const carregar = () => {
      const dados = obterRegistros();
      setRegistros(dados);
    };

    carregar();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'frota_registros_veiculos') {
        carregar();
      }
    };

    const handleLocalUpdate = () => {
      carregar();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('registros_atualizados', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('registros_atualizados', handleLocalUpdate);
    };
  }, []);

  // Handlers de autenticação
  const handleLoginSuccess = (usuarioLogado: UsuarioAutenticado) => {
    setUsuario(usuarioLogado);
    showToast(`Bem-vindo, ${usuarioLogado.nome}!`, 'success');
  };

  const handleLogout = () => {
    encerrarSessao();
    setUsuario(null);
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  // Handlers de registros
  const handleSalvarRegistro = (registro: RegistroVeiculo) => {
    const isEdicao = !!registroEmEdicao;
    salvarRegistro(registro);
    setRegistros(obterRegistros());
    setIsModalCadastroOpen(false);
    setRegistroEmEdicao(null);
    
    // Disparar evento para atualizar outros componentes na mesma aba
    window.dispatchEvent(new Event('registros_atualizados'));

    showToast(
      isEdicao ? 'Registro atualizado com sucesso!' : 'Novo registro cadastrado com sucesso!',
      'success'
    );
  };

  const handleSalvarHorarios = (registroAtualizado: RegistroVeiculo) => {
    salvarRegistro(registroAtualizado);
    setRegistros(obterRegistros());
    setRegistroAjusteHorarios(null);
    
    window.dispatchEvent(new Event('registros_atualizados'));
    showToast('Horários e status atualizados!', 'success');
  };

  const handleExcluirRegistro = (id: string) => {
    excluirRegistro(id);
    setRegistros(obterRegistros());
    if (registroSelecionadoDetalhes?.id === id) {
      setRegistroSelecionadoDetalhes(null);
    }
    window.dispatchEvent(new Event('registros_atualizados'));
    showToast('Registro excluído com sucesso.', 'info');
  };

  // Exportar Relatório em PDF
  const handleExportarPdf = () => {
    try {
      gerarRelatorioGeralPDF(registrosFiltrados, filtros);
      showToast('Relatório PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
  };

  // Filtragem de dados
  const registrosFiltrados = registros.filter((reg) => {
    // Filtro Secretaria
    if (filtros.secretaria !== 'TODAS' && reg.secretaria !== filtros.secretaria) {
      return false;
    }

    // Filtro Data
    if (filtros.data && reg.data !== filtros.data) {
      return false;
    }

    // Filtro Status
    if (filtros.status !== 'TODOS' && reg.status !== filtros.status) {
      return false;
    }

    // Filtro de Busca Geral (Motorista, Placa, FCT, Destino, Assunto)
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase().trim();
      const matchMotorista = reg.motorista.toLowerCase().includes(termo);
      const matchPlaca = reg.placa.toLowerCase().includes(termo);
      const matchFct = reg.fct.toLowerCase().includes(termo);
      const matchDestino = reg.destino.toLowerCase().includes(termo);
      const matchAssunto = reg.assunto?.toLowerCase().includes(termo) || false;
      const matchVeiculo = reg.veiculo?.toLowerCase().includes(termo) || false;

      if (!matchMotorista && !matchPlaca && !matchFct && !matchDestino && !matchAssunto && !matchVeiculo) {
        return false;
      }
    }

    return true;
  });

  // Se não estiver logado, exibe tela de login
  if (!usuario) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col font-sans selection:bg-[#B08D57]/30 selection:text-[#DFBA73] relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glow - Ouro Velho & Champagne */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B08D57]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#C6A96B]/5 rounded-full blur-3xl" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border backdrop-blur-xl ${
            toastMessage.type === 'success' 
              ? 'bg-[#12141A]/95 border-[#B08D57]/40 text-[#DFBA73] shadow-[#B08D57]/20' 
              : toastMessage.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : 'bg-[#12141A]/95 border-sky-500/40 text-sky-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-[#DFBA73] shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Superior Principal */}
      <Header
        usuario={usuario}
        onNovoRegistro={() => {
          setRegistroEmEdicao(null);
          setIsModalCadastroOpen(true);
        }}
        onNovoOperador={() => setIsModalOperadorOpen(true)}
        onAbrirEnviarRelatorio={() => setIsModalEnviarRelatorioOpen(true)}
        onResumoTurno={() => setIsModalResumoTurnoOpen(true)}
        onExportarPdf={handleExportarPdf}
        onEstatisticas={() => setIsModalEstatisticasOpen(true)}
        onExportarExcel={() => setIsModalExportExcelOpen(true)}
        onAlterarSenha={() => setIsModalAlterarSenhaOpen(true)}
        onLogout={handleLogout}
        totalRegistros={registros.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">
        {/* Banner de Instalação PWA no Celular */}
        <PwaInstallPrompt />

        {/* Abas de Navegação Principal / Sub-Pastas do App com Efeito Vidro Avançado Ouro Velho */}
        <div className="bg-[#111317]/80 border border-[#B08D57]/20 p-2.5 rounded-3xl flex items-center justify-between gap-2 shadow-2xl backdrop-blur-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/30 to-transparent" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSubPastaAtiva('GESTAO')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                subPastaAtiva === 'GESTAO'
                  ? 'bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] text-slate-950 shadow-xl shadow-[#B08D57]/20 font-bold border border-[#DFBA73]/50'
                  : 'text-[#C6A96B]/70 hover:text-white bg-black/40 border border-[#B08D57]/15 backdrop-blur-md'
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
                  ? 'bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] text-slate-950 shadow-xl shadow-[#B08D57]/20 font-bold border border-[#DFBA73]/50'
                  : 'text-[#C6A96B]/70 hover:text-white bg-black/40 border border-[#B08D57]/15 backdrop-blur-md'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#DFBA73]" />
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
            onExcluir={handleExcluirRegistro}
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
              <div className="bg-[#111317]/90 border border-[#B08D57]/20 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black/60 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>Listagem de Veículos Cadastrados</span>
                      <span className="bg-gradient-to-r from-[#C6A96B] to-[#B08D57] text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                        {modoVisualizacao === 'CARTOES' ? 'Cartões' : 'Tabela'}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center bg-black/60 p-1 rounded-xl border border-[#B08D57]/25 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setModoVisualizacao('CARTOES')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modoVisualizacao === 'CARTOES'
                          ? 'bg-[#B08D57] text-slate-950 shadow-sm font-bold'
                          : 'text-[#C6A96B]/70 hover:text-white'
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
                          ? 'bg-[#B08D57] text-slate-950 shadow-sm font-bold'
                          : 'text-[#C6A96B]/70 hover:text-white'
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
                  onExcluir={handleExcluirRegistro}
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
                  onAbrirPainelDiario={() => setSubPastaAtiva('PAINEL_DIARIO')}
                  usuarioAtual={usuario}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer Oficial */}
      <Footer />

      {/* Modal de Cadastro / Edição de Registro */}
      {isModalCadastroOpen && (
        <VehicleRegistrationModal
          isOpen={isModalCadastroOpen}
          onClose={() => {
            setIsModalCadastroOpen(false);
            setRegistroEmEdicao(null);
          }}
          onSave={handleSalvarRegistro}
          registroParaEditar={registroEmEdicao}
          usuarioAtual={usuario}
        />
      )}

      {/* Modal de Detalhes Completos */}
      {registroSelecionadoDetalhes && (
        <RecordDetailModal
          isOpen={!!registroSelecionadoDetalhes}
          registro={registroSelecionadoDetalhes}
          onClose={() => setRegistroSelecionadoDetalhes(null)}
          onEditar={(reg) => {
            setRegistroSelecionadoDetalhes(null);
            setRegistroEmEdicao(reg);
            setIsModalCadastroOpen(true);
          }}
          onAjustarHorarios={(reg) => {
            setRegistroSelecionadoDetalhes(null);
            setRegistroAjusteHorarios(reg);
          }}
          onExcluir={handleExcluirRegistro}
          onDelete={handleExcluirRegistro}
          onFinalizarViagem={(id, hora) => {
            const regAtual = registros.find((r) => r.id === id);
            if (regAtual) {
              handleSalvarHorarios({
                ...regAtual,
                horarioChegada: hora,
                status: 'FINALIZADO',
              });
            }
          }}
          usuarioAtual={usuario}
        />
      )}

      {/* Modal de Ajuste Rápido de Horários */}
      {registroAjusteHorarios && (
        <QuickTimeModal
          isOpen={!!registroAjusteHorarios}
          registro={registroAjusteHorarios}
          onClose={() => setRegistroAjusteHorarios(null)}
          onSave={handleSalvarHorarios}
          usuarioAtual={usuario}
        />
      )}

      {/* Modal de Criação de Operador (Admin) */}
      {isModalOperadorOpen && (
        <CreateOperatorModal
          isOpen={isModalOperadorOpen}
          onClose={() => setIsModalOperadorOpen(false)}
          onSuccess={(nome) => showToast(`Operador ${nome} criado com sucesso!`, 'success')}
        />
      )}

      {/* Modal de Enviar Relatório via WhatsApp / Email */}
      {isModalEnviarRelatorioOpen && (
        <SendReportModal
          isOpen={isModalEnviarRelatorioOpen}
          onClose={() => setIsModalEnviarRelatorioOpen(false)}
          registros={registrosFiltrados}
          filtros={filtros}
          usuarioAtual={usuario}
        />
      )}

      {/* Modal de Resumo do Turno Atual */}
      {isModalResumoTurnoOpen && (
        <ShiftSummaryModal
          isOpen={isModalResumoTurnoOpen}
          onClose={() => setIsModalResumoTurnoOpen(false)}
          registros={registros}
          usuarioAtual={usuario}
        />
      )}

      {/* Modal de Estatísticas e Métricas */}
      {isModalEstatisticasOpen && (
        <StatsMetricsModal
          isOpen={isModalEstatisticasOpen}
          onClose={() => setIsModalEstatisticasOpen(false)}
          registros={registros}
        />
      )}

      {/* Modal de Exportação Excel / CSV */}
      {isModalExportExcelOpen && (
        <ExportExcelModal
          isOpen={isModalExportExcelOpen}
          onClose={() => setIsModalExportExcelOpen(false)}
          registros={registrosFiltrados}
          filtros={filtros}
        />
      )}

      {/* Modal de Alteração de Senha */}
      {isModalAlterarSenhaOpen && (
        <ChangePasswordModal
          isOpen={isModalAlterarSenhaOpen}
          onClose={() => setIsModalAlterarSenhaOpen(false)}
          usuario={usuario}
          onSuccess={() => showToast('Senha alterada com sucesso!', 'success')}
        />
      )}
    </div>
  );
}
