document.addEventListener("DOMContentLoaded", () => {
  const btnArrow = document.querySelector(".arrow-container");
  const container = document.querySelector(".container");
  const sidebar = document.querySelector(".sidebar");

  const btnStudents = document.querySelector(".btn-students");
  const btnMedicalRecords = document.querySelector(".btn-fill-up");
  const btnRequests = document.querySelector(".btn-requests");
  const btnMonthlyDisease = document.querySelector(".btn-monthly-disease");
  const btnAdminAccounts = document.querySelector(".btn-admin-accounts");
  const btnLogout = document.querySelector(".btn-logout");

  const btnAdd = document.querySelector(".btn-add");
  const addAccountContainer = document.querySelector(".add-account-container");

  btnAdd.addEventListener("click", () => {
    addAccountContainer.classList.toggle("active");
  });

  const containerStudents = document.querySelector(".students-container");
  const containerMedicalRecords = document.querySelector(
    ".medical-records-container"
  );
  const containerRequests = document.querySelector(".requests-container");
  const containerMonthlyDisease = document.querySelector(
    ".monthly-disease-container"
  );
  const containerAdminAccounts = document.querySelector(
    ".admin-accounts-container"
  );

  handleSidebar();

  function removeBtnStyle() {
    btnStudents.style.removeProperty("background-color");
    btnStudents.style.removeProperty("opacity");

    btnMedicalRecords.style.removeProperty("background-color");
    btnMedicalRecords.style.removeProperty("opacity");

    btnRequests.style.removeProperty("background-color");
    btnRequests.style.removeProperty("opacity");

    btnMonthlyDisease.style.removeProperty("background-color");
    btnMonthlyDisease.style.removeProperty("opacity");

    btnAdminAccounts.style.removeProperty("background-color");
    btnAdminAccounts.style.removeProperty("opacity");

    containerStudents.style.display = "none";
    containerMedicalRecords.style.display = "none";
    containerRequests.style.display = "none";
    containerMonthlyDisease.style.display = "none";
    containerAdminAccounts.style.display = "none";
  }

  function handleSidebar() {
    removeBtnStyle();
    const currentSidebar = sessionStorage.getItem("currentSidebar");
    const currentSidebarBtn =
      sessionStorage.getItem("currentSidebarBtn") || "students";

    if (currentSidebar === "active") {
      btnArrow.classList.add("active");
      container.classList.add("active");
      sidebar.classList.add("active");
    } else {
      btnArrow.classList.remove("active");
      container.classList.remove("active");
      sidebar.classList.remove("active");
    }

    if (currentSidebarBtn === "medical") {
      btnMedicalRecords.style.backgroundColor = "var(--color-sub-bg-4)";
      btnMedicalRecords.style.opacity = "1";
      containerMedicalRecords.style.display = "block";
    } else if (currentSidebarBtn === "requests") {
      btnRequests.style.backgroundColor = "var(--color-sub-bg-4)";
      btnRequests.style.opacity = "1";
      containerRequests.style.display = "block";
    } else if (currentSidebarBtn === "monthly") {
      btnMonthlyDisease.style.backgroundColor = "var(--color-sub-bg-4)";
      btnMonthlyDisease.style.opacity = "1";
      containerMonthlyDisease.style.display = "block";
    } else if (currentSidebarBtn === "admin") {
      btnAdminAccounts.style.backgroundColor = "var(--color-sub-bg-4)";
      btnAdminAccounts.style.opacity = "1";
      containerAdminAccounts.style.display = "block";
    } else {
      btnStudents.style.backgroundColor = "var(--color-sub-bg-4)";
      btnStudents.style.opacity = "1";
      containerStudents.style.display = "block";
    }
  }

  btnStudents.addEventListener("click", () => {
    sessionStorage.setItem("currentSidebarBtn", "students");
    handleSidebar();
  });

  btnMedicalRecords.addEventListener("click", () => {
    sessionStorage.setItem("currentSidebarBtn", "medical");
    handleSidebar();
  });

  btnRequests.addEventListener("click", () => {
    sessionStorage.setItem("currentSidebarBtn", "requests");
    handleSidebar();
  });

  btnMonthlyDisease.addEventListener("click", () => {
    sessionStorage.setItem("currentSidebarBtn", "monthly");
    handleSidebar();
  });

  btnAdminAccounts.addEventListener("click", () => {
    sessionStorage.setItem("currentSidebarBtn", "admin");
    handleSidebar();
  });

  btnArrow.addEventListener("click", () => {
    const currentSidebar = sessionStorage.getItem("currentSidebar");

    if (currentSidebar === "active") {
      sessionStorage.setItem("currentSidebar", "none");
    } else {
      sessionStorage.setItem("currentSidebar", "active");
    }
    handleSidebar();
  });
});
