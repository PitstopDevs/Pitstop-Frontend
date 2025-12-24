document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "appuser-index.html";
    return;
  }

  document
    .getElementById("vehicleType")
    .addEventListener("change", handleVehicleTypeChange);

  fetchVehicles();
});

function handleVehicleTypeChange(e) {
  const type = e.target.value;

  document.getElementById("twoWheelerForm").style.display =
    type === "TWO_WHEELER" ? "block" : "none";

  document.getElementById("fourWheelerForm").style.display =
    type === "FOUR_WHEELER" ? "block" : "none";
}

/* ================= TWO WHEELER ================= */

function submitTwoWheeler() {
  const brand = document.getElementById("twBrand").value;
  const model = document.getElementById("twModel").value;
  const engineCapacity = document.getElementById("twEngineCapacity").value;

  if (!brand || !model || !engineCapacity) {
    showMessage("All fields are required", false);
    return;
  }

  fetch("http://localhost:8080/api/users/addTwoWheeler", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      brand,
      model,
      engineCapacity: Number(engineCapacity),
    }),
  })
    .then((res) => res.json())
    .then(() => {
      showMessage("Two wheeler added successfully", true);
      fetchVehicles();
      clearTwoWheelerForm();
    })
    .catch(() => showMessage("Failed to add vehicle", false));
}

/* ================= FOUR WHEELER ================= */

function submitFourWheeler() {
  const brand = document.getElementById("fwBrand").value;
  const model = document.getElementById("fwModel").value;
  const engineCapacity = document.getElementById("fwEngineCapacity").value;

  if (!brand || !model || !engineCapacity) {
    showMessage("All fields are required", false);
    return;
  }

  fetch("http://localhost:8080/api/users/addFourWheeler", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      brand,
      model,
      engineCapacity: Number(engineCapacity),
    }),
  })
    .then((res) => res.json())
    .then(() => {
      showMessage("Four wheeler added successfully", true);
      fetchVehicles();
      clearFourWheelerForm();
    })
    .catch(() => showMessage("Failed to add vehicle", false));
}

/* ================= TABLE ================= */

function fetchVehicles() {
  fetch("http://localhost:8080/api/users/getAllVehicles", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => res.json())
    .then(renderVehicleTable);
}

function renderVehicleTable(vehicles) {
  const tbody = document.querySelector("#vehicleTable tbody");
  tbody.innerHTML = "";

  if (!vehicles || vehicles.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No vehicles added yet</td></tr>";
    return;
  }

  vehicles.forEach((v) => {
    tbody.innerHTML += `
      <tr>
        <td>${v.vehicleType.replace("_", " ")}</td>
        <td>${v.brand}</td>
        <td>${v.model}</td>
        <td>${v.engineCapacity}</td>
      </tr>
    `;
  });
}

/* ================= HELPERS ================= */

function showMessage(msg, success) {
  const p = document.getElementById("message");
  p.textContent = msg;
  p.style.color = success ? "green" : "red";
}

function clearTwoWheelerForm() {
  document.getElementById("twBrand").value = "";
  document.getElementById("twModel").value = "";
  document.getElementById("twEngineCapacity").value = "";
}

function clearFourWheelerForm() {
  document.getElementById("fwBrand").value = "";
  document.getElementById("fwModel").value = "";
  document.getElementById("fwEngineCapacity").value = "";
}
document
  .getElementById("twoWheelerForm")
  .classList.toggle("hidden", type !== "TWO_WHEELER");

document
  .getElementById("fourWheelerForm")
  .classList.toggle("hidden", type !== "FOUR_WHEELER");
