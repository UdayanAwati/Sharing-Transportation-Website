document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          credentials: "include",  // ✅ Required to receive and store cookies
          body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login successful");
        // ✅ Save token in sessionStorage
        sessionStorage.setItem("token", result.token); // <- Add this line
        // sessionStorage.setItem("email", email);        // Optional: store email too
    
        window.location.href = "homepage.html"; // ✅ Redirect to homepage
     // ✅ Redirect to homepage
      } else {
          alert(result.message || "Login failed");
      }
  } catch (err) {
      alert("Something went wrong");
      console.error(err);
  }
});
