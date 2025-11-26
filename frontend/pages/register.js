import { loadLoginPage } from "./login.js";

export function loadRegisterPage(content) {
  let html = `
    <div><h1>LiftBuddy</h1></div>
                
    <div class="register-form"> 
      <div class="profile-content">
        <div class="profile-field">
          <label for="name">Name:</label>
          <input type="text" id="registerName" name="name" />
        </div>

        <div class="profile-field">
          <label for="email">Email:</label>
          <input type="email" id="registerEmail" name="email" />
        </div>

        <div class="profile-field">
          <label for="password">Password:</label>
          <input type="password" id="registerPassword" name="registerPassword" />
        </div>

        <div class="profile-field">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" />
        </div>

        <div class="middle-pos-btn">
          <button class="btn buddy-btn" id="registerBtn">Register</button>
        </div>

        <p>Already have an account?
          <span id="goLogin" class="link">Login</span>
        </p>

        <div id="errorBox"></div>
        <div id="registerMessage"></div>

      </div>
    </div>
  `;

  content.innerHTML = html;

  const emailInput = document.querySelector("#registerEmail");
  const usernameInput = document.querySelector("#registerName");
  const passwordInput = document.querySelector("#registerPassword");
  const confirmPasswordInput = document.querySelector("#confirmPassword");
  const msg = document.querySelector("#registerMessage");

  document
    .querySelector("#registerBtn")
    .addEventListener("click", registerUser);

  async function registerUser() {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email || !username || !password || !confirmPassword) {
      msg.textContent = "Please fill in all fields.";
      msg.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = "Passwords do not match.";
      msg.style.color = "red";
      return;
    }

    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (data.error) {
      msg.textContent = data.error;
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Registration successful!";
    msg.style.color = "green";
  }

  document.querySelector("#goLogin").addEventListener("click", () => {
    loadLoginPage(content);
  });
}
