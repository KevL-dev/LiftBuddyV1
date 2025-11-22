import { getWorkouts } from "./data.js";

export function loadHomePage(contentEl) {
  const workouts = getWorkouts();

  let html = `<div class="home-header"><h1>My training plan</h1></div>
              <button id="addNewFromHome" class="btn btn-add-workout"><img alt="add-workout" width="24px" height="24px" src="../assets/pluswhite.svg" /></button>
              `;

  if (workouts.length > 0) {
    html += `<ul class="workout-list">`;
    workouts.forEach((w) => {
      html += `
        <li>
          <div class="workout-card">
            <div class="workout-left">
              <h3>${escapeHtml(w.name)}</h3>
              <p class="muted">Created on: ${w.created}</p>
            </div>
            <div class="workout-right">
              <button class="btn-open" data-id="${w.id}"><img alt="open-workout" width="24px" height="24px" src="../assets/dots.svg" /></button>
            </div>
          </div>
        </li>
      `;
    });
    html += `</ul>`;
  } else {
    html += `<p>No workouts found. Start by creating a new workout!</p>
             <button id="createFirst" class="btn">Create New Workout</button>`;
  }

  contentEl.innerHTML = html;

  const addBtn =
    document.getElementById("addNewFromHome") ||
    document.getElementById("createFirst");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("navigate", { detail: { page: "newWorkout" } })
      );
    });
  }

  document.querySelectorAll(".btn-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      window.dispatchEvent(new CustomEvent("openWorkout", { detail: { id } }));
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


