function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8080/api/home/login/app-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        showMessage("Invalid credentials", false);
      }
    })
    .catch(() => showMessage("Server error", false));
}

function showMessage(msg, success) {
  const div = document.getElementById("message");
  div.className = "alert " + (success ? "success" : "error");
  div.innerText = msg;
}
