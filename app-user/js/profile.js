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
function enableEdit() {
  const nameSpan = document.getElementById("name");
  const currentName = nameSpan.textContent;

  const input = document.createElement("input");
  input.value = currentName;

  nameSpan.replaceWith(input);
  input.id = "nameInput";

  const btn = document.createElement("button");
  btn.textContent = "Save";
  btn.onclick = saveProfile;

  input.parentElement.appendChild(btn);
}

function saveProfile() {
  const newName = document.getElementById("nameInput").value;

  fetch("http://localhost:8080/api/users/me/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ name: newName }),
  })
    .then((res) => res.text())
    .then((msg) => {
      alert(msg);
      location.reload();
    });
}
function enableEmailEdit() {
  const emailSpan = document.getElementById("email");
  const currentEmail = emailSpan.textContent;

  const input = document.createElement("input");
  input.type = "email";
  input.value = currentEmail;
  input.id = "emailInput";

  emailSpan.replaceWith(input);

  const btn = document.createElement("button");
  btn.textContent = "Save";
  btn.onclick = saveEmail;

  input.parentElement.appendChild(btn);
}
function saveEmail() {
  const newEmail = document.getElementById("emailInput").value;

  fetch("http://localhost:8080/api/users/me/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ email: newEmail }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((msg) => {
          throw new Error(msg);
        });
      }
      return res.text();
    })
    .then((msg) => {
      alert(msg);
      location.reload();
    })
    .catch((err) => {
      alert(err.message);
    });
}
function openChangePasswordModal() {
  document.getElementById("passwordModal").classList.remove("hidden");
}

function closeChangePasswordModal() {
  document.getElementById("passwordModal").classList.add("hidden");
  document.getElementById("passwordMsg").textContent = "";
  document.getElementById("newPassword").value = "";
}

function submitChangePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  fetch("http://localhost:8080/api/users/me/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      currentPassword: currentPassword,
      newPassword: newPassword,
    }),
  })
    .then((res) => res.text())
    .then((msg) => {
      alert(msg);
    })
    .catch(() => {
      alert("Failed to change password");
    });
}

function showPasswordMessage(msg, success) {
  const p = document.getElementById("passwordMsg");
  p.textContent = msg;
  p.style.color = success ? "green" : "red";
}
