document.addEventListener("DOMContentLoaded", () => {
    const userButton = document.getElementById("user-button");
    const dropdown = document.getElementById("user-dropdown");

    // Show/hide dropdown when user icon is clicked
    userButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent closing immediately
        dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
    });

    // Hide dropdown if clicked outside
    document.addEventListener("click", () => {
        dropdown.style.display = "none";
    });

    // Keep dropdown open if clicked inside
    dropdown.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Redirect to pages when clicked
    const loginLink = dropdown.querySelector('a[href="login.html"]');
    const signupLink = dropdown.querySelector('a[href="signup.html"]');

    loginLink.addEventListener("click", () => {
        window.location.href = "login.html";
    });

    signupLink.addEventListener("click", () => {
        window.location.href = "signup.html";
    });
});
