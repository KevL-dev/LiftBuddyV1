import { addWorkout } from "./data.js";

export function loadNewWorkoutPage(contentEl) {
  contentEl.innerHTML = `
    <h2>Create New Workout</h2>
    <form id="workoutForm" class="workout-form">
      <label>Workout Name
        <input id="workoutName" type="text" required placeholder="e.g. Push Day">
      </label>

      <div id="exercisesContainer">
        <!-- Übungsfelder (kann erweitert werden) -->
      </div>

      <div class="form-actions">
        <button type="submit" class="btn">Save Workout</button>
        <button type="button" id="cancelBtn" class="btn ghost">Cancel</button>
      </div>
    </form>
  `;

  const form = document.getElementById("workoutForm");
  const cancel = document.getElementById("cancelBtn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = document.getElementById("workoutName");
    const name = nameEl.value.trim();
    if (!name) {
      alert("Please enter a workout name.");
      return;
    }

    const newWorkout = {
      name,
      exercises: [],
    };

    const saved = addWorkout(newWorkout);

    window.dispatchEvent(
      new CustomEvent("workoutSaved", { detail: { id: saved.id } })
    );
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { page: "home" } })
    );
  });

  cancel.addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { page: "home" } })
    );
  });
}
