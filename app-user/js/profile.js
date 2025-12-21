document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  fetchProfileInfo();
});

function fetchProfileInfo() {
  fetch("http://localhost:8080/api/users/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to load profile");
      }
      return res.json();
    })
    .then((data) => {
      document.getElementById("name").textContent = data.name;
      document.getElementById("username").textContent = data.username;
      document.getElementById("email").textContent = data.email;
      document.getElementById("rating").textContent = data.rating;
    })
    .catch((err) => {
      document.getElementById("message").textContent = err.message;
    });
}
