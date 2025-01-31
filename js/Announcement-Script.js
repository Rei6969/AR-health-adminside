import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
  getDownloadURL,
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

auth.onAuthStateChanged((user) => {
  if (user) {
    const userID = user.uid;

    const userRef = ref(database, "admins/" + userID);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        const overlay = document.getElementById("overlay");
        const inpContent = document.getElementById("inp-content");
        const inpImage = document.getElementById("inp-image");
        const form = document.getElementById("announcement-form");
        let editingID = null;

        document
          .getElementById("btn-new-announcement")
          .addEventListener("click", () => {
            overlay.classList.add("active");
            inpContent.value = "";
            inpImage.value = "";
            form.classList.remove("update-form");
          });

        document
          .getElementById("close-container")
          .addEventListener("click", () => overlay.classList.remove("active"));

        async function displayAnnouncement() {
          const announcementContainer = document.getElementById(
            "announcement-content"
          );
          announcementContainer.innerHTML = "";

          const snapshot = await get(ref(database, "announcement"));
          const snapshotData = snapshot.val();

          if (!snapshotData) {
            return;
          }

          for (const ID in snapshotData) {
            const data = snapshotData[ID];

            const content = document.createElement("div");
            content.classList = "content";
            content.style.backgroundColor = `var(--box-color-5)`;

            const header = document.createElement("div");
            header.classList.add("header");

            const date = document.createElement("p");
            date.classList.add("date");
            date.textContent = data.dateTime;
            date.style.color = `#000`;

            const dropdownButton = document.createElement("button");
            dropdownButton.classList.add("dropdown-button");
            dropdownButton.ariaHasPopup = true;
            dropdownButton.ariaExpanded = false;

            const icon = document.createElement("i");
            icon.classList = "fa-solid fa-ellipsis-vertical";
            dropdownButton.appendChild(icon);

            header.appendChild(date);
            header.appendChild(dropdownButton);

            const dropdownMenu = document.createElement("div");
            dropdownMenu.classList.add("dropdown-menu");
            dropdownMenu.hidden = true;

            const btnEdit = document.createElement("button");
            btnEdit.textContent = "Edit";

            const btnDelete = document.createElement("button");
            btnDelete.textContent = "Delete";

            dropdownMenu.appendChild(btnEdit);
            dropdownMenu.appendChild(btnDelete);

            const text = document.createElement("p");
            text.innerHTML = data.inpContent;
            text.style.color = `#000`;

            content.appendChild(header);
            content.appendChild(dropdownMenu);
            content.appendChild(text);

            if (data.imageUrl) {
              const imgContainer = document.createElement("div");
              imgContainer.classList.add("image-container");

              const imgThumb = document.createElement("img");
              imgThumb.src = data.imageUrl;
              imgThumb.classList.add("thumbnail");
              imgThumb.onclick = () => openModal(imgThumb);

              imgContainer.appendChild(imgThumb);
              content.appendChild(imgContainer);
            }

            announcementContainer.appendChild(content);

            btnEdit.addEventListener("click", () => {
              form.classList.add("update-form");

              const dropdownMenus = document.querySelectorAll(".dropdown-menu");
              dropdownMenus.forEach((menu) => {
                if (menu.classList.contains("show")) {
                  menu.classList.remove("show");
                  setTimeout(() => {
                    menu.hidden = true;
                  }, 300);
                }
              });

              overlay.classList.add("active");
              inpContent.value = data.inpContent.replace(/<br\s*\/?>/gi, "\n");

              editingID = ID;
            });

            btnDelete.addEventListener("click", () => {
              remove(ref(database, `announcement/${ID}`)).then(() => {
                announcementContainer.removeChild(content);
              });
            });
          }

          handleDropdown();
        }

        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          let imageUrl = "";

          if (inpImage.files.length > 0) {
            const file = inpImage.files[0];
            const imageRef = storageRef(
              storage,
              `announcement-images/${file.name}`
            );
            const snapshot = await uploadBytes(imageRef, file);
            imageUrl = await getDownloadURL(snapshot.ref);
          }

          if (!form.classList.contains("update-form")) {
            function formatDate(date) {
              const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              };

              return date.toLocaleString("en-US", options);
            }

            const date = new Date();

            set(push(ref(database, "announcement")), {
              inpContent: inpContent.value.replace(/\n/g, "<br>"),
              backgroundColor: "--box-color-5",
              fontColors: "#000",
              dateTime: formatDate(date),
              imageUrl: imageUrl,
            }).then(() => {
              overlay.classList.remove("active");
              displayAnnouncement();
            });
          } else if (form.classList.contains("update-form") && editingID) {
            update(ref(database, `announcement/${editingID}`), {
              inpContent: inpContent.value.replace(/\n/g, "<br>"),
              backgroundColor: "--box-color-5",
              fontColors: "#000",
            }).then(() => {
              overlay.classList.remove("active");
              form.classList.remove("update-form");
              editingID = null;

              displayAnnouncement();
            });
          }
        });

        function handleDropdown() {
          const dropdownButtons = document.querySelectorAll(".dropdown-button");
          const dropdownMenus = document.querySelectorAll(".dropdown-menu");

          dropdownButtons.forEach((button) => {
            button.addEventListener("click", function () {
              dropdownMenus.forEach((menu) => {
                if (
                  menu !==
                  this.closest(".content").querySelector(".dropdown-menu")
                ) {
                  menu.classList.remove("show");
                  setTimeout(() => {
                    menu.hidden = true;
                  }, 300);
                }
              });

              const menu =
                this.closest(".content").querySelector(".dropdown-menu");
              if (menu.hidden) {
                menu.hidden = false;
                setTimeout(() => menu.classList.add("show"), 10);
              } else {
                menu.classList.remove("show");
                setTimeout(() => (menu.hidden = true), 300);
              }
            });
          });

          document.addEventListener("click", function (event) {
            const isClickInside = event.target.closest(".content");

            if (!isClickInside) {
              dropdownMenus.forEach((menu) => {
                if (menu.classList.contains("show")) {
                  menu.classList.remove("show");
                  setTimeout(() => {
                    menu.hidden = true;
                  }, 300);
                }
              });
            }
          });
        }

        displayAnnouncement();
      } else {
        window.location.href = "./../index.html";
      }
    });
  } else {
    window.location.href = "./../index.html";
  }
});
