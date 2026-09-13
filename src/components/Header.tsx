import React, { useState, useRef, useEffect } from 'react';
import { Wheat, Plane, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound, Clock, Menu, BarChart3, FileSpreadsheet } from 'lucide-react';
import { UsuarioAutenticado } from '../types';

interface HeaderProps {
  usuario: UsuarioAutenticado;
  onNovoRegistro: () => void;
  onNovoOperador?: () => void;
  onAbrirEnviarRelatorio?: () => void;
  onResumoTurno?: () => void;
  onExportarPdf: () => void;
  onEstatisticas?: () => void;
  onExportarExcel?: () => void;
  onAlterarSenha?: () => void;
  onLogout: () => void;
  totalRegistros: number;
}

export const Header: React.FC<HeaderProps> = ({
  usuario,
  onNovoRegistro,
  onNovoOperador,
  onAbrirEnviarRelatorio,
  onResumoTurno,
  onExportarPdf,
  onEstatisticas,
  onExportarExcel,
  onAlterarSenha,
  onLogout,
  totalRegistros,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-2xl border-b border-white/[0.08] transition-all pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          {/* Brand & App Title */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="flex -space-x-1.5 shrink-0 mt-0.5 sm:mt-0">
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm backdrop-blur-md"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-5 h-5 text-amber-400" />
              </div>
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-sm backdrop-blur-md"
                title="Secretaria do Turismo"
              >
                <Plane className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white tracking-tight leading-none whitespace-nowrap">
                SAA - Controle de Registro
              </h1>
              <p className="text-[10px] sm:text-xs text-white/70 font-normal leading-normal whitespace-nowrap">
                Secretaria da Agricultura e Secretaria do Turismo
              </p>
            </div>
          </div>

          {/* Main Actions & Apple-Style Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end sm:self-center relative" ref={menuRef}>
            <span className="inline-flex items-center gap-1 bg-white/[0.08] text-white/90 border border-white/[0.12] px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Oficial</span>
            </span>

            <button
              type="button"
              onClick={onNovoRegistro}
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-[0.96] transition-all duration-200 cursor-pointer min-h-[40px]"
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>Novo Veículo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-white/80 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.95] rounded-full transition-all duration-200 border border-white/[0.08] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-sm"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* iOS Style Floating Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2.5 w-64 bg-[#1c1c1e]/95 border border-white/[0.12] rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-2xl divide-y divide-white/[0.08]">
                {/* User Profile */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-amber-400 shrink-0 overflow-hidden">
                      {usuario.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-white truncate">{usuario.nome}</p>
                      <p className="text-[11px] text-white/50 font-mono truncate">
                        Mat: {usuario.matricula} • {usuario.nivelAcesso}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary System Actions */}
                <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                  {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                    <button
                      type="button"
                      onClick={() => { onNovoOperador(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      <span>Novo Operador</span>
                    </button>
                  )}

                  {onAlterarSenha && (
                    <button
                      type="button"
                      onClick={() => { onAlterarSenha(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-white/60" />
                      <span>Alterar Senha</span>
                    </button>
                  )}

                  {onAbrirEnviarRelatorio && (
                    <button
                      type="button"
                      onClick={() => { onAbrirEnviarRelatorio(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-white/60" />
                      <span>Enviar Relatório</span>
                    </button>
                  )}

                  {onResumoTurno && (
                    <button
                      type="button"
                      onClick={() => { onResumoTurno(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Resumo do Turno</span>
                    </button>
                  )}

                  {onEstatisticas && (
                    <button
                      type="button"
                      onClick={() => { onEstatisticas(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>Estatísticas & Métricas</span>
                    </button>
                  )}

                  {onExportarExcel && (
                    <button
                      type="button"
                      onClick={() => { onExportarExcel(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Exportar Excel / CSV</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { onExportarPdf(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all text-left cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-white/60" />
                    <span>Exportar PDF</span>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="py-1 px-1.5">
                  <button
                    type="button"
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-[0.98] transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

