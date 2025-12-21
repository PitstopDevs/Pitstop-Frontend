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
    }
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

  if (!list) {
    console.error("addressList element not found");
    return;
  }

  list.innerHTML = "";

  addresses.forEach((addr) => {
    const li = document.createElement("li");
    li.style.marginBottom = "8px";

    const text = document.createElement("span");
    text.textContent = addr.formattedAddress;
    li.appendChild(text);

    const btn = document.createElement("button");
    btn.textContent = addr.isDefault ? "Default" : "Set as default";
    btn.classList.add("set-default-btn");

    // disable button if already default
    if (addr.isDefault) {
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => {
        confirmSetDefault(addr.id); // ✅ PASS ID, NOT ADDRESS
      });
    }

    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* ===================== DEFAULT ADDRESS ===================== */

function confirmSetDefault(id) {
  const confirmed = window.confirm(
    "Are you sure you want to set this address as default?"
  );

  if (!confirmed) return;

  changeDefaultAddress(id); // ✅ ID ONLY
}

function changeDefaultAddress(id) {
  fetch("http://localhost:8080/api/users/change-default-address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ id }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg || "Failed to change default address");
        });
      }
      return res.text();
    })
    .then(() => {
      showMessage("Default address saved", true);
      fetchSavedAddresses(); // refresh from backend truth
    })
    .catch((err) => {
      showMessage(err.message, false);
      console.error(err);
    });
}

/* ===================== COMMON ===================== */

function showMessage(message, success) {
  const div = document.getElementById("message");
  div.textContent = message;
  div.style.color = success ? "green" : "red";
}
