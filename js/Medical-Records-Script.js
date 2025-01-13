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
  getDownloadURL,
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

const medicalRecordsContainer = document.querySelector(
  ".medical-records-container"
);
const searchName = medicalRecordsContainer.querySelector(
  "#inp-search-medical-records"
);
const searchButton = document.querySelector("#btn-search-medical-records");

searchName.value = "";

searchButton.addEventListener("click", () => {
  const searchTerm = searchName.value.trim().toLowerCase();
  displayMedicalRecords(searchTerm);
});

document
  .querySelector(".btn-fill-up")
  .addEventListener("click", () => displayMedicalRecords(""));

const currentNav = sessionStorage.getItem("currentSidebarBtn");

if (currentNav === "medical") {
  displayMedicalRecords("");
}

function displayMedicalRecords(searchTerm) {
  const tBody = medicalRecordsContainer.querySelector(".medical-records-tbody");
  tBody.innerHTML = "";

  const MDRef = ref(database, "medical-records");

  get(MDRef).then((snapshot) => {
    if (snapshot.exists()) {
      const MDData = snapshot.val();

      for (const userID in MDData) {
        const data = MDData[userID];
        const name = data.name.toLowerCase();

        if (name.includes(searchTerm)) {
          const tRow = document.createElement("tr");

          const tdName = document.createElement("td");
          tdName.textContent = `${data.name}`;

          const tdDate = document.createElement("td");
          tdDate.textContent = `${data.dateSubmitted}`;

          const tdActions = document.createElement("td");

          const btnDownload = document.createElement("button");
          btnDownload.classList.add("btn-download");
          btnDownload.textContent = "Download PDF";

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
            const fileName = `Medical-Record-${data.name}.pdf`;

            try {
              // Get a reference to the file in Firebase Storage
              const fileRef = storageRef(
                storage,
                `medical-records/${data.key}/${data.filename}`
              );

              // Fetch the download URL
              const downloadURL = await getDownloadURL(fileRef);

              // Fetch the file as a Blob using the download URL
              const response = await fetch(downloadURL);
              const blob = await response.blob();

              // Create a temporary download link
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = fileName;

              // Trigger the download
              document.body.appendChild(link);
              link.click();

              // Clean up
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            } catch (error) {
              console.error("Error downloading the file:", error);
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
    }
  });
}
