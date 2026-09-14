import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RegistroVeiculo, ContaOperador } from '../types';
import { OPERADORES_PADRAO } from './storageService';

const STORAGE_KEYS = {
  REGISTROS: 'controle_registros_veiculos_prod_v2',
  OPERADORES: 'controle_operadores_contas_v3',
};

const notifyChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_data_changed'));
  }
};

// Sanitiza o objeto removendo chaves com valor undefined para compatibilidade estrita com o Firestore
function sanitizarParaFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const limpo: Record<string, any> = {};
  Object.keys(obj).forEach((chave) => {
    const valor = obj[chave];
    if (valor !== undefined) {
      limpo[chave] = valor;
    }
  });
  return limpo;
}

let cancelRegistrosSub: (() => void) | null = null;
let cancelOperadoresSub: (() => void) | null = null;
let isIniciado = false;

export const FirebaseSyncService = {
  // Inicializar escutadores de dados em tempo real (Ao vivo no celular e computador)
  iniciarSincronizacaoAoVivo() {
    if (typeof window === 'undefined') return;
    if (isIniciado) return;
    isIniciado = true;

    try {
      console.log('🔄 Conectando ao Banco de Dados Firestore...');

      // 1. Escutar Registros de Veículos em tempo real
      const qRegistros = query(collection(db, 'registros'));
      cancelRegistrosSub = onSnapshot(
        qRegistros,
        (snapshot) => {
          const listaRegistros: RegistroVeiculo[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as RegistroVeiculo;
            if (data && data.id) {
              listaRegistros.push(data);
            }
          });

          // Ordenar por data/criadoEm mais recente primeiro
          listaRegistros.sort((a, b) => new Date(b.criadoEm || b.data).getTime() - new Date(a.criadoEm || a.data).getTime());

          // Atualizar o cache local, o backup de segurança e notificar a interface
          if (listaRegistros.length > 0) {
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(listaRegistros));
            localStorage.setItem('controle_registros_backup_permanente_v1', JSON.stringify(listaRegistros));
            notifyChange();
          } else if (!snapshot.metadata.hasPendingWrites) {
            // Preserva backup se por algum motivo receber lista vazia
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(listaRegistros));
            notifyChange();
          }
        },
        (error) => {
          console.warn('⚠️ Escuta em tempo real de registros ativada via cache local:', error);
        }
      );

      // 2. Escutar Operadores em tempo real
      const qOperadores = query(collection(db, 'operadores'));
      cancelOperadoresSub = onSnapshot(
        qOperadores,
        (snapshot) => {
          const listaOperadores: ContaOperador[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ContaOperador;
            if (data && data.id) {
              listaOperadores.push(data);
            }
          });

          // Se o banco estiver completamente vazio na primeira execução, semear os operadores padrão
          if (listaOperadores.length === 0 && !snapshot.metadata.hasPendingWrites) {
            this.semearOperadoresPadrao();
            return;
          }

          if (listaOperadores.length > 0) {
            localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(listaOperadores));
            notifyChange();
          }
        },
        (error) => {
          console.warn('⚠️ Escuta em tempo real de operadores ativada via cache local:', error);
        }
      );
      // 3. Forçar busca imediata via HTTP para garantia de dados frescos imediatos
      this.sincronizarAgora();
    } catch (err) {
      console.error('❌ Erro ao iniciar sincronização com Firebase Firestore:', err);
    }
  },

  // Busca imediata direta no Firestore garantindo que todos os registros existentes venham para a memória
  async sincronizarAgora(): Promise<{ sucesso: boolean; totalRegistros: number; erro?: string }> {
    try {
      const snapReg = await getDocs(collection(db, 'registros'));
      const listaRegistros: RegistroVeiculo[] = [];
      snapReg.forEach((docSnap) => {
        const data = docSnap.data() as RegistroVeiculo;
        if (data && data.id) {
          listaRegistros.push(data);
        }
      });

      listaRegistros.sort((a, b) => new Date(b.criadoEm || b.data).getTime() - new Date(a.criadoEm || a.data).getTime());

      if (listaRegistros.length > 0) {
        localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(listaRegistros));
        localStorage.setItem('controle_registros_backup_permanente_v1', JSON.stringify(listaRegistros));
        notifyChange();
      }

      const snapOp = await getDocs(collection(db, 'operadores'));
      const listaOperadores: ContaOperador[] = [];
      snapOp.forEach((docSnap) => {
        const data = docSnap.data() as ContaOperador;
        if (data && data.id) {
          listaOperadores.push(data);
        }
      });

      if (listaOperadores.length > 0) {
        localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(listaOperadores));
        notifyChange();
      }

      return { sucesso: true, totalRegistros: listaRegistros.length };
    } catch (e) {
      console.warn('Tentativa de sincronização manual do Firestore:', e);
      return { sucesso: false, totalRegistros: 0, erro: String(e) };
    }
  },

  // Semear os operadores padrão no Firebase (ex: Roberto ADM-01) caso o banco esteja novo
  async semearOperadoresPadrao() {
    try {
      for (const op of OPERADORES_PADRAO) {
        const payload = sanitizarParaFirestore(op);
        await setDoc(doc(db, 'operadores', op.id), payload, { merge: true });
      }
      console.log('✅ Operadores padrão semeados no Firebase Firestore com sucesso.');
    } catch (e) {
      console.warn('Falha ao semear operadores padrão no Firebase:', e);
    }
  },

  // Salvar lote de registros no Firebase Firestore
  async salvarLoteRegistros(novosRegistros: RegistroVeiculo[]): Promise<{ sucessos: number; erros: number }> {
    let sucessos = 0;
    let erros = 0;
    for (const reg of novosRegistros) {
      try {
        const payload = sanitizarParaFirestore(reg);
        await setDoc(doc(db, 'registros', reg.id), payload, { merge: true });
        sucessos++;
      } catch (e) {
        console.error(`❌ Erro ao salvar registro em lote ${reg.id}:`, e);
        erros++;
      }
    }
    return { sucessos, erros };
  },

  // Salvar registro no Firebase Firestore em tempo real
  async salvarRegistro(registro: RegistroVeiculo): Promise<boolean> {
    try {
      const payload = sanitizarParaFirestore(registro);
      await setDoc(doc(db, 'registros', registro.id), payload, { merge: true });
      console.log(`✅ Registro ${registro.id} salvo no Firestore com sucesso.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao salvar registro no Firebase Firestore:', e);
      return false;
    }
  },

  // Excluir registro no Firebase Firestore
  async excluirRegistro(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'registros', id));
      console.log(`✅ Registro ${id} excluído do Firestore com sucesso.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao excluir registro no Firebase Firestore:', e);
      return false;
    }
  },

  // Salvar operador no Firebase Firestore
  async salvarOperador(operador: ContaOperador): Promise<boolean> {
    try {
      const payload = sanitizarParaFirestore(operador);
      await setDoc(doc(db, 'operadores', operador.id), payload, { merge: true });
      console.log(`✅ Operador ${operador.nome} salvo no Firestore com sucesso.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao salvar operador no Firebase Firestore:', e);
      return false;
    }
  },

  // Excluir operador no Firebase Firestore
  async excluirOperador(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'operadores', id));
      console.log(`✅ Operador ${id} excluído do Firestore com sucesso.`);
      return true;
    } catch (e) {
      console.error('❌ Erro ao excluir operador no Firebase Firestore:', e);
      return false;
    }
  },

  pararSincronizacao() {
    if (cancelRegistrosSub) {
      cancelRegistrosSub();
      cancelRegistrosSub = null;
    }
    if (cancelOperadoresSub) {
      cancelOperadoresSub();
      cancelOperadoresSub = null;
    }
    isIniciado = false;
  }
};
