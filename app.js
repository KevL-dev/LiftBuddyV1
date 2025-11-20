import { loadHomePage } from "./pages/home.js";

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    loadPage("home");
  }, 2500);
});

function loadPage(page) {
  const content = document.getElementById("content");

  if (page === "home") loadHomePage(content);
  if (page === "newWorkout") content.innerHTML = "<h2>Neues Workout</h2>";
  if (page === "settings") content.innerHTML = "<h2>Settings</h2>";
  if (page === "profile") content.innerHTML = "<h2>Profile</h2>";
}

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    loadPage(btn.dataset.page);
  });
});
