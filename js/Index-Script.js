import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child,
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
const db = getDatabase(firebaseApp);

setPersistence(auth, browserSessionPersistence);

document
  .querySelector(".btn-admin-login")
  .addEventListener("click", async () => {
    const email = document.getElementById("admin-inp-email");
    const password = document.getElementById("admin-inp-password");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
      const user = userCredential.user;

      const userRef = ref(db, "admins/" + user.uid);
      const userSnapshot = await get(child(userRef, "role"));

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if (userData === "admin") {
          window.location.href = "./html/Dashboard.html";
        }
      } else {
        alert("No such user document!");
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      alert(error.message);
    }
  });
