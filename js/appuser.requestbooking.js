let vehicleMap = {};

// Page Load
document.addEventListener("DOMContentLoaded", function () {
  loadVehicles();

  document
    .getElementById("vehicleDropdown")
    .addEventListener("change", loadServicesForVehicle);

  document
    .getElementById("serviceDropdown")
    .addEventListener("change", async () => {
      // Step 1 → Load workshops
      await loadWorkshops();

      // Step 2 → Call price WITHOUT workshopId
      fetchPrice();
    });

  document
    .getElementById("workshopDropdown")
    .addEventListener("change", fetchPrice);
});
async function loadVehicles() {
  const dropdown = document.getElementById("vehicleDropdown");

  try {
    const response = await fetch(
      "http://localhost:8080/api/users/getAllVehicles",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    const vehicles = await response.json();

    dropdown.innerHTML = `<option value="">Select Vehicle</option>`;

    vehicles.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.id;
      option.text = v.brand + " " + v.model;

      dropdown.appendChild(option);

      // Store vehicleType for later use
      vehicleMap[v.id] = v.vehicleType;
    });
  } catch (err) {
    console.log("Vehicle load failed");
  }
}
async function loadServicesForVehicle() {
  const vehicleId = document.getElementById("vehicleDropdown").value;
  const serviceDropdown = document.getElementById("serviceDropdown");

  if (!vehicleId) return;

  const vehicleType = vehicleMap[vehicleId];

  serviceDropdown.innerHTML = `<option>Loading...</option>`;

  try {
    const response = await fetch(
      `http://localhost:8080/api/workshops/available-services?vehicleType=${vehicleType}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    const services = await response.json();

    serviceDropdown.innerHTML = `<option value="">Select Service</option>`;

    services.forEach((service) => {
      const option = document.createElement("option");
      option.value = service;
      option.text = formatServiceName(service);

      serviceDropdown.appendChild(option);
    });
  } catch (err) {
    console.log("Service load failed");
  }
}
async function requestBooking() {
  const vehicleId = document.getElementById("vehicleDropdown").value;
  const serviceType = document.getElementById("serviceDropdown").value;
  const workshopId = document.getElementById("workshopDropdown").value;

  if (!vehicleId || !serviceType || !workshopId) {
    alert("Please select Vehicle, Service and Workshop");
    return;
  }

  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const appUserId = payload.sub;

  const requestBody = {
    appUserId: appUserId,
    workShopUserId: workshopId,
    serviceType: serviceType,
    vehicleId: vehicleId,
  };

  try {
    const response = await fetch("http://localhost:8080/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || "Booking failed");
    }

    alert("Request Booking Success!\nBooking ID: " + data.bookingId);
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to request booking");
  }
}

function addVehicle() {
  window.location.href = "appuser-add-vehicle.html";
}
function formatServiceName(service) {
  return service
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function goBack() {
  window.location.href = "appuser-dashboard.html";
}
async function fetchPrice() {
  const vehicleId = document.getElementById("vehicleDropdown").value;
  const serviceType = document.getElementById("serviceDropdown").value;
  const workshopId = document.getElementById("workshopDropdown").value;

  if (!vehicleId || !serviceType) return;

  const vehicleType = vehicleMap[vehicleId];

  const requestBody = {
    vehicleType: vehicleType,
    serviceType: serviceType,
  };

  // Add workshopId only if selected
  if (workshopId && workshopId !== "" && workshopId !== "undefined") {
    requestBody.workshopId = workshopId;
  }

  try {
    const response = await fetch("http://localhost:8080/api/users/getPrice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(requestBody),
    });

    const price = await response.json();

    updatePriceUI(price, workshopId);
  } catch (err) {
    console.log("Price fetch failed");
  }
  console.log("WorkshopId:", workshopId);
}
async function loadWorkshops() {
  const vehicleId = document.getElementById("vehicleDropdown").value;
  const serviceType = document.getElementById("serviceDropdown").value;

  if (!vehicleId || !serviceType) return;

  const vehicleType = vehicleMap[vehicleId];

  const dropdown = document.getElementById("workshopDropdown");
  dropdown.innerHTML = "<option>Loading...</option>";

  try {
    const response = await fetch(
      "http://localhost:8080/api/workshops/filterWorkshops",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          vehicleType: vehicleType,
          serviceType: serviceType,
        }),
      },
    );

    const workshops = await response.json();
    dropdown.innerHTML = `<option value="">Select Workshop</option>`;

    workshops.forEach((w) => {
      const option = document.createElement("option");
      option.value = w.workshopId;
      option.text = w.premiumWorkshop ? `${w.workshopName} ⭐` : w.workshopName;

      option.dataset.premium = w.premiumWorkshop;

      dropdown.appendChild(option);
    });
  } catch (err) {
    console.log("Workshop load failed");
  }
}
function updatePriceUI(price, workshopId) {
  document.getElementById("priceSection").style.display = "block";

  const title = document.getElementById("priceTitle");

  // Estimated vs Final Title
  if (!workshopId) {
    title.innerText = "Estimated Price";
  } else {
    title.innerText = "Final Price";
  }

  // Base price always shown
  document.getElementById("baseAmount").innerText = price.baseAmount;

  // Premium price
  if (price.premiumApplied) {
    document.getElementById("premiumAmount").innerText = price.premiumAmount;
  } else {
    document.getElementById("premiumAmount").innerText = 0;
  }

  // Final price
  document.getElementById("finalAmount").innerText = price.finalAmount;
}
