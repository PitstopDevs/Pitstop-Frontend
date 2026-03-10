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
  loadWorkshopBookings();
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
function logout() {
  localStorage.clear();
  window.location.href = "workshop-index.html";
}
async function loadWorkshopBookings() {
  try {
    const response = await fetch("http://localhost:8080/api/booking/check", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) return;

    const bookings = await response.json();

    renderBookingTable(bookings);
  } catch (err) {
    console.log("Failed to load workshop bookings");
  }
}
function renderBookingTable(bookings) {
  const tbody = document.getElementById("bookingTableBody");

  tbody.innerHTML = "";

  bookings.forEach((booking, index) => {
    const vehicle = booking.vehicleDetails || {};

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${booking.id || "--"}</td>
      <td>${booking.customerName || "--"}</td>
      <td>${formatEnum(vehicle.vehicleType)}</td>
      <td>${vehicle.model || "--"}</td>
      <td>${formatEnum(booking.serviceType)}</td>
      <td>${formatEnum(booking.currentStatus)}</td>
      <td>
        <button class="view-btn" onclick="viewBooking('${booking.id}')">
          View
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function formatEnum(value) {
  if (!value) return "--";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function viewBooking(bookingId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/booking/view/${bookingId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    if (!response.ok) {
      alert("Failed to load booking details");
      return;
    }

    const booking = await response.json();

    console.log("Booking details:", booking);

    // Example: open a modal or another page
    showBookingDetails(booking);
  } catch (error) {
    console.error("Error loading booking:", error);
  }
}
function viewBooking(bookingId) {
  window.location.href = `workshop-booking-details.html?bookingId=${bookingId}`;
}
