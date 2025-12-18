function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showMessage("Username and password required", false);
    return;
  }

  fetch("http://localhost:8080/api/home/login/app-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then((data) => {
      console.log("Login response:", data);

      // REQUIRED
      localStorage.setItem("token", data.token);

      // OPTIONAL BUT SAFE
      const displayName = data.name || data.username || "User";
      localStorage.setItem("username", displayName);

      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      showMessage(err.message, false);
    });
}

function showMessage(msg, success) {
  const div = document.getElementById("message");
  div.className = success ? "alert success" : "alert error";
  div.innerText = msg;
}
