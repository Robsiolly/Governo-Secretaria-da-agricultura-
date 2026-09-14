import React, { useState, useRef, useEffect } from 'react';
import { Wheat, Plane, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound, Clock, Menu, BarChart3, FileSpreadsheet, RefreshCw } from 'lucide-react';
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
  onSincronizarBanco?: () => void;
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
  onSincronizarBanco,
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
    <header className="sticky top-0 z-40 w-full bg-[#07080a]/90 backdrop-blur-2xl border-b border-[#B08D57]/20 transition-all pt-safe shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4 relative">
          {/* Brand, App Title, Oficial Badge & Novo Veículo - Far Left */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-wrap sm:flex-nowrap">
            <div className="flex -space-x-1.5 shrink-0">
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shadow-md shadow-[#B08D57]/10 backdrop-blur-md"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-5 h-5 text-[#DFBA73]" />
              </div>
              <div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 backdrop-blur-md"
                title="Secretaria do Turismo"
              >
                <Plane className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white tracking-tight leading-none whitespace-nowrap">
                SAA - Controle de Registro
              </h1>
              <p className="text-[10px] sm:text-xs text-[#C6A96B]/80 font-normal leading-normal whitespace-nowrap mt-1">
                Secretaria da Agricultura e Secretaria do Turismo
              </p>
            </div>

            {/* Oficial Badge & Novo Veículo Button placed directly in the left corner block */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 sm:ml-2">
              <span className="inline-flex items-center gap-1.5 bg-[#B08D57]/15 text-[#DFBA73] border border-[#B08D57]/35 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase shrink-0 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
                <span>Oficial</span>
              </span>

              <button
                type="button"
                onClick={onNovoRegistro}
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C6A96B] via-[#B08D57] to-[#80683F] hover:brightness-110 active:scale-[0.96] text-slate-950 font-bold px-4 h-[42px] rounded-full text-xs sm:text-sm shadow-md shadow-[#B08D57]/25 border border-[#DFBA73]/40 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>Novo Veículo</span>
              </button>
            </div>
          </div>

          {/* Right corner: Hamburger Menu - Exact desired position (6.5mm offset) */}
          <div className="flex items-center shrink-0 ml-auto translate-y-[6.5mm]" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-[42px] w-[42px] text-[#DFBA73] hover:text-white bg-[#B08D57]/10 hover:bg-[#B08D57]/20 active:scale-[0.95] rounded-full transition-all duration-200 border border-[#B08D57]/30 cursor-pointer flex items-center justify-center shadow-md shadow-black/30 shrink-0"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* iOS Style Floating Dropdown Menu - Ouro Velho Premium */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2.5 w-64 bg-[#12141A]/95 border border-[#B08D57]/30 rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-2xl divide-y divide-[#B08D57]/15">
                {/* User Profile */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#DFBA73] shrink-0 overflow-hidden shadow-inner">
                      {usuario.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-white truncate">{usuario.nome}</p>
                      <p className="text-[11px] text-[#C6A96B]/70 font-mono truncate">
                        Mat: {usuario.matricula} • {usuario.nivelAcesso}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary System Actions */}
                <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                  {onSincronizarBanco && (
                    <button
                      type="button"
                      onClick={() => { onSincronizarBanco(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#DFBA73] hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-[#DFBA73]" />
                      <span>Sincronizar Banco de Dados</span>
                    </button>
                  )}

                  {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                    <button
                      type="button"
                      onClick={() => { onNovoOperador(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#DFBA73]" />
                      <span>Novo Operador</span>
                    </button>
                  )}

                  {onAlterarSenha && (
                    <button
                      type="button"
                      onClick={() => { onAlterarSenha(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#C6A96B]/80" />
                      <span>Alterar Senha</span>
                    </button>
                  )}

                  {onAbrirEnviarRelatorio && (
                    <button
                      type="button"
                      onClick={() => { onAbrirEnviarRelatorio(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-[#C6A96B]/80" />
                      <span>Enviar Relatório</span>
                    </button>
                  )}

                  {onResumoTurno && (
                    <button
                      type="button"
                      onClick={() => { onResumoTurno(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Resumo do Turno</span>
                    </button>
                  )}

                  {onEstatisticas && (
                    <button
                      type="button"
                      onClick={() => { onEstatisticas(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#DFBA73] hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-[#DFBA73]" />
                      <span>Estatísticas & Métricas</span>
                    </button>
                  )}

                  {onExportarExcel && (
                    <button
                      type="button"
                      onClick={() => { onExportarExcel(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Exportar Excel / CSV</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { onExportarPdf(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-[#B08D57]/15 active:scale-[0.98] transition-all text-left cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-[#C6A96B]/80" />
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
