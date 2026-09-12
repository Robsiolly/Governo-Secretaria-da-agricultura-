import React from 'react';

interface GovSpLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const GovSpLogo: React.FC<GovSpLogoProps> = ({ className = '', size = 'md', variant = 'light' }) => {
  const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-10';
  const textColor = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = variant === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logotipo SP Oficial */}
      <div className={`flex items-center ${heightClass} px-2.5 py-1 bg-white rounded-xl shadow-sm border border-slate-200/80 shrink-0`}>
        <svg viewBox="0 0 160 60" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Letra S preta estilizada */}
          <path d="M24 10C15 10 9 15 9 22C9 32 41 30 41 42C41 50 32 54 20 54C11 54 5 50 2 46L9 39C12 43 16 46 21 46C27 46 31 43 31 39C31 29 -1 31 -1 20C-1 9 10 4 23 4C30 4 36 7 40 11L33 18C30 14 27 10 24 10Z" fill="black"/>
          
          {/* Bloco vermelho SP (Speech bubble / retângulo arredondado vermelho) */}
          <path d="M50 4C50 2.89543 50.8954 2 52 2H86C89.3137 2 92 4.68629 92 8V52C92 53.1046 91.1046 54 90 54H52C50.8954 54 50 53.1046 50 52V4Z" fill="#E11D48"/>
          
          {/* Letra P recortada em branco dentro do bloco vermelho */}
          <path d="M62 14H73C77.9706 14 82 18.0294 82 23C82 27.9706 77.9706 32 73 32H62V14Z" fill="white"/>
          <path d="M62 14H56V46H62V32H73C77.9706 32 82 27.9706 82 23C82 18.0294 77.9706 14 73 14H62Z" fill="#E11D48"/>
          <path d="M62 20H73C74.6569 20 76 21.3431 76 23C76 24.6569 74.6569 26 73 26H62V20Z" fill="white"/>
        </svg>
      </div>

      {/* Textos Institucionais */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight text-sm sm:text-base font-sans ${textColor}`}>
          SÃO PAULO
        </span>
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-0.5 font-sans ${subTextColor}`}>
          GOVERNO DO ESTADO
        </span>
      </div>
    </div>
  );
};
