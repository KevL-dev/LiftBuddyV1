import { checkAuth, setActivePage } from "../app.js";
import { authHeaders } from "../helpers/api.js";
import { loadSessionDetailPage } from "../pages/sessionDetail.js";
const API_BASE = "http://localhost:3000/api";

export async function loadPlanDetailPage(contentEl, planId) {
  const auth = await checkAuth();
  if (!auth.loggedIn) return;

  contentEl.innerHTML = `<h2 class="detail-header">Plan</h2><div id="detail">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/plans/${planId}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Load failed");

    const plan = data.plan;
    const exs = data.exercises;

    let html = `
      <h3 class="workout-name">${escapeHtml(plan.name)}</h3>
      <p>Created: ${new Date(plan.created).toLocaleDateString()}</p>

      <div class="detail-functions">
        <button id="startTraining" type="button" class="btn buddy-btn">Start training</button>
        <button id="backFromPlan" class="btn back-button">Back</button>
      </div>
    `;

    if (exs.length === 0) {
      html += `<p>No exercises in this plan yet.</p>`;
    } else {
      html += `<ul class="workout-exercises">`;
      exs.forEach((e) => {
        html += `
          <li class="list-workout-detail">
            <div class="muscle-group-info">
              ${escapeHtml(e.name)} (${escapeHtml(e.muscle_group || "-")})
            </div>
            <div>Target sets: ${e.target_sets ?? "-"}</div>
            <div>Target reps: ${e.target_reps ?? "-"}</div>
          </li>
        `;
      });
      html += `</ul>`;
    }

    contentEl.querySelector("#detail").innerHTML = html;

    contentEl.querySelector("#backFromPlan").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("navigate", { detail: { page: "home" } }));
    });

    contentEl.querySelector("#startTraining").addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const btn = e.currentTarget;
  btn.disabled = true;

  try {
    const sRes = await fetch(`${API_BASE}/plans/${planId}/start`, {
      method: "POST",
      headers: authHeaders(),
    });

    const sData = await sRes.json().catch(() => ({}));
    if (!sRes.ok) throw new Error(sData.error || "Start failed");
    if (!sData.sessionId) throw new Error("No sessionId returned");

    setActivePage("sessionDetail");
    await loadSessionDetailPage(contentEl, sData.sessionId);
  } catch (err) {
    console.error(err);
    alert("Could not start session.");
  } finally {
    btn.disabled = false;
  }
});
  } catch (err) {
    console.error(err);
    contentEl.querySelector("#detail").innerHTML = `<p>Error loading plan.</p>`;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}