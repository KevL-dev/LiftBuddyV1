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
      <h2 class="menu-title">Menu</h2>
      <div class="menu-item" data-page="home">Home</div>
      <div class="menu-item" data-page="profile">Profile</div>
      <div class="menu-item" data-page="settings">Settings</div>
      <div class="menu-item" data-page="register">register</div>
      <div class="menu-item" data-page="login">login</div>
      <button id="logoutBtn" class="menu-item" data-page="logout">Logout</button>

    </div>
  `;

  content.insertAdjacentHTML("beforeend", html);

  document.querySelector("#logoutBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("authToken");

    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    localStorage.removeItem("authToken");
    localStorage.removeItem("username");

    updateMenu({ loggedIn: false });

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

    if (!page) return;

    const app = document.getElementById("app");
    app.classList.remove("shifted");
    isMenuOpen = false;

    console.log("Navigate to ", page);
  }
});
