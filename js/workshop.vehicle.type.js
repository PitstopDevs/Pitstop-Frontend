document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }
});

function addVehicleType() {
  const vehicleType = document.getElementById("vehicleType").value;
  const msg = document.getElementById("message");

  if (!vehicleType) {
    msg.textContent = "Please select a vehicle type";
    msg.style.color = "red";
    return;
  }

  fetch("http://localhost:8080/api/workshops/addWorkshopVehicleType", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({
      workshopVehicleType: vehicleType,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((t) => {
          throw new Error(t);
        });
      }
      return res.text();
    })
    .then((msgText) => {
      alert(msgText); // ✅ success popup
      msg.textContent = "";
    })
    .catch((err) => {
      alert(err.message); // ❌ error popup
    });
}
