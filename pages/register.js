export function loadRegisterPage(content) {
    let html = `<div><h1>LiftBuddy</h1>
                <p>get better everyday</p>
                </div>
                
                <div class="register-form"> 
                    <div>
                      <label for="username">Username:</label>
                      <input type="text" id="username" name="username" required />
                    </div>
                    
                
                </div>`;

    content.innerHTML = html;
}               