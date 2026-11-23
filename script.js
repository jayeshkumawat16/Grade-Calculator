/* Made by: Jayesh Kumawat, Roll No: 12345 */
// ================== 1. Grab elements from the page ==================
const form = document.getElementById("resultForm");
const nameInput = document.getElementById("studentName");
const markInputs = document.querySelectorAll(".mark"); // all 5 subject inputs
const resetBtn = document.getElementById("resetBtn");
const printBtn = document.getElementById("printBtn");
const themeBtn = document.getElementById("themeBtn");

const placeholder = document.getElementById("placeholder");
const resultCard = document.getElementById("resultCard");

const PASS_MARK = 40; // minimum marks needed in each subject

// ================== 2. Helper functions ==================

// Show or clear an error message under an input
function setError(input, message) {
  const errorEl = input.parentElement.querySelector(".error");
  errorEl.textContent = message;
  input.classList.toggle("invalid", message !== "");
}

// Check the name and all 5 marks. Returns true only if everything is valid.
function validateForm() {
  let isValid = true;

  // Name must not be empty
  if (nameInput.value.trim() === "") {
    setError(nameInput, "Please enter the student's name.");
    isValid = false;
  } else {
    setError(nameInput, "");
  }

  // Each mark must be a number between 0 and 100
  markInputs.forEach((input) => {
    const subject = input.dataset.subject;
    const raw = input.value.trim();
    const value = Number(raw);

    if (raw === "") {
      setError(input, `Enter marks for ${subject}.`);
      isValid = false;
    } else if (isNaN(value)) {
      setError(input, "Marks must be a number.");
      isValid = false;
    } else if (value < 0 || value > 100) {
      setError(input, "Marks must be between 0 and 100.");
      isValid = false;
    } else {
      setError(input, "");
    }
  });

  return isValid;
}

// Decide the grade from the percentage (the rules shown on the page)
function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  else if (percentage >= 80) return "A";
  else if (percentage >= 70) return "B";
  else if (percentage >= 60) return "C";
  else if (percentage >= 50) return "D";
  else if (percentage >= 40) return "E";
  else return "F";
}

// A short message based on performance
function getMessage(grade, passed) {
  if (!passed) return "Some subjects are below the pass mark. Focus on those and try again.";
  if (grade === "A+") return "Outstanding performance!";
  if (grade === "A") return "Excellent work!";
  if (grade === "B") return "Very good. Keep it up!";
  if (grade === "C") return "Good effort. There is room to improve.";
  return "You passed. Aim higher next time.";
}

// ================== 3. Main calculation ==================
function calculateResult() {
  const subjects = [];
  let total = 0;

  markInputs.forEach((input) => {
    const marks = Number(input.value);
    total += marks;
    subjects.push({
      name: input.dataset.subject,
      marks: marks,
      passed: marks >= PASS_MARK,
    });
  });

  const maxTotal = subjects.length * 100;
  const average = total / subjects.length;
  const percentage = (total / maxTotal) * 100;

  // Passed only if EVERY subject is at or above the pass mark
  const passed = subjects.every((s) => s.passed);
  const grade = passed ? getGrade(percentage) : "F";

  showResult({
    name: nameInput.value.trim(),
    subjects, total, maxTotal, average, percentage, passed, grade,
  });
}

// ================== 4. Update the page (DOM manipulation) ==================
function showResult(r) {
  document.getElementById("rName").textContent = r.name;
  document.getElementById("rTotal").textContent = `${r.total} / ${r.maxTotal}`;
  document.getElementById("rAverage").textContent = r.average.toFixed(2);
  document.getElementById("rPercent").textContent = r.percentage.toFixed(2) + "%";
  document.getElementById("rGrade").textContent = r.grade;
  document.getElementById("rMessage").textContent = getMessage(r.grade, r.passed);

  // Pass / Fail badge
  const badge = document.getElementById("rStatus");
  badge.textContent = r.passed ? "PASS" : "FAIL";
  badge.className = "badge " + (r.passed ? "pass" : "fail");

  // Progress bar
  const bar = document.getElementById("barFill");
  bar.style.width = r.percentage + "%";
  bar.classList.toggle("fail", !r.passed);
  bar.parentElement.setAttribute("aria-valuenow", Math.round(r.percentage));

  // Subject-wise table: clear old rows, then add new ones
  const tbody = document.getElementById("subjectRows");
  tbody.innerHTML = "";
  r.subjects.forEach((s) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.marks}</td>
      <td class="${s.passed ? "status-pass" : "status-fail"}">${s.passed ? "Pass" : "Fail"}</td>`;
    tbody.appendChild(row);
  });

  placeholder.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

// ================== 5. Events ==================

// Calculate button (form submit)
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  if (validateForm()) {
    calculateResult();
  } else {
    resultCard.classList.add("hidden");
    placeholder.classList.remove("hidden");
    const firstBad = form.querySelector(".invalid");
    if (firstBad) firstBad.focus();
  }
});

// Clear an input's error as soon as the user edits it
[nameInput, ...markInputs].forEach((input) => {
  input.addEventListener("input", () => setError(input, ""));
});

// Reset button
resetBtn.addEventListener("click", function () {
  form.reset();
  [nameInput, ...markInputs].forEach((input) => setError(input, ""));
  resultCard.classList.add("hidden");
  placeholder.classList.remove("hidden");
  nameInput.focus();
});

// Print button
printBtn.addEventListener("click", () => window.print());

// Theme toggle (remembers the choice)
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}
applyTheme(localStorage.getItem("theme") || "light");

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});
