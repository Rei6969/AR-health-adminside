import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
  uploadBytes,
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

// MONTHLY DISEASE ==================================================================================================================================
const buttons = document.querySelectorAll(".month-btn");

buttons.forEach((button) => {
  button.addEventListener("click", function () {
    const monthId = this.getAttribute("data-month");
    closeAllMonthsExcept(monthId);
    toggleMonthContent(monthId);
  });
});

function closeAllMonthsExcept(monthId) {
  const allContents = document.querySelectorAll(".month-content");
  allContents.forEach((content) => {
    const contentParentId = content.parentElement.id;
    if (contentParentId !== monthId) {
      content.style.display = "none";
    }
  });
}

function toggleMonthContent(monthId) {
  const content = document.querySelector(`#${monthId} .month-content`);

  const year = document.querySelector(`#${monthId} .year`);
  const diseaseImg = document.querySelector(`#${monthId} .disease-image`);
  const diseaseName = document.querySelector(`#${monthId} .disease-name`);
  const description = document.querySelector(`#${monthId} .description`);
  const symptoms = document.querySelectorAll(`#${monthId} .symptoms-inp`);

  const btnClear = document.querySelector(`#${monthId} .btn-clear`);
  const btnSubmit = document.querySelector(`#${monthId} .btn-submit`);

  year.value = "";
  diseaseImg.value = "";
  diseaseName.value = "";
  description.value = "";
  symptoms.forEach((symptom) => {
    symptom.value = "";
  });

  year.addEventListener("input", function (e) {
    if (this.value.length > 4) {
      this.value = this.value.slice(0, 4);
    }
  });

  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "flex";
  } else {
    content.style.display = "none";
  }

  btnClear.addEventListener("click", async () => {
    try {
      const imgFolderRef = storageRef(
        storage,
        `monthly-disease-images/${monthId}`
      );
      const imgList = await listAll(imgFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      await remove(ref(database, `month-disease/${monthId}`));
      alert("All data for this month has been deleted.");

      year.value = "";
      diseaseImg.value = "";
      diseaseName.value = "";
      description.value = "";
      symptoms.forEach((symptom) => {
        symptom.value = "";
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
    }
  });

  btnSubmit.addEventListener("click", async () => {
    const hasLengthFive = Array.from(symptoms).every(
      (symptom) => symptom.value.trim() !== ""
    );

    if (
      year.value &&
      diseaseImg.files.length > 0 &&
      diseaseName.value &&
      description.value &&
      hasLengthFive
    ) {
      const img = diseaseImg.files[0];

      try {
        const imgFolderRef = storageRef(
          storage,
          `monthly-disease-images/${monthId}`
        );
        const imgList = await listAll(imgFolderRef);
        const deletePromises = imgList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);

        const imgStorageRef = storageRef(
          storage,
          `monthly-disease-images/${monthId}/${img.name}`
        );
        const snapshot = await uploadBytes(imgStorageRef, img);

        let dataSymptoms = [];

        symptoms.forEach((symptom) => {
          dataSymptoms.push(symptom.value.trim());
        });

        const monthData = {
          month: monthId,
          year: year.value,
          diseaseName: diseaseName.value.trim(),
          description: description.value.trim(),
          symptoms: dataSymptoms,
          imageUrl: await getDownloadURL(imgStorageRef),
        };

        await set(ref(database, `month-disease/${monthId}`), monthData);
        alert("Month has been updated.");
      } catch (error) {
        console.error(`Error processing the image: ${img.name}`, error);
      }
    } else {
      alert("Please fill all the fields");
    }
  });
}
// MONTHLY DISEASE END ==================================================================================================================================
