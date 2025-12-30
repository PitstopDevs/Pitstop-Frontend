document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  loadWorkshopStatus();

  document
    .getElementById("statusToggle")
    .addEventListener("change", toggleWorkshopStatus);
});

/* ================= LOAD CURRENT STATUS ================= */

function loadWorkshopStatus() {
  fetch("http://localhost:8080/api/workshops/getCurrentStatus", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load workshop status");
      }
      return res.json();
    })
    .then((data) => {
      // backend fields
      updateStatusUI(data.workshopStatus);
      setWorkshopUsername(data.username);
      clearMessage();
    })
    .catch((err) => {
      console.error(err);
      showMessage("Failed to load workshop status", false);
    });
}

/* ================= TOGGLE STATUS ================= */

function toggleWorkshopStatus(e) {
  const isOn = e.target.checked;

  const endpoint = isOn
    ? "/api/workshops/setWorkshopStatus" // OPEN
    : "/api/workshops/setCloseWorkshop"; // CLOSE

  fetch("http://localhost:8080" + endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to update workshop status");
      }
      return res.json();
    })
    .then((data) => {
      updateStatusUI(data.workshopStatus);
      showMessage("Workshop status updated", true);
    })
    .catch((err) => {
      // rollback toggle if API fails
      e.target.checked = !isOn;
      showMessage(err.message, false);
    });
}

/* ================= UI HELPERS ================= */

function updateStatusUI(status) {
  if (!status) return;

  const statusText = document.getElementById("workshopStatus");
  const toggle = document.getElementById("statusToggle");

  statusText.textContent = status;
  toggle.checked = status === "OPEN";
}

function setWorkshopUsername(username) {
  const el = document.getElementById("workshopUsername");
  if (el && username) {
    el.textContent = username;
  }
}

function showMessage(msg, success) {
  const p = document.getElementById("statusMessage");
  p.textContent = msg;
  p.style.color = success ? "green" : "red";
  setTimeout(() => {
    p.textContent = "";
  }, 3000);
}

function clearMessage() {
  const p = document.getElementById("statusMessage");
  if (p) p.textContent = "";
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("workshopToken");
  localStorage.removeItem("workshopUsername");
  window.location.href = "index.html";
}
