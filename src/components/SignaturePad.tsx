import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckCircle2, PenTool, Sparkles } from 'lucide-react';

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

  return (
    <div id="signature-pad-container" className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-slate-300">
        <span className="flex items-center gap-2 font-bold text-white">
          <PenTool className="w-4 h-4 text-amber-400" />
          Assine na área em branco abaixo com o mouse ou dedo (Touch):
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={gerarAssinaturaDigitalPadrao}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-400 bg-amber-950/60 border border-amber-9500/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm font-semibold"
            title="Gerar rubrica digital com base no nome do responsável"
          >
            <Sparkles className="w-4 h-4" />
            <span>Rubrica Automática</span>
          </button>
          <button
            type="button"
            onClick={limparAssinatura}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm font-semibold"
          >
            <Eraser className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      <div className="relative border-2 border-dashed border-slate-600 hover:border-amber-9500 rounded-2xl overflow-hidden bg-white shadow-lg transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 cursor-crosshair touch-none"
        />

        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-500">
            <span className="text-sm sm:text-base font-bold">Toque ou desenhe aqui para assinar</span>
            <span className="text-xs text-slate-400 mt-1">Assinatura do Funcionário Responsável pelo Cadastro</span>
          </div>
        )}

        {hasSignature && (
          <div className="absolute top-2.5 right-2.5 pointer-events-none flex items-center gap-1.5 bg-amber-950 text-amber-950 px-3 py-1 rounded-full text-xs font-bold border border-amber-400 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            Assinatura Pronta
          </div>
        )}
      </div>
    </div>
  );
};
