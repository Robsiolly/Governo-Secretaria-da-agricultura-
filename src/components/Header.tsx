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
    <header className="bg-slate-900 border-b-2 border-slate-800 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand & App Title */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex -space-x-2 shrink-0">
              <div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-100 shadow-lg"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-6 h-6" />
              </div>
              <div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300/50 flex items-center justify-center text-amber-100 shadow-lg"
                title="Secretaria do Turismo"
              >
                <Compass className="w-6 h-6" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                  Controle de Registros Secretaria da Agricultura e Secretaria do Turismo
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Sistema Oficial
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
                <span>Gestão Integrada de Frotas e Tráfego Governamental</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-bold">{totalRegistros} veículo(s) cadastrado(s)</span>
              </p>
            </div>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* User Badge */}
            <div className="flex items-center gap-3 bg-slate-800/90 border-2 border-slate-700 px-4 py-2 rounded-2xl text-left min-h-[46px]">
              <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-sm sm:text-base text-white block truncate max-w-[160px] sm:max-w-[200px]">
                  {usuario.nome}
                </span>
                <span className="text-xs text-slate-300 block font-medium">
                  Mat: <strong className="text-emerald-300">{usuario.matricula}</strong> ({usuario.nivelAcesso})
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2.5">
              {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                <button
                  type="button"
                  onClick={onNovoOperador}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-emerald-300 px-3.5 py-3 rounded-2xl text-sm sm:text-base font-bold border-2 border-slate-700 hover:border-emerald-500/50 transition-colors shadow-sm cursor-pointer min-h-[48px]"
                  title="Painel Administrador e CRUD de Operadores"
                >
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span className="hidden xl:inline">CRUD Operadores</span>
                </button>
              )}

              {onAlterarSenha && (
                <button
                  type="button"
                  onClick={onAlterarSenha}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-amber-300 px-3.5 py-3 rounded-2xl text-sm font-bold border-2 border-slate-700 hover:border-amber-500/50 transition-colors shadow-sm cursor-pointer min-h-[48px]"
                  title="Alterar sua senha de acesso"
                >
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span className="hidden xl:inline">Mudar Senha</span>
                </button>
              )}

              {onAbrirEnviarRelatorio && (
                <button
                  type="button"
                  onClick={onAbrirEnviarRelatorio}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-3 rounded-2xl text-sm sm:text-base font-bold shadow-md transition-all cursor-pointer min-h-[48px]"
                  title="Emitir e Enviar Relatório de qualquer dia selecionado (WhatsApp, E-mail, PDF)"
                >
                  <Share2 className="w-5 h-5 text-amber-200" />
                  <span>Enviar Relatório</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExportarPdf}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white px-3.5 py-3 rounded-2xl text-sm sm:text-base font-bold border-2 border-slate-700 transition-colors shadow-sm cursor-pointer min-h-[48px]"
                title="Exportar relatório diário administrativo em PDF"
              >
                <FileDown className="w-5 h-5 text-amber-400" />
                <span className="hidden sm:inline">Baixar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                type="button"
                onClick={onNovoRegistro}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-3 rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-emerald-950/60 transition-all cursor-pointer min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Veículo</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="p-3 text-slate-300 hover:text-rose-300 hover:bg-rose-950/50 rounded-2xl transition-colors border-2 border-slate-800 hover:border-rose-900/60 cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Encerrar Sessão Segura"
                aria-label="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
