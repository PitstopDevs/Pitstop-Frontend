function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
