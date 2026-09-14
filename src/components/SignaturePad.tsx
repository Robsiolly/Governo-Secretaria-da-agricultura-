import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, CheckCircle2, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  responsavelNome?: string;
  matricula?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  responsavelNome = 'Operador',
  matricula = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [hasSavedSig, setHasSavedSig] = useState(false);

  // Redimensiona o canvas para sua resolução nativa sem distorcer
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Salva imagem atual antes do resize
    const data = canvas.toDataURL();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Linha de assinatura suave no padrão SP
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 24);
    ctx.lineTo(rect.width - 20, rect.height - 24);
    ctx.stroke();

    if (hasSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = data;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Verifica se há assinatura salva para esta matrícula
    if (matricula) {
      const saved = StorageService.getAssinaturaSalva(matricula);
      if (saved) {
        setHasSavedSig(true);
      }
    }

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [matricula]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    setHasSignature(true);

    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 24);
    ctx.lineTo(rect.width - 20, rect.height - 24);
    ctx.stroke();

    setHasSignature(false);
    onSave('');
  };

  // Gerar assinatura digital estilizada (Rubrica automática)
  const gerarAssinaturaDigitalPadrao = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    // Limpa fundo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Linha de base
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, rect.height - 24);
    ctx.lineTo(rect.width - 20, rect.height - 24);
    ctx.stroke();

    // Desenha rubrica caligráfica estilizada em preto
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic bold 26px "Brush Script MT", "Caveat", "Segoe Script", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(responsavelNome, rect.width / 2, rect.height / 2 - 6);

    // Traço estilizado sob o nome
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(rect.width / 2 - 80, rect.height / 2 + 12);
    ctx.quadraticCurveTo(rect.width / 2, rect.height / 2 + 18, rect.width / 2 + 80, rect.height / 2 + 10);
    ctx.stroke();

    setHasSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const salvarComoAssinaturaPadrao = () => {
    const canvas = canvasRef.current;
    if (!canvas || !matricula) return;
    const dataUrl = canvas.toDataURL('image/png');
    StorageService.salvarAssinaturaPadrao(matricula, dataUrl);
    setHasSavedSig(true);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const carregarAssinaturaSalva = () => {
    if (!matricula) return;
    const saved = StorageService.getAssinaturaSalva(matricula);
    if (!saved) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHasSignature(true);
      onSave(saved);
    };
    img.src = saved;
  };

  return (
    <div id="signature-pad-container" className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-white/70">
        <span className="flex items-center gap-1.5 font-medium text-white">
          <PenTool className="w-3.5 h-3.5 text-[#DFBA73]" />
          Assinatura no painel abaixo:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasSavedSig && (
            <button
              type="button"
              onClick={carregarAssinaturaSalva}
              className="flex items-center gap-1.5 text-[#DFBA73] hover:text-white bg-[#B08D57]/20 border border-[#B08D57]/40 px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
              title="Inserir sua assinatura salva anteriormente"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Usar Salva</span>
            </button>
          )}

          <button
            type="button"
            onClick={gerarAssinaturaDigitalPadrao}
            className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/[0.05] hover:bg-[#B08D57]/20 border border-white/[0.08] hover:border-[#B08D57]/30 px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
            title="Gerar rubrica digital com base no nome do responsável"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DFBA73]" />
            <span>Rubrica Auto</span>
          </button>

          {hasSignature && (
            <button
              type="button"
              onClick={salvarComoAssinaturaPadrao}
              className="flex items-center gap-1.5 text-[#DFBA73] hover:text-white bg-white/[0.05] hover:bg-[#B08D57]/20 border border-white/[0.08] hover:border-[#B08D57]/30 px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
              title="Salvar esta assinatura para usar rapidamente em futuros registros"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salvar Padrão</span>
            </button>
          )}

          <button
            type="button"
            onClick={limparAssinatura}
            className="flex items-center gap-1.5 text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Assinatura padrão memorizada! Você pode usá-la com 1 clique em próximos cadastros.
        </div>
      )}

      <div className="relative border border-[#B08D57]/30 hover:border-[#B08D57]/60 rounded-2xl overflow-hidden bg-white shadow-lg transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-32 cursor-crosshair touch-none"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
            Desenhe a assinatura com o dedo ou mouse aqui...
          </div>
        )}
      </div>
    </div>
  );
};
