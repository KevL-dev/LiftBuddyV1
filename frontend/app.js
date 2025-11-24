import { loadHomePage } from "../frontend/pages/home.js";
import { loadNewWorkoutPage } from "../frontend/pages/newWorkout.js";
import { loadSettingsPage } from "../frontend/pages/settings.js";
import { loadProfilePage } from "../frontend/pages/profile.js";
import { loadRegisterPage } from "../frontend/pages/register.js";
import { loadMenuPage } from "../frontend/pages/menu.js";
import { loadLoginPage } from "./pages/login.js";

let isMenuOpen = false;

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    loadPage("home");
  }, 800);
});

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
  alert("Open workout: " + id);
});
