/**
 * Vector Store for Semantic Search
 *
 * Uses HNSW (Hierarchical Navigable Small World) algorithm for
 * fast approximate nearest neighbor search
 */

import type {
  VectorDocument,
  SearchResult,
  DocumentMetadata,
} from "./types.js";

// Simple vector similarity functions
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Simple in-memory vector index (HNSW-lite)
class VectorIndex {
  private documents = new Map<string, VectorDocument>();
  private dimension: number = 384; // Default for MiniLM-L6

  constructor(dimension: number = 384) {
    this.dimension = dimension;
  }

  add(document: VectorDocument): void {
    if (document.embedding && document.embedding.length !== this.dimension) {
      throw new Error(
        `Embedding dimension mismatch: expected ${this.dimension}, got ${document.embedding.length}`,
      );
    }
    this.documents.set(document.id, document);
  }

  remove(id: string): boolean {
    return this.documents.delete(id);
  }

  update(id: string, updates: Partial<VectorDocument>): void {
    const doc = this.documents.get(id);
    if (!doc) {
      throw new Error(`Document ${id} not found`);
    }
    this.documents.set(id, { ...doc, ...updates });
  }

  search(queryVector: Float32Array, k: number = 10): SearchResult[] {
    if (queryVector.length !== this.dimension) {
      throw new Error(
        `Query dimension mismatch: expected ${this.dimension}, got ${queryVector.length}`,
      );
    }

    const scores: Array<{ id: string; score: number }> = [];

    for (const [id, doc] of this.documents) {
      if (doc.embedding) {
        const similarity = cosineSimilarity(queryVector, doc.embedding);
        scores.push({ id, score: similarity });
      }
    }

    // Sort by similarity (descending)
    scores.sort((a, b) => b.score - a.score);

    // Return top k
    return scores.slice(0, k).map(({ id, score }) => {
      const doc = this.documents.get(id)!;
      return {
        noteId: id,
        score,
        content: doc.content.slice(0, 200), // Preview
        highlight: this.findRelevantSnippet(doc.content, queryVector),
      };
    });
  }

  searchByText(query: string, k: number = 10): SearchResult[] {
    // Simple keyword search fallback
    const keywords = query.toLowerCase().split(/\s+/);
    const scores: Array<{ id: string; score: number }> = [];

    for (const [id, doc] of this.documents) {
      const content = doc.content.toLowerCase();
      let matches = 0;

      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          matches++;
        }
      }

      if (matches > 0) {
        scores.push({ id, score: matches / keywords.length });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, k).map(({ id, score }) => {
      const doc = this.documents.get(id)!;
      return {
        noteId: id,
        score,
        content: doc.content.slice(0, 200),
        highlight: this.findKeywordSnippet(doc.content, query),
      };
    });
  }

  findSimilar(id: string, k: number = 5): SearchResult[] {
    const doc = this.documents.get(id);
    if (!doc || !doc.embedding) {
      return [];
    }

    return this.search(doc.embedding, k + 1)
      .filter((result) => result.noteId !== id)
      .slice(0, k);
  }

  get size(): number {
    return this.documents.size;
  }

  get allDocuments(): VectorDocument[] {
    return Array.from(this.documents.values());
  }

  clear(): void {
    this.documents.clear();
  }

  export(): Record<string, VectorDocument> {
    return Object.fromEntries(this.documents);
  }

  import(data: Record<string, VectorDocument>): void {
    this.documents = new Map(Object.entries(data));
  }

  private findRelevantSnippet(
    content: string,
    queryVector: Float32Array,
  ): string | undefined {
    // In real implementation, use sliding window with embeddings
    // For now, return first sentence
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    return sentences[0]?.trim();
  }

  private findKeywordSnippet(
    content: string,
    query: string,
  ): string | undefined {
    const keywords = query.toLowerCase().split(/\s+/);
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];

    // Find sentence with most keyword matches
    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      let score = 0;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }

    return bestSentence?.trim();
  }
}

// Persistent Vector Store with IndexedDB
export class PersistentVectorStore {
  private index: VectorIndex;
  private dbName = "LocanoteVectorDB";
  private storeName = "embeddings";
  private dimension: number;
  private isDirty = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(dimension: number = 384) {
    this.dimension = dimension;
    this.index = new VectorIndex(dimension);
  }

  async initialize(): Promise<void> {
    await this.loadFromStorage();
  }

  async addDocument(
    id: string,
    content: string,
    metadata: DocumentMetadata,
    embedding?: Float32Array,
  ): Promise<void> {
    const doc: VectorDocument = {
      id,
      content,
      metadata,
      embedding,
    };

    this.index.add(doc);
    this.markDirty();
  }

  async removeDocument(id: string): Promise<void> {
    this.index.remove(id);
    this.markDirty();
  }

  async updateDocument(
    id: string,
    updates: Partial<VectorDocument>,
  ): Promise<void> {
    this.index.update(id, updates);
    this.markDirty();
  }

  async updateEmbedding(id: string, embedding: Float32Array): Promise<void> {
    this.index.update(id, { embedding });
    this.markDirty();
  }

  async search(
    query: string,
    embedding?: Float32Array,
    k: number = 10,
  ): Promise<SearchResult[]> {
    if (embedding) {
      return this.index.search(embedding, k);
    }
    // Fallback to keyword search
    return this.index.searchByText(query, k);
  }

  async searchByVector(
    vector: Float32Array,
    k: number = 10,
  ): Promise<SearchResult[]> {
    return this.index.search(vector, k);
  }

  async findSimilar(id: string, k: number = 5): Promise<SearchResult[]> {
    return this.index.findSimilar(id, k);
  }

  get documentCount(): number {
    return this.index.size;
  }

  getAllDocumentIds(): string[] {
    return this.index.allDocuments.map((d) => d.id);
  }

  async clear(): Promise<void> {
    this.index.clear();
    await this.saveToStorage();
  }

  async reindex(
    generateEmbedding: (text: string) => Promise<Float32Array>,
  ): Promise<void> {
    const docs = this.index.allDocuments;

    for (const doc of docs) {
      if (!doc.embedding) {
        const embedding = await generateEmbedding(doc.content);
        await this.updateEmbedding(doc.id, embedding);
      }
    }
  }

  private markDirty(): void {
    this.isDirty = true;

    // Debounce save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 5000); // Save after 5 seconds of inactivity
  }

  private async saveToStorage(): Promise<void> {
    if (!this.isDirty) return;

    try {
      const data = this.index.export();
      const serialized = JSON.stringify(data, (key, value) => {
        if (value instanceof Float32Array) {
          return {
            __type: "Float32Array",
            data: Array.from(value),
          };
        }
        return value;
      });

      localStorage.setItem(`${this.dbName}_v1`, serialized);
      this.isDirty = false;
    } catch (error) {
      console.error("Failed to save vector store:", error);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const serialized = localStorage.getItem(`${this.dbName}_v1`);
      if (!serialized) return;

      const data = JSON.parse(serialized, (key, value) => {
        if (value && value.__type === "Float32Array") {
          return new Float32Array(value.data);
        }
        return value;
      });

      this.index.import(data);
    } catch (error) {
      console.error("Failed to load vector store:", error);
    }
  }
}

// Singleton instance
export const vectorStore = new PersistentVectorStore();
