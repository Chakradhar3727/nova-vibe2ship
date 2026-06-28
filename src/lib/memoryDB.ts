// Local Vector Database for Permanent Episodic Memory

export interface MemoryRecord {
  id: string;
  text: string;
  embedding: number[];
  timestamp: number;
}

const DB_NAME = 'NovaMemoryDB';
const STORE_NAME = 'memories';
const DB_VERSION = 1;

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('IndexedDB not available on server'));
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store a new memory vector
export async function saveMemory(text: string, embedding: number[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record: MemoryRecord = {
      id: Date.now().toString(),
      text,
      embedding,
      timestamp: Date.now()
    };
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Retrieve mathematically similar memories
export async function searchMemories(queryEmbedding: number[], limit: number = 3, threshold: number = 0.65): Promise<MemoryRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const allMemories = request.result as MemoryRecord[];
      
      // Calculate cosine similarity for all stored vectors
      const scoredMemories = allMemories.map(memory => {
        const score = cosineSimilarity(queryEmbedding, memory.embedding);
        return { ...memory, score };
      });
      
      // Filter by threshold and sort by highest similarity
      const topMemories = scoredMemories
        .filter(m => m.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
      resolve(topMemories);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Math logic for vector similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
