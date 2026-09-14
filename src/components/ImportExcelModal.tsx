import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  RefreshCw,
  ShieldCheck,
  Wheat,
  Plane,
  Clock,
  Car,
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrosExistentes: RegistroVeiculo[];
  onImportarNovos: (novos: RegistroVeiculo[]) => void;
  usuarioAtual: UsuarioAutenticado;
}

interface LinhaConciliada {
  linhaOrigem: number;
  registro: RegistroVeiculo;
  jaExiste: boolean;
  motivoExistencia?: string;
  selecionado: boolean;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  registrosExistentes,
  onImportarNovos,
  usuarioAtual,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState<string>('');
  const [linhasProcessadas, setLinhasProcessadas] = useState<LinhaConciliada[]>([]);
  const [erroProcessamento, setErroProcessamento] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState<'UPLOAD' | 'CONCILIACAO' | 'CONCLUIDO'>('UPLOAD');
  const [totalImportadosSucesso, setTotalImportadosSucesso] = useState(0);

  if (!isOpen) return null;

  // Normalização de chaves de cabeçalho
  const normalizarChave = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Normalização de placa (remover traços e espaços)
  const normalizarPlaca = (placa?: string): string => {
    if (!placa) return '';
    return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  // Normalização de data YYYY-MM-DD
  const formatarData = (val: any): string => {
    if (!val) return getLocalDateString();
    if (typeof val === 'number') {
      // Excel serial date
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    // Verifica formato DD/MM/YYYY
    const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (brMatch) {
      const dia = brMatch[1].padStart(2, '0');
      const mes = brMatch[2].padStart(2, '0');
      const ano = brMatch[3];
      return `${ano}-${mes}-${dia}`;
    }
    // Verifica formato YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (isoMatch) {
      const ano = isoMatch[1];
      const mes = isoMatch[2].padStart(2, '0');
      const dia = isoMatch[3].padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    }
    return getLocalDateString();
  };

  // Normalização de horário HH:mm
  const formatarHorario = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'number') {
      // Fração de dia no Excel (ex: 0.5 = 12:00)
      const totalMinutes = Math.round(val * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    const str = String(val).trim();
    const timeMatch = str.match(/^(\d{1,2})[:h](\d{2})/i);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
    return str;
  };

  const processarArquivoExcel = async (file: File) => {
    setCarregando(true);
    setErroProcessamento(null);
    setNomeArquivo(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('A planilha está vazia ou sem abas legíveis.');
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rows || rows.length === 0) {
        throw new Error('Nenhuma linha de dados encontrada na planilha.');
      }

      const mapaExistentesPlacaData = new Set<string>();
      const mapaExistentesPlacaHora = new Set<string>();

      registrosExistentes.forEach((reg) => {
        const placaLimpa = normalizarPlaca(reg.placa);
        const dataReg = reg.data || '';
        const horaSaida = reg.horarioSaida || '';
        const horaChegada = reg.horarioChegada || '';

        if (placaLimpa && dataReg) {
          mapaExistentesPlacaData.add(`${placaLimpa}_${dataReg}_${horaSaida}`);
          mapaExistentesPlacaHora.add(`${placaLimpa}_${dataReg}_${horaChegada}`);
          mapaExistentesPlacaData.add(`${placaLimpa}_${dataReg}`);
        }
      });

      const conciliados: LinhaConciliada[] = [];

      rows.forEach((row, index) => {
        // Encontrar os campos por aproximação de nome de coluna
        const entries = Object.entries(row);
        const getField = (...nomesPossiveis: string[]): string => {
          const normalizados = nomesPossiveis.map(normalizarChave);
          for (const [k, v] of entries) {
            const kn = normalizarChave(k);
            if (normalizados.some((np) => kn.includes(np) || np.includes(kn))) {
              return String(v).trim();
            }
          }
          return '';
        };

        const placaRaw = getField('placa', 'veiculoplaca', 'placaveiculo');
        const motoristaRaw = getField('motorista', 'condutor', 'nomedomotorista', 'nome');
        const secretariaRaw = getField('secretaria', 'orgao', 'departamento', 'pasta');
        const dataRaw = getField('data', 'datasaida', 'dataentrada', 'dataformatada');
        const saidaRaw = getField('horariosaida', 'saida', 'horasaida', 'horario');
        const chegadaRaw = getField('horariochegada', 'chegada', 'horachegada');
        const fctRaw = getField('fct', 'nfct', 'numerofct');
        const garagemRaw = getField('garagem', 'localgaragem', 'patio');
        const andarRaw = getField('andar', 'localizacao', 'piso');
        const modeloRaw = getField('modelo', 'modeloveiculo', 'veiculo');
        const destinoRaw = getField('destino', 'servico', 'rota');
        const ocorrenciaRaw = getField('ocorrencia', 'observacoes', 'obs');

        // Se linha estiver totalmente vazia, ignora
        if (!placaRaw && !motoristaRaw && !saidaRaw && !chegadaRaw) {
          return;
        }

        const dataFormatada = formatarData(dataRaw);
        const horaSaida = formatarHorario(saidaRaw);
        const horaChegada = formatarHorario(chegadaRaw);
        const placaFormatada = normalizarPlaca(placaRaw);

        // Determinar Secretaria
        let secretariaFinal: Secretaria = 'Secretaria da Agricultura';
        const secNorm = normalizarChave(secretariaRaw);
        if (secNorm.includes('turismo') || secNorm.includes('setur')) {
          secretariaFinal = 'Secretaria do Turismo';
        }

        // Determinar Status
        const statusViagem: 'EM_TRANSITO' | 'FINALIZADO' = horaChegada ? 'FINALIZADO' : 'EM_TRANSITO';

        // Localização e Garagem
        let garagemFinal = garagemRaw || 'Kalunga';
        let andarFinal = andarRaw || 'SAA';
        if (garagemFinal && andarFinal && !andarFinal.includes(garagemFinal)) {
          andarFinal = `${garagemFinal} • ${andarFinal}`;
        }

        const motoristaFinal = motoristaRaw || 'Não Informado';

        // Verificação se já existe no banco
        const chaveComHora = `${placaFormatada}_${dataFormatada}_${horaSaida}`;
        const chaveComHoraChegada = `${placaFormatada}_${dataFormatada}_${horaChegada}`;
        const chaveSimples = `${placaFormatada}_${dataFormatada}`;

        let jaExiste = false;
        let motivoExistencia = '';

        if (placaFormatada) {
          if (horaSaida && mapaExistentesPlacaData.has(chaveComHora)) {
            jaExiste = true;
            motivoExistencia = `Já cadastrado hoje às ${horaSaida}`;
          } else if (horaChegada && mapaExistentesPlacaHora.has(chaveComHoraChegada)) {
            jaExiste = true;
            motivoExistencia = `Já registrado (chegada ${horaChegada})`;
          } else if (!horaSaida && !horaChegada && mapaExistentesPlacaData.has(chaveSimples)) {
            jaExiste = true;
            motivoExistencia = `Placa já possui registro nesta data (${dataFormatada})`;
          }
        }

        const registroMontado: RegistroVeiculo = {
          id: `reg-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          secretaria: secretariaFinal,
          data: dataFormatada,
          motorista: motoristaFinal,
          fct: secretariaFinal === 'Secretaria do Turismo' ? 'N/A' : (fctRaw || ''),
          horarioSaida: horaSaida,
          horarioChegada: horaChegada,
          garagem: garagemFinal,
          andar: andarFinal,
          funcionarioResponsavel: usuarioAtual.nome || 'Importação Automática',
          matriculaFuncionario: usuarioAtual.matricula || 'IMP',
          assinaturaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="sans-serif" font-size="12" fill="%23B08D57">Importado via Planilha</text></svg>',
          placa: placaRaw ? placaRaw.toUpperCase().trim() : '',
          modeloVeiculo: modeloRaw || '',
          destino: destinoRaw || '',
          ocorrencia: ocorrenciaRaw || '',
          status: statusViagem,
          criadoEm: new Date().toISOString(),
        };

        conciliados.push({
          linhaOrigem: index + 2,
          registro: registroMontado,
          jaExiste,
          motivoExistencia,
          selecionado: !jaExiste, // Pré-seleciona apenas os que não existem
        });
      });

      if (conciliados.length === 0) {
        throw new Error('Nenhum registro válido de veículo pôde ser extraído da planilha.');
      }

      setLinhasProcessadas(conciliados);
      setEtapa('CONCILIACAO');
    } catch (err: any) {
      console.error('Erro ao ler planilha:', err);
      setErroProcessamento(err.message || 'Falha ao processar o arquivo Excel.');
    } finally {
      setCarregando(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processarArquivoExcel(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processarArquivoExcel(e.target.files[0]);
    }
  };

  const alternarSelecao = (linhaIdx: number) => {
    setLinhasProcessadas((prev) =>
      prev.map((item, idx) =>
        idx === linhaIdx ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const alternarTodosNovos = (marcar: boolean) => {
    setLinhasProcessadas((prev) =>
      prev.map((item) =>
        !item.jaExiste ? { ...item, selecionado: marcar } : item
      )
    );
  };

  const executarImplantacao = () => {
    const novosParaImportar = linhasProcessadas
      .filter((item) => item.selecionado && !item.jaExiste)
      .map((item) => item.registro);

    if (novosParaImportar.length === 0) {
      setErroProcessamento('Nenhum novo registro selecionado para importação.');
      return;
    }

    onImportarNovos(novosParaImportar);
    setTotalImportadosSucesso(novosParaImportar.length);
    setEtapa('CONCLUIDO');
  };

  const novosCount = linhasProcessadas.filter((l) => !l.jaExiste).length;
  const existentesCount = linhasProcessadas.filter((l) => l.jaExiste).length;
  const selecionadosCount = linhasProcessadas.filter((l) => l.selecionado && !l.jaExiste).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#B08D57]/20 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73] shadow-md shadow-[#B08D57]/10">
              <FileSpreadsheet className="w-5 h-5 text-[#DFBA73]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Leitor e Conciliador de Planilhas</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider font-semibold">
                  Inteligente
                </span>
              </h2>
              <p className="text-xs text-[#C6A96B]/80 font-medium">
                Compara a planilha com o banco de dados e adiciona automaticamente os registros ausentes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-2xl hover:bg-[#B08D57]/20 active:scale-[0.94] transition-all cursor-pointer border border-transparent hover:border-[#B08D57]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {erroProcessamento && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{erroProcessamento}</span>
            </div>
          )}

          {etapa === 'UPLOAD' && (
            <div className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                  isDragging
                    ? 'border-[#DFBA73] bg-[#B08D57]/15 scale-[1.01]'
                    : 'border-[#B08D57]/30 bg-black/40 hover:border-[#B08D57]/60 hover:bg-[#B08D57]/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-3xl bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shadow-lg shadow-[#B08D57]/15">
                  <UploadCloud className="w-8 h-8 text-[#DFBA73]" />
                </div>

                <div className="max-w-md">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                    Arraste sua planilha Excel ou clique para selecionar
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C6A96B]/70">
                    Formatos compatíveis: <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong>
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/30 text-[#DFBA73] text-xs font-semibold">
                  <span>Varredura automática com detecção de duplicidades</span>
                </div>
              </div>

              {/* Instruções de Colunas */}
              <div className="bg-black/30 border border-[#B08D57]/15 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-[#DFBA73] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DFBA73]" />
                  <span>Como o sistema faz a comparação:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70">
                  <div className="flex items-start gap-2 bg-[#111317]/60 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Mapeamento Flexível:</strong> Reconhece colunas comuns como Placa, Motorista, Secretaria, Data, Saída e Chegada.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-[#111317]/60 p-3 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Anti-Duplicação:</strong> Registros que já constam no banco são sinalizados e mantidos intactos.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {etapa === 'CONCILIACAO' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#111317]/80 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-300/70 font-medium">Novos para Adicionar</span>
                    <p className="text-lg font-bold text-emerald-300 font-mono">{novosCount}</p>
                  </div>
                </div>

                <div className="bg-[#111317]/80 border border-[#B08D57]/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#C6A96B]/70 font-medium">Já no Banco (Ignorados)</span>
                    <p className="text-lg font-bold text-[#DFBA73] font-mono">{existentesCount}</p>
                  </div>
                </div>

                <div className="bg-[#111317]/80 border border-blue-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-blue-300/70 font-medium">Total na Planilha</span>
                    <p className="text-lg font-bold text-blue-300 font-mono">{linhasProcessadas.length}</p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alternarTodosNovos(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#DFBA73] hover:text-white bg-[#B08D57]/15 hover:bg-[#B08D57]/25 border border-[#B08D57]/30 transition-all cursor-pointer"
                  >
                    Marcar Todos os Novos
                  </button>
                  <button
                    type="button"
                    onClick={() => alternarTodosNovos(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-white bg-black/40 border border-white/10 transition-all cursor-pointer"
                  >
                    Desmarcar Todos
                  </button>
                </div>
                <span className="text-xs text-[#C6A96B]/80 font-mono">
                  {selecionadosCount} novo(s) selecionado(s) para implantação
                </span>
              </div>

              {/* Conciliation Table */}
              <div className="border border-[#B08D57]/20 rounded-2xl overflow-hidden bg-black/40 max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#16181d] text-[#DFBA73] border-b border-[#B08D57]/20 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center">Status</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Placa</th>
                      <th className="p-3">Motorista</th>
                      <th className="p-3">Secretaria</th>
                      <th className="p-3">Horários</th>
                      <th className="p-3">Local/Andar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {linhasProcessadas.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => !item.jaExiste && alternarSelecao(idx)}
                        className={`transition-colors ${
                          item.jaExiste
                            ? 'bg-black/20 opacity-60 cursor-not-allowed'
                            : item.selecionado
                            ? 'bg-[#B08D57]/15 hover:bg-[#B08D57]/20 cursor-pointer'
                            : 'hover:bg-white/5 cursor-pointer'
                        }`}
                      >
                        <td className="p-3 text-center">
                          {item.jaExiste ? (
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-[#DFBA73] border border-amber-500/30 text-[10px]"
                              title={item.motivoExistencia || 'Já existe no banco'}
                            >
                              ✓
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={item.selecionado}
                              onChange={() => alternarSelecao(idx)}
                              className="rounded border-[#B08D57]/40 text-[#B08D57] focus:ring-0 cursor-pointer w-4 h-4"
                            />
                          )}
                        </td>
                        <td className="p-3 font-mono">{item.registro.data}</td>
                        <td className="p-3 font-mono font-bold text-white">{item.registro.placa || '-'}</td>
                        <td className="p-3 font-medium text-white/90">{item.registro.motorista}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.registro.secretaria === 'Secretaria da Agricultura'
                                ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.registro.secretaria === 'Secretaria da Agricultura' ? (
                              <Wheat className="w-3 h-3" />
                            ) : (
                              <Plane className="w-3 h-3" />
                            )}
                            <span>{item.registro.secretaria === 'Secretaria da Agricultura' ? 'Agricultura' : 'Turismo'}</span>
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {item.registro.horarioSaida && `Saída: ${item.registro.horarioSaida}`}
                          {item.registro.horarioChegada && ` | Cheg: ${item.registro.horarioChegada}`}
                          {!item.registro.horarioSaida && !item.registro.horarioChegada && '-'}
                        </td>
                        <td className="p-3 text-[11px] text-white/70">{item.registro.andar || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {etapa === 'CONCLUIDO' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Implantação Concluída com Sucesso!</h3>
                <p className="text-sm text-[#C6A96B] mt-1 font-medium">
                  {totalImportadosSucesso} novo(s) registro(s) foram inseridos no banco de dados com segurança.
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Os dados já estão visíveis na tela e sincronizados com a nuvem.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#B08D57]/20 bg-black/40">
          {etapa === 'CONCILIACAO' && (
            <>
              <button
                type="button"
                onClick={() => { setEtapa('UPLOAD'); setLinhasProcessadas([]); }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                Trocar Arquivo
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-transparent hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={selecionadosCount === 0}
                  onClick={executarImplantacao}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.97] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-[#B08D57]/30 border border-[#DFBA73]/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Implantar {selecionadosCount} Novo(s) no Banco</span>
                </button>
              </div>
            </>
          )}

          {etapa === 'UPLOAD' && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {etapa === 'CONCLUIDO' && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.97] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-[#B08D57]/30 border border-[#DFBA73]/50 transition-all cursor-pointer"
              >
                <span>Concluir e Voltar ao Painel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
