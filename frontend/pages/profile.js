export function loadProfilePage(content) {
  let html = `
    <div>
      <h1>User Profile</h1>
    </div>

    <div class="profile-content">
      <div class="profile-field">
        <label for="name">Name:</label>
        <input type="text" id="profileName" />
      </div>

      <div class="profile-field">
        <label for="email">Email:</label>
        <input type="email" id="profileEmail" />
      </div>
    </div>

    <div class="middle-pos-btn">
      <button class="btn buddy-btn" id="saveProfileBtn">Save Profile</button>
    </div>
  `;

  content.innerHTML = html;

  const profileNameInput = document.getElementById("profileName");
  const profileEmailInput = document.getElementById("profileEmail");
  const saveBtn = document.getElementById("saveProfileBtn");

  loadProfile(profileNameInput, profileEmailInput);

  saveBtn.addEventListener("click", () =>
    saveProfile(profileNameInput.value, profileEmailInput.value)
  );
}

function loadProfile(nameInput, emailInput) {
  nameInput.value = localStorage.getItem("username") || "";
  emailInput.value = localStorage.getItem("profileEmail") || "";
}

async function saveProfile(username, email) {
  const token = localStorage.getItem("authToken");

  if (!username || !email) {
    alert("Bitte alle Felder ausfüllen");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Fehler beim Speichern");
      return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("profileEmail", email);

    alert("Profil erfolgreich aktualisiert!");
  } catch (err) {
    console.error(err);
    alert("Serverfehler");
  }
  window.dispatchEvent(new Event("profileUpdated"));
}
