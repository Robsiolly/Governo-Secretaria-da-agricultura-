import React, { useState, useRef, useEffect } from 'react';
import { Wheat, Plane, Plus, FileDown, LogOut, ShieldCheck, User, UserPlus, Share2, KeyRound, Clock, Menu, BarChart3, FileSpreadsheet, RefreshCw, UploadCloud } from 'lucide-react';
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
  onImportarExcel?: () => void;
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
  onImportarExcel,
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
    <header className="sticky top-0 z-40 w-full bg-[#090A0C]/90 backdrop-blur-md border-b border-[#22252C] transition-all pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4 relative">
          {/* Brand, App Title, Oficial Badge & Novo Veículo - Far Left */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-wrap sm:flex-nowrap">
            <div className="flex -space-x-1 shrink-0">
              <div 
                className="w-9 h-9 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#B08D57]"
                title="Secretaria da Agricultura"
              >
                <Wheat className="w-4.5 h-4.5 text-[#B08D57]" />
              </div>
              <div 
                className="w-9 h-9 rounded-lg bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-emerald-400"
                title="Secretaria do Turismo"
              >
                <Plane className="w-4.5 h-4.5 text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-none whitespace-nowrap">
                SAA - Controle de Registro
              </h1>
              <p className="text-[10px] sm:text-xs text-[#8E95A1] font-normal leading-normal whitespace-nowrap mt-1">
                Secretaria da Agricultura e Secretaria do Turismo
              </p>
            </div>

            {/* Oficial Badge & Novo Veículo Button placed directly in the left corner block */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 sm:ml-2">
              <span className="inline-flex items-center gap-1.5 bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider uppercase shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Oficial</span>
              </span>

              <button
                type="button"
                onClick={onNovoRegistro}
                className="inline-flex items-center justify-center gap-1.5 btn-premium-primary px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap apple-tactile-feedback gold-reflection"
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
              className="h-[38px] w-[38px] btn-premium-secondary text-[#B08D57] hover:text-white bg-[#1B1E22] rounded-lg border border-[#22252C] cursor-pointer flex items-center justify-center shrink-0 apple-tactile-feedback"
              aria-label="Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* iOS Style Floating Dropdown Menu - Ouro Velho Premium */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2.5 w-64 bg-[#121417] border border-[#22252C] rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-md divide-y divide-[#22252C]">
                {/* User Profile */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1B1E22] border border-[#22252C] flex items-center justify-center text-[#B08D57] shrink-0 overflow-hidden">
                      {usuario.fotoPerfil ? (
                        <img src={usuario.fotoPerfil} alt={usuario.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm text-white truncate">{usuario.nome}</p>
                      <p className="text-[10px] text-[#8E95A1] font-mono truncate">
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
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#B08D57] hover:text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-[#B08D57]" />
                      <span>Sincronizar Banco de Dados</span>
                    </button>
                  )}

                  {onNovoOperador && usuario.nivelAcesso === 'ADMINISTRADOR' && (
                    <button
                      type="button"
                      onClick={() => { onNovoOperador(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-[#B08D57]" />
                      <span>Novo Operador</span>
                    </button>
                  )}

                  {onAlterarSenha && (
                    <button
                      type="button"
                      onClick={() => { onAlterarSenha(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#8E95A1]" />
                      <span>Alterar Senha</span>
                    </button>
                  )}

                  {onAbrirEnviarRelatorio && (
                    <button
                      type="button"
                      onClick={() => { onAbrirEnviarRelatorio(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-[#8E95A1]" />
                      <span>Enviar Relatório</span>
                    </button>
                  )}

                  {onResumoTurno && (
                    <button
                      type="button"
                      onClick={() => { onResumoTurno(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Resumo do Turno</span>
                    </button>
                  )}

                  {onEstatisticas && (
                    <button
                      type="button"
                      onClick={() => { onEstatisticas(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#B08D57] hover:text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-[#B08D57]" />
                      <span>Estatísticas & Métricas</span>
                    </button>
                  )}

                  {onExportarExcel && (
                    <button
                      type="button"
                      onClick={() => { onExportarExcel(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#10B981] hover:text-emerald-300 hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                      <span>Exportar Excel / CSV</span>
                    </button>
                  )}

                  {onImportarExcel && (
                    <button
                      type="button"
                      onClick={() => { onImportarExcel(); setIsMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#B08D57] hover:text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-[#B08D57]" />
                      <span>Importar Planilha (Conciliar)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { onExportarPdf(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-white hover:bg-[#1B1E22] transition-colors text-left cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-[#8E95A1]" />
                    <span>Exportar PDF</span>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="py-1 px-1.5">
                  <button
                    type="button"
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
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
