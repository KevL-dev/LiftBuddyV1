const API_BASE = "http://localhost:3000/api";

export async function loadWorkoutDetailPage(contentEl, workoutId) {
  contentEl.innerHTML = `<h2>Workout</h2><div id="detail">Lade...</div>`;
  try {
    const res = await fetch(`${API_BASE}/workouts/detail/${workoutId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Fehler" }));
      throw new Error(err.error || "Fehler beim Laden");
    }
    const json = await res.json();

    const w = json.workout;
    const exs = json.exercises;

    let html = `<h3>${w.name}</h3><p>Erstellt: ${new Date(
      w.created
    ).toLocaleDateString()}</p>`;
    if (exs.length === 0) html += "<p>Keine Übungen hinzugefügt.</p>";
    else {
      html += `<ul>`;
      exs.forEach((e) => {
        html += `<li><strong>${e.name}</strong> (${e.muscle_group}) — sets: ${
          e.sets ?? "-"
        }, reps: ${e.reps ?? "-"}, weight: ${e.weight ?? "-"}</li>`;
      });
      html += `</ul>`;
    }
    contentEl.querySelector("#detail").innerHTML = html;
  } catch (err) {
    console.error(err);
    contentEl.querySelector("#detail").innerHTML = "<p>Fehler beim Laden.</p>";
  }
}
