import { checkAuth } from "../app.js";
import { authHeaders } from "../helpers/api.js";

const API_BASE = "http://localhost:3000/api";

export async function loadNewPlanPage(contentEl) {
  contentEl.innerHTML = `
    <h2 class="workout-headline-h2">New Plan</h2>
    <button id="newPlanBackBtn" class="btn">Back</button>

    <div id="new-workout-form">
      <div>
        <label>Plan name</label>
        <input id="planName" type="text" placeholder="Example: Push Day" />
      </div>

      <div>
        <label>Exercise</label>
        <select id="exerciseSelect" class="select-exercise"><option>Loading...</option></select>
      </div>

      <div>
        <label>Target Sets</label><input id="sets" type="number" min="1" />
        <label>Target Reps</label><input id="reps" type="number" min="1" />
      </div>

      <button id="addExerciseBtn" class="btn buddy-btn">Add to plan</button>
      <h3 class="workout-headline">Plan exercises</h3>
      <ul id="exerciseList"></ul>

      <button id="savePlanBtn" class="btn buddy-btn">Save plan</button>
    </div>
  `;

  const auth = await checkAuth();
  if (!auth.loggedIn) {
    contentEl.querySelector("#new-workout-form").innerHTML =
      "<p>Please login.</p>";
    return;
  }

  document.getElementById("newPlanBackBtn").addEventListener("click", () => {
    window.dispatchEvent(
      new CustomEvent("navigate", { detail: { page: "home" } }),
    );
  });

  const exerciseSelect = document.getElementById("exerciseSelect");
  let exercises = [];
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    exercises = await res.json();
    exerciseSelect.innerHTML = exercises
      .map(
        (e) =>
          `<option value="${e.id}">${escapeHtml(e.name)} (${escapeHtml(e.muscle_group) || "-"})</option>`,
      )
      .join("");
  } catch (err) {
    console.error(err);
    exerciseSelect.innerHTML = "<option>Error loading</option>";
  }

  const currentExercises = [];
  const exerciseList = document.getElementById("exerciseList");

  function render() {
    exerciseList.innerHTML = currentExercises
      .map(
        (ex, idx) => `
        <li data-idx="${idx}">
          <strong>${escapeHtml(ex.name)}</strong> — sets: ${ex.target_sets ?? "-"}, reps: ${ex.target_reps ?? "-"}
          <button class="remove-ex btn-small">Remove</button>
        </li>
      `,
      )
      .join("");

    exerciseList.querySelectorAll(".remove-ex").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.closest("li").dataset.idx);
        currentExercises.splice(idx, 1);
        render();
      });
    });
  }

  document.getElementById("addExerciseBtn").addEventListener("click", () => {
    const sel = exerciseSelect.value;
    const selected = exercises.find((e) => String(e.id) === String(sel));
    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;

    if (!selected) return alert("Pick an exercise.");

    currentExercises.push({
      exercise_id: selected.id,
      name: selected.name,
      target_sets: sets ? Number(sets) : null,
      target_reps: reps ? Number(reps) : null,
    });

    render();
  });

  document.getElementById("savePlanBtn").addEventListener("click", async () => {
    const name = document.getElementById("planName").value.trim();
    if (!name) return alert("Enter a plan name.");
    if (currentExercises.length === 0)
      return alert("Add at least one exercise.");

    try {
      const res = await fetch(`${API_BASE}/plans`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create plan failed");

      const planId = data.planId;

      for (const ex of currentExercises) {
        const exRes = await fetch(`${API_BASE}/plans/${planId}/exercises`, {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            exercise_id: ex.exercise_id,
            target_sets: ex.target_sets,
            target_reps: ex.target_reps,
          }),
        });

        const exData = await exRes.json().catch(() => ({}));
        if (!exRes.ok) throw new Error(exData.error || "Add exercise failed");
      }

      window.dispatchEvent(
        new CustomEvent("navigate", { detail: { page: "home" } }),
      );
    } catch (err) {
      console.error(err);
      alert("Error saving plan.");
    }
  });
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
