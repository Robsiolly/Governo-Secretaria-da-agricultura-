import React from 'react';
import { Wheat, Compass, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound } from 'lucide-react';
import { UsuarioAutenticado } from '../types';
import { GovSpLogo } from './GovSpLogo';

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
    <header className="bg-slate-900 border-b-2 border-slate-800 sticky top-0 z-30 shadow-xl w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          {/* Brand & App Title */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex -space-x-2 shrink-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-100 shadow-lg"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#8c6d46] to-[#6e5230] border-2 border-[#b08d57]/50 flex items-center justify-center text-[#f5ebe0] shadow-lg"
                title="Secretaria do Turismo"
              >
                <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug break-words">
                  Controle de Registros Secretaria da Agricultura e Secretaria do Turismo
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-sm font-bold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Sistema Oficial
                </span>
              </div>
              <p className="text-xs sm:text-base text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span className="truncate max-w-full">Gestão Integrada de Frotas e Tráfego Governamental</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-bold block sm:inline">{totalRegistros} veículo(s) cadastrado(s)</span>
              </p>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-wrap w-full lg:w-auto">
            {/* User Badge */}
            <div className="flex items-center gap-3 bg-slate-800/90 border-2 border-slate-700 px-3.5 py-2 rounded-2xl text-left min-h-[46px] w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="leading-tight truncate">
                  <span className="font-bold text-xs sm:text-base text-white block truncate max-w-[150px] sm:max-w-[200px]">
                    {usuario.nome}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-300 block font-medium">
                    Mat: <strong className="text-emerald-300">{usuario.matricula}</strong> ({usuario.nivelAcesso})
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
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-emerald-300 px-3 py-2.5 rounded-2xl text-xs sm:text-base font-bold border-2 border-slate-700 hover:border-emerald-500/50 transition-colors shadow-sm cursor-pointer min-h-[44px]"
                  title="Painel Administrador e CRUD de Operadores"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span className="truncate">Operadores</span>
                </button>
              )}

              {onAlterarSenha && (
                <button
                  type="button"
                  onClick={onAlterarSenha}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-[#d4b896] px-3 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border-2 border-slate-700 hover:border-[#a8855d]/50 transition-colors shadow-sm cursor-pointer min-h-[44px]"
                  title="Alterar sua senha de acesso"
                >
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4b896] shrink-0" />
                  <span className="truncate">Mudar Senha</span>
                </button>
              )}

              {onAbrirEnviarRelatorio && (
                <button
                  type="button"
                  onClick={onAbrirEnviarRelatorio}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c6d46] to-[#785b37] hover:from-[#9a7852] hover:to-[#8c6d46] text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-base font-bold shadow-md transition-all cursor-pointer min-h-[44px] col-span-2 xs:col-span-1"
                  title="Emitir e Enviar Relatório de qualquer dia selecionado (WhatsApp, E-mail, PDF)"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#e8d5b7] shrink-0" />
                  <span>Enviar Relatório</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportarPdf}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-3 py-2.5 rounded-2xl text-xs sm:text-base font-bold border-2 border-slate-700 transition-colors shadow-sm cursor-pointer min-h-[44px]"
                title="Exportar relatório diário administrativo em PDF"
              >
                <FileDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4b896] shrink-0" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={onNovoRegistro}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-base font-bold shadow-lg shadow-emerald-950/60 transition-all cursor-pointer min-h-[44px]"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>+ Novo</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-2.5 text-slate-300 hover:text-rose-300 hover:bg-rose-950/50 rounded-2xl transition-colors border-2 border-slate-800 hover:border-rose-900/60 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                title="Encerrar Sessão Segura"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
