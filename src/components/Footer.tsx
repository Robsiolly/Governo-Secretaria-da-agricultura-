import React from 'react';
import { Shield, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[#111113]/80 backdrop-blur-2xl text-white/60 py-8 relative">
      {/* Specular Top Edge Light */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-sm font-semibold text-white">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Controle de Registros • Agricultura e Turismo</span>
            </div>
            <p className="text-xs text-white/40 max-w-md">
              Sistema oficial de controle de tráfego veicular e registro autorizado para auditoria governamental.
            </p>
          </div>

          <div className="flex flex-col sm:items-end items-center space-y-1.5">
            {/* Frase oficial do rodapé */}
            <div className="px-4 py-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-amber-400 shadow-sm backdrop-blur-md">
              Desenvolvido por Siolly Technology
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Ambiente Protegido e Auditado • Acesso Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


