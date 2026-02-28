document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // HARD GUARD
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  let username = localStorage.getItem("username") || "User";

  // Remove prefixes
  username = username.replace("appuser_", "").replace("workshop_", "");

  // Capitalize first letter
  username = username.charAt(0).toUpperCase() + username.slice(1);

  document.getElementById("userName").innerText = username;
});
function logout() {
  localStorage.clear();
  window.location.href = "appuser-index.html";
}
function goToAddAddress() {
  window.location.href = "appuser-add-address.html";
}
function goToRequestBooking() {
  window.location.href = "appuser-request-booking.html";
}
