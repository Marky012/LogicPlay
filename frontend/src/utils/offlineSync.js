import { openDB } from 'idb';

const DB_NAME = 'logicplay_db';
const STORE_NAME = 'circuits_offline';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('sync_queue')) {
                db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const saveCircuitOffline = async (circuitData) => {
    const db = await initDB();
    return db.add(STORE_NAME, {
        ...circuitData,
        saved_at: new Date().toISOString()
    });
};

export const getOfflineCircuits = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const addToSyncQueue = async (request) => {
    const db = await initDB();
    return db.add('sync_queue', request);
};

export const getSyncQueue = async () => {
    const db = await initDB();
    return db.getAll('sync_queue');
};

export const removeFromSyncQueue = async (id) => {
    const db = await initDB();
    return db.delete('sync_queue', id);
};
