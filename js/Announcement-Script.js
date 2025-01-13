import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

auth.onAuthStateChanged((user) => {
  if (user) {
    const userID = user.uid;

    const userRef = ref(database, "admins/" + userID);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        const overlay = document.getElementById("overlay");
        const inpContent = document.getElementById("inp-content");
        const form = document.getElementById("announcement-form");
        let currentColorIndex = 4;
        let editingID = null;

        const baseColors = [
          "--box-color-1",
          "--box-color-2",
          "--box-color-3",
          "--box-color-4",
          "--box-color-5",
        ];
        const fontColors = ["#fff", "#000", "#fff", "#000", "#000"];

        document
          .getElementById("btn-new-announcement")
          .addEventListener("click", () => {
            overlay.classList.add("active");
            inpContent.value = "";
            form.classList.remove("update-form");
            colorPicker();
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
            content.style.backgroundColor = `var(${data.backgroundColor})`;

            const header = document.createElement("div");
            header.classList.add("header");

            const date = document.createElement("p");
            date.classList.add("date");
            date.textContent = data.dateTime;
            date.style.color = `${data.fontColors}`;

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
            text.style.color = `${data.fontColors}`;

            content.appendChild(header);
            content.appendChild(dropdownMenu);
            content.appendChild(text);

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
              currentColorIndex = data.index;
              colorPicker();

              editingID = ID;

              //   form.addEventListener("submit", () => {

              //   });
            });

            btnDelete.addEventListener("click", () => {
              remove(ref(database, `announcement/${ID}`)).then(() => {
                announcementContainer.removeChild(content);
              });
            });
          }

          handleDropdown();
        }

        form.addEventListener("submit", (e) => {
          e.preventDefault();

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
              backgroundColor: baseColors[currentColorIndex],
              fontColors: fontColors[currentColorIndex],
              index: currentColorIndex,
              dateTime: formatDate(date),
            }).then(() => {
              overlay.classList.remove("active");
              displayAnnouncement();
            });
          } else if (form.classList.contains("update-form") && editingID) {
            update(ref(database, `announcement/${editingID}`), {
              inpContent: inpContent.value.replace(/\n/g, "<br>"),
              backgroundColor: baseColors[currentColorIndex],
              fontColors: fontColors[currentColorIndex],
              index: currentColorIndex,
            }).then(() => {
              overlay.classList.remove("active");
              form.classList.remove("update-form");
              editingID = null;

              displayAnnouncement();
            });
          }
        });

        async function colorPicker() {
          const colorPickerContainer = document.querySelector(".color-picker");
          colorPickerContainer.innerHTML = "";

          baseColors.forEach((colorVar, index) => {
            const colorDiv = document.createElement("div");
            colorDiv.className = "color";

            const colorValue = getComputedStyle(document.documentElement)
              .getPropertyValue(colorVar)
              .trim();

            colorDiv.style.backgroundColor = colorValue;
            colorDiv.dataset.color = colorVar;

            colorDiv.addEventListener("click", () => {
              document
                .querySelectorAll(".color")
                .forEach((el) => el.classList.remove("active"));

              colorDiv.classList.add("active");

              inpContent.style.backgroundColor = `var(${colorVar})`;
              inpContent.style.color = fontColors[index];
              inpContent.style.setProperty(
                "--placeholder-color",
                fontColors[index]
              );

              currentColorIndex = index;
            });

            colorPickerContainer.appendChild(colorDiv);
          });

          const initialColorDiv =
            document.querySelectorAll(".color")[currentColorIndex];
          initialColorDiv.classList.add("active");

          inpContent.style.backgroundColor = `var(${baseColors[currentColorIndex]})`;
          inpContent.style.color = fontColors[currentColorIndex];
          inpContent.style.setProperty(
            "--placeholder-color",
            fontColors[currentColorIndex]
          );
        }

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
