// Service Worker para cache offline - Kerigma Hub PWA
const CACHE_NAME = 'kerigma-hub-v2';
const STATIC_CACHE_NAME = 'kerigma-static-v2';
const DYNAMIC_CACHE_NAME = 'kerigma-dynamic-v2';
const IMAGES_CACHE_NAME = 'kerigma-images-v1';
const ALUNO_CACHE_NAME = 'kerigma-aluno-v1';

// App Shell - recursos críticos
const STATIC_ASSETS = [
  '/',
  '/aluno',
  '/dashboard',
  '/comunidade',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.ico'
];

// APIs para cache dinâmico
const DYNAMIC_CACHE_URLS = [
  '/api/',
  'https://vsanvmekqtfkbgmrjwoo.supabase.co/'
];

// Portal do Aluno - dados para cache persistente
const ALUNO_CACHE_URLS = [
  '/api/aluno/',
  '/supabase/rest/v1/cursos',
  '/supabase/rest/v1/progresso_aluno',
  '/supabase/rest/v1/matriculas'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static assets...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Interceptar requisições com estratégias específicas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // NavigationRoute -> App Shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/') || caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Cache First para recursos estáticos
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Cache First para imagens (30 dias)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(IMAGES_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network First com timeout para Portal do Aluno
  if (ALUNO_CACHE_URLS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ])
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(ALUNO_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Network First para outras APIs do Supabase
  if (DYNAMIC_CACHE_URLS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request) || caches.match('/offline.html');
        })
    );
    return;
  }
  
  // Stale While Revalidate para outros recursos
  event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
      
      return response || fetchPromise;
    })
  );
});

// Background Sync para fila submit-queue
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'submit-queue') {
    event.waitUntil(syncSubmitQueue());
  }
  
  if (event.tag === 'aluno-progress') {
    event.waitUntil(syncAlunoProgress());
  }
});

// Função para sincronizar fila de submissões
async function syncSubmitQueue() {
  try {
    const cache = await caches.open('submit-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
          console.log('✅ Sincronizado:', request.url);
        }
      } catch (error) {
        console.log('❌ Falha na sincronização:', request.url, error);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização da fila:', error);
  }
}

// Função para sincronizar progresso do aluno
async function syncAlunoProgress() {
  try {
    const db = await openIndexedDB();
    const pendingProgress = await getAllPendingProgress(db);
    
    for (const progress of pendingProgress) {
      try {
        const response = await fetch('/api/aluno/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        });
        
        if (response.ok) {
          await deletePendingProgress(db, progress.id);
        }
      } catch (error) {
        console.log('❌ Falha ao sincronizar progresso:', error);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização do progresso:', error);
  }
}

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.id
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver mais',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/favicon.ico'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// IndexedDB helpers para sincronização
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kerigma-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store para progresso do aluno
      if (!db.objectStoreNames.contains('aluno_progress')) {
        const store = db.createObjectStore('aluno_progress', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('synced', 'synced');
      }
      
      // Store para dados offline
      if (!db.objectStoreNames.contains('offline_data')) {
        const store = db.createObjectStore('offline_data', { keyPath: 'key' });
        store.createIndex('church_id', 'church_id');
      }
    };
  });
}

function getAllPendingProgress(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['aluno_progress'], 'readonly');
    const store = transaction.objectStore('aluno_progress');
    const index = store.index('synced');
    const request = index.getAll(false);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingProgress(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['aluno_progress'], 'readwrite');
    const store = transaction.objectStore('aluno_progress');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Limpeza de cache antigo
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});