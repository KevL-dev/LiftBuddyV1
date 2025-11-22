const STORAGE_KEY = "liftbuddy_workouts";

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error loading workouts from storage:", e);
        return [];
    }
}

function saveToStorage(workouts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

let workouts = loadFromStorage();

export function getWorkouts() {
    return [...workouts];
}

export function addWorkout(workout) {
  const newWorkout = {
    id: workout.id ?? Date.now().toString(),
    created: workout.created ?? new Date().toISOString().split("T")[0],
    ...workout,
  };
  workouts.unshift(newWorkout);
  saveToStorage(workouts);
  return newWorkout;
}

export function clearAllWorkouts() {
  workouts = [];
  saveToStorage(workouts);
}