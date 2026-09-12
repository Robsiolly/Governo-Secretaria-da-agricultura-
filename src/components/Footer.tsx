import React from 'react';
import { Shield, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950 text-slate-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-sm sm:text-base font-bold text-white">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Controle de Registros Secretaria da Agricultura e Secretaria do Turismo</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Sistema oficial de controle de tráfego veicular e registro autorizado para auditoria governamental.
            </p>
          </div>

          <div className="flex flex-col sm:items-end items-center space-y-1.5">
            {/* Frase oficial do rodapé solicitada */}
            <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-sm sm:text-base font-bold text-emerald-300 shadow-md">
              2026 Desenvolvido por Roberto
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Ambiente Protegido e Auditado • Acesso Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

