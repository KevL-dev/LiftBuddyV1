export function loadSettingsPage(content) {
  content.innerHTML = `
    <div class="settings-header">
      <h1>Settings</h1>
    </div>

    <div class="settings-section danger">
      <button id="deactivateAccountBtn" class="btn danger-btn">
        Account deactivate
      </button>
    </div>
  `;

  document
    .getElementById("deactivateAccountBtn")
    .addEventListener("click", confirmDeactivation);
}

async function confirmDeactivation() {
  const confirm = window.confirm(
    "Do you really want to deactivate your account?\n\nYou won't be able to log in afterwards."
  );

  if (!confirm) return;

  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("http://localhost:3000/api/auth/deactivate", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Server error during deactivation");
      return;
    }

    localStorage.clear();
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Server not reachable");
  }
}
