import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { RegistroVeiculo } from '../types';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface GlobalAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  registros: RegistroVeiculo[];
}

export const GlobalAiAssistantModal: React.FC<GlobalAiAssistantModalProps> = ({ isOpen, onClose, registros }) => {
  const [chatMensagens, setChatMensagens] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatCarregando, setIsChatCarregando] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMensagens, isOpen]);

  const enviarMensagem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatCarregando) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    const novasMensagens: ChatMessage[] = [...chatMensagens, { role: 'user', text: userMsg }];
    setChatMensagens(novasMensagens);
    setIsChatCarregando(true);

    try {
      const res = await fetch('/api/global-search-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          history: chatMensagens,
          registros: registros, // Envia um resumo dos registros atuais
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro na comunicação com o servidor.');
      }
      const data = await res.json();
      setChatMensagens([...novasMensagens, { role: 'ai', text: data.reply }]);
    } catch (err: any) {
      setChatMensagens([...novasMensagens, { role: 'ai', text: err.message || 'Desculpe, a Aura está temporariamente indisponível. Tente novamente em alguns instantes.' }]);
    } finally {
      setIsChatCarregando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 sm:bottom-6 z-50 w-[92vw] sm:w-[380px] max-w-full h-[500px] max-h-[70vh] bg-[#0B0C10] border border-[#B08D57]/30 shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#B08D57]/20 flex items-center justify-between bg-gradient-to-r from-black via-black to-[#B08D57]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C6A96B] to-[#B08D57] flex items-center justify-center text-black shadow-lg shadow-[#B08D57]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#DFBA73] text-sm">Aura</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Inteligência de Frota</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Corpo do Chat */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050608]">
        {/* Mensagem de Boas-vindas */}
        <div className="flex gap-2">
          <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#80683F]/20 flex items-center justify-center border border-[#B08D57]/30">
            <Bot className="w-4 h-4 text-[#DFBA73]" />
          </div>
          <div className="bg-[#111317] border border-[#B08D57]/20 rounded-2xl rounded-tl-sm p-3.5 text-sm text-white/90 shadow-sm leading-relaxed">
            Olá! Eu sou a Aura. Posso localizar veículos por motorista, placa, ou informar quem está na rua. O que você gostaria de saber?
          </div>
        </div>

        {/* Histórico de Mensagens */}
        {chatMensagens.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#80683F]/20 flex items-center justify-center border border-[#B08D57]/30">
                <Bot className="w-4 h-4 text-[#DFBA73]" />
              </div>
            )}
            <div className={`p-3.5 text-sm max-w-[85%] border shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#B08D57]/15 text-white border-[#B08D57]/30 rounded-2xl rounded-tr-sm' 
                : 'bg-[#111317] text-white/90 border-[#B08D57]/20 rounded-2xl rounded-tl-sm whitespace-pre-wrap'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador de Carregamento */}
        {isChatCarregando && (
          <div className="flex gap-2">
            <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#B08D57]/20 to-[#80683F]/20 flex items-center justify-center border border-[#B08D57]/30">
              <Bot className="w-4 h-4 text-[#DFBA73]" />
            </div>
            <div className="bg-[#111317] border border-[#B08D57]/20 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-3 shadow-sm">
              <Loader2 className="w-4 h-4 text-[#C6A96B] animate-spin" />
              <span className="text-white/50 text-xs font-medium">Buscando na base de dados...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-3 bg-black/60 border-t border-[#B08D57]/20">
        <form onSubmit={enviarMensagem} className="relative flex items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ex: Quais veículos estão na rua?"
            className="w-full bg-[#111317] border border-[#B08D57]/30 text-white text-sm rounded-xl py-3 pl-4 pr-12 outline-none focus:border-[#C6A96B] focus:ring-1 focus:ring-[#C6A96B]/50 placeholder:text-white/30 transition-all shadow-inner"
            disabled={isChatCarregando}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isChatCarregando}
            className="absolute right-2 p-2 bg-[#B08D57] hover:bg-[#DFBA73] text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
