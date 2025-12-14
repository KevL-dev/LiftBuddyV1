import { loadHomePage } from "../frontend/pages/home.js";
import { loadNewWorkoutPage } from "../frontend/pages/newWorkout.js";
import { loadSettingsPage } from "../frontend/pages/settings.js";
import { loadProfilePage } from "../frontend/pages/profile.js";
import { loadRegisterPage } from "../frontend/pages/register.js";
import { loadMenuPage } from "../frontend/pages/menu.js";
import { loadLoginPage } from "./pages/login.js";
import { loadWorkoutDetailPage } from "./pages/workoutDetail.js";

function checkLoginStatus() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    document.getElementById("navbar").classList.add("hide");
    console.log("No auth token found.");
    return { loggedIn: false };
  } else if (token) {
    document.getElementById("navbar").classList.remove("hide");
    console.log("Auth token found.");
    return { loggedIn: true };
  }
}
checkLoginStatus();

export function updateMenu(auth) {
  const loginBtn = document.querySelector("[data-page='login']");
  const registerBtn = document.querySelector("[data-page='register']");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginBtn || !registerBtn || !logoutBtn) {
    return;
  }

  if (auth.loggedIn) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "block";
  } else {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    logoutBtn.style.display = "none";
  }
}

let isMenuOpen = false;

window.addEventListener("load", async () => {
  setTimeout(async () => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("app").classList.remove("hidden");

    const content = document.getElementById("content");
    const auth = await checkAuth();

    updateMenu(auth);

    if (auth.loggedIn) {
      loadHomePage(content, auth.user);
    } else {
      loadLoginPage(content);
    }
  }, 800);
});

export async function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) return { loggedIn: false };

  try {
    const res = await fetch("http://localhost:3000/api/auth/token-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return await res.json();
  } catch (err) {
    console.error("Auth check failed:", err);
    return { loggedIn: false };
  }
}

export function loadPage(page) {
  const content = document.getElementById("content");
  if (page === "home") {
    loadHomePage(content);
  } else if (page === "newWorkout") {
    loadNewWorkoutPage(content);
  } else if (page === "settings") {
    loadSettingsPage(content);
  } else if (page === "profile") {
    loadProfilePage(content);
  } else if (page === "register") {
    loadRegisterPage(content);
  } else if (page === "login") {
    loadLoginPage(content);
  } else if (page === "menu") {
    loadMenuPage(content);
  } else {
    content.innerHTML = `<h2>${page}</h2>`;
  }
}

document.getElementById("content").addEventListener("click", (e) => {
  const target = e.target;

  if (target.classList.contains("menu-item")) {
    const page = target.dataset.page;

    const app = document.getElementById("app");
    app.classList.remove("shifted");
    isMenuOpen = false;

    loadPage(page);
  }
});

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    window.dispatchEvent(new CustomEvent("navigate", { detail: { page } }));
  });
});

window.addEventListener("navigate", (e) => {
  loadPage(e.detail.page);
});

window.addEventListener("workoutSaved", (e) => {
  loadPage("home");
});

window.addEventListener("openWorkout", (e) => {
  const id = e.detail.id;
  loadWorkoutDetailPage(content, id);
});
