const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const DB_NAME = "TuneMix";
const DB_VERSION = 1;

let db;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = event => {
            console.error("IndexedDB error:", event.target.errorCode);
            reject(event.target.error);
        };

        request.onupgradeneeded = event => {
            const db = event.target.result;

            // Create 'songs' store (individual song metadata)
            if (!db.objectStoreNames.contains("songs")) {
                const songStore = db.createObjectStore("songs", { keyPath: "id" });
                songStore.createIndex("title", "title", { unique: false });
                songStore.createIndex("artist", "artist", { unique: false });
                songStore.createIndex("album", "album", { unique: false });
                songStore.createIndex("year", "year", { unique: false });
                songStore.createIndex("genre", "genre", { unique: false });
                songStore.createIndex("duration", "duration", { unique: false });
                songStore.createIndex("path", "path", { unique: false });
                songStore.createIndex("cover", "cover", { unique: false });
            }

            // Create 'playlists' store
            if (!db.objectStoreNames.contains("playlists")) {
                const playlistStore = db.createObjectStore("playlists", { keyPath: "id" });
                playlistStore.createIndex("name", "name", { unique: true });
            }
        };

        request.onsuccess = event => {
            db = event.target.result;
            console.log("Database initialized successfully.");
            resolve(db);
        };
    });
};

// Helper functions for database operations (songs)
const addSong = (song) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readwrite");
        const store = transaction.objectStore("songs");
        const request = store.add(song);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getSong = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readonly");
        const store = transaction.objectStore("songs");
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const updateSong = (song) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readwrite");
        const store = transaction.objectStore("songs");
        const request = store.put(song);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const deleteSong = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readwrite");
        const store = transaction.objectStore("songs");
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getAllSongs = () => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("songs", "readonly");
        const store = transaction.objectStore("songs");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Helper functions for database operations (playlists)
const addPlaylist = (playlist) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.add(playlist);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error("Error adding playlist:", request.error);
            reject(request.error);
        };
    });
};

const getPlaylist = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("playlists", "readonly");
        const store = transaction.objectStore("playlists");
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const updatePlaylist = (playlist) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.put(playlist);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const deletePlaylist = (id) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("playlists", "readwrite");
        const store = transaction.objectStore("playlists");
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getAllPlaylists = () => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("playlists", "readonly");
        const store = transaction.objectStore("playlists");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

initDB().then(() => {
    console.log("TuneMix database ready.");
}).catch(error => {
    console.error("Failed to initialize TuneMix database:", error);
});