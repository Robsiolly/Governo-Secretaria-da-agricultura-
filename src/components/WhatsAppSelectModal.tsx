import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  User,
  Building2,
  Wheat,
  Plane,
  Phone,
  Plus,
  Trash2,
  Check,
  Send,
  Users,
  Star,
  FileText
} from 'lucide-react';
import { UsuarioAutenticado } from '../types';
import { StorageService } from '../services/storageService';

export interface ContatoWhatsApp {
  id: string;
  nome: string;
  numero: string; // formato limpo sem caracteres especiais ex: 5511999998888
  cargoOuSetor?: string;
  tipo: 'SETOR' | 'OPERADOR' | 'PERSONALIZADO' | 'GERAL';
}

interface WhatsAppSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: (numeroWhatsApp: string, nomeDestinatario?: string) => void;
  textoRelatorio: string;
  dataRelatorio?: string;
  usuarioAtual?: UsuarioAutenticado | null;
}

const STORAGE_KEY_CONTATOS = 'controle_whatsapp_contatos_frequentes_v1';

// Setores padrão predefinidos do Governo do Estado
const SETORES_PREDEFINIDOS: ContatoWhatsApp[] = [
  {
    id: 'setor-geral',
    nome: 'Qualquer Contato (Lista Aberta do WhatsApp)',
    numero: '',
    cargoOuSetor: 'Escolher o contato ou grupo diretamente dentro do WhatsApp',
    tipo: 'GERAL',
  },
  {
    id: 'setor-frotas-geral',
    nome: 'Diretoria Geral de Frotas',
    numero: '5511999990001',
    cargoOuSetor: 'Central de Transporte e Logística • Governo de SP',
    tipo: 'SETOR',
  },
  {
    id: 'setor-agri-frotas',
    nome: 'Coordenadoria de Frotas • Secretaria da Agricultura',
    numero: '5511999990002',
    cargoOuSetor: 'Secretaria da Agricultura e Abastecimento',
    tipo: 'SETOR',
  },
  {
    id: 'setor-turismo-frotas',
    nome: 'Coordenadoria de Frotas • Secretaria do Turismo',
    numero: '5511999990003',
    cargoOuSetor: 'Secretaria do Turismo e Viagens',
    tipo: 'SETOR',
  },
];

