let selectedBookingId = null;
let currentBooking = null;
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

  const toggle = document.getElementById("statusToggle");
  if (toggle) {
    toggle.addEventListener("change", toggleWorkshopStatus);
  }
  loadWorkshopBookings();
  loadWorkshopStatus();
  setInterval(loadWorkshopBookings, 10000);
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
    const response = await fetch(
      "http://localhost:8080/api/booking/workshopUser/active",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

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
  selectedBookingId = bookingId;

  const response = await fetch(
    `http://localhost:8080/api/booking/view/${bookingId}`,
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    },
  );

  const booking = await response.json();

  currentBooking = booking;

  showBookingDetails(booking);

  document.getElementById("bookingModal").style.display = "block";
}
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function showBookingDetails(booking) {
  const vehicle = booking.vehicleDetails || {};

  setText("bdBookingId", booking.id);
  setText("bdCustomer", booking.customerName || "--");

  setText("bdVehicle", (vehicle.brand || "") + " " + (vehicle.model || ""));

  setText("bdVehicleType", formatEnum(vehicle.vehicleType));
  setText("bdEngine", vehicle.engineCapacity + " CC");

  setText("bdService", formatEnum(booking.serviceType));
  setText("bdStatus", formatEnum(booking.currentStatus));

  setText("bdAmount", booking.amount);
  setText("bdPayment", booking.paymentStatus);

  setText(
    "bdStarted",
    booking.bookingStartedTime
      ? new Date(booking.bookingStartedTime).toLocaleString()
      : "--",
  );

  const acceptBtn = document.getElementById("acceptBookingBtn");

  if (booking.currentStatus === "STARTED") {
    acceptBtn.style.display = "inline-block";
  } else {
    acceptBtn.style.display = "none";
  }
  const otpSection = document.getElementById("otpVerificationSection");

  if (
    booking.currentStatus === "ON_THE_WAY" ||
    booking.currentStatus === "WAITING" ||
    booking.currentStatus === "REPAIRING"
  ) {
    otpSection.style.display = "block";
  } else {
    otpSection.style.display = "none";
  }
}
document.getElementById("acceptBookingBtn").onclick = async function () {
  if (!selectedBookingId) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/booking/acceptBooking/${selectedBookingId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    if (!response.ok) {
      alert("Failed to accept booking");
      return;
    }

    alert("Booking accepted");

    document.getElementById("acceptBookingBtn").style.display = "none";

    loadWorkshopBookings();
  } catch (err) {
    console.error(err);
  }
};
document.getElementById("closeBookingModal").onclick = function () {
  document.getElementById("bookingModal").style.display = "none";
};
document.getElementById("verifyOtpBtn").onclick = verifyOtp;

async function verifyOtp() {
  const otp = document.getElementById("otpInput").value;

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  const currentStatus = currentBooking.currentStatus;

  let endpoint = "";

  if (currentStatus === "ON_THE_WAY") {
    endpoint = "/api/booking/verifyOtpAndSetWaiting";
  } else if (currentStatus === "WAITING") {
    endpoint = "/api/booking/verifyOtpAndSetRepairing";
  } else if (currentStatus === "REPAIRING") {
    endpoint = "/api/booking/verifyOtpAndSetCompleted";
  } else {
    alert("OTP verification not allowed in this state");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080" + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        id: selectedBookingId,
        otp: otp,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      alert(err);
      return;
    }

    alert("Status updated successfully");

    document.getElementById("bookingModal").style.display = "none";

    loadWorkshopBookings();
  } catch (err) {
    console.error("OTP verification failed", err);
  }
}
const verifyBtn = document.getElementById("verifyOtpBtn");

if (booking.currentStatus === "ON_THE_WAY") {
  verifyBtn.innerText = "Verify OTP & Set Waiting";
} else if (booking.currentStatus === "WAITING") {
  verifyBtn.innerText = "Verify OTP & Start Repair";
} else if (booking.currentStatus === "REPAIRING") {
  verifyBtn.innerText = "Verify OTP & Complete Job";
}
