import { loadRegisterPage } from "./register.js";
import { loadHomePage } from "./home.js";
import { loadPage } from "../app.js";

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

        <p class="change-site">Don't have an account yet? 
          <span id="goRegister" class="link">Register</span>
        </p>

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

  document.querySelector("#loginBtn").addEventListener("click", login);

  async function login() {
    const email = document.querySelector("#loginEmail").value;
    const password = document.querySelector("#loginPassword").value;

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("authToken", data.token);
      updateMenu({ loggedIn: true });
      loadPage("home");
    } else {
      console.log("Something went wrong: " + data.error);
    }
  }

  document.querySelector("#goRegister").addEventListener("click", () => {
    loadRegisterPage(content);
  });
}
