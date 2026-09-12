import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
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

let cancelRegistrosSub: (() => void) | null = null;
let cancelOperadoresSub: (() => void) | null = null;

export const FirebaseSyncService = {
  // Inicializar escutadores de dados em tempo real (Ao vivo no celular e computador)
  iniciarSincronizacaoAoVivo() {
    if (typeof window === 'undefined') return;

    try {
      // 1. Escutar Registros de Veículos em tempo real
      const qRegistros = query(collection(db, 'registros'));
      cancelRegistrosSub = onSnapshot(
        qRegistros,
        (snapshot) => {
          const listaRegistros: RegistroVeiculo[] = [];
          snapshot.forEach((docSnap) => {
            listaRegistros.push(docSnap.data() as RegistroVeiculo);
          });

          // Ordenar por data/criadoEm mais recente primeiro
          listaRegistros.sort((a, b) => new Date(b.criadoEm || b.data).getTime() - new Date(a.criadoEm || a.data).getTime());

          // Apenas atualizar localStorage se houver dados ou se a coleção tiver sido limpa remotamente
          if (listaRegistros.length > 0 || !snapshot.metadata.hasPendingWrites) {
            localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(listaRegistros));
            notifyChange();
          }
        },
        (error) => {
          console.warn('Escuta em tempo real de registros ativada via cache local:', error);
        }
      );

      // 2. Escutar Operadores em tempo real
      const qOperadores = query(collection(db, 'operadores'));
      cancelOperadoresSub = onSnapshot(
        qOperadores,
        (snapshot) => {
          const listaOperadores: ContaOperador[] = [];
          snapshot.forEach((docSnap) => {
            listaOperadores.push(docSnap.data() as ContaOperador);
          });

          // Se a nuvem estiver completamente vazia na primeira execução, subir os operadores padrão
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
          console.warn('Escuta em tempo real de operadores ativada via cache local:', error);
        }
      );
    } catch (err) {
      console.error('Erro ao iniciar sincronização Firebase:', err);
    }
  },

  // Semear os operadores padrão no Firebase (ex: Roberto ADM-01) caso o banco esteja novo
  async semearOperadoresPadrao() {
    try {
      for (const op of OPERADORES_PADRAO) {
        await setDoc(doc(db, 'operadores', op.id), op, { merge: true });
      }
    } catch (e) {
      console.warn('Falha ao semear operadores padrão no Firebase:', e);
    }
  },

  // Salvar registro no Firebase Firestore em tempo real
  async salvarRegistro(registro: RegistroVeiculo) {
    try {
      await setDoc(doc(db, 'registros', registro.id), registro, { merge: true });
    } catch (e) {
      console.error('Erro ao salvar registro no Firebase:', e);
    }
  },

  // Excluir registro no Firebase Firestore
  async excluirRegistro(id: string) {
    try {
      await deleteDoc(doc(db, 'registros', id));
    } catch (e) {
      console.error('Erro ao excluir registro no Firebase:', e);
    }
  },

  // Salvar operador no Firebase Firestore
  async salvarOperador(operador: ContaOperador) {
    try {
      await setDoc(doc(db, 'operadores', operador.id), operador, { merge: true });
    } catch (e) {
      console.error('Erro ao salvar operador no Firebase:', e);
    }
  },

  // Excluir operador no Firebase Firestore
  async excluirOperador(id: string) {
    try {
      await deleteDoc(doc(db, 'operadores', id));
    } catch (e) {
      console.error('Erro ao excluir operador no Firebase:', e);
    }
  },

  pararSincronizacao() {
    if (cancelRegistrosSub) cancelRegistrosSub();
    if (cancelOperadoresSub) cancelOperadoresSub();
  }
};
