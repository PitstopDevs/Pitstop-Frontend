function register() {
  const body = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  fetch("http://localhost:8080/api/home/registerAppUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      showMessage("Registration successful. Redirecting...", true);
      setTimeout(() => (window.location.href = "index.html"), 1500);
    })
    .catch(() => showMessage("Registration failed", false));
}

function showMessage(msg, success) {
  const div = document.getElementById("message");
  div.className = "alert " + (success ? "success" : "error");
  div.innerText = msg;
}