export const WhatsAppSelectModal: React.FC<WhatsAppSelectModalProps> = ({
  isOpen,
  onClose,
  onConfirmSend,
  textoRelatorio,
  dataRelatorio,
  usuarioAtual,
}) => {
  const [opcaoSelecionadaId, setOpcaoSelecionadaId] = useState<string>('setor-geral');
  const [numeroCustom, setNumeroCustom] = useState<string>('');
  const [nomeCustom, setNomeCustom] = useState<string>('');
  const [salvarContatoCustom, setSalvarContatoCustom] = useState<boolean>(true);
  const [contatosSalvos, setContatosSalvos] = useState<ContatoWhatsApp[]>([]);
  const [mostrarPreviewText, setMostrarPreviewText] = useState<boolean>(false);

  // Carregar contatos frequentes salvos no localStorage + Operadores do sistema
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CONTATOS);
      if (data) {
        setContatosSalvos(JSON.parse(data));
      }
    } catch {
      // Ignora erro de parse
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Obter lista de operadores cadastrados no sistema
  const operadoresDoSistema: ContatoWhatsApp[] = StorageService.getOperadores().map((op) => ({
    id: `op-wa-${op.id}`,
    nome: op.nome,
    numero: op.matricula === 'ADM-01' ? '5511999998888' : '', // se tiver número do operador
    cargoOuSetor: `${op.cargo} • ${op.secretariaPadrao}`,
    tipo: 'OPERADOR',
  }));

  // Limpar formatação de telefone para envio
  const formatarNumeroEnvio = (raw: string): string => {
    const apenasNumeros = raw.replace(/\D/g, '');
    if (!apenasNumeros) return '';
    // Se digitou DDD + Numero sem 55 (ex: 11988887777), adiciona o DDI do Brasil 55
    if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
      return `55${apenasNumeros}`;
    }
    return apenasNumeros;
  };

  const handleSalvarNovoContato = () => {
    if (!numeroCustom.trim()) return;
    const numFormatado = formatarNumeroEnvio(numeroCustom);
    const novo: ContatoWhatsApp = {
      id: `custom-${Date.now()}`,
      nome: nomeCustom.trim() || `Contato (${numeroCustom})`,
      numero: numFormatado,
      cargoOuSetor: 'Contato Frequente Adicionado',
      tipo: 'PERSONALIZADO',
    };

    const atualizados = [novo, ...contatosSalvos];
    setContatosSalvos(atualizados);
    try {
      localStorage.setItem(STORAGE_KEY_CONTATOS, JSON.stringify(atualizados));
    } catch {
      // ignore
    }
    setOpcaoSelecionadaId(novo.id);
    setNumeroCustom('');
    setNomeCustom('');
  };

  const handleExcluirContatoSalvo = (idExcluir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtrados = contatosSalvos.filter((c) => c.id !== idExcluir);
    setContatosSalvos(filtrados);
    try {
      localStorage.setItem(STORAGE_KEY_CONTATOS, JSON.stringify(filtrados));
    } catch {
      // ignore
    }
    if (opcaoSelecionadaId === idExcluir) {
      setOpcaoSelecionadaId('setor-geral');
    }
  };

  const handleEnviar = () => {
    // 1. Se escolheu opção personalizada e digitou número
    if (opcaoSelecionadaId === 'custom-input') {
      const numFormatado = formatarNumeroEnvio(numeroCustom);
      if (salvarContatoCustom && numFormatado && nomeCustom.trim()) {
        handleSalvarNovoContato();
      }
      onConfirmSend(numFormatado, nomeCustom.trim() || 'Contato');
      return;
    }

    // 2. Se selecionou das listas predefinidas ou salvos
    const todosContatos = [...SETORES_PREDEFINIDOS, ...contatosSalvos, ...operadoresDoSistema];
    const contatoAlvo = todosContatos.find((c) => c.id === opcaoSelecionadaId);

    if (contatoAlvo) {
      onConfirmSend(contatoAlvo.numero, contatoAlvo.nome);
    } else {
      onConfirmSend(''); // Envio geral sem número
    }
  };

  // Identificar dados do contato selecionado para exibição do botão final
  const todosDisponiveis = [...SETORES_PREDEFINIDOS, ...contatosSalvos, ...operadoresDoSistema];
  const contatoAtualSelecionado = todosDisponiveis.find((c) => c.id === opcaoSelecionadaId);

  return (
    <div
      id="modal-whatsapp-select-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="modal-whatsapp-select-container"
        className="bg-slate-900 border-2 border-amber-9500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabeçalho */}
        <div className="bg-slate-950 px-6 py-5 border-b-2 border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Escolher Destinatário do WhatsApp
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Selecione o setor, operador ou informe para qual WhatsApp enviar o relatório
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Opção 1: Escolha Geral no WhatsApp */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Destinatário Aberto (Escolher no Aparelho):
            </label>
            <div
              onClick={() => setOpcaoSelecionadaId('setor-geral')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                opcaoSelecionadaId === 'setor-geral'
                  ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-950/50'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Escolher o Contato no próprio WhatsApp</h4>
                  <p className="text-xs text-slate-300 font-medium">
                    Abre a lista de contatos/grupos do seu WhatsApp para você selecionar
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  opcaoSelecionadaId === 'setor-geral'
                    ? 'border-amber-400 bg-amber-9500 text-slate-950'
                    : 'border-slate-600'
                }`}
              >
                {opcaoSelecionadaId === 'setor-geral' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Opção 2: Setores Governamentais Predefinidos */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Setores de Frotas e Coordenadorias:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SETORES_PREDEFINIDOS.filter((s) => s.id !== 'setor-geral').map((setor) => {
                const isSelected = opcaoSelecionadaId === setor.id;
                return (
                  <div
                    key={setor.id}
                    onClick={() => setOpcaoSelecionadaId(setor.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        {setor.nome.includes('Agricultura') ? (
                          <Wheat className="w-4 h-4 text-[#D97924]" />
                        ) : setor.nome.includes('Turismo') ? (
                          <Plane    className="text-emerald-400 w-4 h-4 text-emerald-400" />
                        ) : (
                          <Building2 className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{setor.nome}</h4>
                        <p className="text-xs text-slate-400">{setor.cargoOuSetor}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-9500 text-slate-950'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Opção 3: Digitar Novo Número Personalizado */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Enviar para Número Específico (Informe o WhatsApp):
            </label>
            <div
              onClick={() => setOpcaoSelecionadaId('custom-input')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                opcaoSelecionadaId === 'custom-input'
                  ? 'bg-amber-950/60 border-amber-400 shadow-md'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Digitar Número do WhatsApp</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    opcaoSelecionadaId === 'custom-input'
                      ? 'border-amber-400 bg-amber-9500 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {opcaoSelecionadaId === 'custom-input' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    DDD + Telefone / Celular:
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: (11) 99888-7766"
                    value={numeroCustom}
                    onFocus={() => setOpcaoSelecionadaId('custom-input')}
                    onChange={(e) => setNumeroCustom(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nome do Destinatário (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Coordenador João"
                    value={nomeCustom}
                    onFocus={() => setOpcaoSelecionadaId('custom-input')}
                    onChange={(e) => setNomeCustom(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-700 focus:border-amber-400 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  id="chk-salvar-contato"
                  checked={salvarContatoCustom}
                  onChange={(e) => setSalvarContatoCustom(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-9500 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="chk-salvar-contato" className="text-xs text-slate-300 cursor-pointer font-medium">
                  Salvar este número na minha lista de contatos frequentes
                </label>
              </div>
            </div>
          </div>

          {/* Opção 4: Contatos Frequentes / Recentes Salvos */}
          {contatosSalvos.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Meus Contatos Frequentes Salvos:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contatosSalvos.map((c) => {
                  const isSelected = opcaoSelecionadaId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setOpcaoSelecionadaId(c.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <User className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block truncate">{c.nome}</span>
                          <span className="text-[11px] font-mono text-slate-400">{c.numero}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleExcluirContatoSalvo(c.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remover dos salvos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-amber-400 bg-amber-9500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prévia Sanfonada da Mensagem */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <button
              type="button"
              onClick={() => setMostrarPreviewText(!mostrarPreviewText)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Ver prévia da mensagem que será enviada</span>
              </div>
              <span className="text-[11px] text-amber-400 hover:underline">
                {mostrarPreviewText ? 'Ocultar' : 'Expandir prévia'}
              </span>
            </button>

            {mostrarPreviewText && (
              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {textoRelatorio}
              </pre>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-950 px-6 py-4 border-t-2 border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleEnviar}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-9500 hover:to-amber-9500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xl shadow-amber-950/60 cursor-pointer transition-all min-h-[46px]"
          >
            <Send className="w-4 h-4" />
            <span>
              {opcaoSelecionadaId === 'setor-geral'
                ? 'Abrir no WhatsApp'
                : contatoAtualSelecionado
                ? `Enviar p/ ${contatoAtualSelecionado.nome}`
                : 'Enviar p/ WhatsApp'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
