
async function getAllIndexedDBData() {
    if (!indexedDB.databases) return {};
    let dbList = [];
    try {
        dbList = await indexedDB.databases();
    } catch (e) {
        return {};
    }
    const result = {};
    for (const dbInfo of dbList) {
        if (!dbInfo.name) continue;
        result[dbInfo.name] = await getDataFromDatabase(dbInfo.name);
    }
    return result;
}
function getDataFromDatabase(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        (request.onsuccess = e => {
            const db = e.target.result,
                storeNames = Array.from(db.objectStoreNames),
                dbData = {},
                pendingCount = storeNames.length;
            if (!pendingCount) {
                db.close(), resolve(dbData);
                return;
            }
            let pending = pendingCount;
            storeNames.forEach(storeName => {
                const transaction = db.transaction(storeName, "readonly"),
                    store = transaction.objectStore(storeName),
                    items = [],
                    cursorRequest = store.openCursor();
                (cursorRequest.onsuccess = evt => {
                    const cursor = evt.target.result;
                    if (cursor)
                        items.push({ key: cursor.key, value: cursor.value }),
                            cursor.continue();
                    else {
                        (dbData[storeName] = items),
                            pending--,
                            !pending && (db.close(), resolve(dbData));
                    }
                }),
                    (cursorRequest.onerror = () => {
                        pending--, !pending && (db.close(), resolve(dbData));
                    });
            });
        }),
            (request.onerror = e => {
                reject(e.target.error);
            });
    });
}
async function setAllIndexedDBData(indexedData) {
    for (const dbName in indexedData) {
        const storesData = indexedData[dbName];
        await new Promise(resolve => {
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            (deleteRequest.onsuccess = () => resolve()),
                (deleteRequest.onerror = () => resolve()),
                (deleteRequest.onblocked = () => resolve());
        });
        const openRequest = indexedDB.open(dbName, 1);
        openRequest.onupgradeneeded = function (e) {
            const db = e.target.result;
            for (const storeName in storesData)
                db.objectStoreNames.contains(storeName) ||
                    db.createObjectStore(storeName, { autoIncrement: false });
        };
        const dbInstance = await new Promise((resolve, reject) => {
            (openRequest.onsuccess = e => {
                resolve(e.target.result);
            }),
                (openRequest.onerror = e => {
                    reject(e.target.error);
                });
        });
        for (const storeName in storesData)
            await new Promise(resolve => {
                const transaction = dbInstance.transaction(storeName, "readwrite");
                (transaction.oncomplete = () => resolve()),
                    (transaction.onerror = () => resolve());
                const store = transaction.objectStore(storeName),
                    clearRequest = store.clear();
                clearRequest.onsuccess = async () => {
                    for (const record of storesData[storeName])
                        await new Promise(r => {
                            const putRequest = store.put(record.value, record.key);
                            (putRequest.onsuccess = () => r()),
                                (putRequest.onerror = () => r());
                        });
                };
            });
        dbInstance.close();
    }
}