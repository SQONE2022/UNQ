// Stockline data layer: row-based persistence for products and job orders.
const TABLE_PRODUCTS = 'products';
const TABLE_JOBORDERS = 'joborders';
const TABLE_NEWS = 'news';
const TABLE_OPERATIONS = 'operations';
const STORAGE_SHARED = true;
const LOCAL_DB_NAME = 'stockline-db';
const LOCAL_DB_VERSION = 1;
const LOCAL_STORE = 'rows';

function rowKey(table, id){ return `${table}:${id}`; }

function openLocalDatabase(){
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);
    request.onupgradeneeded = () => {// Stockline data layer: row-based persistence for products and job orders.
const TABLE_PRODUCTS = 'products';
const TABLE_JOBORDERS = 'joborders';
const TABLE_NEWS = 'news';
const TABLE_OPERATIONS = 'operations';
const STORAGE_SHARED = true;
const LOCAL_DB_NAME = 'stockline-db';
const LOCAL_DB_VERSION = 1;
const LOCAL_STORE = 'rows';

function rowKey(table, id){ return `${table}:${id}`; }

function openLocalDatabase(){
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);
    request.onupgradeneeded = () => {
      if(!request.result.objectStoreNames.contains(LOCAL_STORE)){
        request.result.createObjectStore(LOCAL_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function localStorageList(prefix){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readonly').objectStore(LOCAL_STORE).getAllKeys();
    request.onsuccess = () => resolve({keys: request.result.filter(key => key.startsWith(prefix))});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageGet(key){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readonly').objectStore(LOCAL_STORE).get(key);
    request.onsuccess = () => resolve(request.result === undefined ? null : {value: request.result});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageSet(key, value){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readwrite').objectStore(LOCAL_STORE).put(value, key);
    request.onsuccess = () => resolve({value});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageDelete(key){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readwrite').objectStore(LOCAL_STORE).delete(key);
    request.onsuccess = () => resolve({});
    request.onerror = () => reject(request.error);
  });
}

const storage = {
  list: (prefix, shared) => window.storage?.list(prefix, shared) || localStorageList(prefix),
  get: (key, shared) => window.storage?.get(key, shared) || localStorageGet(key),
  set: (key, value, shared) => window.storage?.set(key, value, shared) || localStorageSet(key, value),
  delete: (key, shared) => window.storage?.delete(key, shared) || localStorageDelete(key),
};

function computeNextIds(){
  nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  nextJoId = jobOrders.length ? Math.max(...jobOrders.map(j => j.id)) + 1 : 1;
  const nums = jobOrders
    .map(j => parseInt((j.jobNo || '').split('-')[1], 10))
    .filter(n => !isNaN(n));
  nextJoNum = nums.length ? Math.max(...nums) + 1 : 1;
}

async function loadTable(table){
  let listing;
  try{
    listing = await storage.list(table + ':', STORAGE_SHARED);
  }catch(err){
    return null;
  }
  if(!listing || !listing.keys || !listing.keys.length) return null;
  const rows = await Promise.all(listing.keys.map(async key => {
    try{
      const res = await storage.get(key, STORAGE_SHARED);
      return res && res.value ? JSON.parse(res.value) : null;
    }catch(err){
      console.error(`Failed to read row ${key}:`, err);
      return null;
    }
  }));
  return rows.filter(Boolean);
}

async function saveRow(table, row){
  setSaveIndicator('saving');
  try{
    const result = await storage.set(rowKey(table, row.id), JSON.stringify(row), STORAGE_SHARED);
    if(!result) throw new Error('empty result');
    setSaveIndicator('saved');
  }catch(err){
    console.error(`Failed to save row in ${table}:`, err);
    setSaveIndicator('error');
    showFlash('Could not save — your change is only on this screen for now.', true);
  }
}

async function deleteRow(table, id){
  setSaveIndicator('saving');
  try{
    await storage.delete(rowKey(table, id), STORAGE_SHARED);
    setSaveIndicator('saved');
  }catch(err){
    console.error(`Failed to delete row from ${table}:`, err);
    setSaveIndicator('error');
    showFlash('Could not save the deletion — it may reappear next time you load.', true);
  }
}

async function loadAppData(){
  products = await loadTable(TABLE_PRODUCTS) || [];
  jobOrders = await loadTable(TABLE_JOBORDERS) || [];
  computeNextIds();
}

async function loadNewsData(){
  news = await loadTable(TABLE_NEWS) || [];
  nextNewsId = news.length ? Math.max(...news.map(item => item.id)) + 1 : 1;
}

async function loadOperationsData(){
  const loadedOperations = await loadTable(TABLE_OPERATIONS);
  operations = loadedOperations || [];
  nextOperationId = operations.length ? Math.max(...operations.map(item => item.id)) + 1 : 1;
}
      if(!request.result.objectStoreNames.contains(LOCAL_STORE)){
        request.result.createObjectStore(LOCAL_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function localStorageList(prefix){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readonly').objectStore(LOCAL_STORE).getAllKeys();
    request.onsuccess = () => resolve({keys: request.result.filter(key => key.startsWith(prefix))});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageGet(key){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readonly').objectStore(LOCAL_STORE).get(key);
    request.onsuccess = () => resolve(request.result === undefined ? null : {value: request.result});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageSet(key, value){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readwrite').objectStore(LOCAL_STORE).put(value, key);
    request.onsuccess = () => resolve({value});
    request.onerror = () => reject(request.error);
  });
}

async function localStorageDelete(key){
  const db = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(LOCAL_STORE, 'readwrite').objectStore(LOCAL_STORE).delete(key);
    request.onsuccess = () => resolve({});
    request.onerror = () => reject(request.error);
  });
}

const storage = {
  list: (prefix, shared) => window.storage?.list(prefix, shared) || localStorageList(prefix),
  get: (key, shared) => window.storage?.get(key, shared) || localStorageGet(key),
  set: (key, value, shared) => window.storage?.set(key, value, shared) || localStorageSet(key, value),
  delete: (key, shared) => window.storage?.delete(key, shared) || localStorageDelete(key),
};

const DEFAULT_PRODUCTS = [
  { id: 1, sku: 'TS-BLK-001', name: 'Classic Black Tee', prices: { XS: 499, S: 499, M: 499, L: 499, XL: 499 },
    sizes: { XS: 3, S: 12, M: 20, L: 14, XL: 0 } },
  { id: 2, sku: 'HD-GRY-014', name: 'Heather Grey Hoodie', prices: { XS: 1299, S: 1299, M: 1299, L: 1299, XL: 1299 },
    sizes: { XS: 0, S: 2, M: 9, L: 6, XL: 3 } },
  { id: 3, sku: 'PL-WHT-007', name: 'Everyday Polo — White', prices: { XS: 749, S: 749, M: 749, L: 749, XL: 749 },
    sizes: { XS: 8, S: 15, M: 4, L: 2, XL: 1 } },
];
const DEFAULT_JOBORDERS = [
  { id: 1, jobNo: 'JO-1042', productId: 1, qty: 40, status: 'sewing', due: '2026-09-12' },
  { id: 2, jobNo: 'JO-1043', productId: 2, qty: 15, status: 'printing', due: '2026-09-18' },
  { id: 3, jobNo: 'JO-1041', productId: 3, qty: 25, status: 'done', due: '2026-08-29' },
];
const DEFAULT_NEWS = [];

function computeNextIds(){
  nextId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  nextJoId = jobOrders.length ? Math.max(...jobOrders.map(j => j.id)) + 1 : 1;
  const nums = jobOrders
    .map(j => parseInt((j.jobNo || '').split('-')[1], 10))
    .filter(n => !isNaN(n));
  nextJoNum = nums.length ? Math.max(...nums) + 1 : 1044;
}

async function loadTable(table){
  let listing;
  try{
    listing = await storage.list(table + ':', STORAGE_SHARED);
  }catch(err){
    return null;
  }
  if(!listing || !listing.keys || !listing.keys.length) return null;
  const rows = await Promise.all(listing.keys.map(async key => {
    try{
      const res = await storage.get(key, STORAGE_SHARED);
      return res && res.value ? JSON.parse(res.value) : null;
    }catch(err){
      console.error(`Failed to read row ${key}:`, err);
      return null;
    }
  }));
  return rows.filter(Boolean);
}

async function saveRow(table, row){
  setSaveIndicator('saving');
  try{
    const result = await storage.set(rowKey(table, row.id), JSON.stringify(row), STORAGE_SHARED);
    if(!result) throw new Error('empty result');
    setSaveIndicator('saved');
  }catch(err){
    console.error(`Failed to save row in ${table}:`, err);
    setSaveIndicator('error');
    showFlash('Could not save — your change is only on this screen for now.', true);
  }
}

async function deleteRow(table, id){
  setSaveIndicator('saving');
  try{
    await storage.delete(rowKey(table, id), STORAGE_SHARED);
    setSaveIndicator('saved');
  }catch(err){
    console.error(`Failed to delete row from ${table}:`, err);
    setSaveIndicator('error');
    showFlash('Could not save the deletion — it may reappear next time you load.', true);
  }
}

async function seedTableIfEmpty(table, rows){
  await Promise.all(rows.map(row => saveRow(table, row)));
}

async function loadAppData(){
  let loadedProducts = await loadTable(TABLE_PRODUCTS);
  if(!loadedProducts){
    loadedProducts = DEFAULT_PRODUCTS.map(p => ({...p, sizes: {...p.sizes}}));
    await seedTableIfEmpty(TABLE_PRODUCTS, loadedProducts);
  }
  let loadedJobOrders = await loadTable(TABLE_JOBORDERS);
  if(!loadedJobOrders){
    loadedJobOrders = DEFAULT_JOBORDERS.map(j => ({...j}));
    await seedTableIfEmpty(TABLE_JOBORDERS, loadedJobOrders);
  }
  products = loadedProducts;
  jobOrders = loadedJobOrders;
  computeNextIds();
}

async function loadNewsData(){
  let loadedNews = await loadTable(TABLE_NEWS);
  if(!loadedNews){
    loadedNews = DEFAULT_NEWS.map(item => ({...item}));
    await seedTableIfEmpty(TABLE_NEWS, loadedNews);
  }
  news = loadedNews;
  nextNewsId = news.length ? Math.max(...news.map(item => item.id)) + 1 : 1;
}

async function loadOperationsData(){
  const loadedOperations = await loadTable(TABLE_OPERATIONS);
  operations = loadedOperations || [];
  nextOperationId = operations.length ? Math.max(...operations.map(item => item.id)) + 1 : 1;
}
