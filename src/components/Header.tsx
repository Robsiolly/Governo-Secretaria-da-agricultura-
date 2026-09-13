import React, { useState, useRef, useEffect } from 'react';
import { Wheat, Plane, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound, Clock, Menu } from 'lucide-react';
import { UsuarioAutenticado } from '../types';

interface HeaderProps {
  usuario: UsuarioAutenticado;
  onNovoRegistro: () => void;
  onNovoOperador?: () => void;
  onAbrirEnviarRelatorio?: () => void;
  onResumoTurno?: () => void;
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
  onResumoTurno,
  onExportarPdf,
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
    <header className="bg-black/90 backdrop-blur-2xl border-b border-[#252525] sticky top-0 z-40 w-full shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#5A3A2E] via-[#D97924] to-[#3A241D]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
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
                  Controle de Registros
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-[#3A241D] text-[#D97924] border border-[#5A3A2E] px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-inner">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97924]" />
                  Oficial
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#6B6B6B] mt-0.5 font-medium whitespace-nowrap overflow-visible">
                Secretaria da Agricultura e Secretaria do Turismo
              </p>
            </div>
          </div>

          {/* Main Actions & Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative" ref={menuRef}>
            <button
              type="button"
              onClick={onNovoRegistro}
              className="flex items-center justify-center gap-2 bg-[#D97924] hover:bg-[#c2681e] text-white px-3 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xl shadow-[#D97924]/20 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Novo Veículo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-[#F3F3F1] hover:bg-[#333] rounded-2xl transition-all border border-[#6B6B6B]/30 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-lg bg-[#252525]"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-[#6B6B6B]/30 rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
                {/* User Profile */}
                <div className="px-4 py-3 border-b border-[#6B6B6B]/30 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black border border-[#6B6B6B]/40 flex items-center justify-center text-[#D97924] shrink-0 overflow-hidden">
                      {usuario.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-white truncate">{usuario.nome}</p>
                      <p className="text-[10px] text-[#6B6B6B] font-mono truncate">
                        Mat: {usuario.matricula} ({usuario.nivelAcesso})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col px-2 gap-1">
                  {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                    <button
                      type="button"
                      onClick={() => { onNovoOperador(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-[#333333] transition-colors text-left"
                    >
                      <UserPlus className="w-4 h-4 text-[#D97924]" />
                      <span>Novo Operador</span>
                    </button>
                  )}

                  {onAlterarSenha && (
                    <button
                      type="button"
                      onClick={() => { onAlterarSenha(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-[#333333] transition-colors text-left"
                    >
                      <KeyRound className="w-4 h-4 text-[#6B6B6B]" />
                      <span>Alterar Senha</span>
                    </button>
                  )}

                  {onAbrirEnviarRelatorio && (
                    <button
                      type="button"
                      onClick={() => { onAbrirEnviarRelatorio(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-[#333333] transition-colors text-left"
                    >
                      <Share2 className="w-4 h-4 text-[#6B6B6B]" />
                      <span>Enviar Relatório</span>
                    </button>
                  )}

                  {onResumoTurno && (
                    <button
                      type="button"
                      onClick={() => { onResumoTurno(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-100 hover:text-white bg-emerald-950/20 hover:bg-emerald-900/60 transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Resumo do Turno</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { onExportarPdf(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-[#333333] transition-colors text-left"
                  >
                    <FileDown className="w-4 h-4 text-[#6B6B6B]" />
                    <span>Exportar PDF</span>
                  </button>
                  
                  <div className="h-px bg-[#6B6B6B]/30 my-1 mx-2" />

                  <button
                    type="button"
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
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
