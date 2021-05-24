const router = require("router")
const { response } = require("express");

let db
const request = indexDB.open("budget", 1);

request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (e) {
    db = e.target.result;
    if (navigator.onLine){
        checkData();
    }
}

request.onerror = function (e) {
    console.log("bad" + e.target.errorCode);
}

function checkData() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.createObjectStore("pending")
    const getThing = store.getThing();
    getThing.onsuccess = function () {
        if (getThing.result > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getThing.results),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                }
            })
            .then((response) => response.json())
            .then(() => {
                console.log(response.json)
                const transaction = db.transaction(["pending"], "readwrite")
                const store = transaction.objectStore("pending");
                store.clear();
            })
        }
    }
}

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.createObjectStore("pending");
    store.add(record);
}

window.addEventListener("online", checkData);

