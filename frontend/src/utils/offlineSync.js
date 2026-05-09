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
            if (!db.objectStoreNames.contains('user_profile')) {
                db.createObjectStore('user_profile', { keyPath: 'username' });
            }
        },
    });
};

export const saveUserProfile = async (profile) => {
    const db = await initDB();
    return db.put('user_profile', profile);
};

export const getCachedUser = async (username) => {
    const db = await initDB();
    return db.get('user_profile', username);
};

export const saveCircuitOffline = async (circuitData) => {
    const db = await initDB();
    return db.add(STORE_NAME, {
        ...circuitData,
        is_offline_only: true, // Marker for UI
        saved_at: new Date().toISOString()
    });
};

export const getOfflineCircuits = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const deleteOfflineCircuit = async (id) => {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
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
