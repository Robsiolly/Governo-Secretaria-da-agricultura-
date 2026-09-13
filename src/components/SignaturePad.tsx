import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckCircle2, PenTool, Sparkles, BookmarkCheck, Bookmark } from 'lucide-react';

interface SignaturePadProps {
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  funcionarioNome?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  initialSignature,
  onSave,
  funcionarioNome = 'Funcionário',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [hasSavedSig, setHasSavedSig] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_operator_signature');
    if (saved) {
      setHasSavedSig(true);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
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
    setHasSignature(false);
    onSave('');
  };

  const gerarAssinaturaDigitalPadrao = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Linha fluida da assinatura
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(35, rect.height * 0.65);
    ctx.bezierCurveTo(70, rect.height * 0.25, 110, rect.height * 0.85, 160, rect.height * 0.45);
    ctx.bezierCurveTo(200, rect.height * 0.2, 230, rect.height * 0.75, 290, rect.height * 0.5);
    ctx.stroke();

    // Texto de validação
    ctx.font = '500 11px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Assinado digitalmente por ${funcionarioNome}`, 25, rect.height - 12);

    setHasSignature(true);
    onSave(canvas.toDataURL('image/png'));
  };

  const salvarComoAssinaturaPadrao = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('saved_operator_signature', dataUrl);
    setHasSavedSig(true);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const carregarAssinaturaSalva = () => {
    const saved = localStorage.getItem('saved_operator_signature');
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
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          Assinatura no painel abaixo:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasSavedSig && (
            <button
              type="button"
              onClick={carregarAssinaturaSalva}
              className="flex items-center gap-1.5 text-amber-300 hover:text-white bg-amber-500/15 border border-amber-400/30 px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
              title="Inserir sua assinatura salva anteriormente"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Usar Salva</span>
            </button>
          )}

          <button
            type="button"
            onClick={gerarAssinaturaDigitalPadrao}
            className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
            title="Gerar rubrica digital com base no nome do responsável"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rubrica Auto</span>
          </button>

          {hasSignature && (
            <button
              type="button"
              onClick={salvarComoAssinaturaPadrao}
              className="flex items-center gap-1.5 text-amber-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-3 py-1 rounded-xl transition-all cursor-pointer text-xs font-medium active:scale-[0.96]"
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

      <div className="relative border border-white/20 hover:border-white/40 rounded-2xl overflow-hidden bg-white shadow-lg transition-colors">
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

        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
            <span className="text-sm font-medium">Toque ou desenhe aqui para assinar</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Assinatura / Rubrica do Operador</span>
          </div>
        )}

        {hasSignature && (
          <div className="absolute top-2.5 right-2.5 pointer-events-none flex items-center gap-1.5 bg-slate-900/90 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assinado</span>
          </div>
        )}
      </div>
    </div>
  );
};

