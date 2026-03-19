let activeBookings = [];
let currentBookingIndex = 0;
let otpTimerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  setupUserName();

  attachEventListeners();

  loadActiveBookings();

  // refresh bookings periodically
  setInterval(loadActiveBookings, 30000);
});

function setupUserName() {
  let username = localStorage.getItem("username") || "User";

  username = username.replace("appuser_", "").replace("workshop_", "");

  username = username.charAt(0).toUpperCase() + username.slice(1);

  document.getElementById("userName").innerText = username;
}

function attachEventListeners() {
  document.getElementById("nextBooking").onclick = nextBooking;
  document.getElementById("prevBooking").onclick = prevBooking;

  const journeyBtn = document.getElementById("startJourneyBtn");
  if (journeyBtn) journeyBtn.onclick = startJourney;

  const payBtn = document.getElementById("payNowBtn");
  if (payBtn) payBtn.onclick = initiatePayment;

  const otpBtn = document.getElementById("generateOtpBtn");
  if (otpBtn) otpBtn.onclick = generateBookingOtp;

  document.getElementById("regenOtpBtn").onclick = generateBookingOtp;

  document.getElementById("copyOtpBtn").onclick = copyOtp;
}

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

    if (currentBookingIndex >= activeBookings.length) {
      currentBookingIndex = 0;
    }

    renderBooking(activeBookings[currentBookingIndex]);
  } catch (err) {
    console.log("Active bookings fetch failed");
  }
}

function renderBooking(booking) {
  const vehicle = booking.vehicleDetails || {};

  resetOtpUI();

  // vehicle details
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

  document.getElementById("cbPayment").innerText = formatEnum(
    booking.paymentStatus || "--",
  );

  document.getElementById("cbStarted").innerText = booking.bookingStartedTime
    ? new Date(booking.bookingStartedTime).toLocaleString()
    : "--";

  // status
  const statusEl = document.getElementById("cbStatus");

  const status = booking.currentStatus || "--";

  statusEl.innerText = status.replaceAll("_", " ");

  statusEl.className = "booking-status status-" + status;

  // start journey button
  const journeyBtn = document.getElementById("startJourneyBtn");

  if (journeyBtn) {
    journeyBtn.style.display =
      booking.currentStatus === "BOOKED" ? "inline-block" : "none";
  }

  // payment button
  const payBtn = document.getElementById("payNowBtn");

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

  // OTP logic
  const otpBtn = document.getElementById("generateOtpBtn");
  const otpCard = document.getElementById("otpCard");
  const otpValue = document.getElementById("bookingOtp");

  if (
    booking.currentStatus === "ON_THE_WAY" ||
    booking.currentStatus === "WAITING" ||
    booking.currentStatus === "REPAIRING"
  ) {
    if (booking.otp && booking.otpExpiry) {
      otpCard.style.display = "block";

      otpValue.innerText = booking.otp;

      otpBtn.style.display = "none";

      startOtpCountdown(booking.otpExpiry);
    } else {
      otpCard.style.display = "none";

      otpBtn.style.display = "inline-block";
    }
  } else {
    otpBtn.style.display = "none";

    otpCard.style.display = "none";
  }

  updateBookingCounter();
}

function resetOtpUI() {
  const otpCard = document.getElementById("otpCard");
  const otpValue = document.getElementById("bookingOtp");
  const timer = document.getElementById("otpTimer");

  if (otpTimerInterval) clearInterval(otpTimerInterval);

  otpCard.style.display = "none";

  otpValue.innerText = "------";

  timer.innerText = "--:--";
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

    loadActiveBookings();
  } catch (err) {
    console.log("Start journey failed");
  }
}

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
      alert("Payment initiation failed: " + text);

      return;
    }

    const payment = JSON.parse(text);

    openRazorpayCheckout(payment);
  } catch (err) {
    console.error("Payment initiation error:", err);
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

    const result = await verifyResponse.json();

    alert(result.message);

    loadActiveBookings();
  } catch (err) {
    console.error("Verification error:", err);
  }
}

async function generateBookingOtp() {
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

    if (!response.ok) {
      const msg = await response.text();

      alert(msg);

      return;
    }

    await loadActiveBookings();
  } catch (err) {
    console.error("OTP generation failed", err);
  }
}

function startOtpCountdown(expiryTime) {
  const timerEl = document.getElementById("otpTimer");
  const regenBtn = document.getElementById("regenOtpBtn");

  if (otpTimerInterval) clearInterval(otpTimerInterval);

  const expiry = new Date(expiryTime).getTime();

  otpTimerInterval = setInterval(() => {
    const now = new Date().getTime();

    const diff = expiry - now;

    if (diff <= 0) {
      clearInterval(otpTimerInterval);

      timerEl.innerText = "Expired";

      regenBtn.style.display = "inline-block";

      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    timerEl.innerText =
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }, 1000);
}

function copyOtp() {
  const otp = document.getElementById("bookingOtp").innerText;

  navigator.clipboard.writeText(otp);

  const btn = document.getElementById("copyOtpBtn");

  btn.innerText = "Copied";

  setTimeout(() => {
    btn.innerText = "Copy";
  }, 1500);
}
function formatEnum(value) {
  if (!value) return "--";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
