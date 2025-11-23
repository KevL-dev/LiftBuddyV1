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
    </div>
  `;
  content.insertAdjacentHTML("beforeend", html);
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
