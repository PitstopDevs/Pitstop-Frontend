document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // HARD GUARD
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const name = localStorage.getItem("username") || "User";
  document.getElementById("userName").innerText = name;
  document.getElementById("userName").innerText = name;
});

function logout() {
  localStorage.clear();
  window.location.href = "appuser-index.html";
}

function goToAddAddress() {
  window.location.href = "appuser-add-address.html";
}
