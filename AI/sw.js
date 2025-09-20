// Service Worker for 穗安巡视官 - 智慧农业AI一体系统
const CACHE_NAME = 'sui-an-inspector-v1.0.0';
const STATIC_CACHE = 'sui-an-static-v1.0.0';
const DYNAMIC_CACHE = 'sui-an-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/voice.js',
  '/js/upload.js',
  '/js/cases.js',
  '/js/background.js',
  '/js/api.js',
  '/js/main.js',
  '/manifest.json',
  '/pic/background.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2'
];

// 需要缓存的动态资源
const DYNAMIC_ASSETS = [
  '/icons/',
  '/screenshots/'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('缓存静态资源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('静态资源缓存完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('缓存静态资源失败:', error);
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 激活完成');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过Chrome扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 处理静态资源
  if (STATIC_ASSETS.includes(url.pathname) || STATIC_ASSETS.includes(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
    );
    return;
  }

  // 处理动态资源（图片等）
  if (request.destination === 'image' || url.pathname.startsWith('/pic/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            })
            .catch(() => {
              // 如果网络请求失败，返回默认图片
              if (request.destination === 'image') {
                return caches.match('/icons/icon-192x192.png');
              }
            });
        })
    );
    return;
  }

  // 处理API请求（不缓存）
  if (url.pathname.includes('/api/') || url.hostname.includes('api.openai.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // 其他请求使用网络优先策略
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('收到推送通知:', event);
  
  const options = {
    body: event.data ? event.data.text() : '穗安巡视官有新消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('穗安巡视官', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 后台同步事件
self.addEventListener('sync', (event) => {
  console.log('后台同步:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 后台同步任务
async function doBackgroundSync() {
  try {
    // 这里可以执行一些后台任务
    console.log('执行后台同步任务...');
  } catch (error) {
    console.error('后台同步失败:', error);
  }
}

// 消息事件
self.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 