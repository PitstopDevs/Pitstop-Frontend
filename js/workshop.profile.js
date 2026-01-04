let originalName = "";
let originalEmail = "";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  loadProfile();
  loadVehicleTypes();
  loadServicesOffered();
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
function togglePasswordForm() {
  const form = document.getElementById("passwordForm");
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function changePassword() {
  const currentPassword = document
    .getElementById("currentPassword")
    .value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  if (!currentPassword || !newPassword) {
    alert("Both fields are required");
    return;
  }

  if (currentPassword === newPassword) {
    alert("New password cannot be same as current password");
    return;
  }

  fetch("http://localhost:8080/api/workshops/me/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.text();
    })
    .then((msg) => {
      alert(msg);

      // 🔥 Force logout after password change
      localStorage.removeItem("workshopToken");
      localStorage.removeItem("workshopUsername");
      window.location.href = "workshop-index.html";
    })
    .catch((err) => {
      alert(err.message);
    });
}
/* ================= LOAD VEHICLE TYPES ================= */

function loadVehicleTypes() {
  fetch("http://localhost:8080/api/workshops/me/vehicleTypes", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load vehicle types");
      return res.json();
    })
    .then((data) => {
      const textEl = document.getElementById("vehicleTypes");
      const deleteBtn = document.getElementById("deleteVehicleTypeBtn");

      // 🔑 extract RAW value only
      let rawType = null;

      if (typeof data === "string") {
        rawType = data;
      } else if (data && data.vehicleTypeSupported) {
        rawType = data.vehicleTypeSupported;
      }

      // ❌ no vehicle type
      if (!rawType) {
        textEl.textContent = "Not available";
        deleteBtn.style.display = "none";
        return;
      }

      // ✅ vehicle type exists
      textEl.textContent = formatVehicleType(rawType);
      deleteBtn.style.display = "inline-block";
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("vehicleTypes").textContent = "Not available";
      document.getElementById("deleteVehicleTypeBtn").style.display = "none";
    });
}

/* ================= FORMATTER ================= */

function formatVehicleType(type) {
  if (!type) return "-";

  switch (type) {
    case "TWO_WHEELER":
      return "Two Wheeler";
    case "FOUR_WHEELER":
      return "Four Wheeler";
    case "BOTH":
      return "Two & Four Wheeler";
    default:
      return type;
  }
}
function deleteVehicleType() {
  const confirmed = confirm(
    "Are you sure you want to remove the vehicle type?"
  );

  if (!confirmed) return;

  fetch("http://localhost:8080/api/workshops/removeVehicle", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.text();
    })
    .then((msg) => {
      alert(msg);
      document.getElementById("vehicleTypes").textContent = "Not available";
      document.getElementById("deleteVehicleTypeBtn").style.display = "none";
    })
    .catch((err) => {
      alert(err.message);
    });
}
function loadServicesOffered() {
  fetch("http://localhost:8080/api/workshops/me/services", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load services");
      }
      return res.json();
    })
    .then((data) => {
      const list = document.getElementById("servicesList");
      list.innerHTML = "";

      let services = [];

      // Handle multiple response shapes
      if (Array.isArray(data)) {
        services = data;
      } else if (data.servicesOffered) {
        services = data.servicesOffered;
      }

      if (!services || services.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Not available";
        list.appendChild(li);
        return;
      }

      services.forEach((service) => {
        const li = document.createElement("li");
        li.textContent = formatServiceType(service);
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error(err);
      const list = document.getElementById("servicesList");
      list.innerHTML = "<li>Not available</li>";
    });
}
function formatServiceType(type) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
