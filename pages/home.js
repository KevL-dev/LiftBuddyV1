const dummyWorkouts = [
  { name: "Push", created: "2024-06-01" },
  { name: "Pull", created: "2024-06-03" },
  { name: "Legs", created: "2024-06-05" },
];

export function loadHomePage(contentEl) {
  let html = `<h1>My training plan</h1>`;

  if (dummyWorkouts.length > 0) {
    html += `<img alt="Plus for adding workouts" src="../assets/plus.svg" class="add-workout-btn"/>`;
    html += `<ul class="workout-list">`;

    dummyWorkouts.forEach((workout) => {
      html += `
        <li>
          <div class="workout-card">
          <img alt=Folder-Icon width="24px" height="24px" src="../assets/folder.svg " />
            <h3>${workout.name}</h3>
            <img alt=Dots-Icon width="24px" height="24px" src="../assets/dots.svg " />
          </div>
        </li>
      `;
    });

    html += `</ul>`;
  } else {
    html += `
      <p>No workouts found. Start by creating a new workout!</p>
      <button>Create New Workout</button>
    `;
  }

  contentEl.innerHTML = html;
}
