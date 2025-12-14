'use client';

import { useEffect, useState, useCallback } from 'react';

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

const DB_NAME = 'fuel-tracker-offline';
const STORE_NAME = 'actions';
const DB_VERSION = 1;
const MAX_RETRIES = 3;

class OfflineQueue {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async addAction(type: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    const action: QueuedAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(action);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getActions(): Promise<QueuedAction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async removeAction(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateAction(action: QueuedAction): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(action);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instance
const offlineQueue = new OfflineQueue();

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check online status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update queue size
  const updateQueueSize = useCallback(async () => {
    try {
      const actions = await offlineQueue.getActions();
      setQueueSize(actions.length);
    } catch (error) {
      console.error('Failed to get queue size:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    offlineQueue.init().then(updateQueueSize);
  }, [updateQueueSize]);

  // Queue an action
  const queueAction = useCallback(
    async (type: string, data: any) => {
      try {
        await offlineQueue.addAction(type, data);
        await updateQueueSize();
      } catch (error) {
        console.error('Failed to queue action:', error);
        throw error;
      }
    },
    [updateQueueSize]
  );

  // Process queue
  const processQueue = useCallback(
    async (executor: (action: QueuedAction) => Promise<void>) => {
      if (isSyncing) return;

      setIsSyncing(true);
      try {
        const actions = await offlineQueue.getActions();

        for (const action of actions) {
          try {
            // Execute the action
            await executor(action);

            // Remove from queue on success
            await offlineQueue.removeAction(action.id);
          } catch (error) {
            console.error('Failed to process action:', error);

            // Increment retry count
            action.retries++;

            if (action.retries >= MAX_RETRIES) {
              // Remove if max retries reached
              await offlineQueue.removeAction(action.id);
              console.error('Max retries reached, removing action:', action);
            } else {
              // Update retry count
              await offlineQueue.updateAction(action);
            }
          }
        }

        await updateQueueSize();
      } finally {
        setIsSyncing(false);
      }
    },
    [isSyncing, updateQueueSize]
  );

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queueSize > 0 && !isSyncing) {
      // Notify user that sync is about to happen
      console.log('Online detected, syncing queued actions...');
    }
  }, [isOnline, queueSize, isSyncing]);

  // Clear queue
  const clearQueue = useCallback(async () => {
    try {
      await offlineQueue.clear();
      await updateQueueSize();
    } catch (error) {
      console.error('Failed to clear queue:', error);
      throw error;
    }
  }, [updateQueueSize]);

  return {
    isOnline,
    queueSize,
    isSyncing,
    queueAction,
    processQueue,
    clearQueue,
  };
}
