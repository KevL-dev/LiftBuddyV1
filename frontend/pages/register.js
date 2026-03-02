import { loadLoginPage } from "./login.js";

function validatePassword(password) {
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter (A–Z).";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter (a–z).";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number (0–9).";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character (!@#$%...).";
  return null;
}

export function loadRegisterPage(content) {
  let html = `
    <div><h1>LiftBuddy</h1></div>

    <div class="login-form">
      <div class="profile-field">
        <label for="registerName">Name:</label>
        <input type="text" id="registerName" name="name" required />
      </div>

      <div class="profile-field">
        <label for="registerEmail">Email:</label>
        <input type="email" id="registerEmail" name="email" required />
      </div>

      <div class="profile-field">
        <label for="registerPassword">Password:</label>
        <input type="password" id="registerPassword" name="registerPassword" required />
      </div>

      <div class="profile-field">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required />
      </div>

      <p class="change-site">Already have an account?
        <span id="goLogin" class="link">Login</span>
      </p>

      <div class="middle-pos-btn">
        <button class="btn buddy-btn" id="registerBtn">Register</button>
      </div>

      <p id="registerMessage"></p>
    </div>
  `;

  content.innerHTML = html;

  const emailInput = document.querySelector("#registerEmail");
  const usernameInput = document.querySelector("#registerName");
  const passwordInput = document.querySelector("#registerPassword");
  const confirmPasswordInput = document.querySelector("#confirmPassword");
  const msg = document.querySelector("#registerMessage");

  function showError(text) {
    msg.textContent = text;
    msg.style.color = "var(--red-500)";
  }

  function showSuccess(text) {
    msg.textContent = text;
    msg.style.color = "#4ade80";
  }

  document
    .querySelector("#registerBtn")
    .addEventListener("click", registerUser);

  async function registerUser() {
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    msg.textContent = "";

    if (!username) return showError("Please enter your name.");
    if (!email) return showError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showError("Please enter a valid email address.");
    if (!password) return showError("Please enter a password.");

    const pwError = validatePassword(password);
    if (pwError) return showError(pwError);

    if (password !== confirmPassword)
      return showError("Passwords do not match.");

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Registration failed.");
        return;
      }

      showSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => loadLoginPage(document.getElementById("content")), 1200);
    } catch (err) {
      console.error(err);
      showError("Server not reachable.");
    }
  }

  document.querySelector("#goLogin").addEventListener("click", () => {
    loadLoginPage(content);
  });
}
