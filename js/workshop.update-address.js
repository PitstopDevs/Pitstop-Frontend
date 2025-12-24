document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }
});

/* ================= USE CURRENT LOCATION ================= */

function useCurrentLocation() {
  if (!navigator.geolocation) {
    showMessage("Geolocation not supported", false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      sendAddressToBackend(position.coords.latitude, position.coords.longitude);
    },
    () => {
      showMessage("Location permission denied", false);
    }
  );
}

/* ================= BACKEND CALL ================= */

function sendAddressToBackend(latitude, longitude) {
  fetch("http://localhost:8080/api/workshops/update-address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.json(); // AddressResponse
    })
    .then((addressResponse) => {
      // ✅ ONLY THIS MATTERS
      document.getElementById("currentAddress").textContent =
        addressResponse.formattedAddress;

      showMessage("Address updated successfully", true);
    })
    .catch((err) => {
      showMessage(err.message, false);
    });
}

/* ================= UI ================= */

function showMessage(msg, success) {
  const p = document.getElementById("message");
  p.textContent = msg;
  p.style.color = success ? "green" : "red";
}
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "workshop-index.html";
    return;
  }

  fetchCurrentAddress(); // 🔥 THIS WAS MISSING
});

function fetchCurrentAddress() {
  fetch("http://localhost:8080/api/workshops/getAddress", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((data) => {
      if (data && data.formattedAddress) {
        document.getElementById("currentAddress").textContent =
          data.formattedAddress;
      }
    })
    .catch(() => {});
}
