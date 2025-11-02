document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("autoSaveModal")) {
        const modal = document.createElement("div");
        (modal.id = "autoSaveModal"),
            (modal.style.cssText =
                "display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); align-items:center; justify-content:center; z-index:3000;"),
            (modal.innerHTML = `
<div style="background:#333; padding:20px; border-radius:5px; text-align:center; color:#fff; max-width:90%;">
    <p>Would you like to load your auto-save?<br>If not now, you'll have to enable it manually later.</p>
    <button id="autoSaveYes" style="margin-right:10px; padding:10px 20px; background:orange; border:none; border-radius:5px;cursor:pointer;">Yes</button>
    <button id="autoSaveNo" style="padding:10px 20px; background:gray; border:none; border-radius:5px;cursor:pointer;">No</button>
</div>
`),
            document.body.appendChild(modal);
    }
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + 24 * 60 * 60 * 1e3 * days),
            (document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`);
    }
    function getCookie(name) {
        const all = `; ${document.cookie}`,
            parts = all.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";")[0];
        return "";
    }
    function getAllLocalStorageData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            data[k] = localStorage.getItem(k);
        }
        return data;
    }
    function setAllLocalStorageData(obj) {
        localStorage.clear();
        for (const k in obj) localStorage.setItem(k, obj[k]);
    }
    function autoSaveData() {
        if (!window.currentUserId) return;
        const localData = getAllLocalStorageData();
        getAllIndexedDBData()
            .then(indexedData => {
                const docRef = window.db
                    .collection("users")
                    .doc(window.currentUserId)
                    .collection("saves")
                    .doc("slot3");
                docRef
                    .set({
                        title: "Auto Save",
                        description: "Auto-saved on " + new Date().toLocaleString(),
                        localStorageData: localData,
                        indexedDBBackup: indexedData,
                    })
                    .catch(err => {});
            })
            .catch(err => {});
    }
    function loadAutoSave() {
        if (!window.currentUserId) return;
        const docRef = window.db
            .collection("users")
            .doc(window.currentUserId)
            .collection("saves")
            .doc("slot3");
        docRef.get().then(docSnap => {
            if (docSnap.exists && docSnap.data().localStorageData) {
                setAllLocalStorageData(docSnap.data().localStorageData);
                if (docSnap.data().indexedDBBackup) {
                    setAllIndexedDBData(docSnap.data().indexedDBBackup)
                        .then(() => alert("Auto-save loaded!"))
                        .catch(err => {
                            alert("Error loading auto-save IndexedDB data!");
                        });
                } else alert("Auto-save loaded!");
            } else alert("No auto-save data found in Firestore.");
        });
    }
    function showAutoSaveModal() {
        document.getElementById("autoSaveModal").style.display = "flex";
    }
    function hideAutoSaveModal() {
        document.getElementById("autoSaveModal").style.display = "none";
    }
    const yesBtn = document.getElementById("autoSaveYes"),
        noBtn = document.getElementById("autoSaveNo");
    yesBtn?.addEventListener("click", () => {
        hideAutoSaveModal(), setCookie("autoSaveEnabled", "true", 9999), loadAutoSave();
    });
    noBtn?.addEventListener("click", () => {
        hideAutoSaveModal(), setCookie("autoSaveEnabled", "false", 9999);
    });
    window.auth.onAuthStateChanged(async user => {
        if (user) {
            window.currentUserId = user.uid;
            const autoEnabled = getCookie("autoSaveEnabled");
            if (!autoEnabled) {
                const docRef = window.db
                        .collection("users")
                        .doc(user.uid)
                        .collection("saves")
                        .doc("slot3"),
                    docSnap = await docRef.get();
                if (docSnap.exists && docSnap.data().localStorageData)
                    showAutoSaveModal();
                else {
                    setCookie("autoSaveEnabled", "true", 9999);
                    if (!getCookie("autoSaveDone")) {
                        autoSaveData(), setCookie("autoSaveDone", "true", 1);
                    }
                }
            } else if (autoEnabled === "true" && !getCookie("autoSaveDone")) {
                autoSaveData(), setCookie("autoSaveDone", "true", 1);
            }
        }
    });
});