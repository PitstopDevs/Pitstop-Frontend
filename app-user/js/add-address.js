document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const btn = document.getElementById("useLocationBtn");
  if (btn) {
    btn.addEventListener("click", handleUseLocation);
  }

  // ✅ load saved addresses on page load
  fetchSavedAddresses();
});

/* Entry point when user clicks button */
function handleUseLocation() {
  if (!navigator.geolocation) {
    showMessage("Geolocation not supported by this browser", false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      sendAddressToBackend(latitude, longitude);
    },
    (error) => {
      showMessage("Location permission denied", false);
      console.error("Geolocation error:", error);
    }
  );
}

/* Call backend to add address */
function sendAddressToBackend(latitude, longitude) {
  fetch("http://localhost:8080/api/users/add-address", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ latitude, longitude }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.message || "Failed to add address");
        });
      }
      return res.json();
    })
    .then((data) => {
      showMessage("Address added successfully", true);

      // ✅ add only ONE new address to UI
      if (data.formattedAddress) {
        appendAddress(data.formattedAddress);
      }
    })
    .catch((err) => {
      showMessage(err.message, false);
      console.error(err);
    });
}

/* ✅ Fetch all saved addresses */
function fetchSavedAddresses() {
  fetch("http://localhost:8080/api/users/savedAddress", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch addresses");
      }
      return res.json();
    })
    .then((addresses) => {
      renderAddressList(addresses);
    })
    .catch((err) => {
      console.error(err);
    });
}

/* UI helpers */

/* render FULL list (array) */
function renderAddressList(addresses) {
  const list = document.getElementById("addressList");

  if (!list) {
    console.error("addressList element not found");
    return;
  }

  list.innerHTML = "";

  addresses.forEach((addr) => {
    const li = document.createElement("li");
    li.textContent = addr.formattedAddress;
    list.appendChild(li);
  });
}

/* append SINGLE address */
function appendAddress(address) {
  const list = document.getElementById("addressList");
  if (!list) return;

  // prevent duplicate UI entries
  const exists = Array.from(list.children).some(
    (li) => li.textContent === address
  );
  if (exists) return;

  const li = document.createElement("li");
  li.textContent = address;
  list.appendChild(li);
}

function showMessage(message, success) {
  const div = document.getElementById("message");
  div.textContent = message;
  div.style.color = success ? "green" : "red";
}
