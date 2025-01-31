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

async function toggleMonthContent(monthId) {
  const content = document.querySelector(`#${monthId} .month-content`);

  const year = document.querySelector(`#${monthId} .year`);
  const diseaseImg = document.querySelector(`#${monthId} .disease-image`);
  const diseaseName = document.querySelector(`#${monthId} .disease-name`);
  const description = document.querySelector(`#${monthId} .description`);
  const symptoms = document.querySelectorAll(`#${monthId} .symptoms-inp`);
  const otherInfo = document.querySelector(`#${monthId} .info`);
  const relatedImages = document.querySelector(`#${monthId} .related-images`);

  const btnClear = document.querySelector(`#${monthId} .btn-clear`);
  const btnSubmit = document.querySelector(`#${monthId} .btn-submit`);

  const snapshot = await get(ref(database, `month-disease/${monthId}`));
  const snapshotData = snapshot.val();

  relatedImages.addEventListener("change", function () {
    const files = this.files;
    if (files.length < 3 || files.length > 5) {
      alert("Please select between 3 to 5 images.");
      this.value = "";
    }
  });

  if (snapshotData) {
    year.value = snapshotData.year;
    diseaseImg.value = "";
    diseaseName.value = snapshotData.diseaseName;
    description.value = snapshotData.description;
    symptoms.forEach((symptom, index) => {
      symptom.value = snapshotData.symptoms[index];
    });
    otherInfo.value = snapshotData.otherInfo;
    relatedImages.value = "";
  } else {
    year.value = "";
    diseaseImg.value = "";
    diseaseName.value = "";
    description.value = "";
    symptoms.forEach((symptom) => {
      symptom.value = "";
    });
    otherInfo.value = "";
    relatedImages.value = "";
  }

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
      otherInfo.value = "";
      relatedImages.value = "";
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
      hasLengthFive &&
      otherInfo &&
      relatedImages.files.length > 2
    ) {
      const img = diseaseImg.files[0];
      const relatedImgs = relatedImages.files;

      // Show loading screen
      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.style.display = "flex";

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

        let relatedImagesUrls = [];
        for (let i = 0; i < relatedImgs.length; i++) {
          const relatedImg = relatedImgs[i];
          const relatedImgRef = storageRef(
            storage,
            `monthly-disease-images/${monthId}/related/${relatedImg.name}`
          );
          await uploadBytes(relatedImgRef, relatedImg);
          const relatedImgUrl = await getDownloadURL(relatedImgRef);
          relatedImagesUrls.push(relatedImgUrl);
        }

        const monthData = {
          month: monthId,
          year: year.value,
          diseaseName: diseaseName.value.trim(),
          description: description.value.trim(),
          symptoms: dataSymptoms,
          otherInfo: otherInfo.value.trim(),
          imageUrl: await getDownloadURL(imgStorageRef),
          relatedImagesUrls: relatedImagesUrls,
        };

        await set(ref(database, `month-disease/${monthId}`), monthData);
        alert("Month has been updated.");
      } catch (error) {
        console.error(`Error processing the images:`, error);
      } finally {
        // Hide loading screen
        loadingScreen.style.display = "none";
      }
    } else {
      alert("Please fill all the fields");
    }
  });
}
// MONTHLY DISEASE END ==================================================================================================================================
