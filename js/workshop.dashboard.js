document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  // HARD GUARD
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  let username = localStorage.getItem("username");

  if (username) {
    // Remove prefixes if any
    username = username.replace("workshop_", "").replace("appuser_", "");

    // Capitalize
    username = username.charAt(0).toUpperCase() + username.slice(1);

    const nameElement = document.getElementById("workshopUsername");

    if (nameElement) {
      nameElement.innerText = username;
    } else {
      console.log("Element workshopUsername not found");
    }
  }

  loadWorkshopStatus();

  const toggle = document.getElementById("statusToggle");
  if (toggle) {
    toggle.addEventListener("change", toggleWorkshopStatus);
  }
});
function loadWorkshopStatus() {
  fetch("http://localhost:8080/api/workshops/getCurrentStatus", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load workshop status");
      }
      return res.json();
    })
    .then((data) => {
      updateStatusUI(data.workshopStatus);
    })
    .catch((err) => {
      console.error(err);
    });
}
function toggleWorkshopStatus(e) {
  const isOn = e.target.checked;

  const endpoint = isOn
    ? "/api/workshops/setWorkshopStatus"
    : "/api/workshops/setCloseWorkshop";

  fetch("http://localhost:8080" + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
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
    })
    .catch((err) => {
      e.target.checked = !isOn;
      console.error(err);
    });
}
function updateStatusUI(status) {
  const statusText = document.getElementById("workshopStatus");
  const toggle = document.getElementById("statusToggle");

  if (!statusText || !toggle) return;

  statusText.innerText = status;

  if (status === "OPEN") {
    toggle.checked = true;
  } else {
    toggle.checked = false;
  }
}
