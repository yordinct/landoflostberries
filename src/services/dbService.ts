import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PlayerState } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveGame = async (slotId: number, data: PlayerState) => {
  if (!auth.currentUser) return;
  const path = `saves/${auth.currentUser.uid}/slots/${slotId}`;
  try {
    await setDoc(doc(db, path), { ...data, updatedAt: Date.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const loadGame = async (slotId: number): Promise<PlayerState | null> => {
  if (!auth.currentUser) return null;
  const path = `saves/${auth.currentUser.uid}/slots/${slotId}`;
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? (snap.data() as PlayerState) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const deleteSave = async (slotId: number) => {
  if (!auth.currentUser) return;
  const path = `saves/${auth.currentUser.uid}/slots/${slotId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getAllSaves = async (): Promise<Record<number, PlayerState>> => {
  if (!auth.currentUser) return {};
  const path = `saves/${auth.currentUser.uid}/slots`;
  try {
    const snap = await getDocs(collection(db, path));
    const saves: Record<number, PlayerState> = {};
    snap.forEach(doc => {
      saves[parseInt(doc.id)] = doc.data() as PlayerState;
    });
    return saves;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
};
