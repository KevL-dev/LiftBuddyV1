import { checkAuth } from "../app.js";
import { authHeaders } from "../helpers/api.js";

const API_BASE = "http://localhost:3000/api";

export async function loadSessionDetailPage(contentEl, sessionId) {
  const auth = await checkAuth();
  if (!auth.loggedIn) return;

  contentEl.innerHTML = `<h2 class="detail-header">Session</h2><div id="detail">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/detail`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Load failed");

    const s = json.session;
    const exs = json.exercises;

    const startedText = s.started ? new Date(s.started).toLocaleString() : "-";
    const finishedText = s.finished
      ? new Date(s.finished).toLocaleString()
      : null;

    let html = `
      <h3 class="workout-name">${escapeHtml(s.plan_name)}</h3>
      <p>Started: ${startedText}</p>
      ${finishedText ? `<p>Finished: ${finishedText}</p>` : ""}

      <div class="detail-functions">
        <button id="finishSession" class="btn buddy-btn">Finish</button>
        <button id="backFromSession" class="btn back-button">Back</button>
      </div>

      <div id="statsMount"></div>
    `;

    if (exs.length === 0) {
      html += "<p>No exercises found.</p>";
    } else {
      html += `<ul class="workout-exercises">`;
      exs.forEach((e) => {
        html += `
          <li data-id="${e.se_id}" class="list-workout-detail">
            <div class="muscle-group-info">
              ${escapeHtml(e.name)} (${escapeHtml(e.muscle_group || "-")})
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
              Weight (kg):
              <input type="number" step="0.5" class="weight workout-detail-input" value="${e.weight ?? ""}" />
            </div>

            <div class="detail-actions">
              <button class="btn btn-save workout-detail-btn">Save</button>
            </div>
          </li>
        `;
      });
      html += `</ul>`;
    }

    contentEl.querySelector("#detail").innerHTML = html;

    contentEl
      .querySelector("#backFromSession")
      .addEventListener("click", () => {
        window.dispatchEvent(
          new CustomEvent("navigate", { detail: { page: "home" } }),
        );
      });

    contentEl.querySelectorAll(".btn-save").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const li = e.target.closest("li");
        const seId = li.dataset.id;

        const setsVal = li.querySelector(".sets").value;
        const repsVal = li.querySelector(".reps").value;
        const weightVal = li.querySelector(".weight").value;

        const sets = setsVal === "" ? null : Number(setsVal);
        const reps = repsVal === "" ? null : Number(repsVal);
        const weight = weightVal === "" ? null : Number(weightVal);

        const uRes = await fetch(
          `${API_BASE}/sessions/${sessionId}/exercises/${seId}`,
          {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ sets, reps, weight }),
          },
        );

        const uJson = await uRes.json().catch(() => ({}));
        if (!uRes.ok) return alert(uJson.error || "Save failed");

        alert("Saved!");
      });
    });

    contentEl
      .querySelector("#finishSession")
      .addEventListener("click", async () => {
        const ok = confirm("Finish this training session?");
        if (!ok) return;

        try {
          const fRes = await fetch(`${API_BASE}/sessions/${sessionId}/finish`, {
            method: "POST",
            headers: authHeaders(),
          });

          const stats = await fRes.json();
          if (!fRes.ok) throw new Error(stats.error || "Finish failed");

          renderStats(stats);
        } catch (err) {
          console.error(err);
          alert("Could not finish session.");
        }
      });

    function renderStats(stats) {
      const pct = stats.improvementPct;
      const pctText =
        pct === null ? "—" : `${pct >= 0 ? "+" : ""}${Number(pct).toFixed(1)}%`;

      const totalText = `${Number(stats.totalMovedKg || 0).toFixed(1)} kg`;

      const box = `
        <div class="stats-box">
          <div><strong>Total moved:</strong> ${totalText}</div>
          <div><strong>Improvement vs last same plan:</strong> ${pctText}</div>
        </div>
      `;

      const mount = contentEl.querySelector("#statsMount");
      if (mount) mount.innerHTML = box;
    }
  } catch (err) {
    console.error(err);
    contentEl.querySelector("#detail").innerHTML =
      `<p>Error loading session.</p>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
