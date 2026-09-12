import React from 'react';
import { Wheat, Plane, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound } from 'lucide-react';
import { UsuarioAutenticado } from '../types';

interface HeaderProps {
  usuario: UsuarioAutenticado;
  onNovoRegistro: () => void;
  onNovoOperador?: () => void;
  onAbrirEnviarRelatorio?: () => void;
  onExportarPdf: () => void;
  onAlterarSenha?: () => void;
  onLogout: () => void;
  totalRegistros: number;
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onNovoRegistro,
  onNovoOperador,
  onAbrirEnviarRelatorio,
  onExportarPdf,
  onAlterarSenha,
  onLogout,
  totalRegistros,
}) => {
  return (
    <header className="bg-black/90 backdrop-blur-2xl border-b border-[#252525] sticky top-0 z-40 w-full shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#5A3A2E] via-[#D97924] to-[#3A241D]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & App Title */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex -space-x-2 shrink-0">
              <div 
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#3A241D] border border-[#5A3A2E] flex items-center justify-center text-[#D97924] shadow-lg"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-5 h-5 text-[#D97924]" />
              </div>
              <div 
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#252525] border border-[#6B6B6B]/40 flex items-center justify-center text-[#F3F3F1] shadow-lg"
                title="Secretaria do Turismo"
              >
                <Plane    className="text-emerald-400 w-5 h-5 text-[#F3F3F1]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-snug break-words">
                  Controle de Registros • Agricultura & Turismo
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-[#3A241D] text-[#D97924] border border-[#5A3A2E] px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-inner">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97924]" />
                  Oficial
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5 flex items-center gap-2 flex-wrap font-medium">
                <span className="truncate max-w-full">Secretaria da Agricultura e Abastecimento</span>
                <span className="text-[#6B6B6B] hidden sm:inline">•</span>
                <span className="text-[#D97924] font-semibold block sm:inline">{totalRegistros} veículos cadastrados</span>
              </p>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-wrap w-full lg:w-auto">
            {/* User Badge */}
            <div className="flex items-center gap-3 bg-[#252525] border border-[#6B6B6B]/30 px-3.5 py-2 rounded-2xl text-left min-h-[46px] w-full sm:w-auto justify-between sm:justify-start shadow-inner">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#D97924] shrink-0 border border-[#6B6B6B]/40">
                  <User className="w-4 h-4" />
                </div>
                <div className="leading-tight truncate">
                  <span className="font-semibold text-xs sm:text-sm text-white block truncate max-w-[150px] sm:max-w-[200px]">
                    {usuario.nome}
                  </span>
                  <span className="text-[11px] text-[#6B6B6B] block font-mono">
                    Mat: {usuario.matricula} ({usuario.nivelAcesso})
                  </span>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-2 xs:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                <button
                  type="button"
                  onClick={onNovoOperador}
                  className="flex items-center justify-center gap-2 bg-[#252525] hover:bg-[#333333] text-neutral-200 hover:text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-[#6B6B6B]/30 transition-all cursor-pointer min-h-[44px]"
                  title="Operadores"
                >
                  <UserPlus className="w-4 h-4 text-[#D97924] shrink-0" />
                  <span className="truncate">Operadores</span>
                </button>
              )}

              {onAlterarSenha && (
                <button
                  type="button"
                  onClick={onAlterarSenha}
                  className="flex items-center justify-center gap-2 bg-[#252525] hover:bg-[#333333] text-neutral-200 hover:text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-[#6B6B6B]/30 transition-all cursor-pointer min-h-[44px]"
                  title="Alterar senha"
                >
                  <KeyRound className="w-4 h-4 text-[#6B6B6B] shrink-0" />
                  <span className="truncate">Senha</span>
                </button>
              )}

              {onAbrirEnviarRelatorio && (
                <button
                  type="button"
                  onClick={onAbrirEnviarRelatorio}
                  className="flex items-center justify-center gap-2 bg-[#252525] hover:bg-[#333333] text-neutral-200 hover:text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-[#6B6B6B]/30 transition-all cursor-pointer min-h-[44px] col-span-2 xs:col-span-1"
                  title="Enviar Relatório"
                >
                  <Share2 className="w-4 h-4 text-[#6B6B6B] shrink-0" />
                  <span>Relatório</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportarPdf}
                className="flex items-center justify-center gap-2 bg-[#252525] hover:bg-[#333333] text-neutral-200 hover:text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border border-[#6B6B6B]/30 transition-all cursor-pointer min-h-[44px]"
                title="Exportar PDF"
              >
                <FileDown className="w-4 h-4 text-[#6B6B6B] shrink-0" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={onNovoRegistro}
                className="flex items-center justify-center gap-2 bg-[#D97924] hover:bg-[#c2681e] text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-[#D97924]/20 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Novo Veículo</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2.5 text-[#6B6B6B] hover:text-rose-400 hover:bg-rose-950/30 rounded-2xl transition-all border border-[#6B6B6B]/30 hover:border-rose-900/50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
