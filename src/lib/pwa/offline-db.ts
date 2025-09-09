// IndexedDB wrapper for offline data management
export interface OfflineData {
  key: string;
  value: any;
  church_id: string;
  timestamp: number;
  expires?: number;
}

export interface AlunoProgress {
  id?: number;
  user_id: string;
  curso_id: string;
  licao_id: string;
  progress_percent: number;
  completed_at?: string;
  timestamp: number;
  synced: boolean;
  church_id: string;
}

export class OfflineDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'kerigma-offline';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para dados offline gerais
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'key' });
          store.createIndex('church_id', 'church_id');
          store.createIndex('timestamp', 'timestamp');
        }

        // Store para progresso do aluno
        if (!db.objectStoreNames.contains('aluno_progress')) {
          const store = db.createObjectStore('aluno_progress', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('user_id', 'user_id');
          store.createIndex('curso_id', 'curso_id');
          store.createIndex('synced', 'synced');
          store.createIndex('church_id', 'church_id');
          store.createIndex('timestamp', 'timestamp');
        }

        // Store para cursos offline
        if (!db.objectStoreNames.contains('courses_cache')) {
          const store = db.createObjectStore('courses_cache', { keyPath: 'id' });
          store.createIndex('church_id', 'church_id');
          store.createIndex('cached_at', 'cached_at');
        }

        // Store para agenda offline
        if (!db.objectStoreNames.contains('agenda_cache')) {
          const store = db.createObjectStore('agenda_cache', { keyPath: 'id' });
          store.createIndex('user_id', 'user_id');
          store.createIndex('church_id', 'church_id');
          store.createIndex('date', 'date');
        }
      };
    });
  }

  // Dados offline gerais
  async setOfflineData(key: string, value: any, churchId: string, expiresIn?: number): Promise<void> {
    const data: OfflineData = {
      key,
      value,
      church_id: churchId,
      timestamp: Date.now(),
      expires: expiresIn ? Date.now() + expiresIn : undefined
    };

    return this.put('offline_data', data);
  }

  async getOfflineData(key: string, churchId: string): Promise<any> {
    const data = await this.get('offline_data', key) as OfflineData;
    
    if (!data || data.church_id !== churchId) {
      return null;
    }

    // Verificar expiração
    if (data.expires && Date.now() > data.expires) {
      await this.delete('offline_data', key);
      return null;
    }

    return data.value;
  }

  // Progresso do aluno
  async saveAlunoProgress(progress: Omit<AlunoProgress, 'id'>): Promise<void> {
    const data: AlunoProgress = {
      ...progress,
      timestamp: Date.now(),
      synced: false
    };

    return this.put('aluno_progress', data);
  }

  async getPendingAlunoProgress(churchId: string): Promise<AlunoProgress[]> {
    return this.getAllByIndex('aluno_progress', 'synced', false).then(
      results => results.filter(item => item.church_id === churchId)
    );
  }

  async markProgressAsSynced(id: number): Promise<void> {
    const progress = await this.get('aluno_progress', id) as AlunoProgress;
    if (progress) {
      progress.synced = true;
      await this.put('aluno_progress', progress);
    }
  }

  async getAlunoProgressByUser(userId: string, churchId: string): Promise<AlunoProgress[]> {
    const allProgress = await this.getAllByIndex('aluno_progress', 'user_id', userId);
    return allProgress.filter(p => p.church_id === churchId);
  }

  // Cache de cursos
  async cacheCourses(courses: any[], churchId: string): Promise<void> {
    const promises = courses.map(course => {
      const cachedCourse = {
        ...course,
        church_id: churchId,
        cached_at: Date.now()
      };
      return this.put('courses_cache', cachedCourse);
    });

    await Promise.all(promises);
  }

  async getCachedCourses(churchId: string): Promise<any[]> {
    const allCourses = await this.getAll('courses_cache');
    return allCourses.filter(course => course.church_id === churchId);
  }

  // Cache de agenda
  async cacheAgenda(agendaItems: any[], userId: string, churchId: string): Promise<void> {
    const promises = agendaItems.map(item => {
      const cachedItem = {
        ...item,
        user_id: userId,
        church_id: churchId,
        cached_at: Date.now()
      };
      return this.put('agenda_cache', cachedItem);
    });

    await Promise.all(promises);
  }

  async getCachedAgenda(userId: string, churchId: string): Promise<any[]> {
    const allItems = await this.getAllByIndex('agenda_cache', 'user_id', userId);
    return allItems.filter(item => item.church_id === churchId);
  }

  // Limpeza por igreja
  async clearChurchData(churchId: string): Promise<void> {
    const stores = ['offline_data', 'aluno_progress', 'courses_cache', 'agenda_cache'];
    
    const promises = stores.map(storeName => 
      this.clearByChurchId(storeName, churchId)
    );

    await Promise.all(promises);
  }

  private async clearByChurchId(storeName: string, churchId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('church_id');
      const request = index.openCursor(IDBKeyRange.only(churchId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Métodos auxiliares genéricos
  private async put(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async get(storeName: string, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllByIndex(storeName: string, indexName: string, value: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const offlineDB = new OfflineDB();