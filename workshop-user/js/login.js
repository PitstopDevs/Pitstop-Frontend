function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8080/api/home/login/workshop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then((data) => {
      localStorage.setItem("workshopToken", data.token);
      localStorage.setItem("workshopUsername", data.username);
      window.location.href = "dashboard.html";
    })
    .catch((err) => {
      document.getElementById("message").innerText = err.message;
    });
}
