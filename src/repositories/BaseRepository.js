import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * BaseRepository enforces a strict CRUD and Listen interface for all domain entities.
 * This completely abstracts the Firebase modular SDK from the UI layer, enabling
 * global optimizations, caching, and easier testing while preserving Firebase's
 * native offline persistence and optimistic updates.
 */
export class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  /**
   * Retrieves a single document by ID.
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const docRef = doc(this.collectionRef, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }

  /**
   * Retrieves multiple documents based on a composed query.
   * @param {import('firebase/firestore').QueryConstraint[]} constraints 
   * @returns {Promise<Array>}
   */
  async findMany(constraints = []) {
    const q = query(this.collectionRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  /**
   * Creates a new document with an auto-generated ID if id is omitted.
   * @param {Object} payload 
   * @param {string} [id=null] 
   * @returns {Promise<string>} The document ID
   */
  async create(payload, id = null) {
    const docRef = id ? doc(this.collectionRef, id) : doc(this.collectionRef);
    await setDoc(docRef, payload);
    return docRef.id;
  }

  /**
   * Updates an existing document.
   * @param {string} id 
   * @param {Object} payload 
   * @returns {Promise<void>}
   */
  async update(id, payload) {
    const docRef = doc(this.collectionRef, id);
    await updateDoc(docRef, payload);
  }

  /**
   * Deletes a document.
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async delete(id) {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }

  /**
   * Listens to a query in real-time. Crucial for reactive UI.
   * @param {import('firebase/firestore').QueryConstraint[]} constraints 
   * @param {Function} callback - Called with (data, error)
   * @returns {Function} Unsubscribe function
   */
  listen(constraints = [], callback) {
    const q = query(this.collectionRef, ...constraints);
    return onSnapshot(
      q,
      (snap) => {
        const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(results, null);
      },
      (error) => {
        console.error(`[BaseRepository:${this.collectionName}] Listen failed:`, error);
        callback(null, error);
      }
    );
  }
}
