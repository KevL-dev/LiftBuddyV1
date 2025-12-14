// const STORAGE_KEY = "liftbuddy_workouts";

// function loadFromStorage() {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);
//     if (!raw) return [];
//     return JSON.parse(raw);
//   } catch (e) {
//     console.error("Error loading workouts from storage:", e);
//     return [];
//   }
// }

// function saveToStorage(workouts) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
// }

// let workouts = loadFromStorage();

// export function getWorkouts() {
//   return [...workouts];
// }

// export function addWorkout(workout) {
//   const newWorkout = {
//     id: workout.id ?? Date.now().toString(),
//     created: workout.created ?? new Date().toISOString().split("T")[0],
//     exercises: workout.exercises ?? [],
//   };
//   workouts.unshift(newWorkout);
//   saveToStorage(workouts);
//   return newWorkout;
// }

// export function clearAllWorkouts() {
//   workouts = [];
//   saveToStorage(workouts);
// }

// export function getWorkoutById(id) {
//   return workouts.find((w) => w.id === id);
// }

// export function addExercise(workoutId, exercise) {
//   const workout = getWorkoutById(workoutId);
//   if (!workout) return;

//   const newExercise = {
//     id: exercise.id ?? Date.now().toString(),
//     ...exercise,
//   };
//   workout.exercises.push(newExercise);
//   saveToStorage(workouts);
//   return newExercise;
// }

// export function updateExercise(workoutId, exersiceId, updateData) {
//   const workout = getWorkoutById(workoutId);
//   if (!workout) return;

//   const ex = workout.exercises.find((e) => e.id === exerciseId);
//   if (!ex) return;

//   Object.assign(ex, updateData);
//   saveToStorage(workouts);
// }

// export function deleteExercise(workoutId, exerciseId) {
//   const workout = getWorkoutById(workoutId);
//   if (!workout) return;
//   workout.exercises = workout.exercises.filter((e) => e.id !== exerciseId);
//   saveToStorage(workouts);
// }