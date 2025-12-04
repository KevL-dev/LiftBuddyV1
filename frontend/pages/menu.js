import { loadLoginPage } from "./login.js";
import { checkAuth, updateMenu } from "../app.js";

let isMenuOpen = false;

export function toggleMenu() {
  const app = document.getElementById("app");

  if (!isMenuOpen) {
    app.classList.add("shifted");
    isMenuOpen = true;
  } else {
    app.classList.remove("shifted");
    isMenuOpen = false;
  }
}

export function loadMenuPage(content) {
  let html = `
    <div id="menu-slider">
      <h2>Menu</h2>
      <div class="menu-item" data-page="home">Home</div>
      <div class="menu-item" data-page="profile">Profile</div>
      <div class="menu-item" data-page="settings">Settings</div>
      <div class="menu-item" data-page="register">register</div>
      <div class="menu-item" data-page="login">login</div>
      <button id="logoutBtn" class="menu-item">Logout</button>

    </div>
  `;

  content.insertAdjacentHTML("beforeend", html);

  document.querySelector("#logoutBtn").addEventListener("click", async () => {
    localStorage.removeItem("authToken");
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { page: "login" } })
    );
  });
  checkAuth().then((auth) => updateMenu(auth));
}

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    if (!btn.dataset.page || btn.dataset.page !== "menu") {
      const app = document.getElementById("app");
      app.classList.remove("shifted");
      isMenuOpen = false;
    }
  });
});

const menuButton = document.querySelector('nav button[data-page="menu"]');
menuButton.addEventListener("click", () => {
  toggleMenu();
});

document.addEventListener("click", (e) => {
  const target = e.target;

  if (target.classList.contains("menu-item")) {
    const page = target.dataset.page;

    const app = document.getElementById("app");
    app.classList.remove("shifted");
    isMenuOpen = false;

    console.log("Navigate to ", page);
  }
});
