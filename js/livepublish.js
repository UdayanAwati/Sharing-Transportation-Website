let currentLat, currentLng;

// Initialize map
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Authenticate user and get email
        const response = await fetch("http://127.0.0.1:5000/api/auth/user", {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("User not authenticated. Please login.");
        }

        const data = await response.json();
        const userEmail = data.email;

        // Initialize Leaflet Map
        const map = L.map("map").setView([18.5204, 73.8567], 12); // Pune default location

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        let marker;

        map.on("click", function (e) {
            currentLat = e.latlng.lat;
            currentLng = e.latlng.lng;

            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([currentLat, currentLng]).addTo(map)
                .bindPopup("current Location")
                .openPopup();
        });

        // Handle form submission
        const form = document.getElementById("livePublishForm");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const vehicleType = document.getElementById("vehicle-type").value.trim();
            const vehicleSpace = parseFloat(document.getElementById("vehicle-space").value);
            const cargoType = document.getElementById("cargo-type").value.trim();

            if (!currentLat || !currentLng) {
                alert("Please select your pickup location on the map.");
                return;
            }

            const payload = {
                email: userEmail,
                vehicleType,
                vehicleSpace,
                cargoType,
                lat: currentLat,
                lng: currentLng
            };

            try {
                const res = await fetch("http://127.0.0.1:5000/api/livepublish", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (res.ok) {
                    document.getElementById("successMessage").style.display = "block";
                    form.reset();
                    setTimeout(() => {
                        document.getElementById("successMessage").style.display = "none";
                    }, 3000);
                } else {
                    alert(result.message || "Failed to publish live ride.");
                }
            } catch (err) {
                alert("Something went wrong while publishing.");
                console.error("Live Publish Error:", err);
            }
        });

    } catch (err) {
        alert(err.message);
        window.location.href = "login.html";
    }
});

// Back button
function goBack() {
    window.location.href = "homepage.html";
}
