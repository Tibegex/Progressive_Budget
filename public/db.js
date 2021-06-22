let db;

const request = window.indexedDB.open("Budget", 1);

request.onupgradeneeded = ({ target }) => {
  db = target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("budget", { autoIncrement: true });
  }
};
request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

request.onsuccess = (event) => {
  dp = request.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

function checkDatabase() {
  let transaction = db.transaction(["budget"], "readwrite");

  const store = transaction.objectStore("budget");

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["budget"], "readwrite");

            const currentStore = transaction.objectStore("budget");

            currentStore.clear();
          }
        });
    }
  };
}

const saveRecord = (record) => {
  const transaction = db.transaction(["budget"], "readwrite");

  const store = transaction.objectStore("budget");

  store.add(record);
};

window.addEventListener("online", checkDatabase);
