document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "appuser-index.html";
    return;
  }

  const btn = document.getElementById("useLocationBtn");
  if (btn) {
    btn.addEventListener("click", handleUseLocation);
  }

  // Load saved addresses on page load
  fetchSavedAddresses();
});

/* ===================== ADD ADDRESS ===================== */

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
    },
  );
}

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
    .then(() => {
      showMessage("Address added successfully", true);
      fetchSavedAddresses(); // refresh list
    })
    .catch((err) => {
      showMessage(err.message, false);
      console.error(err);
    });
}

/* ===================== FETCH ADDRESSES ===================== */

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

/* ===================== UI RENDERING ===================== */

function renderAddressList(addresses) {
  const list = document.getElementById("addressList");

  if (!list) return;

  list.innerHTML = "";

  addresses.forEach((addr) => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    const text = document.createElement("span");
    text.textContent = addr.formattedAddress;
    li.appendChild(text);

    // 🔥 DEFAULT badge OR button
    if (addr.default === true) {
      const badge = document.createElement("span");
      badge.textContent = " Default";
      badge.style.color = "green";
      badge.style.marginLeft = "8px";
      badge.style.fontWeight = "bold";
      li.appendChild(badge);
    } else {
      const btn = document.createElement("button");
      btn.textContent = "Set as default";
      btn.classList.add("set-default-btn");

      btn.addEventListener("click", () => {
        confirmSetDefault(addr.id);
      });

      li.appendChild(btn);
    }

    list.appendChild(li);
  });
}
function confirmSetDefault(addressId) {
  const confirmed = window.confirm(
    "Are you sure you want to set this address as default?",
  );

  if (!confirmed) return;

  changeDefaultAddress(addressId);
}

function changeDefaultAddress(addressId) {
  fetch("http://localhost:8080/api/users/change-default-address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ id: addressId }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.error || "Failed to change default address");
        });
      }
      return res.text();
    })
    .then(() => {
      showMessage("Default address updated", true);

      // 🔥 THIS IS THE FIX
      fetchSavedAddresses();
    })
    .catch((err) => {
      showMessage(err.message, false);
    });
}

/* ===================== COMMON ===================== */

function showMessage(message, success) {
  const div = document.getElementById("message");
  div.textContent = message;
  div.style.color = success ? "green" : "red";
}
