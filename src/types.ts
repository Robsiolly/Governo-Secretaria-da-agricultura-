export type Secretaria = 'Secretaria da Agricultura' | 'Secretaria do Turismo';

export interface RegistroVeiculo {
  id: string;
  secretaria: Secretaria;
  data: string; // YYYY-MM-DD
  motorista: string;
  fct: string; // Nº do registro FCT (apenas para Secretaria da Agricultura mediante autorização; Secretaria do Turismo NÃO utiliza FCT)
  horarioSaida: string; // HH:mm
  horarioChegada: string; // HH:mm (pode estar em aberto se em trânsito ou preenchido)
  garagem?: string; // Ex: 'Kalunga' ou 'Sub Solo'
  andar: string; // Ex: Kalunga, Sub Solo, Andar 1..7, SAA, ou composto: Kalunga • Andar 2
  funcionarioResponsavel: string; // Nome do funcionário responsável pelo cadastro
  matriculaFuncionario?: string;
  assinaturaUrl: string; // Base64 dataURL da assinatura desenhada no canvas
  placa?: string; // Opcional, ex: ABC-1234
  modeloVeiculo?: string; // Opcional, ex: Hilux 4x4, Spin 7L, Renegade
  destino?: string; // Opcional, ex: Fazenda Experimental, Polo Turístico
  observacoes?: string;
  ocorrencia?: string; // Campo de ocorrência/anotação de incidentes pelo operador (avarias, atrasos, vistorias, etc.)
  status: 'EM_TRANSITO' | 'FINALIZADO';
  criadoEm: string; // ISO string
  atualizadoEm?: string;
}

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  secretariaPadrao: Secretaria | 'Ambas';
  nivelAcesso: 'ADMINISTRADOR' | 'FISCAL' | 'OPERADOR';
  fotoPerfil?: string; // Base64 dataURL da foto do operador
}

export interface ContaOperador extends UsuarioAutenticado {
  senha: string;
  criadoEm?: string;
}

export interface FiltrosRegistros {
  secretaria: 'TODAS' | Secretaria;
  data: string; // '' para todas ou YYYY-MM-DD
  busca: string;
  status: 'TODOS' | 'EM_TRANSITO' | 'FINALIZADO';
}
