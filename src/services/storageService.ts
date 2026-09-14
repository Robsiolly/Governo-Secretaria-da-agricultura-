import { RegistroVeiculo, UsuarioAutenticado, ContaOperador } from '../types';
import { FirebaseSyncService } from './firebaseSyncService';

const STORAGE_KEYS = {
  REGISTROS: 'controle_registros_veiculos_prod_v2',
  REGISTROS_BACKUP: 'controle_registros_backup_permanente_v1',
  AUTH_USER: 'controle_registros_auth_user_v1',
  OPERADORES: 'controle_operadores_contas_v3',
};

const notifyChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_data_changed'));
  }
};

// Purga dados mockados da versão anterior se ainda existirem no navegador
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('controle_registros_veiculos_data_v1')) {
      localStorage.removeItem('controle_registros_veiculos_data_v1');
    }
  } catch {
    // Silently ignore
  }
}

export const RESPONSAVEIS_CADASTRO = [
  'Diego',
  'Ricardo',
  'Rivaldo',
  'Carlos',
  'Sacchi',
  'Jean',
  'Karina',
] as const;

export type ResponsavelNome = typeof RESPONSAVEIS_CADASTRO[number];

export const GARAGENS_DISPONIVEIS = ['Kalunga', 'Sub Solo'] as const;
export type GaragemDisponivel = typeof GARAGENS_DISPONIVEIS[number];

export const ANDARES_DISPONIVEIS = ['Térreo', '1', '2', '3', '4', '5', '6', '7', 'SAA', 'Kalunga', 'Sub Solo'] as const;
export type AndarDisponivel = typeof ANDARES_DISPONIVEIS[number];

/** Formata localização legível aceitando garagem, andar ou ambos */
export const formatarLocalizacaoCompleta = (garagem?: string, andar?: string): string => {
  const g = garagem?.trim() || '';
  const a = andar?.trim() || '';

  if (g && a && g !== a) {
    const andarFormatado = ['SAA', 'Térreo'].includes(a) ? a : (a.toLowerCase().startsWith('andar') ? a : `Andar ${a}`);
    return `${g} • ${andarFormatado}`;
  }
  if (g) return g;
  if (a) {
    if (a.includes('•') || a.includes('-')) return a;
    if (['Kalunga', 'Sub Solo', 'SAA', 'Térreo'].includes(a)) return a;
    return a.toLowerCase().startsWith('andar') ? a : `Andar ${a}`;
  }
  return 'Kalunga';
};

