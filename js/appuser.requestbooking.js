let vehicleMap = {};

// Page Load
document.addEventListener("DOMContentLoaded", function () {
  loadVehicles();

  document
    .getElementById("vehicleDropdown")
    .addEventListener("change", loadServicesForVehicle);
  document
    .getElementById("serviceDropdown")
    .addEventListener("change", fetchPrice);
  document.getElementById("serviceDropdown").addEventListener("change", () => {
    fetchPrice();
    loadWorkshops();
  });
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
function requestBooking() {
  alert("Request Booking clicked");
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

  if (!vehicleId || !serviceType) return;

  const vehicleType = vehicleMap[vehicleId];

  try {
    const response = await fetch("http://localhost:8080/api/users/getPrice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        vehicleType: vehicleType,
        serviceType: serviceType,
      }),
    });

    const price = await response.json();

    document.getElementById("priceSection").style.display = "block";
    document.getElementById("baseAmount").innerText = price.baseAmount;
    document.getElementById("premiumAmount").innerText = price.premiumAmount;
  } catch (err) {
    console.log("Price fetch failed");
  }
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
      option.value = w.id;
      option.text = w.workshopName;

      dropdown.appendChild(option);
    });
  } catch (err) {
    console.log("Workshop load failed");
  }
}
