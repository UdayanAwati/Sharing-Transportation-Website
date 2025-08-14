function handleLogout() {
    // Remove stored token (if using localStorage or cookies)
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");

    // Redirect to login page
    window.location.href = "index.html";
}
