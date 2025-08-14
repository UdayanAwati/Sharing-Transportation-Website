document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
  
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
      const messageElement = document.getElementById("message");
  
      if (password !== confirmPassword) {
        messageElement.innerText = "Passwords do not match!";
        return;
      }
  
      try {
        const response = await fetch("http://127.0.0.1:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
        messageElement.innerText = data.message;
  
        if (response.ok) {
          messageElement.style.color = "green";
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          messageElement.style.color = "red";
        }
      } catch (error) {
        console.error("Signup error:", error);
        messageElement.innerText = "Something went wrong. Please try again.";
      }
    });
  });
  