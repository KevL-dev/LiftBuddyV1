export function loadSettingsPage(content) {
  content.innerHTML = `
    <div class="settings-header">
      <h1>Settings</h1>
    </div>

    <div class="settings-section danger">
      <button id="deactivateAccountBtn" class="btn danger-btn">
        Deactivate Account
      </button>

      <button id="changePasswordBtn" class="btn">Change Password</button>
    </div>
    

    <div id="passwordModalAccount" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
      <div style="background:#222; max-width:200px; width:100%; padding:20px; border-radius:8px;">
        <h3 style=" color:white; text-align:center;">Deactivate Account</h3>
        <div class="modal-buttons" style="display:flex; max-width:200px; width:100%; gap:8px; flex-direction: row; justify-content:space-between; margin-top:12px;">
        <button style=" max-width:100px; width:100%;" id="submitAccountBtn" class="btn">Deactivate</button>
        <button style=" max-width:100px; width:100%;" id="cancelAccountBtn" class="btn">Cancel</button>
        </div>
      </div>
    </div>

    <div id="passwordModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
      <div style="background:#222; padding:20px; border-radius:8px;">
        <h3 style=" color:white;">Change Password</h3>
        <input type="password" id="newPasswordInput" placeholder="New password" />
        <div class="modal-buttons" style="display:flex; gap:8px; flex-direction: row; justify-content:space-between; margin-top:12px;">
        <button id="submitPasswordBtn" class="btn">Submit</button>
        <button id="cancelPasswordBtn" class="btn">Cancel</button>
        </div>
      </div>
    </div>
  `;

  document
    .getElementById("submitAccountBtn")
    .addEventListener("click", deactivateAccount);

  document.getElementById("changePasswordBtn").addEventListener("click", () => {
    document.getElementById("passwordModal").style.display = "flex";
  });

  document.getElementById("deactivateAccountBtn").addEventListener("click", () => {
    document.getElementById("passwordModalAccount").style.display = "flex";
  });

  document
  .getElementById("cancelPasswordBtn")
  .addEventListener("click", closeModal);

  document
  .getElementById("cancelAccountBtn")
  .addEventListener("click", closeModalAccount);

  function closeModal() {
    document.getElementById("passwordModal").style.display = "none";
  }

  function closeModalAccount() {
    document.getElementById("passwordModalAccount").style.display = "none";
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

async function deactivateAccount() {
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
