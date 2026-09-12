import React, { useState, useEffect } from 'react';
import { X, Clock, Check, ArrowRight, CheckCircle2, Car, User, FileText, AlertCircle } from 'lucide-react';
import { RegistroVeiculo } from '../types';

interface QuickTimeModalProps {
  registro: RegistroVeiculo | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvarHorarios: (id: string, horarioSaida: string, horarioChegada: string) => void;
}

export const QuickTimeModal: React.FC<QuickTimeModalProps> = ({
  registro,
  isOpen,
  onClose,
  onSalvarHorarios,
}) => {
  const [saida, setSaida] = useState('');
  const [chegada, setChegada] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (registro) {
      setSaida(registro.horarioSaida || '');
      setChegada(registro.horarioChegada || '');
      setErro(null);
    }
  }, [registro]);

  if (!isOpen || !registro) return null;

  const handleDefinirSaidaAgora = () => {
    const agora = new Date().toTimeString().slice(0, 5);
    setSaida(agora);
    setErro(null);
  };

  const handleDefinirChegadaAgora = () => {
    const agora = new Date().toTimeString().slice(0, 5);
    setChegada(agora);
    setErro(null);
  };

  const handleLimparChegada = () => {
    setChegada('');
    setErro(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saida.trim()) {
      setErro('O horário de saída é obrigatório.');
      return;
    }

    onSalvarHorarios(registro.id, saida.trim(), chegada.trim());
    onClose();
  };

  const isAgri = registro.secretaria === 'Secretaria da Agricultura';
  const statusPrevisto = chegada.trim() ? 'FINALIZADO' : 'EM_TRANSITO';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-horarios-titulo"
    >
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header com fontes grandes para visualização fácil */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h2 id="modal-horarios-titulo" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Acessar e Alterar Horários
              </h2>
              <p className="text-sm text-slate-300">
                Ajuste os horários de <strong className="text-emerald-400">Saída</strong> e <strong className="text-amber-400">Chegada</strong> do veículo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Resumo do Veículo / Motorista */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            {isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? (
              <span className="font-mono font-bold text-base px-3 py-1 bg-slate-800 text-white rounded-xl border border-slate-700">
                FCT: {registro.fct}
              </span>
            ) : (
              <span className="font-semibold text-xs px-2.5 py-1 bg-amber-950/70 text-amber-300 rounded-xl border border-amber-800/60">
                Sem FCT (Turismo)
              </span>
            )}
            <span className={`font-semibold px-3 py-1 rounded-xl text-sm ${
              isAgri ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40' : 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
            }`}>
              {isAgri ? 'Sec. Agricultura' : 'Sec. Turismo'}
            </span>
          </div>

          <div className="text-slate-200 font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Motorista: <strong className="text-white">{registro.motorista}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {erro && (
            <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-700 text-rose-100 text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* Bloco 1: Horário de Saída */}
          <div className="bg-slate-950/80 border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="input-horario-saida" className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                Horário de Saída do Veículo
              </label>
              <button
                type="button"
                onClick={handleDefinirSaidaAgora}
                className="px-4 py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-semibold text-sm rounded-xl border border-emerald-500/40 transition-colors cursor-pointer"
              >
                Colocar Hora Atual
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="input-horario-saida"
                type="time"
                required
                value={saida}
                onChange={(e) => setSaida(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 rounded-2xl px-5 py-3.5 text-2xl font-bold font-mono text-emerald-300 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-slate-400">
              Momento em que o veículo oficial saiu da garagem/estacionamento.
            </p>
          </div>

          {/* Bloco 2: Horário de Chegada */}
          <div className="bg-slate-950/80 border-2 border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="input-horario-chegada" className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                Horário de Chegada / Retorno
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDefinirChegadaAgora}
                  className="px-4 py-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-semibold text-sm rounded-xl border border-amber-500/40 transition-colors cursor-pointer"
                >
                  Chegou Agora
                </button>
                {chegada && (
                  <button
                    type="button"
                    onClick={handleLimparChegada}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    title="Remover horário de retorno e marcar como Em Trânsito"
                  >
                    Em Trânsito
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="input-horario-chegada"
                type="time"
                value={chegada}
                onChange={(e) => setChegada(e.target.value)}
                placeholder="--:--"
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-5 py-3.5 text-2xl font-bold font-mono text-amber-300 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-slate-400">
              {chegada
                ? 'Com o horário preenchido, a viagem será marcada como Concluída.'
                : 'Deixe em branco se o veículo ainda estiver em trânsito/operação externa.'}
            </p>
          </div>

          {/* Indicador de Status Resultante */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Status resultante da viagem:</span>
            {statusPrevisto === 'FINALIZADO' ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
                Viagem Concluída
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                <Clock className="w-4 h-4 animate-pulse" />
                Veículo Em Trânsito
              </span>
            )}
          </div>

          {/* Botões de Ação com tamanho ampliado para facilitar o clique */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base transition-colors cursor-pointer border border-slate-700 text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              <span>Salvar Horários Atualizados</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