// Todos os responsáveis pelo cadastro são OPERADORES
export const OPERADORES_PADRAO: ContaOperador[] = [
  {
    id: 'op-roberto-adm',
    nome: 'Roberto Siolly',
    email: 'robertosiolly98@gmail.com',
    matricula: 'ADM-01',
    cargo: 'Administrador do Sistema',
    secretariaPadrao: 'Ambas',
    nivelAcesso: 'ADMINISTRADOR',
    senha: 'Otrebor1982@',
  },
  {
    id: 'op-diego-2',
    nome: 'Diego',
    email: 'diego@governo.gov.br',
    matricula: 'OP-002',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Secretaria da Agricultura',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-ricardo-3',
    nome: 'Ricardo',
    email: 'ricardo@governo.gov.br',
    matricula: 'OP-003',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Secretaria do Turismo',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-rivaldo-4',
    nome: 'Rivaldo',
    email: 'rivaldo@governo.gov.br',
    matricula: 'OP-004',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Secretaria da Agricultura',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-carlos-5',
    nome: 'Carlos',
    email: 'carlos@governo.gov.br',
    matricula: 'OP-005',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Secretaria do Turismo',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-sacchi-6',
    nome: 'Sacchi',
    email: 'sacchi@governo.gov.br',
    matricula: 'OP-006',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Ambas',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-jean-7',
    nome: 'Jean',
    email: 'jean@governo.gov.br',
    matricula: 'OP-007',
    cargo: 'Operador de Cadastro',
    secretariaPadrao: 'Ambas',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
  {
    id: 'op-karina-8',
    nome: 'Karina',
    email: 'karina@governo.gov.br',
    matricula: 'OP-008',
    cargo: 'Operadora de Cadastro',
    secretariaPadrao: 'Ambas',
    nivelAcesso: 'OPERADOR',
    senha: '123',
  },
];

// Compatibilidade
export const USUARIOS_AUTORIZADOS: UsuarioAutenticado[] = OPERADORES_PADRAO.map(({ senha, ...resto }) => resto);

export const StorageService = {
  // Operadores e Contas com Senha
  getOperadores(): ContaOperador[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OPERADORES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(OPERADORES_PADRAO));
        return OPERADORES_PADRAO;
      }
      const parsed: ContaOperador[] = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(OPERADORES_PADRAO));
        return OPERADORES_PADRAO;
      }

      let modificado = false;
      const operadoresValidos: ContaOperador[] = [];
      const idsExistentes = new Set<string>();
      const matriculasExistentes = new Set<string>();
      const nomesExistentes = new Set<string>();

      // 1. Processar operadores já salvos, eliminando duplicatas de ID ou matrícula
      for (let i = 0; i < parsed.length; i++) {
        const op = parsed[i];
        if (!op || typeof op !== 'object') {
          modificado = true;
          continue;
        }

        const idOriginal = op.id || `op-${i}-${Date.now()}`;
        const nomeTrim = (op.nome || '').trim();
        const matTrim = (op.matricula || '').trim().toUpperCase();

        // Remover OP-001 se presente
        if (matTrim === 'OP-001') {
          modificado = true;
          continue;
        }

        // Se já existe exatamente o mesmo ID ou a mesma matrícula, ignora duplicata
        if (idsExistentes.has(idOriginal) || (matTrim && matriculasExistentes.has(matTrim))) {
          modificado = true;
          continue;
        }

        const isRoberto = idOriginal === 'op-roberto-adm' || matTrim === 'ADM-01' || nomeTrim.toLowerCase().includes('roberto');

        const operadorSaneado: ContaOperador = {
          ...op,
          id: idOriginal,
          nome: nomeTrim,
          matricula: matTrim,
          nivelAcesso: isRoberto ? 'ADMINISTRADOR' : 'OPERADOR',
          cargo: isRoberto ? 'Administrador do Sistema' : (op.cargo || 'Operador de Cadastro'),
          senha: isRoberto ? 'Otrebor1982@' : (op.senha || '123'),
        };

        idsExistentes.add(idOriginal);
        if (matTrim) matriculasExistentes.add(matTrim);
        if (nomeTrim) nomesExistentes.add(nomeTrim.toLowerCase());

        operadoresValidos.push(operadorSaneado);
      }

      // 2. Garantir que todos os operadores padrão (Roberto, Diego, Ricardo, Rivaldo, Carlos, Sacchi, Jean, Karina) existam
      for (const opPadrao of OPERADORES_PADRAO) {
        const existe = operadoresValidos.some(
          o => o.id === opPadrao.id ||
               o.matricula.trim().toUpperCase() === opPadrao.matricula.trim().toUpperCase() ||
               o.nome.trim().toLowerCase() === opPadrao.nome.trim().toLowerCase()
        );
        if (!existe) {
          operadoresValidos.push(opPadrao);
          modificado = true;
        }
      }

      // 3. Forçar senha e privilégios atualizados para o Administrador Roberto Siolly
      for (let i = 0; i < operadoresValidos.length; i++) {
        const op = operadoresValidos[i];
        if (op.id === 'op-roberto-adm' || op.matricula === 'ADM-01' || op.nome.toLowerCase().includes('roberto')) {
          if (op.senha !== 'Otrebor1982@' || op.nivelAcesso !== 'ADMINISTRADOR') {
            operadoresValidos[i] = {
              ...op,
              nivelAcesso: 'ADMINISTRADOR',
              cargo: 'Administrador do Sistema',
              senha: 'Otrebor1982@',
            };
            modificado = true;
          }
        }
      }

      if (modificado) {
        localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(operadoresValidos));
      }
      return operadoresValidos;
    } catch (e) {
      console.error('Erro ao ler operadores do localStorage:', e);
      return OPERADORES_PADRAO;
    }
  },

  salvarOperador(novoOperador: Omit<ContaOperador, 'id'> & { id?: string }): ContaOperador {
    const operadores = this.getOperadores();
    
    // Normalizar nível de acesso (Roberto permanece ADMINISTRADOR)
    const termoMat = novoOperador.matricula.trim().toLowerCase();
    const termoNome = novoOperador.nome.trim().toLowerCase();
    const isRoberto = novoOperador.id === 'op-roberto-adm' || termoMat === 'adm-01' || termoNome.includes('roberto');
    
    const nivelAcesso = isRoberto ? 'ADMINISTRADOR' : 'OPERADOR';
    const cargo = isRoberto ? 'Administrador do Sistema' : (novoOperador.cargo || 'Operador de Cadastro');

    if (novoOperador.id) {
      const idx = operadores.findIndex(o => o.id === novoOperador.id);
      if (idx !== -1) {
        const atualizado: ContaOperador = {
          ...operadores[idx],
          ...novoOperador,
          nivelAcesso,
          cargo,
        };
        operadores[idx] = atualizado;
        localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(operadores));
        notifyChange();
        FirebaseSyncService.salvarOperador(atualizado);
        return atualizado;
      }
    }

    // Verificar se já existe por matrícula ou e-mail
    const termoEmail = novoOperador.email.trim().toLowerCase();
    const indexExistente = operadores.findIndex(
      o => o.matricula.trim().toLowerCase() === termoMat || o.email.trim().toLowerCase() === termoEmail
    );

    if (indexExistente !== -1) {
      const atualizado: ContaOperador = {
        ...operadores[indexExistente],
        ...novoOperador,
        nivelAcesso,
        cargo,
      };
      operadores[indexExistente] = atualizado;
      localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(operadores));
      notifyChange();
      FirebaseSyncService.salvarOperador(atualizado);
      return atualizado;
    }

    const contaCriada: ContaOperador = {
      ...novoOperador,
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nivelAcesso,
      cargo,
      criadoEm: new Date().toISOString(),
    };

    const atualizados = [...operadores, contaCriada];
    localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(atualizados));
    notifyChange();
    FirebaseSyncService.salvarOperador(contaCriada);
    return contaCriada;
  },

  excluirOperador(id: string): boolean {
    const operadores = this.getOperadores();
    // Não permitir excluir o admin principal ou se restar apenas 1 operador
    const opAlvo = operadores.find(o => o.id === id);
    if (opAlvo && (opAlvo.id === 'op-roberto-adm' || opAlvo.matricula === 'ADM-01' || opAlvo.nivelAcesso === 'ADMINISTRADOR')) {
      return false;
    }
    if (operadores.length <= 1) {
      return false;
    }
    const filtrados = operadores.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(filtrados));
    notifyChange();
    FirebaseSyncService.excluirOperador(id);
    return true;
  },

  autenticar(identificador: string, senhaDigitada: string): { sucesso: boolean; usuario?: UsuarioAutenticado; erro?: string } {
    const operadores = this.getOperadores();
    const termo = identificador.trim().toLowerCase();

    // Buscar por matrícula, email ou nome
    const operador = operadores.find(
      o => o.matricula.trim().toLowerCase() === termo ||
           o.email.trim().toLowerCase() === termo ||
           o.nome.trim().toLowerCase() === termo
    );

    if (!operador) {
      return {
        sucesso: false,
        erro: 'Operador não encontrado. Verifique a matrícula ou crie uma nova conta de Operador.',
      };
    }

    // Validar senha
    const senhaCorreta = operador.senha?.trim();
    if (senhaCorreta && senhaDigitada.trim() !== senhaCorreta) {
      return {
        sucesso: false,
        erro: 'Senha incorreta para o operador informado.',
      };
    }

    // Retorna dados do usuário autenticado (sem expor a senha)
    const { senha, ...usuarioAutenticado } = operador;
    this.setUsuarioAutenticado(usuarioAutenticado);
    return {
      sucesso: true,
      usuario: usuarioAutenticado,
    };
  },

  getNomesResponsaveis(): string[] {
    const operadores = this.getOperadores();
    const nomes = new Set<string>();
    
    // Garantir a ordem inicial dos 7 solicitados
    for (const nome of RESPONSAVEIS_CADASTRO) {
      nomes.add(nome);
    }
    // Adicionar quaisquer novos operadores criados
    for (const op of operadores) {
      if (op.nome?.trim()) {
        nomes.add(op.nome.trim());
      }
    }
    return Array.from(nomes);
  },

  // Registros de Veículos com espelho de redundância contra perda
  getRegistros(): RegistroVeiculo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTROS);
      let registros: RegistroVeiculo[] = data ? JSON.parse(data) : [];

      // Se o array principal estiver vazio ou corrompido, tenta restaurar do backup permanente
      if (!Array.isArray(registros) || registros.length === 0) {
        const backup = localStorage.getItem(STORAGE_KEYS.REGISTROS_BACKUP);
        if (backup) {
          const registrosBackup: RegistroVeiculo[] = JSON.parse(backup);
          if (Array.isArray(registrosBackup) && registrosBackup.length > 0) {
            registros = registrosBackup;
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
          }
        }
      }

      return Array.isArray(registros) ? registros : [];
    } catch (e) {
      console.error('Erro ao ler registros do localStorage:', e);
      try {
        const backup = localStorage.getItem(STORAGE_KEYS.REGISTROS_BACKUP);
        if (backup) return JSON.parse(backup);
      } catch {}
      return [];
    }
  },

  salvarRegistro(registro: Omit<RegistroVeiculo, 'id' | 'criadoEm'> & { id?: string }): RegistroVeiculo {
    const registros = this.getRegistros();
    if (registro.id) {
      // Atualização
      const index = registros.findIndex(r => r.id === registro.id);
      if (index !== -1) {
        const atualizado: RegistroVeiculo = {
          ...registros[index],
          ...registro,
          atualizadoEm: new Date().toISOString(),
        };
        registros[index] = atualizado;
        localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
        localStorage.setItem(STORAGE_KEYS.REGISTROS_BACKUP, JSON.stringify(registros));
        notifyChange();
        FirebaseSyncService.salvarRegistro(atualizado);
        return atualizado;
      }
    }

    // Criação de novo registro real
    const novo: RegistroVeiculo = {
      ...registro,
      id: registro.id || `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      criadoEm: new Date().toISOString(),
    };
    const atualizados = [novo, ...registros.filter(r => r.id !== novo.id)];
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(atualizados));
    localStorage.setItem(STORAGE_KEYS.REGISTROS_BACKUP, JSON.stringify(atualizados));
    notifyChange();
    FirebaseSyncService.salvarRegistro(novo);
    return novo;
  },

  salvarLoteRegistros(novos: RegistroVeiculo[]): RegistroVeiculo[] {
    if (!novos || novos.length === 0) return [];
    const registros = this.getRegistros();
    const idsExistentes = new Set(registros.map(r => r.id));
    const novosUnicos = novos.filter(n => !idsExistentes.has(n.id));
    const atualizados = [...novosUnicos, ...registros];
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(atualizados));
    localStorage.setItem(STORAGE_KEYS.REGISTROS_BACKUP, JSON.stringify(atualizados));
    notifyChange();
    FirebaseSyncService.salvarLoteRegistros(novosUnicos);
    return novosUnicos;
  },

  excluirRegistro(id: string): boolean {
    const registros = this.getRegistros();
    const filtrados = registros.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(filtrados));
    localStorage.setItem(STORAGE_KEYS.REGISTROS_BACKUP, JSON.stringify(filtrados));
    notifyChange();
    FirebaseSyncService.excluirRegistro(id);
    return true;
  },

  getUsuarioAutenticado(): UsuarioAutenticado | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setUsuarioAutenticado(usuario: UsuarioAutenticado | null): void {
    if (!usuario) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(usuario));
    }
    notifyChange();
  },

  limparTodosRegistros(): void {
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify([]));
    notifyChange();
  },

  atualizarSenha(operadorIdOrMatricula: string, novaSenha: string): boolean {
    const operadores = this.getOperadores();
    const idx = operadores.findIndex(
      o => o.id === operadorIdOrMatricula ||
           o.matricula.toLowerCase() === operadorIdOrMatricula.toLowerCase() ||
           o.email.toLowerCase() === operadorIdOrMatricula.toLowerCase()
    );
    if (idx !== -1) {
      operadores[idx].senha = novaSenha.trim();
      localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(operadores));
      notifyChange();
      FirebaseSyncService.salvarOperador(operadores[idx]);
      return true;
    }
    return false;
  },

  salvarAssinaturaPadrao(matricula: string, dataUrl: string): void {
    if (!matricula) return;
    try {
      localStorage.setItem(`sig_padrao_${matricula.toUpperCase()}`, dataUrl);
    } catch {
      // Ignorar quota exceeded
    }
  },

  getAssinaturaSalva(matricula: string): string | null {
    if (!matricula) return null;
    try {
      return localStorage.getItem(`sig_padrao_${matricula.toUpperCase()}`);
    } catch {
      return null;
    }
  }
};

// Aliases para compatibilidade
export const obterRegistros = () => StorageService.getRegistros();
export const salvarRegistro = (reg: Parameters<typeof StorageService.salvarRegistro>[0]) => StorageService.salvarRegistro(reg);
export const excluirRegistro = (id: string) => StorageService.excluirRegistro(id);
export const obterSessao = () => StorageService.getUsuarioAutenticado();
export const encerrarSessao = () => StorageService.setUsuarioAutenticado(null);

