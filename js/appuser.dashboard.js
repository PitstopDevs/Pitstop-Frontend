let activeBookings = [];
let currentBookingIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // HARD GUARD
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  loadActiveBookings();

  let username = localStorage.getItem("username") || "User";

  // Remove prefixes
  username = username.replace("appuser_", "").replace("workshop_", "");

  // Capitalize
  username = username.charAt(0).toUpperCase() + username.slice(1);

  document.getElementById("userName").innerText = username;

  // Slider controls
  document.getElementById("nextBooking").onclick = nextBooking;
  document.getElementById("prevBooking").onclick = prevBooking;
});

function logout() {
  localStorage.clear();
  window.location.href = "appuser-index.html";
}

function goToAddAddress() {
  window.location.href = "appuser-add-address.html";
}

function goToRequestBooking() {
  window.location.href = "appuser-request-booking.html";
}

async function loadActiveBookings() {
  try {
    const response = await fetch("http://localhost:8080/api/booking/active", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) return;

    activeBookings = await response.json();

    if (!activeBookings || activeBookings.length === 0) {
      document.getElementById("currentBookingCard").style.display = "none";
      return;
    }

    document.getElementById("currentBookingCard").style.display = "block";

    renderBooking(activeBookings[currentBookingIndex]);
  } catch (err) {
    console.log("Active bookings fetch failed");
  }
}

function renderBooking(booking) {
  const vehicle = booking.vehicleDetails || {};

  document.getElementById("cbVehicle").innerText =
    (vehicle.brand || "") + " " + (vehicle.model || "");

  document.getElementById("cbVehicleType").innerText = vehicle.vehicleType
    ? formatVehicleType(vehicle.vehicleType)
    : "--";

  document.getElementById("cbEngine").innerText = vehicle.engineCapacity
    ? vehicle.engineCapacity + " CC"
    : "--";

  document.getElementById("cbAmount").innerText = booking.amount
    ? " " + booking.amount
    : "--";

  document.getElementById("cbPayment").innerText =
    booking.paymentStatus || "--";

  document.getElementById("cbStarted").innerText = booking.bookingStartedTime
    ? new Date(booking.bookingStartedTime).toLocaleString()
    : "--";

  const statusEl = document.getElementById("cbStatus");

  const status = booking.currentStatus || "--";

  statusEl.innerText = status.replaceAll("_", " ");

  statusEl.className = "booking-status status-" + status;

  updateBookingCounter();
}

function nextBooking() {
  if (currentBookingIndex < activeBookings.length - 1) {
    currentBookingIndex++;

    renderBooking(activeBookings[currentBookingIndex]);
  }
}

function prevBooking() {
  if (currentBookingIndex > 0) {
    currentBookingIndex--;

    renderBooking(activeBookings[currentBookingIndex]);
  }
}

function updateBookingCounter() {
  const counter = document.getElementById("bookingCounter");

  if (!counter) return;

  counter.innerText =
    "Booking " + (currentBookingIndex + 1) + " of " + activeBookings.length;
}
function formatVehicleType(type) {
  return type
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
