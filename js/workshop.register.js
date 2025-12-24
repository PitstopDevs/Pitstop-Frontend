function register() {
  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8080/api/home/registerWorkshop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, email, password }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Registration failed");
      return res.text();
    })
    .then(() => {
      alert("Registration successful");
      window.location.href = "workshop-index.html";
    })
    .catch((err) => alert(err.message));
}
