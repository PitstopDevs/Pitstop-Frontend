document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetchProfile();
});

function fetchProfile() {
  fetch("http://localhost:8080/api/workshops/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("workshopToken"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    })
    .then((data) => {
      document.getElementById("name").textContent = data.name;
      document.getElementById("username").textContent = data.username;
      document.getElementById("email").textContent = data.email;
      document.getElementById("rating").textContent =
        data.rating != null ? data.rating : "Not rated yet";
    })
    .catch((err) => {
      document.getElementById("message").textContent = err.message;
    });
}
