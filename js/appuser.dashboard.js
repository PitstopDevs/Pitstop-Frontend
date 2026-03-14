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
  const otpBtn = document.getElementById("generateOtpBtn");

  if (otpBtn) {
    otpBtn.addEventListener("click", generateBookingOtp);
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

  const journeyBtn = document.getElementById("startJourneyBtn");
  const payBtn = document.getElementById("payNowBtn");
  const otpSection = document.getElementById("otpSection");
  const otpValue = document.getElementById("bookingOtp");
  const otpBtn = document.getElementById("generateOtpBtn");

  // ---------------- VEHICLE DETAILS ----------------

  document.getElementById("cbVehicle").innerText =
    (vehicle.brand || "") + " " + (vehicle.model || "");

  document.getElementById("cbVehicleType").innerText = vehicle.vehicleType
    ? formatVehicleType(vehicle.vehicleType)
    : "--";

  document.getElementById("cbEngine").innerText = vehicle.engineCapacity
    ? vehicle.engineCapacity + " CC"
    : "--";

  document.getElementById("cbAmount").innerText = booking.amount
    ? booking.amount
    : "--";

  document.getElementById("cbPayment").innerText =
    booking.paymentStatus || "--";

  document.getElementById("cbStarted").innerText = booking.bookingStartedTime
    ? new Date(booking.bookingStartedTime).toLocaleString()
    : "--";

  // ---------------- STATUS ----------------

  const statusEl = document.getElementById("cbStatus");
  const status = booking.currentStatus || "--";

  statusEl.innerText = status.replaceAll("_", " ");
  statusEl.className = "booking-status status-" + status;

  // ---------------- START JOURNEY BUTTON ----------------

  if (journeyBtn) {
    if (booking.currentStatus === "BOOKED") {
      journeyBtn.style.display = "inline-block";
    } else {
      journeyBtn.style.display = "none";
    }
  }

  // ---------------- PAYMENT BUTTON ----------------

  if (payBtn) {
    if (
      booking.paymentStatus === "NOT_PAID" &&
      (booking.currentStatus === "BOOKED" ||
        booking.currentStatus === "ON_THE_WAY")
    ) {
      payBtn.style.display = "inline-block";
    } else {
      payBtn.style.display = "none";
    }
  }

  // ---------------- OTP SECTION ----------------

  if (!otpBtn || !otpSection) return;

  if (booking.currentStatus === "ON_THE_WAY") {
    // OTP already generated
    if (booking.otp && booking.otpExpiry) {
      otpSection.style.display = "block";
      otpValue.innerText = booking.otp;

      otpBtn.style.display = "none";
    }
    // OTP not generated yet
    else {
      otpSection.style.display = "none";
      otpBtn.style.display = "inline-block";
    }
  } else {
    otpBtn.style.display = "none";
    otpSection.style.display = "none";
  }
  if (booking.currentStatus === "ON_THE_WAY") {
    if (booking.otp && booking.otpExpiry) {
      otpSection.style.display = "block";
      otpValue.innerText = booking.otp;

      otpBtn.style.display = "none";

      startOtpCountdown(booking.otpExpiry);
    } else {
      otpSection.style.display = "none";
      otpBtn.style.display = "inline-block";
    }
  }

  // ---------------- SLIDER COUNTER ----------------

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
async function generateBookingOtp() {
  if (activeBookings.length === 0) return;

  const bookingId = activeBookings[currentBookingIndex].id;

  try {
    const response = await fetch(
      `http://localhost:8080/api/booking/generateOtp/${bookingId}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    // HANDLE BACKEND ERROR MESSAGE
    if (!response.ok) {
      const errorMessage = await response.text();

      alert(errorMessage); // shows: OTP already generated and still valid

      return;
    }

    const data = await response.json();

    document.getElementById("otpSection").style.display = "block";
    document.getElementById("bookingOtp").innerText = data.otp;
  } catch (err) {
    console.error("OTP generation failed", err);

    alert("Something went wrong while generating OTP");
  }
}
let otpTimerInterval = null;

function startOtpCountdown(expiryTime) {
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
  }

  const timerElement = document.getElementById("otpTimer");

  otpTimerInterval = setInterval(() => {
    const expiry = new Date(expiryTime).getTime();
    const now = new Date().getTime();

    const remaining = expiry - now;

    if (remaining <= 0) {
      clearInterval(otpTimerInterval);

      timerElement.innerText = "Expired";

      document.getElementById("generateOtpBtn").style.display = "inline-block";
      document.getElementById("otpSection").style.display = "none";

      return;
    }

    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    timerElement.innerText =
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }, 1000);
}
