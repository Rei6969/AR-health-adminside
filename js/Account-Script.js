import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  signOut,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
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
const database = getDatabase(firebaseApp);

setPersistence(auth, browserSessionPersistence);

document.addEventListener("DOMContentLoaded", () => {
  const accountContainer = document.querySelector(".admin-accounts-container");

  displayAccount();

  function displayAccount() {
    const tBody = accountContainer.querySelector(".account-tbody");
    tBody.innerHTML = "";

    const ARef = ref(database, "admins");

    get(ARef).then((snapshot) => {
      if (snapshot.exists()) {
        const AData = snapshot.val();

        for (const userID in AData) {
          const data = AData[userID];

          const tRow = document.createElement("tr");

          const tdEmail = document.createElement("td");
          tdEmail.textContent = `${data.email}`;

          const tdActions = document.createElement("td");

          const btnReset = document.createElement("button");
          btnReset.classList.add("btn-reset");
          btnReset.textContent = "Reset Password";

          const btnDelete = document.createElement("button");
          btnDelete.classList.add("btn-delete");
          btnDelete.textContent = "Delete";

          tdActions.appendChild(btnReset);
          tdActions.appendChild(btnDelete);

          tRow.appendChild(tdEmail);
          tRow.appendChild(tdActions);

          tBody.appendChild(tRow);
        }
      }
    });
  }

  // ADD ACCOUNT
  const addEmail = document.getElementById("add-account-inp-email");
  const addPassword = document.getElementById("add-account-inp-password");

  document
    .querySelector(".btn-add-account")
    .addEventListener("click", async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          addEmail.value,
          addPassword.value
        );

        const user = userCredential.user;

        await sendEmailVerification(user);
        alert(`Verification email sent to ${addEmail.value}`);

        const role = "admin";
        await set(ref(database, "admins/" + user.uid), {
          role: role,
          email: addEmail.value,
        });

        addEmail.value = "";
        addPassword.value = "";
      } catch (error) {
        console.error("Error registering: ", error);
        alert(error.message);
      }
    });

  auth.onAuthStateChanged((user) => {
    if (user) {
      document.querySelector(".btn-logout").addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            window.location.href = "./../index.html";
            sessionStorage.clear();
            localStorage.clear();
          })
          .catch((error) => {
            console.error("Sign out error:", error.message);
            alert(error.message);
          });
      });
    } else {
      alert("Please login first before proceeding here.");
      window.location.href = "./../index.html";
    }
  });
});
