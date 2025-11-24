export function loadProfilePage(content) {
  let html = `<div>
                <h1>User Profile</h1>
             </div>
                <div class="profile-content">
                <div class="profile-field">
                    <label for="name">Name:</label>
                    <input type="text" id="profileName" name="name" />
                </div>
                <div class="profile-field">
                    <label for="email">Email:</label>
                    <input type="email" id="profileEmail" name="email" />
                </div>

                <div class="middle-pos-btn">
                    <button class="btn buddy-btn" id="saveProfileBtn">Save Profile</button>
                </div>
                </div>
                
    `;

  content.innerHTML = html;
}
