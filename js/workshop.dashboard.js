document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("workshopToken");
  const username = localStorage.getItem("workshopUsername");

  if (!token || !username) {
    window.location.href = "workshop-index.html";
    return;
  }

  document.getElementById("workshopUsername").textContent = username;
});

function logout() {
  localStorage.removeItem("workshopToken");
  localStorage.removeItem("workshopUsername");
  window.location.href = "workshop-index.html";
}
