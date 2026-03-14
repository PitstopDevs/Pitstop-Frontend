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
  setInterval(loadActiveBookings, 10000);
  const btn = document.getElementById("startJourneyBtn");

  if (btn) {
    btn.addEventListener("click", startJourney);
  }

  let username = localStorage.getItem("username") || "User";

  // Remove prefixes
  username = username.replace("appuser_", "").replace("workshop_", "");

  // Capitalize
  username = username.charAt(0).toUpperCase() + username.slice(1);

  document.getElementById("userName").innerText = username;

  // Slider controls
  document.getElementById("nextBooking").onclick = nextBooking;
  document.getElementById("prevBooking").onclick = prevBooking;
  const payBtn = document.getElementById("payNowBtn");

  if (payBtn) {
    payBtn.addEventListener("click", initiatePayment);
  }
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
    const response = await fetch(
      "http://localhost:8080/api/booking/appUser/active",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

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
  if (booking.currentStatus === "BOOKED") {
    journeyBtn.style.display = "inline-block";
  } else {
    journeyBtn.style.display = "none";
  }

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

  const payBtn = document.getElementById("payNowBtn");

  if (
    booking.paymentStatus === "NOT_PAID" &&
    (booking.currentStatus === "BOOKED" ||
      booking.currentStatus === "ON_THE_WAY")
  ) {
    payBtn.style.display = "inline-block";
  } else {
    payBtn.style.display = "none";
  }
  if (booking.paymentStatus === "NOT_PAID") {
    payBtn.style.display = "block";
  } else {
    payBtn.style.display = "none";
  }
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
async function startJourney() {
  if (activeBookings.length === 0) return;

  const bookingId = activeBookings[currentBookingIndex].id;

  try {
    const response = await fetch(
      `http://localhost:8080/api/booking/startJourney/${bookingId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    if (!response.ok) {
      alert("Failed to start journey");
      return;
    }

    alert("Journey started");

    // refresh booking card
    loadActiveBookings();
  } catch (err) {
    console.log("Start journey failed");
  }
}
const journeyBtn = document.getElementById("startJourneyBtn");

async function initiatePayment() {
  if (activeBookings.length === 0) return;

  const bookingId = activeBookings[currentBookingIndex].id;

  try {
    const response = await fetch(
      `http://localhost:8080/api/payments/initiate/${bookingId}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("Backend error:", text);
      alert("Payment initiation failed: " + text);
      return;
    }

    const payment = JSON.parse(text);

    openRazorpayCheckout(payment);
  } catch (err) {
    console.error("Payment initiation error:", err);
    alert("Network error while initiating payment");
  }
}
function openRazorpayCheckout(payment) {
  const options = {
    key: payment.key,

    amount: payment.amount,

    currency: payment.currency,

    order_id: payment.razorpayOrderId,

    name: "Pitstop",

    description: "Vehicle Service Payment",

    handler: function (response) {
      verifyPayment(response);
    },

    theme: {
      color: "#2563eb",
    },
  };

  const rzp = new Razorpay(options);

  rzp.open();
}
async function verifyPayment(response) {
  try {
    const verifyResponse = await fetch(
      "http://localhost:8080/api/payments/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          gatewayOrderId: response.razorpay_order_id,
          gatewayPaymentId: response.razorpay_payment_id,
          gatewaySignature: response.razorpay_signature,
        }),
      },
    );

    if (!verifyResponse.ok) {
      const err = await verifyResponse.text();
      alert("Payment verification failed: " + err);
      return;
    }

    const result = await verifyResponse.json();

    alert(result.message);

    // refresh booking card
    loadActiveBookings();
  } catch (err) {
    console.error("Verification error:", err);
  }
}
