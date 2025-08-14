document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            await fetch("http://127.0.0.1:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            alert("Logged out successfully!");
            window.location.href = "login.html";
        });
    }
});
