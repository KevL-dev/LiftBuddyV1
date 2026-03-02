import { loadRegisterPage } from "./register.js";
import { loadPage, updateMenu } from "../app.js";

export function loadLoginPage(content) {
  let html = `
    <div><h1>Login</h1></div>

    <div class="login-form">
      <div class="profile-field">
        <label for="loginEmail">Email:</label>
        <input type="email" id="loginEmail" name="email" required />
      </div>

      <div class="profile-field">
        <label for="loginPassword">Password:</label>
        <input type="password" id="loginPassword" name="password" required />
      </div>

      <p class="change-site">Don't have an account yet?
        <span id="goRegister" class="link">Register</span>
      </p>

      <div class="middle-pos-btn">
        <button class="btn buddy-btn" id="loginBtn">Login</button>
      </div>

      <p id="loginMessage"></p>
    </div>
  `;

  content.innerHTML = html;

  const emailInput = document.querySelector("#loginEmail");
  const passwordInput = document.querySelector("#loginPassword");
  const msg = document.querySelector("#loginMessage");

  document.querySelector("#loginBtn").addEventListener("click", login);

  async function login() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    msg.textContent = "";

    if (!email || !password) {
      msg.textContent = "Please fill in all fields.";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Account is deactivated") {
          msg.textContent =
            "Your account has been deactivated. Please contact support.";
        } else if (res.status === 429) {
          msg.textContent = data.error;
        } else {
          msg.textContent = data.error || "Login failed";
        }
        return;
      }

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("profileEmail", data.user.email);

      updateMenu({ loggedIn: true });
      loadPage("home");
    } catch (err) {
      console.error(err);
      msg.textContent = "Server not reachable";
    }
  }

  document.querySelector("#goRegister").addEventListener("click", () => {
    loadRegisterPage(content);
  });
}
