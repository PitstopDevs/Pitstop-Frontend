let originalName = "";
let originalEmail = "";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  loadProfile();
});

/* ================= LOAD PROFILE ================= */

function loadProfile() {
  fetch("http://localhost:8080/api/workshops/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load profile");
      }
      return res.json();
    })
    .then((data) => {
      // Map backend response
      document.getElementById("username").value = data.username;
      document.getElementById("name").value = data.name;
      document.getElementById("email").value = data.email;
      document.getElementById("rating").textContent = data.rating ?? "N/A";

      // Save originals for cancel
      originalName = data.name;
      originalEmail = data.email;
    })
    .catch((err) => {
      showMessage(err.message, false);
    });
}

/* ================= EDIT MODE ================= */

function enableEdit() {
  document.getElementById("name").disabled = false;
  document.getElementById("email").disabled = false;

  toggleButtons(true);
  clearMessage();
}

function cancelEdit() {
  // restore original values
  document.getElementById("name").value = originalName;
  document.getElementById("email").value = originalEmail;

  document.getElementById("name").disabled = true;
  document.getElementById("email").disabled = true;

  toggleButtons(false);
  clearMessage();
}

/* ================= SAVE PROFILE ================= */

function saveProfile() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) {
    showMessage("Name and Email cannot be empty", false);
    return;
  }

  fetch("http://localhost:8080/api/workshops/me/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({ name, email }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg || "Failed to update profile");
        });
      }
      return res.text(); // backend returns String
    })
    .then((msg) => {
      showMessage(msg, true);

      // persist new originals
      originalName = name;
      originalEmail = email;

      document.getElementById("name").disabled = true;
      document.getElementById("email").disabled = true;

      toggleButtons(false);
    })
    .catch((err) => {
      showMessage(err.message, false);
    });
}

/* ================= UI HELPERS ================= */

function toggleButtons(editing) {
  document.getElementById("editBtn").style.display = editing
    ? "none"
    : "inline-block";
  document.getElementById("saveBtn").style.display = editing
    ? "inline-block"
    : "none";
  document.getElementById("cancelBtn").style.display = editing
    ? "inline-block"
    : "none";
}

function showMessage(msg, success) {
  const p = document.getElementById("message");
  p.textContent = msg;
  p.style.color = success ? "green" : "red";
  setTimeout(() => {
    p.textContent = "";
  }, 3000);
}

function clearMessage() {
  const p = document.getElementById("message");
  if (p) p.textContent = "";
}
