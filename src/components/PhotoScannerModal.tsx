import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  UploadCloud, 
  Scan, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  FileCheck,
  Wheat,
  Plane,
  Eye,
  Sliders,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Send,
  Bot,
  Loader2
} from 'lucide-react';
import { RegistroVeiculo, Secretaria, UsuarioAutenticado } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface PhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrosExistentes: RegistroVeiculo[];
  onImportarNovos: (novos: RegistroVeiculo[]) => void;
  usuarioAtual: UsuarioAutenticado;
}

interface LinhaFotoConciliada {
  idTemp: string;
  registro: RegistroVeiculo;
  jaExiste: boolean;
  motivoExistencia?: string;
  selecionado: boolean;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export const PhotoScannerModal: React.FC<PhotoScannerModalProps> = ({
  isOpen,
  onClose,
  registrosExistentes,
  onImportarNovos,
  usuarioAtual,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [modoEntrada, setModoEntrada] = useState<'ESCOLHER' | 'CAMERA' | 'ANALISANDO' | 'CONCILIACAO' | 'CONCLUIDO'>('ESCOLHER');
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [linhasConciliadas, setLinhasConciliadas] = useState<LinhaFotoConciliada[]>([]);
  const [totalImportados, setTotalImportados] = useState(0);
  const [streamCamera, setStreamCamera] = useState<MediaStream | null>(null);

  if (!isOpen) return null;

  // Limpeza de stream de câmera ao fechar
  const pararCamera = () => {
    if (streamCamera) {
      streamCamera.getTracks().forEach((track) => track.stop());
      setStreamCamera(null);
    }
  };

  const fecharModal = () => {
    pararCamera();
    onClose();
  };

  const iniciarCamera = async () => {
    setErro(null);
    try {
      pararCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStreamCamera(stream);
      setModoEntrada('CAMERA');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 200);
    } catch (err: any) {
      console.error('Erro ao acessar câmera:', err);
      setErro('Não foi possível acessar a câmera do aparelho. Você pode selecionar uma foto da galeria.');
      setModoEntrada('ESCOLHER');
    }
  };

  const capturarFotoDaCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      pararCamera();
      setImagemPreview(dataUrl);
      analisarImagemComIA(dataUrl);
    }
  };

  const processarERedimensionarImagem = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        // Redimensionar mantendo proporção com max 1920x1920 para melhor OCR (usando 1920 ao invés de 1280)
        const MAX_DIM = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }

        // Desenhar com nitidez
        ctx.drawImage(img, 0, 0, width, height);
        // Converter em JPEG de alta qualidade para não perder foco nas letras
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada.'));
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo de foto.'));
      reader.readAsDataURL(file);
    });
  };

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const dataUrl = await processarERedimensionarImagem(file);
        setImagemPreview(dataUrl);
        analisarImagemComIA(dataUrl);
      } catch (err: any) {
        setErro(err.message || 'Erro ao preparar a imagem.');
      }
    }
  };

  const normalizarPlaca = (placa?: string): string => {
    if (!placa) return '';
    return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const analisarImagemComIA = async (base64Img: string) => {
    setModoEntrada('ANALISANDO');
    setErro(null);

    try {
      const res = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: 'image/jpeg',
        }),
      });

      if (!res.ok) {
        const dataErr = await res.json().catch(() => ({}));
        throw new Error(dataErr.error || `Erro no servidor (${res.status})`);
      }

      const resultado = await res.json();
      const registrosAchados: any[] = resultado.registros || [];

      if (!resultado.sucesso || registrosAchados.length === 0) {
        throw new Error(
          'A IA não conseguiu ler linhas legíveis na foto. Certifique-se de que a planilha ou caderno esteja bem iluminado, sem reflexos de luz ou sombras escuras, e que o texto (especialmente placa e motorista) esteja nítido.'
        );
      }

      // Preparar mapas de conciliação com o banco de dados
      const mapaPlacasExistentesHoje = new Set<string>();
      const mapaPlacasComHora = new Set<string>();

      registrosExistentes.forEach((reg) => {
        const p = normalizarPlaca(reg.placa);
        const d = reg.data || '';
        const hs = reg.horarioSaida || '';
        const hc = reg.horarioChegada || '';
        if (p) {
          mapaPlacasExistentesHoje.add(`${p}_${d}`);
          if (hs) mapaPlacasComHora.add(`${p}_${d}_${hs}`);
          if (hc) mapaPlacasComHora.add(`${p}_${d}_${hc}`);
        }
      });

      const conciliados: LinhaFotoConciliada[] = registrosAchados.map((item, index) => {
        const placaLimpa = normalizarPlaca(item.placa);
        const dataReg = item.data || getLocalDateString();
        const horaSaida = item.horarioSaida || '';
        const horaChegada = item.horarioChegada || '';

        let secretaria: Secretaria = 'Secretaria da Agricultura';
        if (item.secretaria && String(item.secretaria).toLowerCase().includes('turismo')) {
          secretaria = 'Secretaria do Turismo';
        }

        let jaExiste = false;
        let motivoExistencia = '';

        const chaveComHoraSaida = `${placaLimpa}_${dataReg}_${horaSaida}`;
        const chaveComHoraChegada = `${placaLimpa}_${dataReg}_${horaChegada}`;
        const chaveSimples = `${placaLimpa}_${dataReg}`;

        if (placaLimpa) {
          if (horaSaida && mapaPlacasComHora.has(chaveComHoraSaida)) {
            jaExiste = true;
            motivoExistencia = `Já registrado hoje (${horaSaida})`;
          } else if (horaChegada && mapaPlacasComHora.has(chaveComHoraChegada)) {
            jaExiste = true;
            motivoExistencia = `Já registrado (chegada ${horaChegada})`;
          } else if (!horaSaida && !horaChegada && mapaPlacasExistentesHoje.has(chaveSimples)) {
            jaExiste = true;
            motivoExistencia = `Placa já possui lançamento nesta data`;
          }
        }

        const garagemFinal = item.garagem || 'Kalunga';
        let andarFinal = item.andar || 'SAA';
        if (garagemFinal && andarFinal && !andarFinal.includes(garagemFinal)) {
          andarFinal = `${garagemFinal} • ${andarFinal}`;
        }

        const regMontado: RegistroVeiculo = {
          id: `reg-scan-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          secretaria,
          data: dataReg,
          motorista: item.motorista || 'Motorista Identificado na Foto',
          fct: secretaria === 'Secretaria do Turismo' ? 'N/A' : (item.fct || ''),
          horarioSaida: horaSaida,
          horarioChegada: horaChegada,
          garagem: garagemFinal,
          andar: andarFinal,
          funcionarioResponsavel: usuarioAtual.nome || 'Scanner IA',
          matriculaFuncionario: usuarioAtual.matricula || 'IA-OCR',
          assinaturaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="sans-serif" font-size="12" fill="%23B08D57">Reconhecido via Foto IA</text></svg>',
          placa: item.placa ? item.placa.toUpperCase().trim() : '',
          modeloVeiculo: item.modeloVeiculo || '',
          destino: item.destino || '',
          ocorrencia: item.ocorrencia || '',
          status: horaChegada ? 'FINALIZADO' : 'EM_TRANSITO',
          criadoEm: new Date().toISOString(),
        };

        return {
          idTemp: `scan-${index}`,
          registro: regMontado,
          jaExiste,
          motivoExistencia,
          selecionado: !jaExiste, // Automaticamente marca apenas os que NÃO estão cadastrados
        };
      });

      setLinhasConciliadas(conciliados);
      setModoEntrada('CONCILIACAO');
    } catch (err: any) {
      console.error('Falha ao processar foto:', err);
      setErro(err.message || 'Não foi possível analisar a imagem. Tente novamente.');
      setModoEntrada('ESCOLHER');
    }
  };

  const alternarSelecao = (idx: number) => {
    setLinhasConciliadas((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selecionado: !item.selecionado } : item))
    );
  };

  const alternarTodosNovos = (marcar: boolean) => {
    setLinhasConciliadas((prev) =>
      prev.map((item) => (!item.jaExiste ? { ...item, selecionado: marcar } : item))
    );
  };

  const executarImplantacaoAutomatica = () => {
    const novos = linhasConciliadas
      .filter((item) => item.selecionado && !item.jaExiste)
      .map((item) => item.registro);

    if (novos.length === 0) {
      setErro('Nenhum novo registro selecionado para implantação.');
      return;
    }

    onImportarNovos(novos);
    setTotalImportados(novos.length);
    setModoEntrada('CONCLUIDO');
  };

  const novosCount = linhasConciliadas.filter((l) => !l.jaExiste).length;
  const existentesCount = linhasConciliadas.filter((l) => l.jaExiste).length;
  const selecionadosCount = linhasConciliadas.filter((l) => l.selecionado && !l.jaExiste).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#111317]/95 border border-[#B08D57]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/40 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#B08D57]/20 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73] shadow-md shadow-[#B08D57]/10">
              <Camera className="w-5 h-5 text-[#DFBA73]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Scanner de Prancheta & Folha por Foto</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/30 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#DFBA73]" />
                  <span>IA de Visão</span>
                </span>
              </h2>
              <p className="text-xs text-[#C6A96B]/80 font-medium">
                Tira ou carrega uma foto, reconhece as viagens escritas e implanta os registros ausentes no banco
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={fecharModal}
              className="p-2 text-white/50 hover:text-white rounded-2xl hover:bg-[#B08D57]/20 active:scale-[0.94] transition-all cursor-pointer border border-transparent hover:border-[#B08D57]/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Modal Body Principal */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col">
            {erro && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{erro}</span>
              </div>
            )}

            {/* Modo: Escolha (Câmera ou Galeria) */}
            {modoEntrada === 'ESCOLHER' && (
              <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opção 1: Abrir Câmera Nativa */}
                <label className="group p-6 rounded-3xl bg-black/40 border border-[#B08D57]/30 hover:border-[#DFBA73] hover:bg-[#B08D57]/10 transition-all text-left flex flex-col items-center sm:items-start text-center sm:text-left gap-4 cursor-pointer active:scale-[0.98]">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleArquivoSelecionado}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C6A96B]/20 to-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] group-hover:scale-105 transition-transform shadow-lg shadow-[#B08D57]/15">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-[#DFBA73] transition-colors">
                      Tirar Foto com a Câmera
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60">
                      Use a câmera do seu celular para dar zoom e focar na prancheta ou folha física.
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFBA73]">
                    <span>Ativar Câmera Nativa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </label>

                {/* Opção 2: Carregar da Galeria/Arquivo */}
                <label className="group p-6 rounded-3xl bg-black/40 border border-[#B08D57]/30 hover:border-[#DFBA73] hover:bg-[#B08D57]/10 transition-all text-left flex flex-col items-center sm:items-start text-center sm:text-left gap-4 cursor-pointer active:scale-[0.98]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArquivoSelecionado}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C6A96B]/20 to-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] group-hover:scale-105 transition-transform shadow-lg shadow-[#B08D57]/15">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-[#DFBA73] transition-colors">
                      Carregar Foto da Galeria
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60">
                      Selecione uma foto já tirada ou captura de tela guardada no seu celular ou computador.
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFBA73]">
                    <span>Selecionar Imagem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </label>
              </div>

              {/* Dicas de Captura */}
              <div className="bg-black/30 border border-[#B08D57]/20 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-[#DFBA73] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#DFBA73]" />
                  <span>Dicas para melhor reconhecimento da foto:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/70">
                  <div className="bg-[#111317]/60 p-3 rounded-xl border border-white/5">
                    <strong className="text-white block mb-1">Boa Iluminação</strong>
                    <span>Evite sombras fortes sobre a folha para que placas e nomes fiquem bem nítidos.</span>
                  </div>
                  <div className="bg-[#111317]/60 p-3 rounded-xl border border-white/5">
                    <strong className="text-white block mb-1">Enquadramento Total</strong>
                    <span>Enquadre a tabela inteira ou o bloco de linhas que você quer registrar no app.</span>
                  </div>
                  <div className="bg-[#111317]/60 p-3 rounded-xl border border-white/5">
                    <strong className="text-white block mb-1">Conciliação Automática</strong>
                    <span>O que já foi cadastrado antes não será duplicado; só entram as viagens faltantes.</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Modo: Câmera Ativa */}
            {modoEntrada === 'CAMERA' && (
              <div className="space-y-4 flex flex-col items-center">
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#DFBA73] bg-black max-w-lg w-full aspect-[4/3] shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Linhas de Guia de Scanner */}
                <div className="absolute inset-4 border border-dashed border-[#DFBA73]/50 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#DFBA73] to-transparent animate-pulse" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { pararCamera(); setModoEntrada('ESCOLHER'); }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={capturarFotoDaCamera}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.96] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-[#B08D57]/30 border border-[#DFBA73]/50 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>Capturar e Reconhecer</span>
                </button>
              </div>
            </div>
          )}

          {/* Modo: Analisando com IA */}
          {modoEntrada === 'ANALISANDO' && (
            <div className="py-16 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-[#B08D57]/20 border-t-[#DFBA73] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#DFBA73]">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  Inteligência Artificial Analisando a Folha...
                </h3>
                <p className="text-xs sm:text-sm text-[#C6A96B]/80">
                  Lendo caligrafia manuscrita, placas, motoristas, secretarias e horários registrados na foto.
                </p>
              </div>
            </div>
          )}

          {/* Modo: Tabela de Conciliação e Confirmação */}
          {modoEntrada === 'CONCILIACAO' && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#111317]/80 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-300/70 font-medium">Faltando no Banco</span>
                    <p className="text-lg font-bold text-emerald-300 font-mono">{novosCount} novo(s)</p>
                  </div>
                </div>

                <div className="bg-[#111317]/80 border border-[#B08D57]/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B08D57]/15 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#C6A96B]/70 font-medium">Já Cadastrados (Protegidos)</span>
                    <p className="text-lg font-bold text-[#DFBA73] font-mono">{existentesCount}</p>
                  </div>
                </div>

                <div className="bg-[#111317]/80 border border-blue-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-blue-300/70 font-medium">Total Reconhecido na Foto</span>
                    <p className="text-lg font-bold text-blue-300 font-mono">{linhasConciliadas.length}</p>
                  </div>
                </div>
              </div>

              {/* Barra de Seleção */}
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
                  {selecionadosCount} novo(s) selecionado(s) para implantação imediata
                </span>
              </div>

              {/* Tabela de Conciliação */}
              <div className="border border-[#B08D57]/20 rounded-2xl overflow-hidden bg-black/40 max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#16181d] text-[#DFBA73] border-b border-[#B08D57]/20 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center">Status</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Placa</th>
                      <th className="p-3">Motorista</th>
                      <th className="p-3">Secretaria</th>
                      <th className="p-3">Horários</th>
                      <th className="p-3">Garagem/Andar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {linhasConciliadas.map((item, idx) => (
                      <tr
                        key={item.idTemp}
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
                              title={item.motivoExistencia || 'Já cadastrado no banco'}
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

          {/* Modo: Concluído */}
          {modoEntrada === 'CONCLUIDO' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Importação da Foto Concluída!</h3>
                <p className="text-sm text-[#C6A96B] mt-1 font-medium">
                  {totalImportados} registro(s) novos foram reconhecidos e implantados diretamente no banco de dados.
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Os dados já foram sincronizados e estão prontos no painel principal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#B08D57]/20 bg-black/40">
          {modoEntrada === 'CONCILIACAO' && (
            <>
              <button
                type="button"
                onClick={() => { setModoEntrada('ESCOLHER'); setLinhasConciliadas([]); }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                Tirar Outra Foto
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-transparent hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={selecionadosCount === 0}
                  onClick={executarImplantacaoAutomatica}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.97] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-[#B08D57]/30 border border-[#DFBA73]/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Implantar {selecionadosCount} no Aplicativo</span>
                </button>
              </div>
            </>
          )}

          {modoEntrada === 'ESCOLHER' && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={fecharModal}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {modoEntrada === 'CONCLUIDO' && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={fecharModal}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.97] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-[#B08D57]/30 border border-[#DFBA73]/50 transition-all cursor-pointer"
              >
                <span>Concluir e Ver Painel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
