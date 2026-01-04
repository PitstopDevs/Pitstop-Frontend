document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }
});

function addServiceType() {
  const serviceType = document.getElementById("serviceType").value;

  if (!serviceType) {
    alert("Please select a service type");
    return;
  }

  fetch("http://localhost:8080/api/workshops/addWorkshopService", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({
      workshopServiceType: serviceType,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.text();
    })
    .then((msg) => {
      alert(msg); // ✅ success popup
      document.getElementById("serviceType").value = "";
    })
    .catch((err) => {
      alert(err.message);
    });
}
function deleteServiceType() {
  const serviceType = document.getElementById("serviceType").value;

  if (!serviceType) {
    alert("Please select a service to delete");
    return;
  }

  const confirmed = confirm("Are you sure you want to remove this service?");

  if (!confirmed) return;

  fetch("http://localhost:8080/api/workshops/removeWorkshopService", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
    body: JSON.stringify({
      workshopServiceType: serviceType,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.text();
    })
    .then((msg) => {
      alert(msg);
      document.getElementById("serviceType").value = "";
    })
    .catch((err) => {
      alert(err.message);
    });
}
