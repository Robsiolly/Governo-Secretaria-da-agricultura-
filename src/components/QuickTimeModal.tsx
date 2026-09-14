import React, { useState, useEffect } from 'react';
import { X, Clock, Check, CheckCircle2, User, AlertCircle, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo } from '../types';

interface QuickTimeModalProps {
  registro: RegistroVeiculo | null;
  isOpen: boolean;
  onClose: () => void;
  onSalvarHorarios: (id: string, horarioSaida: string, horarioChegada: string, ocorrencia?: string) => void;
}

export const QuickTimeModal: React.FC<QuickTimeModalProps> = ({
  registro,
  isOpen,
  onClose,
  onSalvarHorarios,
}) => {
  const [saida, setSaida] = useState('');
  const [chegada, setChegada] = useState('');
  const [ocorrencia, setOcorrencia] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (registro) {
      setSaida(registro.horarioSaida || '');
      setChegada(registro.horarioChegada || '');
      setOcorrencia(registro.ocorrencia || '');
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

    onSalvarHorarios(registro.id, saida.trim(), chegada.trim(), ocorrencia.trim());
    onClose();
  };

  const isAgri = registro.secretaria === 'Secretaria da Agricultura';
  const statusPrevisto = chegada.trim() ? 'FINALIZADO' : 'EM_TRANSITO';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-horarios-titulo"
    >
      <div className="bg-[#111317] border border-[#B08D57]/30 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header com estilo Ouro Velho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#B08D57]/20 bg-black/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h2 id="modal-horarios-titulo" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Acessar e Alterar Horários
              </h2>
              <p className="text-sm text-[#C6A96B]/80">
                Ajuste os horários de <strong className="text-[#DFBA73]">Saída</strong> e <strong className="text-[#DFBA73]">Chegada</strong> do veículo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-white/50 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Resumo do Veículo / Motorista */}
        <div className="bg-black/40 border-b border-[#B08D57]/15 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            {isAgri && registro.fct && registro.fct !== 'N/A' && registro.fct !== '-' ? (
              <span className="font-mono font-bold text-base px-3 py-1 bg-black/70 text-[#DFBA73] rounded-xl border border-[#B08D57]/30">
                FCT: {registro.fct}
              </span>
            ) : (
              <span className="font-semibold text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                Sem FCT (Turismo)
              </span>
            )}
            <span className={`font-semibold px-3 py-1 rounded-xl text-sm ${
              isAgri ? 'bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
            }`}>
              {isAgri ? 'Sec. Agricultura' : 'Sec. Turismo'}
            </span>
          </div>

          <div className="text-white/80 font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-[#C6A96B]/70" />
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
          <div className="bg-black/40 border border-[#B08D57]/25 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="input-horario-saida" className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#DFBA73]"></span>
                Horário de Saída do Veículo
              </label>
              <button
                type="button"
                onClick={handleDefinirSaidaAgora}
                className="px-4 py-2 bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-[#DFBA73] font-semibold text-sm rounded-xl border border-[#B08D57]/40 transition-colors cursor-pointer"
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
                className="w-full bg-black/60 border border-[#B08D57]/30 focus:border-[#DFBA73] rounded-2xl px-5 py-3.5 text-2xl font-bold font-mono text-[#DFBA73] focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-[#C6A96B]/70">
              Momento em que o veículo oficial saiu da garagem/estacionamento.
            </p>
          </div>

          {/* Bloco 2: Horário de Chegada */}
          <div className="bg-black/40 border border-[#B08D57]/25 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="input-horario-chegada" className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#DFBA73]"></span>
                Horário de Chegada / Retorno
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDefinirChegadaAgora}
                  className="px-4 py-2 bg-[#B08D57]/30 hover:bg-[#B08D57]/40 text-[#DFBA73] font-semibold text-sm rounded-xl border border-[#B08D57]/50 transition-colors cursor-pointer"
                >
                  Chegou Agora
                </button>
                {chegada && (
                  <button
                    type="button"
                    onClick={handleLimparChegada}
                    className="px-3 py-2 bg-black/60 hover:bg-black/80 text-white/70 text-xs font-semibold rounded-xl border border-white/20 transition-colors cursor-pointer"
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
                className="w-full bg-black/60 border border-[#B08D57]/30 focus:border-[#DFBA73] rounded-2xl px-5 py-3.5 text-2xl font-bold font-mono text-emerald-400 focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-[#C6A96B]/70">
              {chegada
                ? 'Com o horário preenchido, a viagem será marcada como Concluída.'
                : 'Deixe em branco se o veículo ainda estiver em trânsito/operação externa.'}
            </p>
          </div>

          {/* Indicador de Status Resultante */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/80">Status resultante da viagem:</span>
            {statusPrevisto === 'FINALIZADO' ? (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <CheckCircle2 className="w-4 h-4" />
                Viagem Concluída
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40">
                <Clock className="w-4 h-4 animate-pulse" />
                Veículo Em Trânsito
              </span>
            )}
          </div>

          {/* Campo de Ocorrência / Anotações Rápidas */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-2xl p-4 space-y-2">
            <label htmlFor="input-ocorrencia-rapida" className="text-sm font-bold text-[#DFBA73] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#DFBA73]" />
                Campo de Ocorrência (Portaria / Operador)
              </span>
              <span className="text-[11px] text-[#C6A96B]/70 font-normal">Opcional</span>
            </label>
            <textarea
              id="input-ocorrencia-rapida"
              rows={2}
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              placeholder="Anotar alguma ocorrência no retorno, avaria, atraso ou observação..."
              className="w-full bg-black/60 border border-[#B08D57]/25 focus:border-[#DFBA73] rounded-xl p-3 text-sm text-white placeholder-white/40 focus:outline-none resize-y"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3.5 rounded-2xl bg-black/60 hover:bg-black/80 text-white/70 font-bold text-base transition-colors cursor-pointer border border-white/20 text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 font-bold text-base shadow-xl shadow-[#B08D57]/25 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#DFBA73]/40"
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
