export interface Memory {
  id: string;
  text: string;
  embedding: number[];
  timestamp: number;
}

const DB_NAME = 'NovaVectorDB';
const STORE_NAME = 'memories';

// Open the IndexedDB database
async function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available in SSR');
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save a single memory
export async function saveMemory(memory: Memory): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(memory);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Retrieve all memories
export async function getAllMemories(): Promise<Memory[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    // If SSR or error, return empty
    return [];
  }
}

// Cosine Similarity Math
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Find top K most similar memories
export async function retrieveRelevantMemories(queryEmbedding: number[], topK: number = 3): Promise<Memory[]> {
  const memories = await getAllMemories();
  
  if (memories.length === 0) return [];

  // Calculate similarity for each memory
  const scoredMemories = memories.map(mem => ({
    memory: mem,
    score: cosineSimilarity(queryEmbedding, mem.embedding)
  }));

  // Sort descending by score
  scoredMemories.sort((a, b) => b.score - a.score);

  // Return top K
  // We can optionally filter by a threshold here, e.g. score > 0.7, but for now we just return topK.
  return scoredMemories.slice(0, topK).map(sm => sm.memory);
}
