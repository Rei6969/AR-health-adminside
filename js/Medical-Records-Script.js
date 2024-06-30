import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAHMdNm9q6RENL7Bbk2dsqcAzClHVVB70",
  authDomain: "ar-health-55bdf.firebaseapp.com",
  databaseURL:
    "https://ar-health-55bdf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ar-health-55bdf",
  storageBucket: "ar-health-55bdf.appspot.com",
  messagingSenderId: "299653685010",
  appId: "1:299653685010:web:0234781762639516ea1dcb",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase();
const storage = getStorage(firebaseApp);

document.addEventListener("DOMContentLoaded", () => {
  const medicalRecordsContainer = document.querySelector(
    ".medical-records-container"
  );

  displayMedicalRecords();

  function displayMedicalRecords() {
    const tBody = medicalRecordsContainer.querySelector(
      ".medical-records-tbody"
    );
    tBody.innerHTML = "";

    const MDRef = ref(database, "medical-records");

    get(MDRef).then((snapshot) => {
      if (snapshot.exists()) {
        const MDData = snapshot.val();

        for (const userID in MDData) {
          const data = MDData[userID];

          const tRow = document.createElement("tr");

          const tdName = document.createElement("td");
          tdName.textContent = `${data.name}`;

          const tdDate = document.createElement("td");
          tdDate.textContent = `${data.dateSubmitted}`;

          const tdActions = document.createElement("td");

          const btnDownload = document.createElement("button");
          btnDownload.classList.add("btn-download");
          btnDownload.textContent = "Open PDF";

          const btnDelete = document.createElement("button");
          btnDelete.classList.add("btn-delete");
          btnDelete.textContent = "Delete";

          tdActions.appendChild(btnDownload);
          tdActions.appendChild(btnDelete);

          tRow.appendChild(tdName);
          tRow.appendChild(tdDate);
          tRow.appendChild(tdActions);

          tBody.appendChild(tRow);

          btnDownload.addEventListener("click", async () => {
            const fileName = `Medical-Record-${data.name}`;

            try {
              const link = document.createElement("a");
              link.href = data.fileUrl;
              link.download = fileName;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              try {
                const response = await fetch(data.fileUrl);
                if (!response.ok)
                  throw new Error("Network response was not ok");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = fileName;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(url);
              } catch (fetchError) {
                console.error("Fetch and download failed:", fetchError);
                alert("Failed to download the file.");
              }
            }
          });

          btnDelete.addEventListener("click", async () => {
            const confirmDelete = confirm(
              "Are you sure you want to delete this record?"
            );
            if (!confirmDelete) return;

            try {
              const fileStorageRef = storageRef(
                storage,
                `medical-records/${userID}/Medical-Record.pdf`
              );
              await deleteObject(fileStorageRef);

              const userRef = ref(database, `medical-records/${userID}`);
              await remove(userRef);

              tBody.removeChild(tRow);

              alert("Record has been deleted.");
            } catch (error) {
              console.error("Error deleting record:", error);
              alert("Failed to delete the record.");
            }
          });
        }
      }
    });
  }
});
