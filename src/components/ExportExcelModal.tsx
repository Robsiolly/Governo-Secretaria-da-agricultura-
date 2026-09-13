import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  CheckSquare, 
  Square, 
  Filter, 
  Calendar, 
  Building, 
  Table,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { RegistroVeiculo, Secretaria } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
  onToast: (msg: string) => void;
}

interface ColunaConfig {
  id: keyof RegistroVeiculo | 'tempoTotal' | 'dataFormatada';
  label: string;
  selecionada: boolean;
  obterValor: (r: RegistroVeiculo) => string;
}

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  registros,
  onToast,
}) => {
  const hojeStr = getLocalDateString();
  const [periodoFiltro, setPeriodoFiltro] = useState<'TODOS' | 'HOJE' | 'MES_ATUAL' | 'CUSTOM'>('MES_ATUAL');
  const [dataInicio, setDataInicio] = useState(hojeStr);
  const [dataFim, setDataFim] = useState(hojeStr);
  const [secretariaFiltro, setSecretariaFiltro] = useState<'TODAS' | Secretaria>('TODAS');
  const [statusFiltro, setStatusFiltro] = useState<'TODOS' | 'EM_TRANSITO' | 'FINALIZADO'>('TODOS');
  const [copiado, setCopiado] = useState(false);

  // Configuração das colunas disponíveis para exportação
  const [colunas, setColunas] = useState<ColunaConfig[]>([
    { id: 'dataFormatada', label: 'Data', selecionada: true, obterValor: (r) => r.data ? new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR') : '' },
    { id: 'horarioSaida', label: 'Horário de Saída', selecionada: true, obterValor: (r) => r.horarioSaida || '' },
    { id: 'horarioChegada', label: 'Horário de Chegada', selecionada: true, obterValor: (r) => r.horarioChegada || 'Em Trânsito' },
    { id: 'status', label: 'Status da Viagem', selecionada: true, obterValor: (r) => r.status === 'EM_TRANSITO' ? 'Em Trânsito' : 'Finalizado' },
    { id: 'secretaria', label: 'Secretaria', selecionada: true, obterValor: (r) => r.secretaria || '' },
    { id: 'fct', label: 'Nº FCT (Agricultura)', selecionada: true, obterValor: (r) => r.fct && r.fct !== 'N/A' ? r.fct : '-' },
    { id: 'placa', label: 'Placa do Veículo', selecionada: true, obterValor: (r) => r.placa || '-' },
    { id: 'modeloVeiculo', label: 'Modelo do Veículo', selecionada: true, obterValor: (r) => r.modeloVeiculo || '-' },
    { id: 'motorista', label: 'Nome do Motorista', selecionada: true, obterValor: (r) => r.motorista || '' },
    { id: 'destino', label: 'Destino / Serviço', selecionada: true, obterValor: (r) => r.destino || '-' },
    { id: 'andar', label: 'Andar / Local de Saída', selecionada: true, obterValor: (r) => r.andar || 'Térreo' },
    { id: 'funcionarioResponsavel', label: 'Operador que Cadastrou', selecionada: true, obterValor: (r) => r.funcionarioResponsavel || '' },
    { id: 'matriculaFuncionario', label: 'Matrícula do Operador', selecionada: false, obterValor: (r) => r.matriculaFuncionario || '-' },
    { id: 'observacoes', label: 'Observações', selecionada: false, obterValor: (r) => r.observacoes || '' },
    { id: 'id', label: 'ID do Registro', selecionada: false, obterValor: (r) => r.id },
  ]);

  // Filtragem dos registros
  const registrosFiltrados = useMemo(() => {
    const hoje = new Date();
    return registros.filter(reg => {
      // Filtro Secretaria
      if (secretariaFiltro !== 'TODAS' && reg.secretaria !== secretariaFiltro) return false;
      // Filtro Status
      if (statusFiltro !== 'TODOS' && reg.status !== statusFiltro) return false;

      // Filtro Período
      if (!reg.data) return true;
      if (periodoFiltro === 'HOJE') return reg.data === hojeStr;
      if (periodoFiltro === 'MES_ATUAL') {
        const mesAtual = (hoje.getMonth() + 1).toString().padStart(2, '0');
        const anoAtual = hoje.getFullYear().toString();
        return reg.data.startsWith(`${anoAtual}-${mesAtual}`);
      }
      if (periodoFiltro === 'CUSTOM') {
        if (dataInicio && reg.data < dataInicio) return false;
        if (dataFim && reg.data > dataFim) return false;
      }
      return true;
    });
  }, [registros, periodoFiltro, secretariaFiltro, statusFiltro, hojeStr, dataInicio, dataFim]);

  const toggleColuna = (colId: string) => {
    setColunas(prev => prev.map(c => c.id === colId ? { ...c, selecionada: !c.selecionada } : c));
  };

  const selecionarTodasColunas = (selecionar: boolean) => {
    setColunas(prev => prev.map(c => ({ ...c, selecionada: selecionar })));
  };

  const colunasAtivas = colunas.filter(c => c.selecionada);

  // 1. Exportar como CSV formatado para Microsoft Excel (UTF-8 BOM + Ponto e Vírgula)
  const baixarCsvExcel = () => {
    if (registrosFiltrados.length === 0) {
      onToast('Nenhum registro encontrado com os filtros selecionados.');
      return;
    }
    if (colunasAtivas.length === 0) {
      onToast('Selecione pelo menos uma coluna para exportar.');
      return;
    }

    const cabecalho = colunasAtivas.map(c => `"${c.label.replace(/"/g, '""')}"`).join(';');
    const linhas = registrosFiltrados.map(reg => {
      return colunasAtivas.map(col => {
        const valor = col.obterValor(reg);
        return `"${valor.replace(/"/g, '""')}"`;
      }).join(';');
    });

    const conteudoCsv = '\uFEFF' + [cabecalho, ...linhas].join('\r\n');
    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nomeArquivo = `Controle_Registros_Veiculos_${getLocalDateString()}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast(`Planilha CSV baixada com sucesso (${registrosFiltrados.length} linhas)!`);
  };

  // 2. Exportar como Planilha Excel Nativa (.XLS com formato HTML/XML)
  const baixarXlsNativo = () => {
    if (registrosFiltrados.length === 0) {
      onToast('Nenhum registro encontrado com os filtros selecionados.');
      return;
    }
    if (colunasAtivas.length === 0) {
      onToast('Selecione pelo menos uma coluna para exportar.');
      return;
    }

    let tabelaHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Registros de Veículos</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 12px; }
          th { background-color: #3A241D; color: #FFFFFF; font-weight: bold; border: 1px solid #666; padding: 8px; text-align: left; }
          td { border: 1px solid #CCCCCC; padding: 6px 8px; }
          .highlight { background-color: #FFF3CD; }
        </style>
      </head>
      <body>
        <h2>Controle de Registros de Veículos Oficiais</h2>
        <p>Secretaria da Agricultura & Secretaria do Turismo | Exportado em: ${new Date().toLocaleString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              ${colunasAtivas.map(c => `<th>${c.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${registrosFiltrados.map(r => `
              <tr>
                ${colunasAtivas.map(c => `<td>${c.obterValor(r)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + tabelaHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nomeArquivo = `Controle_Registros_Veiculos_${getLocalDateString()}.xls`;
    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast(`Planilha Excel (.XLS) gerada com sucesso!`);
  };

  // 3. Copiar Dados para a Área de Transferência (Para colar no Excel com Ctrl+V)
  const copiarParaAreaTransferencia = async () => {
    if (registrosFiltrados.length === 0) {
      onToast('Nenhum registro selecionado.');
      return;
    }

    const cabecalho = colunasAtivas.map(c => c.label).join('\t');
    const linhas = registrosFiltrados.map(reg => {
      return colunasAtivas.map(col => col.obterValor(reg)).join('\t');
    });

    const textoFormatado = [cabecalho, ...linhas].join('\n');
    try {
      await navigator.clipboard.writeText(textoFormatado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
      onToast('Tabela copiada! Agora basta dar Ctrl+V dentro do Excel ou Google Planilhas.');
    } catch (err) {
      onToast('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#181818] border border-[#6B6B6B]/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto text-[#F3F3F1] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-[#1f1f1f] border-b border-[#6B6B6B]/30 px-5 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Exportar para Excel / Planilhas
                </h2>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {registrosFiltrados.length} {registrosFiltrados.length === 1 ? 'Linha' : 'Linhas'}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Gere arquivos compatíveis com Microsoft Excel, Google Planilhas e LibreOffice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-black/50 hover:bg-[#333] border border-[#6B6B6B]/30 flex items-center justify-center text-[#6B6B6B] hover:text-white transition-all cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Seção 1: Filtros de Exportação */}
          <div className="bg-[#212121] border border-[#6B6B6B]/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-[#D97924]" />
              <span>1. Filtrar Dados para a Planilha</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Período */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1.5">Período:</label>
                <select
                  value={periodoFiltro}
                  onChange={(e) => setPeriodoFiltro(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#6B6B6B]/40 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D97924]"
                >
                  <option value="MES_ATUAL">Este Mês</option>
                  <option value="HOJE">Somente Hoje</option>
                  <option value="TODOS">Todo o Histórico</option>
                  <option value="CUSTOM">Data Personalizada</option>
                </select>
              </div>

              {/* Secretaria */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1.5">Secretaria:</label>
                <select
                  value={secretariaFiltro}
                  onChange={(e) => setSecretariaFiltro(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#6B6B6B]/40 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D97924]"
                >
                  <option value="TODAS">Todas as Secretarias</option>
                  <option value="Secretaria da Agricultura">Secretaria da Agricultura</option>
                  <option value="Secretaria do Turismo">Secretaria do Turismo</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1.5">Status:</label>
                <select
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value as any)}
                  className="w-full bg-[#181818] border border-[#6B6B6B]/40 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D97924]"
                >
                  <option value="TODOS">Todos os Registros</option>
                  <option value="FINALIZADO">Somente Viagens Concluídas</option>
                  <option value="EM_TRANSITO">Somente Em Trânsito (Na Rua)</option>
                </select>
              </div>
            </div>

            {/* Custom Dates */}
            {periodoFiltro === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#6B6B6B]/20">
                <div>
                  <label className="block text-[11px] text-[#6B6B6B] mb-1">Data Inicial:</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-[#181818] border border-[#6B6B6B]/40 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6B6B6B] mb-1">Data Final:</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full bg-[#181818] border border-[#6B6B6B]/40 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Seleção de Colunas */}
          <div className="bg-[#212121] border border-[#6B6B6B]/30 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Table className="w-4 h-4 text-[#D97924]" />
                <span>2. Selecionar Colunas para a Planilha ({colunasAtivas.length} de {colunas.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selecionarTodasColunas(true)}
                  className="text-[11px] text-[#D97924] hover:underline font-semibold cursor-pointer"
                >
                  Marcar Todas
                </button>
                <span className="text-[#6B6B6B]">•</span>
                <button
                  type="button"
                  onClick={() => selecionarTodasColunas(false)}
                  className="text-[11px] text-[#6B6B6B] hover:text-white hover:underline cursor-pointer"
                >
                  Desmarcar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {colunas.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleColuna(col.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    col.selecionada
                      ? 'bg-[#181818] border-[#D97924]/60 text-white shadow-sm'
                      : 'bg-[#141414] border-[#6B6B6B]/20 text-[#6B6B6B] hover:text-white'
                  }`}
                >
                  {col.selecionada ? (
                    <CheckSquare className="w-4 h-4 text-[#D97924] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#6B6B6B] shrink-0" />
                  )}
                  <span className="truncate">{col.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seção 3: Pré-visualização dos Dados */}
          <div className="bg-[#212121] border border-[#6B6B6B]/30 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Prévia da Planilha (Primeiras linhas)
              </span>
              <span className="text-xs text-emerald-400 font-bold font-mono">
                {registrosFiltrados.length} registros selecionados
              </span>
            </div>

            {registrosFiltrados.length === 0 ? (
              <p className="text-xs text-[#6B6B6B] py-4 text-center">
                Nenhum registro corresponde aos filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#6B6B6B]/20 rounded-xl bg-[#141414]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#1f1f1f] border-b border-[#6B6B6B]/30 text-white font-bold">
                      {colunasAtivas.map(c => (
                        <th key={c.id} className="p-2.5 whitespace-nowrap border-r border-[#6B6B6B]/20 last:border-r-0">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrosFiltrados.slice(0, 4).map((reg, idx) => (
                      <tr key={reg.id} className="border-b border-[#6B6B6B]/15 hover:bg-[#1f1f1f]/50">
                        {colunasAtivas.map(c => (
                          <td key={c.id} className="p-2.5 whitespace-nowrap text-[#F3F3F1]/80 border-r border-[#6B6B6B]/15 last:border-r-0">
                            {c.obterValor(reg)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="bg-[#1f1f1f] border-t border-[#6B6B6B]/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={copiarParaAreaTransferencia}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#252525] hover:bg-[#333] border border-[#6B6B6B]/40 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#D97924]" />}
            <span>{copiado ? 'Copiado com Sucesso!' : 'Copiar para Área de Transferência'}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={baixarCsvExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Planilha CSV / Excel</span>
            </button>

            <button
              type="button"
              onClick={baixarXlsNativo}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D97924] hover:bg-[#c2681e] text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Baixar Excel (.XLS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
