import React, { useState } from 'react';
import { Wheat, Plane, Eye, Edit3, Clock, CheckCircle2, FileDown, AlertCircle, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface RecordsTableProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onEditar: (registro: RegistroVeiculo) => void;
  onEditarHorarios?: (registro: RegistroVeiculo) => void;
  onExcluir?: (id: string) => void;
  onNovoRegistro?: () => void;
  onAbrirPainelDiario?: () => void;
  usuarioAtual?: UsuarioAutenticado | null;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  registros,
  onVerDetalhes,
  onEditar,
  onEditarHorarios,
  onExcluir,
  onNovoRegistro,
  usuarioAtual,
}) => {
  const [registroParaExcluir, setRegistroParaExcluir] = useState<RegistroVeiculo | null>(null);

  const confirmarExclusao = () => {
    if (registroParaExcluir && onExcluir) {
      onExcluir(registroParaExcluir.id);
      setRegistroParaExcluir(null);
    }
  };

  if (registros.length === 0) {
    return (
      <div className="bg-[#111317]/70 backdrop-blur-2xl border border-[#B08D57]/20 rounded-3xl p-10 sm:p-16 text-center space-y-5 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-black/50 border border-[#B08D57]/30 flex items-center justify-center text-[#DFBA73] mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8 text-[#DFBA73]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Nenhum registro encontrado</h3>
          <p className="text-sm text-[#C6A96B]/70 max-w-lg mx-auto leading-relaxed">
            O sistema está pronto para registrar os dados de saída e chegada da Secretaria da Agricultura e Secretaria do Turismo.
          </p>
        </div>
        {onNovoRegistro && (
          <button
            type="button"
            onClick={onNovoRegistro}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 text-slate-950 text-sm font-bold px-6 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer active:scale-[0.96] border border-[#DFBA73]/40"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Primeiro Veículo</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Desktop Ouro Velho Table */}
      <div className="hidden md:block bg-[#111317]/80 backdrop-blur-2xl border border-[#B08D57]/20 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Specular Top Edge Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C6A96B]/30 to-transparent" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#B08D57]/20 bg-black/40 text-[11px] font-semibold uppercase tracking-wider text-[#C6A96B]/80">
                <th className="py-4 px-5">FCT</th>
                <th className="py-4 px-5">Secretaria</th>
                <th className="py-4 px-5">Data</th>
                <th className="py-4 px-5">Motorista / Veículo</th>
                <th className="py-4 px-5">Horários (Saída / Chegada)</th>
                <th className="py-4 px-5">Andar</th>
                <th className="py-4 px-5">Operador Resp.</th>
                <th className="py-4 px-5 text-center">Situação</th>
                <th className="py-4 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B08D57]/10 text-sm">
              {registros.map((reg, index) => {
                const isAgri = reg.secretaria === 'Secretaria da Agricultura';
                const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

                return (
                  <tr
                    key={`${reg.id}-${index}`}
                    onClick={() => onVerDetalhes(reg)}
                    className="hover:bg-[#B08D57]/[0.06] transition-colors duration-150 cursor-pointer group"
                  >
                    {/* FCT */}
                    <td className="py-4 px-5">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-bold text-[#DFBA73] text-base">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl inline-block whitespace-nowrap">
                          Sem FCT (Turismo)
                        </span>
                      )}
                    </td>

                    {/* Secretaria */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isAgri ? 'bg-[#DFBA73] shadow-sm shadow-[#B08D57]/50' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          }`}
                        />
                        <span className="font-semibold text-white/90 truncate max-w-[170px]">
                          {isAgri ? 'Agricultura' : 'Turismo'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-5 text-white/70 whitespace-nowrap font-mono text-xs">
                      {dataFormatada}
                    </td>

                    {/* Motorista & Veículo */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-semibold text-white block text-sm leading-snug">{reg.motorista}</span>
                        {reg.placa && (
                          <span className="text-xs text-[#C6A96B]/70 font-mono block mt-0.5">
                            Placa: <strong className="text-white font-mono">{reg.placa}</strong> {reg.modeloVeiculo ? `• ${reg.modeloVeiculo}` : ''}
                          </span>
                        )}
                        {reg.ocorrencia && (
                          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-lg bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#DFBA73] text-xs font-semibold max-w-[240px] truncate" title={`Ocorrência: ${reg.ocorrencia}`}>
                            <AlertTriangle className="w-3 h-3 text-[#DFBA73] shrink-0" />
                            <span className="truncate">{reg.ocorrencia}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Horários e botão de acesso rápido */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-white/80">{reg.horarioSaida}</span>
                          <span className="text-[#B08D57]/50">→</span>
                          {reg.horarioChegada ? (
                            <span className="text-emerald-400 font-bold">{reg.horarioChegada}</span>
                          ) : (
                            <span className="text-[#DFBA73] text-xs font-medium bg-[#B08D57]/20 border border-[#B08D57]/40 px-2 py-0.5 rounded-lg">
                              Em trânsito
                            </span>
                          )}
                        </div>
                        {onEditarHorarios && (
                          <button
                            type="button"
                            onClick={() => onEditarHorarios(reg)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 hover:bg-[#B08D57]/20 active:scale-[0.96] text-[#DFBA73] hover:text-white border border-[#B08D57]/25 text-xs font-medium transition-all cursor-pointer"
                            title="Ajustar horário de saída ou de chegada"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#DFBA73]" />
                            <span>Ajustar Horário</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Andar / Garagem */}
                    <td className="py-4 px-5 text-white/80 font-medium">
                      <span className="inline-block bg-black/40 px-2.5 py-1 rounded-xl text-xs font-semibold text-white/90 border border-[#B08D57]/30 whitespace-nowrap shadow-sm">
                        {reg.andar || reg.garagem || '-'}
                      </span>
                    </td>

                    {/* Funcionário Responsável & Assinatura */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {reg.assinaturaUrl ? (
                          <img
                            src={reg.assinaturaUrl}
                            alt="Rubrica"
                            className="h-8 w-16 object-contain bg-white rounded-lg border border-white/20 px-1 shrink-0"
                          />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0" />
                        )}
                        <div className="truncate max-w-[150px]">
                          <span className="text-white font-medium block truncate text-xs sm:text-sm">
                            {reg.funcionarioResponsavel}
                          </span>
                          {reg.matriculaFuncionario && (
                            <span className="text-[11px] text-[#C6A96B]/60 block font-mono">
                              Mat: {reg.matriculaFuncionario}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {reg.status === 'EM_TRANSITO' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40">
                          <Clock className="w-3.5 h-3.5 text-[#DFBA73]" />
                          <span>Em Trânsito</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Concluído</span>
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditarHorarios && (
                          <button
                            type="button"
                            onClick={() => onEditarHorarios(reg)}
                            className="p-2 text-[#C6A96B]/70 hover:text-[#DFBA73] hover:bg-[#B08D57]/20 active:scale-[0.94] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#B08D57]/30"
                            title="Ajustar Horário de Saída / Chegada"
                          >
                            <Clock className="w-4 h-4 text-[#DFBA73]" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/[0.08] active:scale-[0.94] rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/[0.08]"
                          title="Baixar Ficha PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditar(reg)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/[0.08] active:scale-[0.94] rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/[0.08]"
                          title="Editar Cadastro Completo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onVerDetalhes(reg)}
                          className="p-2 text-[#DFBA73] hover:text-white hover:bg-[#B08D57]/20 active:scale-[0.94] rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#B08D57]/30"
                          title="Ver Ficha Detalhada"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onExcluir && (
                          <button
                            type="button"
                            onClick={() => setRegistroParaExcluir(reg)}
                            className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 active:scale-[0.94] rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Glass Cards View */}
      <div className="md:hidden space-y-3.5">
        {registros.map((reg, index) => {
          const isAgri = reg.secretaria === 'Secretaria da Agricultura';
          const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

          return (
            <div
              key={`${reg.id}-${index}`}
              onClick={() => onVerDetalhes(reg)}
              className="bg-[#111317]/80 backdrop-blur-2xl border border-[#B08D57]/20 hover:border-[#B08D57]/50 rounded-3xl p-4.5 shadow-lg transition-all cursor-pointer space-y-3.5 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                      isAgri ? 'bg-[#B08D57]/15 border border-[#B08D57]/40 text-[#DFBA73]' : 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-400'
                    }`}
                  >
                    {isAgri ? <Wheat className="w-5 h-5 text-[#DFBA73]" /> : <Plane className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-bold text-[#DFBA73] text-base">{reg.fct}</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          Sem FCT (Turismo)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#C6A96B]/70 font-medium block truncate">
                      {isAgri ? 'Secretaria da Agricultura' : 'Secretaria do Turismo'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {reg.status === 'EM_TRANSITO' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#B08D57]/20 text-[#DFBA73] border border-[#B08D57]/40">
                      <Clock className="w-3.5 h-3.5 text-[#DFBA73]" />
                      <span>Em Trânsito</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Concluído</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Main Info */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-black/40 p-3.5 rounded-2xl border border-[#B08D57]/15">
                <div className="col-span-2">
                  <span className="text-[10px] text-[#C6A96B]/60 block font-semibold uppercase tracking-wider">Motorista:</span>
                  <span className="font-semibold text-white text-sm block mt-0.5">{reg.motorista}</span>
                  {reg.placa && (
                    <span className="text-xs text-[#C6A96B]/70 font-mono mt-0.5 block">
                      Placa: <strong className="text-white font-mono">{reg.placa}</strong> {reg.modeloVeiculo ? `(${reg.modeloVeiculo})` : ''}
                    </span>
                  )}
                </div>
                {reg.ocorrencia && (
                  <div className="col-span-2 p-2.5 bg-[#B08D57]/20 border border-[#B08D57]/40 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-semibold text-[#DFBA73] flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#DFBA73] shrink-0" />
                      Ocorrência da Portaria:
                    </span>
                    <p className="text-xs text-white/90 font-medium whitespace-pre-wrap">
                      {reg.ocorrencia}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-[#C6A96B]/60 block font-semibold uppercase tracking-wider">Data:</span>
                  <span className="text-white font-mono font-medium">{dataFormatada}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C6A96B]/60 block font-semibold uppercase tracking-wider">Local / Andar:</span>
                  <span className="text-white font-medium block whitespace-nowrap">{reg.andar || reg.garagem || '-'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#B08D57]/15">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#C6A96B]/60 block font-semibold uppercase tracking-wider">Horários:</span>
                      <div className="flex items-center gap-2 font-mono text-xs mt-0.5">
                        <span className="text-white">{reg.horarioSaida}</span>
                        <span className="text-[#B08D57]/50">→</span>
                        <span className="text-white">{reg.horarioChegada || 'Em trânsito'}</span>
                      </div>
                    </div>
                    {onEditarHorarios && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarHorarios(reg);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#B08D57]/20 active:scale-[0.96] text-[#DFBA73] border border-[#B08D57]/25 text-xs font-medium transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#DFBA73]" />
                        <span>Ajustar Horário</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsável & Assinatura & Ações */}
              <div className="flex items-center justify-between pt-2 border-t border-[#B08D57]/15" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {reg.assinaturaUrl && (
                    <img
                      src={reg.assinaturaUrl}
                      alt="Assinatura"
                      className="h-7 w-14 object-contain bg-white rounded-lg border border-white/20 px-1"
                    />
                  )}
                  <span className="text-white/90 text-xs font-semibold whitespace-nowrap">
                    {reg.funcionarioResponsavel}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                    className="p-2 text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.94] rounded-xl border border-white/[0.08]"
                    title="Baixar PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditar(reg)}
                    className="p-2 text-white/70 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.94] rounded-xl border border-white/[0.08]"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="p-2 text-[#DFBA73] hover:text-white bg-[#B08D57]/10 hover:bg-[#B08D57]/20 active:scale-[0.94] rounded-xl border border-[#B08D57]/25"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onExcluir && (
                    <button
                      type="button"
                      onClick={() => setRegistroParaExcluir(reg)}
                      className="p-2 text-white/40 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.94] rounded-xl border border-rose-500/20"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão (CRUD: Delete) */}
      {registroParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-150">
          <div className="bg-[#12141A] border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Excluir Registro?</h3>
                <p className="text-xs text-rose-300/80">Operação permanente de remoção</p>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed font-normal">
              Tem certeza que deseja excluir o registro {registroParaExcluir.secretaria === 'Secretaria da Agricultura' && registroParaExcluir.fct && registroParaExcluir.fct !== 'N/A' ? (
                <strong className="text-white font-mono">{registroParaExcluir.fct}</strong>
              ) : (
                <span className="text-[#DFBA73] font-medium">(Sem FCT - Turismo)</span>
              )} do motorista <strong className="text-white">{registroParaExcluir.motorista}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRegistroParaExcluir(null)}
                className="px-5 py-2.5 rounded-2xl border border-white/[0.1] text-white/70 hover:text-white hover:bg-white/[0.05] active:scale-[0.96] font-medium text-sm cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.96] text-white font-semibold text-sm shadow-lg shadow-rose-900/40 cursor-pointer flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
