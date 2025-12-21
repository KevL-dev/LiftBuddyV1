const API_BASE = "http://localhost:3000/api";

export async function loadWorkoutDetailPage(contentEl, workoutId) {
  contentEl.innerHTML = `<h2 class="detail-header">Workout</h2><div id="detail">Lade...</div>`;
  try {
    const res = await fetch(`${API_BASE}/workouts/detail/${workoutId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Fehler" }));
      throw new Error(err.error || "Fehler beim Laden");
    }
    const json = await res.json();

    const w = json.workout;
    const exs = json.exercises;

    let html = `<h3 class="workout-name" >${w.name}</h3><p>Created: ${new Date(
      w.created
    ).toLocaleDateString()}</p><button id="deleteWorkout" class="btn btn-danger">
    Delete workout
  </button>`;

    if (exs.length === 0) {
      html += "<p>Keine Übungen hinzugefügt.</p>";
    } else {
      html += `<ul class="workout-exercises">`;
      exs.forEach((e) => {
        html += `
      <li data-id="${e.we_id}" class="list-workout-detail">
        <div class="muscle-group-info">
        ${e.name} (${e.muscle_group})
        </div>
        <div>
        Sets:
        <input type="number" class="sets workout-detail-input" value="${e.sets ?? ""}" />
        </div>
        <div>
        Reps:
        <input type="number" class="reps workout-detail-input" value="${e.reps ?? ""}" />
        </div>
        <div>
        Weight:
        <input type="number" class="weight workout-detail-input" value="${e.weight ?? ""}" />
        </div>
        <div>
          <button class="btn workout-detail-btn">Save</button>
          <button class="btn">Remove</button>
        </div>
        
      </li>
    `;
      });
      html += `</ul>`;
    }

    contentEl.querySelector("#detail").innerHTML = html;

    document.querySelectorAll(".btn-save").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const li = e.target.closest("li");
        const exerciseId = li.dataset.id;

        const sets = li.querySelector(".sets").value || null;
        const reps = li.querySelector(".reps").value || null;
        const weight = li.querySelector(".weight").value || null;

        await fetch(`${API_BASE}/workouts/${w.id}/exercises/${exerciseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sets, reps, weight }),
        });

        alert("Exercise saved");
      });
    });

    // DELETE exercise from workout
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Remove exercise from this workout?")) return;

        const li = e.target.closest("li");
        const exerciseId = li.dataset.id;

        await fetch(`${API_BASE}/workouts/${w.id}/exercises/${exerciseId}`, {
          method: "DELETE",
        });

        li.remove();
      });
    });

    const deleteBtn = document.getElementById("deleteWorkout");

    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete this workout? This cannot be undone."
      );

      if (!confirmed) return;

      try {
        const res = await fetch(`${API_BASE}/workouts/${workoutId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Delete failed");
        }

        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { page: "home" } })
        );
      } catch (err) {
        alert("Error deleting workout");
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
    contentEl.querySelector("#detail").innerHTML = "<p>Fehler beim Laden.</p>";
  }
}
