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
      <div className="bg-[#121417] border border-[#22252C] rounded-xl p-10 sm:p-16 text-center space-y-6">
        <div className="w-14 h-14 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#B08D57] mx-auto">
          <AlertCircle className="w-6 h-6 text-[#B08D57]" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-white tracking-tight">Nenhum registro encontrado</h3>
          <p className="text-sm text-[#8E95A1] max-w-lg mx-auto leading-relaxed">
            O sistema está pronto para registrar os dados de saída e chegada da Secretaria da Agricultura e Secretaria do Turismo.
          </p>
        </div>
        {onNovoRegistro && (
          <button
            type="button"
            onClick={onNovoRegistro}
            className="inline-flex items-center gap-2 bg-[#B08D57] hover:bg-[#80683F] text-black text-sm font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeiro Veículo</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Ouro Velho Table */}
      <div className="hidden md:block bg-[#121417] border border-[#22252C] rounded-xl overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#22252C] bg-[#1B1E22] text-[10px] font-semibold uppercase tracking-widest text-[#8E95A1]">
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
            <tbody className="divide-y divide-[#22252C] text-sm">
              {registros.map((reg, index) => {
                const isAgri = reg.secretaria === 'Secretaria da Agricultura';
                const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

                return (
                  <tr
                    key={`${reg.id}-${index}`}
                    onClick={() => onVerDetalhes(reg)}
                    className="hover:bg-[#1B1E22] transition-colors duration-150 cursor-pointer group"
                  >
                    {/* FCT */}
                    <td className="py-4 px-5">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-semibold text-[#B08D57] text-base">
                          {reg.fct}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[#8E95A1] bg-[#090A0C] border border-[#22252C] px-2.5 py-1 rounded inline-block whitespace-nowrap">
                          Sem FCT
                        </span>
                      )}
                    </td>

                    {/* Secretaria */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isAgri ? 'bg-[#B08D57]' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-medium text-[#F3F4F6] truncate max-w-[170px]">
                          {isAgri ? 'Agricultura' : 'Turismo'}
                        </span>
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-4 px-5 text-[#8E95A1] whitespace-nowrap font-mono text-xs">
                      {dataFormatada}
                    </td>

                    {/* Motorista & Veículo */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="font-semibold text-white block text-sm leading-snug">{reg.motorista}</span>
                        {reg.placa && (
                          <span className="text-xs text-[#8E95A1] font-mono block mt-0.5">
                            Placa: <strong className="text-white font-mono font-medium">{reg.placa}</strong> {reg.modeloVeiculo ? `• ${reg.modeloVeiculo}` : ''}
                          </span>
                        )}
                        {reg.ocorrencia && (
                          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-[#B08D57]/10 border border-[#B08D57]/20 text-[#B08D57] text-xs font-medium max-w-[240px] truncate" title={`Ocorrência: ${reg.ocorrencia}`}>
                            <AlertTriangle className="w-3 h-3 text-[#B08D57] shrink-0" />
                            <span className="truncate">{reg.ocorrencia}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Horários e botão de acesso rápido */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[#8E95A1]">{reg.horarioSaida}</span>
                          <span className="text-[#8E95A1]/40">→</span>
                          {reg.horarioChegada ? (
                            <span className="text-emerald-400 font-semibold">{reg.horarioChegada}</span>
                          ) : (
                            <span className="text-[#B08D57] text-xs font-semibold bg-[#B08D57]/10 border border-[#B08D57]/20 px-2 py-0.5 rounded">
                              Em trânsito
                            </span>
                          )}
                        </div>
                        {onEditarHorarios && (
                          <button
                            type="button"
                            onClick={() => onEditarHorarios(reg)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[#B08D57] hover:text-white border border-[#B08D57]/20 text-xs font-medium cursor-pointer btn-premium-secondary apple-tactile-feedback rounded-lg"
                            title="Ajustar horário de saída ou de chegada"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                            <span>Ajustar Horário</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Andar / Garagem */}
                    <td className="py-4 px-5 text-[#F3F4F6] font-medium">
                      <span className="inline-block bg-[#090A0C] px-2.5 py-1 rounded text-xs font-semibold text-[#8E95A1] border border-[#22252C] whitespace-nowrap">
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
                            className="h-8 w-16 object-contain bg-white rounded border border-[#22252C] px-1 shrink-0"
                          />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0" />
                        )}
                        <div className="truncate max-w-[150px]">
                          <span className="text-[#F3F4F6] font-medium block truncate text-xs sm:text-sm">
                            {reg.funcionarioResponsavel}
                          </span>
                          {reg.matriculaFuncionario && (
                            <span className="text-[11px] text-[#8E95A1] block font-mono">
                              Mat: {reg.matriculaFuncionario}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {reg.status === 'EM_TRANSITO' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/20">
                          <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                          <span>Em Trânsito</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
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
                            className="p-1.5 text-[#8E95A1] hover:text-[#B08D57] rounded cursor-pointer btn-premium-secondary apple-tactile-feedback"
                            title="Ajustar Horário de Saída / Chegada"
                          >
                            <Clock className="w-4 h-4 text-[#B08D57]" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                          className="p-1.5 text-[#8E95A1] hover:text-white rounded cursor-pointer btn-premium-secondary apple-tactile-feedback"
                          title="Baixar Ficha PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditar(reg)}
                          className="p-1.5 text-[#8E95A1] hover:text-white rounded cursor-pointer btn-premium-secondary apple-tactile-feedback"
                          title="Editar Cadastro Completo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onVerDetalhes(reg)}
                          className="p-1.5 text-[#B08D57] hover:text-white rounded cursor-pointer btn-premium-secondary apple-tactile-feedback"
                          title="Ver Ficha Detalhada"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onExcluir && (
                          <button
                            type="button"
                            onClick={() => setRegistroParaExcluir(reg)}
                            className="p-1.5 text-white/30 hover:text-rose-400 rounded cursor-pointer btn-premium-secondary apple-tactile-feedback"
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
      <div className="md:hidden space-y-4">
        {registros.map((reg, index) => {
          const isAgri = reg.secretaria === 'Secretaria da Agricultura';
          const dataFormatada = reg.data ? new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR') : '-';

          return (
            <div
              key={`${reg.id}-${index}`}
              onClick={() => onVerDetalhes(reg)}
              className="card-premium-tilt glass-card rounded-xl p-5 cursor-pointer space-y-4 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isAgri ? 'bg-[#B08D57]/10 border border-[#B08D57]/20 text-[#B08D57]' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isAgri ? <Wheat className="w-4.5 h-4.5 text-[#B08D57]" /> : <Plane className="w-4.5 h-4.5 text-emerald-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAgri && reg.fct && reg.fct !== 'N/A' && reg.fct !== '-' ? (
                        <span className="font-mono font-bold text-[#B08D57] text-base">{reg.fct}</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Sem FCT
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#8E95A1] font-medium block truncate">
                      {isAgri ? 'Secretaria da Agricultura' : 'Secretaria do Turismo'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {reg.status === 'EM_TRANSITO' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/20">
                      <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                      <span>Trânsito</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Conclúido</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Main Info */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#090A0C] p-4 rounded-lg border border-[#22252C]">
                <div className="col-span-2">
                  <span className="text-[10px] text-[#8E95A1] block font-semibold uppercase tracking-wider">Motorista:</span>
                  <span className="font-semibold text-white text-sm block mt-0.5">{reg.motorista}</span>
                  {reg.placa && (
                    <span className="text-xs text-[#8E95A1] font-mono mt-0.5 block">
                      Placa: <strong className="text-white font-mono">{reg.placa}</strong> {reg.modeloVeiculo ? `(${reg.modeloVeiculo})` : ''}
                    </span>
                  )}
                </div>
                {reg.ocorrencia && (
                  <div className="col-span-2 p-2.5 bg-[#B08D57]/10 border border-[#B08D57]/20 rounded space-y-0.5">
                    <span className="text-[10px] font-semibold text-[#B08D57] flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
                      Ocorrência da Portaria:
                    </span>
                    <p className="text-xs text-white/90 font-medium whitespace-pre-wrap">
                      {reg.ocorrencia}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-[#8E95A1] block font-semibold uppercase tracking-wider">Data:</span>
                  <span className="text-white font-mono font-medium">{dataFormatada}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8E95A1] block font-semibold uppercase tracking-wider">Local / Andar:</span>
                  <span className="text-white font-medium block whitespace-nowrap">{reg.andar || reg.garagem || '-'}</span>
                </div>
                <div className="col-span-2 pt-3 border-t border-[#22252C]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8E95A1] block font-semibold uppercase tracking-wider">Horários:</span>
                      <div className="flex items-center gap-2 font-mono text-xs mt-0.5">
                        <span className="text-white">{reg.horarioSaida}</span>
                        <span className="text-[#8E95A1]/40">→</span>
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
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#B08D57] border border-[#B08D57]/20 text-xs font-medium cursor-pointer btn-premium-secondary apple-tactile-feedback"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#B08D57]" />
                        <span>Ajustar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsável & Assinatura & Ações */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#22252C]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 min-w-0">
                  {reg.assinaturaUrl && (
                    <img
                      src={reg.assinaturaUrl}
                      alt="Assinatura"
                      className="h-7 w-14 object-contain bg-white rounded border border-[#22252C] px-1 shrink-0"
                    />
                  )}
                  <span className="text-[#F3F4F6] text-xs font-semibold truncate max-w-[150px]">
                    {reg.funcionarioResponsavel}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => PdfService.gerarFichaIndividual(reg, usuarioAtual)}
                    className="p-1.5 text-[#8E95A1] hover:text-white rounded border border-[#B08D57]/25 btn-premium-secondary apple-tactile-feedback"
                    title="Baixar PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditar(reg)}
                    className="p-1.5 text-[#8E95A1] hover:text-white rounded border border-[#B08D57]/25 btn-premium-secondary apple-tactile-feedback"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onVerDetalhes(reg)}
                    className="p-1.5 text-[#B08D57] hover:text-white rounded border border-[#B08D57]/25 btn-premium-secondary apple-tactile-feedback"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onExcluir && (
                    <button
                      type="button"
                      onClick={() => setRegistroParaExcluir(reg)}
                      className="p-1.5 text-white/40 hover:text-rose-400 rounded border border-rose-500/20 btn-premium-secondary apple-tactile-feedback"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121417] border border-rose-500/20 rounded-xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Excluir Registro?</h3>
                <p className="text-xs text-[#8E95A1]">Operação permanente de remoção</p>
              </div>
            </div>

            <p className="text-sm text-[#8E95A1] leading-relaxed font-normal">
              Tem certeza que deseja excluir o registro {registroParaExcluir.secretaria === 'Secretaria da Agricultura' && registroParaExcluir.fct && registroParaExcluir.fct !== 'N/A' ? (
                <strong className="text-white font-mono">{registroParaExcluir.fct}</strong>
              ) : (
                <span className="text-[#B08D57] font-medium">(Sem FCT)</span>
              )} do motorista <strong className="text-white">{registroParaExcluir.motorista}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRegistroParaExcluir(null)}
                className="px-4 py-2 rounded-lg border border-[#22252C] text-[#8E95A1] hover:text-white hover:bg-[#1B1E22] font-medium text-sm cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm cursor-pointer flex items-center gap-2 transition-colors"
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
