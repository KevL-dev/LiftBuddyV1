export function loadLoginPage(content) {
  let html = `
    <div><h1>Login</h1></div>

    <div class="login-form"> 
      <div class="profile-content">

        <div class="profile-field">
          <label for="email">Email:</label>
          <input type="email" id="loginEmail" name="email" />
        </div>

        <div class="profile-field">
          <label for="password">Password:</label>
          <input type="password" id="loginPassword" name="password" />
        </div>

        <div class="middle-pos-btn">
          <button class="btn buddy-btn" id="loginBtn">Login</button>
        </div>

        <p id="loginMessage"></p>
      </div>
    </div>
  `;

  content.innerHTML = html;

  const emailInput = document.querySelector("#loginEmail");
  const passwordInput = document.querySelector("#loginPassword");
  const msg = document.querySelector("#loginMessage");

  document.querySelector("#loginBtn").addEventListener("click", loginUser);

  async function loginUser() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      msg.textContent = "Bitte alle Felder ausfüllen.";
      msg.style.color = "red";
      return;
    }

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.error) {
      msg.textContent = data.error;
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Login erfolgreich!";
    msg.style.color = "green";

  }
}
