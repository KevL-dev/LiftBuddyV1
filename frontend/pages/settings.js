export function loadSettingsPage(content) {
  content.innerHTML = `
    <div class="settings-header">
      <h1>Settings</h1>
    </div>

    <div class="settings-section danger">
      <button id="deactivateAccountBtn" class="btn danger-btn">
        Deactivate Account
      </button>
    </div>
    <div>
      <button id="changePasswordBtn" class="btn">Change Password</button>
    </div>
    <!-- HTML -->
<div id="passwordModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
  <div style="background:white; padding:20px; border-radius:8px;">
    <h3>Change Password</h3>
    <input type="password" id="newPasswordInput" placeholder="New password" />
    <button id="submitPasswordBtn">Submit</button>
    <button onclick="closeModal()">Cancel</button>
  </div>
</div>

  `;

  document
    .getElementById("deactivateAccountBtn")
    .addEventListener("click", confirmDeactivation);

  document.getElementById("changePasswordBtn").addEventListener("click", () => {
    document.getElementById("passwordModal").style.display = "flex";
  });

  function closeModal() {
    document.getElementById("passwordModal").style.display = "none";
  }

  document
    .getElementById("submitPasswordBtn")
    .addEventListener("click", async () => {
      const newPassword = document.getElementById("newPasswordInput").value;
      if (!newPassword) return alert("Password cannot be empty");

      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(
          "http://localhost:3000/api/auth/change-password",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ password: newPassword }),
          }
        );

        const data = await res.json();
        if (data.success) {
          alert("Password changed!");
          closeModal();
        } else {
          alert("Error: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Server not reachable");
      }
    });
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
