// workoutDetail.js
const API_BASE = "http://localhost:3000/api";

export async function loadWorkoutDetailPage(contentEl, workoutId) {
  contentEl.innerHTML = `<h2 class="detail-header">Workout</h2><div id="detail">Lade...</div>`;

  try {
    // 1) Load workout + exercises
    const res = await fetch(`${API_BASE}/workouts/detail/${workoutId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Fehler" }));
      throw new Error(err.error || "Fehler beim Laden");
    }
    const json = await res.json();

    const w = json.workout;
    const exs = json.exercises;

    // 2) Load stats (total moved + improvement)
    let stats = null;
    try {
      const sRes = await fetch(`${API_BASE}/workouts/${workoutId}/stats`);
      if (sRes.ok) stats = await sRes.json();
    } catch (e) {
      console.warn("Stats could not be loaded", e);
    }

    const totalMoved = stats?.totalMovedKg ?? null;
    const pct = stats?.improvementPct ?? null;

    const pctText =
      pct === null ? "—" : `${pct >= 0 ? "+" : ""}${Number(pct).toFixed(1)}%`;
    const totalText =
      totalMoved === null
        ? "—"
        : `${Number(totalMoved).toFixed(1)} kg`;

    const statsHtml = `
      <div class="stats-box">
        <div><strong>Total moved:</strong> ${totalText}</div>
        <div><strong>Improvement vs last:</strong> ${pctText}</div>
      </div>
    `;

    // 3) Build UI
    let html = `
      <h3 class="workout-name">${escapeHtml(w.name)}</h3>
      <p>Created: ${new Date(w.created).toLocaleDateString()}</p>
      ${statsHtml}

      <div class="detail-functions">
        <button id="deleteWorkout" class="btn btn-danger">Delete workout</button>
        <button id="backFromDetails" class="btn back-button">Back</button>
      </div>
    `;

    if (exs.length === 0) {
      html += "<p>Keine Übungen hinzugefügt.</p>";
    } else {
      html += `<ul class="workout-exercises">`;

      exs.forEach((e) => {
        html += `
          <li data-id="${e.we_id}" class="list-workout-detail">
            <div class="muscle-group-info">
              ${escapeHtml(e.name)} (${escapeHtml(e.muscle_group || "-")})
            </div>

            <div>
              Sets:
              <input type="number" class="sets workout-detail-input" value="${
                e.sets ?? ""
              }" />
            </div>

            <div>
              Reps:
              <input type="number" class="reps workout-detail-input" value="${
                e.reps ?? ""
              }" />
            </div>

            <div>
              Weight:
              <input type="number" step="0.5" class="weight workout-detail-input" value="${
                e.weight ?? ""
              }" />
            </div>

            <div class="detail-actions">
              <button class="btn btn-save workout-detail-btn">Save</button>
              <button class="btn btn-delete">Remove</button>
            </div>
          </li>
        `;
      });

      html += `</ul>`;
    }

    contentEl.querySelector("#detail").innerHTML = html;

    // 4) Save handlers
    contentEl.querySelectorAll(".btn-save").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const li = e.target.closest("li");
        const weId = li.dataset.id;

        const setsVal = li.querySelector(".sets").value;
        const repsVal = li.querySelector(".reps").value;
        const weightVal = li.querySelector(".weight").value;

        const sets = setsVal === "" ? null : Number(setsVal);
        const reps = repsVal === "" ? null : Number(repsVal);
        const weight = weightVal === "" ? null : Number(weightVal);

        const uRes = await fetch(
          `${API_BASE}/workouts/${w.id}/exercises/${weId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sets, reps, weight }),
          }
        );

        if (!uRes.ok) {
          const err = await uRes.json().catch(() => ({ error: "Update failed" }));
          alert(err.error || "Update failed");
          return;
        }

        // Reload page to refresh stats
        loadWorkoutDetailPage(contentEl, workoutId);
      });
    });

    // 5) Remove handlers
    contentEl.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        if (!confirm("Remove exercise from this workout?")) return;

        const li = e.target.closest("li");
        const weId = li.dataset.id;

        const dRes = await fetch(
          `${API_BASE}/workouts/${w.id}/exercises/${weId}`,
          { method: "DELETE" }
        );

        if (!dRes.ok) {
          const err = await dRes.json().catch(() => ({ error: "Delete failed" }));
          alert(err.error || "Delete failed");
          return;
        }

        // Reload page to refresh stats
        loadWorkoutDetailPage(contentEl, workoutId);
      });
    });

    // 6) Delete workout
    const deleteBtn = contentEl.querySelector("#deleteWorkout");
    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Are you sure you want to delete this workout? This cannot be undone."
      );
      if (!confirmed) return;

      try {
        const delRes = await fetch(`${API_BASE}/workouts/${workoutId}`, {
          method: "DELETE",
        });

        if (!delRes.ok) {
          const err = await delRes.json().catch(() => ({ error: "Delete failed" }));
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

    // 7) Back
    contentEl.querySelector("#backFromDetails").addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("navigate", { detail: { page: "home" } })
      );
    });
  } catch (err) {
    console.error(err);
    contentEl.querySelector("#detail").innerHTML = "<p>Fehler beim Laden.</p>";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}