import { checkAuth } from "../app.js";
const API_BASE = "http://localhost:3000/api";

export async function loadNewWorkoutPage(contentEl) {
  contentEl.innerHTML = `<h2 class="workout-headline-h2">Neues Workout</h2>
    <div id="new-workout-form">
      <div>
        <label>Name</label>
        <input id="workoutName" type="text" placeholder="Beispiel: Push Day" />
      </div>
      <div>
        <label>Übung</label>
        <select id="exerciseSelect" class="select-exercise"><option>Lade...</option></select>
      </div>
      <div>
        <label>Sets</label><input id="sets" type="number" min="1" />
        <label>Reps</label><input id="reps" type="number" min="1" />
        <label>Gewicht (kg)</label><input id="weight" type="number" step="0.5" />
      </div>
      <button id="addExerciseBtn" class="btn buddy-btn">Zur Liste hinzufügen</button>
      <h3 class="workout-headline">Aktuelle Übungen</h3>
      <ul id="exerciseList"></ul>
      <button id="saveWorkoutBtn" class="btn buddy-btn">Workout speichern</button>
    </div>`;

  const auth = await checkAuth();
  const userId = auth?.user?.id;
  if (!userId) {
    contentEl.querySelector("#new-workout-form").innerHTML =
      "<p>Bitte einloggen.</p>";
    return;
  }

  const exerciseSelect = document.getElementById("exerciseSelect");
  let exercises = [];
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    exercises = await res.json();
    exerciseSelect.innerHTML = exercises
      .map(
        (e) =>
          `<option value="${e.id}">${e.name} (${
            e.muscle_group || "-"
          })</option>`
      )
      .join("");
  } catch (err) {
    console.error("Fehler beim Laden der Übungen", err);
    exerciseSelect.innerHTML = "<option>Fehler beim Laden</option>";
  }

  const currentExercises = [];
  const exerciseList = document.getElementById("exerciseList");

  function renderExerciseList() {
    exerciseList.innerHTML = currentExercises
      .map(
        (ex, idx) => `
      <li data-idx="${idx}">
        <strong>${ex.name}</strong> — sets: ${ex.sets ?? "-"}, reps: ${
          ex.reps ?? "-"
        }, weight: ${ex.weight ?? "-"}
        <button class="remove-ex btn-small">Entfernen</button>
      </li>
    `
      )
      .join("");
    Array.from(exerciseList.querySelectorAll(".remove-ex")).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.target.closest("li").dataset.idx);
        currentExercises.splice(idx, 1);
        renderExerciseList();
      });
    });
  }

  document.getElementById("addExerciseBtn").addEventListener("click", () => {
    const sel = exerciseSelect.value;
    const selected = exercises.find((e) => String(e.id) === String(sel));
    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;
    const weight = document.getElementById("weight").value;

    if (!selected) return alert("Wähle eine Übung aus.");
    currentExercises.push({
      exercise_id: selected.id,
      name: selected.name,
      sets: sets ? Number(sets) : null,
      reps: reps ? Number(reps) : null,
      weight: weight ? Number(weight) : null,
    });
    renderExerciseList();
  });

  document
    .getElementById("saveWorkoutBtn")
    .addEventListener("click", async () => {
      const name = document.getElementById("workoutName").value.trim();
      if (!name) return alert("Gib dem Workout einen Namen.");
      if (currentExercises.length === 0)
        return alert("Füge mindestens eine Übung hinzu.");

      try {
        // 1) Workout anlegen
        const res = await fetch(`${API_BASE}/workouts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, name }),
        });
        const data = await res.json();
        if (!data.workoutId) throw new Error("Kein workoutId");

        // 2) Jede Übung anhängen
        for (const ex of currentExercises) {
          await fetch(`${API_BASE}/workouts/${data.workoutId}/exercises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exercise_id: ex.exercise_id,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
            }),
          });
        }

        // event: workoutSaved (app.js lauscht darauf)
        window.dispatchEvent(new CustomEvent("workoutSaved"));
      } catch (err) {
        console.error("Fehler beim Speichern", err);
        alert("Fehler beim Speichern des Workouts.");
      }
    });
}
