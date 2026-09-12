import React, { useState } from 'react';
import { Wheat, Compass, Eye, Edit3, Clock, CheckCircle2, FileDown, AlertCircle, Plus, Trash2, X, AlertTriangle } from 'lucide-react';
import { RegistroVeiculo, UsuarioAutenticado } from '../types';
import { PdfService } from '../services/pdfService';

interface RecordsTableProps {
  registros: RegistroVeiculo[];
  onVerDetalhes: (registro: RegistroVeiculo) => void;
  onEditar: (registro: RegistroVeiculo) => void;
  onEditarHorarios?: (registro: RegistroVeiculo) => void;
  onExcluir?: (id: string) => void;
  onNovoRegistro?: () => void;
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
      <div className="bg-slate-900 border-2 border-slate-750 rounded-3xl p-10 sm:p-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
          <AlertCircle className="w-9 h-9 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Nenhum registro de veículo encontrado</h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
            O banco de dados está pronto para registrar os dados de saída e chegada da Secretaria da Agricultura e Secretaria do Turismo.
          </p>
        </div>
        {onNovoRegistro && (
          <button
            type="button"
            onClick={onNovoRegistro}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm sm:text-base font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all cursor-pointer min-h-[50px]"
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
      {/* Desktop Table */}
      <div className="hidden md:block bg-slate-900 border-2 border-slate-750 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
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
            <tbody className="divide-y divide-slate-800 text-sm sm:text-base">
              {registros.map((reg, index) => {
                const isAgri = reg.secretaria === 'Secretaria da Agricultura';
                const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

                return (
                  <tr
                    key={`${reg.id}-${index}`}
                    onClick={() => onVerDetalhes(reg)}
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    {/* FCT */}
                    <td className="py-4 px-5">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-black text-emerald-400 group-hover:text-emerald-300 text-base sm:text-lg">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-xs font-sans font-semibold text-amber-300/90 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-xl inline-block whitespace-nowrap">
                          Sem FCT (Turismo)
                        </span>
                      )}
                    </td>

                    {/* Secretaria */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            isAgri ? 'bg-emerald-400 shadow-sm shadow-emerald-500' : 'bg-[#d4b896] shadow-sm shadow-[#8c6d46]'
                          }`}
                        />
                        <span className="font-bold text-white truncate max-w-[170px]">
                          {isAgri ? 'Agricultura' : 'Turismo'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-5 text-slate-200 whitespace-nowrap font-medium">
                      {dataFormatada}
                    </td>

                    {/* Motorista & Veículo */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-bold text-white block text-base leading-snug">{reg.motorista}</span>
                        {reg.placa && (
                          <span className="text-xs sm:text-sm text-slate-300 font-mono font-medium block mt-0.5">
                            Placa: <strong className="text-emerald-300">{reg.placa}</strong> {reg.modeloVeiculo ? `• ${reg.modeloVeiculo}` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Horários e botão de acesso rápido */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-base">
                          <span className="text-emerald-400 font-mono">{reg.horarioSaida}</span>
                          <span className="text-slate-400">→</span>
                          {reg.horarioChegada ? (
                            <span className="text-slate-100 font-mono">{reg.horarioChegada}</span>
                          ) : (
                            <span className="text-[#d4b896] text-xs sm:text-sm font-semibold bg-[#362619] px-2.5 py-0.5 rounded-lg border border-[#a8855d]/40 animate-pulse">
                              Em trânsito
                            </span>
                          )}
                        </div>
                        {onEditarHorarios && (
                          <button
                            type="button"
                            onClick={() => onEditarHorarios(reg)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#d4b896] hover:text-[#e8d5b7] border border-[#a8855d]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="Acessar e ajustar horário de saída ou de chegada"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Ajustar Horário</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Andar */}
                    <td className="py-4 px-5 text-slate-200 font-medium">
                      <span className="inline-block bg-slate-800 px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700">
                        {reg.andar}
                      </span>
                    </td>

                    {/* Funcionário Responsável & Assinatura */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {reg.assinaturaUrl ? (
                          <img
                            src={reg.assinaturaUrl}
                            alt="Rubrica"
                            className="h-8 w-16 object-contain bg-white rounded-lg border-2 border-slate-500 px-1 shrink-0"
                          />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                        )}
                        <div className="truncate max-w-[150px]">
                          <span className="text-white font-bold block truncate text-sm">
                            {reg.funcionarioResponsavel}
                          </span>
                          {reg.matriculaFuncionario && (
                            <span className="text-xs text-slate-300 block font-mono font-medium">
                              Mat: {reg.matriculaFuncionario}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {reg.status === 'EM_TRANSITO' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          Em Trânsito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Concluído
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
                            className="p-2.5 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                            title="Ajustar Horário de Saída / Chegada"
                          >
                            <Clock className="w-5 h-5 text-amber-400" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                          className="p-2.5 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                          title="Baixar Ficha PDF"
                        >
                          <FileDown className="w-5 h-5 text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditar(reg)}
                          className="p-2.5 text-slate-300 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                          title="Editar Cadastro Completo"
                        >
                          <Edit3 className="w-5 h-5 text-emerald-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onVerDetalhes(reg)}
                          className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                          title="Ver Ficha Detalhada"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {onExcluir && (
                          <button
                            type="button"
                            onClick={() => setRegistroParaExcluir(reg)}
                            className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-800/40"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-5 h-5" />
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

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {registros.map((reg, index) => {
          const isAgri = reg.secretaria === 'Secretaria da Agricultura';
          const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

          return (
            <div
              key={`${reg.id}-${index}`}
              onClick={() => onVerDetalhes(reg)}
              className="bg-slate-900 border-2 border-slate-750 hover:border-slate-600 rounded-3xl p-5 shadow-lg transition-all cursor-pointer space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                      isAgri ? 'bg-emerald-700' : 'bg-[#8c6d46]'
                    }`}
                  >
                    {isAgri ? <Wheat className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-black text-white text-base sm:text-lg">{reg.fct}</span>
                      ) : (
                        <span className="text-xs font-sans font-bold text-[#d4b896] bg-[#362619] border border-[#a8855d]/60 px-2 py-0.5 rounded-lg">
                          Sem FCT (Turismo)
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300 font-bold block truncate">
                      {isAgri ? 'Secretaria da Agricultura' : 'Secretaria do Turismo'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {reg.status === 'EM_TRANSITO' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#362619] text-[#d4b896] border border-[#a8855d]/50">
                      <Clock className="w-3 h-3 animate-pulse" />
                      Em Trânsito
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluído
                    </span>
                  )}
                </div>
              </div>

              {/* Card Main Info */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Motorista:</span>
                  <span className="font-bold text-white text-base block">{reg.motorista}</span>
                  {reg.placa && (
                    <span className="text-xs text-slate-300 font-mono mt-0.5 block">
                      Placa: <strong className="text-emerald-300">{reg.placa}</strong> {reg.modeloVeiculo ? `(${reg.modeloVeiculo})` : ''}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Data:</span>
                  <span className="text-slate-100 font-bold">{dataFormatada}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Andar / Setor:</span>
                  <span className="text-slate-100 font-bold truncate block">{reg.andar}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold uppercase">Horários:</span>
                      <div className="flex items-center gap-2 font-bold text-base mt-0.5">
                        <span className="text-emerald-400">{reg.horarioSaida}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-100">{reg.horarioChegada || 'Em trânsito'}</span>
                      </div>
                    </div>
                    {onEditarHorarios && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarHorarios(reg);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Ajustar Horário</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsável & Assinatura & Ações */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {reg.assinaturaUrl && (
                    <img
                      src={reg.assinaturaUrl}
                      alt="Assinatura"
                      className="h-7 w-14 object-contain bg-white rounded-lg border border-slate-500 px-1"
                    />
                  )}
                  <span className="text-slate-200 text-xs sm:text-sm font-bold truncate max-w-[140px]">
                    {reg.funcionarioResponsavel}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                    className="p-2 text-slate-300 hover:text-amber-300 bg-slate-800 rounded-xl"
                    title="Baixar PDF"
                  >
                    <FileDown className="w-5 h-5 text-amber-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditar(reg)}
                    className="p-2 text-slate-300 hover:text-emerald-300 bg-slate-800 rounded-xl"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {onExcluir && (
                    <button
                      type="button"
                      onClick={() => setRegistroParaExcluir(reg)}
                      className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-xl"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border-2 border-rose-600/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-2xl">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Excluir Registro?</h3>
                <p className="text-xs text-rose-300">Operação permanente de remoção</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Tem certeza que deseja excluir o registro {registroParaExcluir.secretaria === 'Secretaria da Agricultura' && registroParaExcluir.fct && registroParaExcluir.fct !== 'N/A' ? (
                <strong className="text-white font-mono">{registroParaExcluir.fct}</strong>
              ) : (
                <span className="text-amber-300 font-semibold">(Sem FCT - Turismo)</span>
              )} do motorista <strong className="text-white">{registroParaExcluir.motorista}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRegistroParaExcluir(null)}
                className="px-5 py-3 rounded-2xl border-2 border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 cursor-pointer flex items-center gap-2"
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
