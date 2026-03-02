import { authHeaders } from "../helpers/api.js";
import { checkAuth, isActivePage } from "../app.js";

const API_BASE = "http://localhost:3000/api";

export async function loadHomePage(contentEl) {
  const auth = await checkAuth();
  if (!auth.loggedIn) return;

  const user = auth.user;

  let plans = [];
  try {
    const res = await fetch(`${API_BASE}/plans`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load plans");
    plans = await res.json();
  } catch (err) {
    console.error("Plan load error:", err);
  }

  let html = `
    <div class="home-header">
      <h1>My training plans</h1>
      <p id="welcome">Hey, ${escapeHtml(user.username)}!</p>
    </div>

    <button id="addNewFromHome" class="btn btn-add-workout">
      <img alt="add-plan" width="24" height="24" src="../frontend/assets/pluswhite.svg" />
    </button>
  `;

  if (plans.length > 0) {
    html += `<ul class="workout-list">`;

    plans.forEach((p) => {
      html += `
        <li>
          <div class="workout-card">
            <div class="workout-left">
              <h3>${escapeHtml(p.name)}</h3>
              <p class="muted">
                Created on: ${new Date(p.created).toLocaleDateString()}
              </p>
            </div>
            <div class="workout-right">
              <button class="btn-open" data-id="${p.id}">
                <img alt="open-plan" width="24" height="24" src="../frontend/assets/dots.svg" />
              </button>
            </div>
          </div>
        </li>
      `;
    });

    html += `</ul>`;
  } else {
    html += `
      <p>No plans found. Create your first plan!</p>
      <button id="createFirst" class="btn">Create Plan</button>
    `;
  }

  if (!isActivePage("home")) return;
  contentEl.innerHTML = html;

  const addBtn =
    document.getElementById("addNewFromHome") ||
    document.getElementById("createFirst");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.dispatchEvent(
        new CustomEvent("navigate", { detail: { page: "newPlan" } })
      );
    });
  }

  document.querySelectorAll(".btn-open").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      window.dispatchEvent(new CustomEvent("openPlan", { detail: { id } }));
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
