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
const inpClassification = document.getElementById("inp-classification");
const inpCollege = document.getElementById("inp-college");
const inpCourse = document.getElementById("inp-course");
const filterContainer = document.getElementById("filter-container");
const btnBack = document.getElementById("btn-back");
const individualTable = document.getElementById("individual-table");
const generalTable = document.getElementById("general-table");

inpClassification.add;

handleChange();

function handleChange() {
  if (inpClassification.value === "Student") {
    inpCourse.style.display = "block";
    inpCollege.style.display = "none";
  } else {
    inpCourse.style.display = "none";
    inpCollege.style.display = "block";
  }
}

inpClassification.addEventListener("change", () => {
  handleChange();
});

inpClassification.addEventListener("change", () => displayGeneral(""));
inpCourse.addEventListener("change", () => displayGeneral(""));
inpCollege.addEventListener("change", () => displayGeneral(""));

searchName.value = "";

searchButton.addEventListener("click", () => {
  const searchTerm = searchName.value.trim().toLowerCase();
  displayGeneral(searchTerm);
});

document
  .querySelector(".btn-fill-up")
  .addEventListener("click", () => displayGeneral(""));

const currentNav = sessionStorage.getItem("currentSidebarBtn");

if (currentNav === "medical") {
  displayGeneral("");
}

function displayGeneral(searchTerm) {
  const tBody = medicalRecordsContainer.querySelector(".general-tbody");
  tBody.innerHTML = "";
  const cc =
    inpClassification.value === "Student" ? inpCourse.value : inpCollege.value;

  const MDRef = ref(
    database,
    `medical-records/${inpClassification.value}/${cc}`
  );

  get(MDRef).then((snapshot) => {
    if (snapshot.exists()) {
      const MDData = snapshot.val();

      for (const userName in MDData) {
        const data = MDData[userName];
        const name = userName.toLowerCase();
        if (name.includes(searchTerm)) {
          const tRow = document.createElement("tr");
          const tdName = document.createElement("td");
          tdName.textContent = userName;
          tdName.addEventListener("click", () => {
            displayMedicalRecords(inpClassification.value, cc, userName);
          });

          tRow.appendChild(tdName);

          tBody.appendChild(tRow);
        }
      }
    }
  });
}

btnBack.addEventListener("click", () => {
  generalTable.style.display = "table";
  individualTable.style.display = "none";
  filterContainer.style.display = "flex";
  btnBack.style.display = "none";
});

function displayMedicalRecords(classification, courseCollege, userName) {
  generalTable.style.display = "none";
  individualTable.style.display = "table";
  filterContainer.style.display = "none";
  btnBack.style.display = "block";

  const tBody = medicalRecordsContainer.querySelector(".medical-records-tbody");
  tBody.innerHTML = "";

  const MDRef = ref(
    database,
    `medical-records/${classification}/${courseCollege}/${userName}`
  );

  get(MDRef).then((snapshot) => {
    if (snapshot.exists()) {
      const MDData = snapshot.val();

      for (const userID in MDData) {
        const data = MDData[userID];

        if (data === "Male" || data === "Female") {
          return;
        }

        const tRow = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = `${data.name}`;

        const tdDate = document.createElement("td");
        tdDate.textContent = `${data.dateSubmitted}`;

        const tdActions = document.createElement("td");

        const btnOpen = document.createElement("button");
        btnOpen.classList.add("btn-open");
        btnOpen.textContent = "Open";
        btnOpen.addEventListener("click", async () => {
          try {
            const fileRef = storageRef(
              storage,
              `medical-records/${classification}/${courseCollege}/${userName}/${userID}/${data.filename}`
            );
            const downloadURL = await getDownloadURL(fileRef);
            window.open(downloadURL, "_blank");
          } catch (error) {
            console.error("Error opening the file:", error);
          }
        });

        const btnDownload = document.createElement("button");
        btnDownload.classList.add("btn-download");
        btnDownload.textContent = "Download";

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");
        btnDelete.textContent = "Delete";

        tdActions.appendChild(btnOpen);
        tdActions.appendChild(btnDownload);
        tdActions.appendChild(btnDelete);

        tRow.appendChild(tdName);
        tRow.appendChild(tdDate);
        tRow.appendChild(tdActions);

        tBody.appendChild(tRow);

        btnDownload.addEventListener("click", async () => {
          const fileName = `Medical-Record-${data.name}.pdf`;

          try {
            const fileRef = storageRef(
              storage,
              `medical-records/${classification}/${courseCollege}/${userName}/${userID}/${data.filename}`
            );

            const downloadURL = await getDownloadURL(fileRef);

            const response = await fetch(downloadURL);
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;

            document.body.appendChild(link);
            link.click();

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
  });
}
