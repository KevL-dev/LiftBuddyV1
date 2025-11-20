// Splashscreen entfernen nach 1.5 Sekunden
setTimeout(() => {
  document.getElementById("splash").style.display = "none";
  document.getElementById("app").classList.remove("hidden");

  loadPage("home");
}, 1500);

// Seiteninhalt dynamisch laden
function loadPage(page) {
  const content = document.getElementById("content");

  if (page === "home") {
    content.innerHTML = `
      <h2>Willkommen bei LiftBuddy</h2>
      <p>Tracke dein Training und verbessere dich jedes Workout!</p>
    `;
  }

  if (page === "newWorkout") {
    content.innerHTML = `
      <h2>Neues Workout</h2>
      <p>Hier kannst du Übungen, Wiederholungen und Gewicht eintragen.</p>
    `;
  }

  if (page === "history") {
    content.innerHTML = `
      <h2>Verlauf</h2>
      <p>Deine letzten Trainingseinheiten erscheinen hier.</p>
    `;
  }
}

// Navigation Buttons aktivieren
document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    loadPage(btn.dataset.page);
  });
});
