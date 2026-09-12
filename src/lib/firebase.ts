import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validar conexão inicial com Firestore conforme protocolo do Firebase Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('🔥 Conexão com Firebase Firestore estabelecida com sucesso!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('⚠️ Firebase rodando em modo offline/cache.');
    }
  }
}

testConnection();
