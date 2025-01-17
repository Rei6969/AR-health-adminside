import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
  getDownloadURL,
  uploadBytes,
  listAll,
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

const requestsContainer = document.querySelector(".requests-container");
const searchName = requestsContainer.querySelector("#inp-search-requests");
const searchButton = document.querySelector("#btn-search-requests");

searchName.value = "";

searchButton.addEventListener("click", () => {
  const searchTerm = searchName.value.trim().toLowerCase();
  displayRequests(searchTerm);
});

// displayRequests();

document
  .querySelector(".btn-requests")
  .addEventListener("click", () => displayRequests(""));

const currentNav = sessionStorage.getItem("currentSidebarBtn");

if (currentNav === "requests") {
  displayRequests("");
}

function displayRequests(searchTerm) {
  const tBody = requestsContainer.querySelector(".requests-tbody");
  tBody.innerHTML = "";

  const MDRef = ref(database, "requests");

  get(MDRef).then((snapshot) => {
    if (snapshot.exists()) {
      const RData = snapshot.val();

      for (const userID in RData) {
        for (const requestID in RData[userID]) {
          const data = RData[userID][requestID];
          const name = data.name.toLowerCase();

          if (name.includes(searchTerm)) {
            const tRow = document.createElement("tr");

            const tdStatus = document.createElement("td");

            const statusSpan = document.createElement("span");
            statusSpan.classList.add("request-status");

            if (data.status === "Done") {
              statusSpan.style.backgroundColor = "var(--color-sub-bg-2)";
            } else {
              statusSpan.style.backgroundColor = "var(--color-sub-bg-1)";
            }

            const tooltipSpan = document.createElement("span");
            tooltipSpan.classList.add("tooltip");
            tooltipSpan.textContent = `${data.status}`;

            statusSpan.appendChild(tooltipSpan);

            tdStatus.appendChild(statusSpan);

            const tdName = document.createElement("td");
            tdName.textContent = `${data.name}`;

            const tdType = document.createElement("td");
            tdType.textContent = `${data.requestValue}`;

            const tdDate = document.createElement("td");
            tdDate.textContent = `${data.dateSubmitted}`;

            const tdFile = document.createElement("td");

            const inpFile = document.createElement("input");

            if (data.requestType === "Medical Form") {
              inpFile.type = "file";
              inpFile.classList.add("requests-file");
              inpFile.maxLength = "1";
            } else if (data.requestType === "Clinical Services") {
              inpFile.type = "text";
              inpFile.classList.add("requests-note");
              inpFile.placeholder = "Please input a message.";
              // inpFile.maxLength = "1";
            }

            tdFile.appendChild(inpFile);

            const tdActions = document.createElement("td");

            const btnSubmit = document.createElement("button");
            btnSubmit.classList.add("btn-submit");
            btnSubmit.textContent = "Submit";

            const btnDelete = document.createElement("button");
            btnDelete.classList.add("btn-delete");
            btnDelete.textContent = "Delete";

            tdActions.appendChild(btnSubmit);
            tdActions.appendChild(btnDelete);

            tRow.appendChild(tdStatus);
            tRow.appendChild(tdName);
            tRow.appendChild(tdType);
            tRow.appendChild(tdDate);
            tRow.appendChild(tdFile);
            tRow.appendChild(tdActions);

            tBody.appendChild(tRow);

            btnSubmit.addEventListener("click", async () => {
              if (inpFile.value) {
                if (data.requestType === "Medical Form") {
                  const file = inpFile.files[0];

                  const fileFolderRef = storageRef(
                    storage,
                    `requests-files/${data.userID}/${data.requestID}`
                  );
                  const fileList = await listAll(fileFolderRef);
                  const deletePromises = fileList.items.map((item) =>
                    deleteObject(item)
                  );
                  await Promise.all(deletePromises);

                  const requestsStorageRef = storageRef(
                    storage,
                    `requests-files/${data.userID}/${data.requestID}/${file.name}`
                  );
                  const snapshot = await uploadBytes(requestsStorageRef, file);

                  const userRequestRef = ref(
                    database,
                    `requests/${data.userID}/${data.requestID}`
                  );

                  const newData = {
                    fileUrl: await getDownloadURL(requestsStorageRef),
                    filename: file.name,
                    status: "Done",
                  };

                  (function () {
                    emailjs.init({
                      publicKey: "BJmnfRx_UOTvJHiwG",
                    });
                  })();

                  await emailjs.send("service_5mvbaht", "template_wxxfyra", {
                    request_name: data.requestValue,
                    user_name: data.name,
                    request_status: "Accepted",
                    message: `The file you requested has been sent to your account. Alternatively, you can open it directly using the link below:\n\n${await getDownloadURL(
                      requestsStorageRef
                    )}`,
                    user_email: data.email,
                  });

                  update(userRequestRef, newData);
                  alert("The file has been submitted.");
                  statusSpan.style.backgroundColor = "var(--color-sub-bg-2)";
                  inpFile.value = "";
                } else {
                  (function () {
                    emailjs.init({
                      publicKey: "BJmnfRx_UOTvJHiwG",
                    });
                  })();

                  await emailjs.send("service_5mvbaht", "template_wxxfyra", {
                    request_name: data.requestValue,
                    user_name: data.name,
                    request_status: "Accepted",
                    message: inpFile.value,
                    user_email: data.email,
                  });

                  const userRequestRef = ref(
                    database,
                    `requests/${data.userID}/${data.requestID}`
                  );

                  const newData = {
                    status: "Done",
                  };

                  update(userRequestRef, newData);
                  alert("An update email has been submitted.");
                  statusSpan.style.backgroundColor = "var(--color-sub-bg-2)";
                  inpFile.value = "";
                }
              } else {
                if (data.requestType === "Medical Form") {
                  alert("Please upload a file before submitting.");
                } else {
                  alert("Please put a message before submitting.");
                }
              }
            });

            btnDelete.addEventListener("click", async () => {
              const confirmDelete = confirm(
                "Are you sure you want to delete this request?"
              );
              if (!confirmDelete) return;

              try {
                if (data.status === "Done") {
                  const fileFolderRef = storageRef(
                    storage,
                    `requests-files/${data.userID}/${data.requestID}`
                  );
                  const fileList = await listAll(fileFolderRef);
                  const deletePromises = fileList.items.map((item) =>
                    deleteObject(item)
                  );
                  await Promise.all(deletePromises);
                }

                const userRef = ref(
                  database,
                  `requests/${data.userID}/${data.requestID}`
                );
                await remove(userRef);

                tBody.removeChild(tRow);

                alert("request has been deleted.");
              } catch (error) {
                console.error("Error deleting record:", error);
                alert("Failed to delete the record.");
              }
            });
          }
        }
      }
    }
  });
}
