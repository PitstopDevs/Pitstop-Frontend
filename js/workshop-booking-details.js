document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const bookingId = params.get("bookingId");

  if (!bookingId) return;

  loadBookingDetails(bookingId);
});

async function loadBookingDetails(bookingId) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/booking/view/" + bookingId,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    if (!response.ok) return;

    const booking = await response.json();

    renderBookingDetails(booking);
  } catch (err) {
    console.log("Failed to load booking details");
  }
}

function renderBookingDetails(booking) {
  const vehicle = booking.vehicleDetails || {};

  document.getElementById("bdId").innerText = booking.id;

  document.getElementById("bdCustomer").innerText = booking.customerName;

  document.getElementById("bdVehicle").innerText =
    vehicle.brand + " " + vehicle.model;

  document.getElementById("bdService").innerText = formatEnum(
    booking.serviceType,
  );

  document.getElementById("bdStatus").innerText = formatEnum(
    booking.currentStatus,
  );

  document.getElementById("bdAmount").innerText = "₹ " + booking.amount;

  if (booking.currentStatus !== "STARTED") {
    document.getElementById("acceptBookingBtn").style.display = "none";
  }
}

function formatEnum(value) {
  if (!value) return "--";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
let currentBookingId = null;
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  currentBookingId = params.get("bookingId");

  if (!currentBookingId) return;

  loadBookingDetails(currentBookingId);

  document
    .getElementById("acceptBookingBtn")
    .addEventListener("click", acceptBooking);
});
async function acceptBooking() {
  if (!currentBookingId) return;

  try {
    const response = await fetch(
      `http://localhost:8080/api/booking/acceptBooking/${currentBookingId}`,
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

    // reload booking details
    loadBookingDetails(currentBookingId);
  } catch (err) {
    console.log("Accept booking failed");
  }
}
