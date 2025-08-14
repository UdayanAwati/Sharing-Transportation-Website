// On DOM load, verify the logged-in user and fill the email field
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/auth/user", {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("User not authenticated. Please login.");
        }

        const data = await response.json();
        document.getElementById("userEmail").value = data.email;
    } catch (err) {
        alert(err.message);
        window.location.href = "login.html";
    }
});

// Preview the uploaded image before submission
function previewImage() {
    const file = document.getElementById('cargo-image').files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const preview = document.getElementById('image-preview');
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

const apiKey = "5b3ce3597851110001cf62480d9850cb98984d77adc32aa9ea3e5323";

// Initialize map
let map = L.map("map").setView([18.5204, 73.8567], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let pickup = null;
let delivery = null;
let markers = [];

// 📍 Map Click to select pickup and delivery
map.on("click", async (e) => {
    const latlng = e.latlng;

    if (!pickup) {
        pickup = latlng;
        const placeName = await getPlaceName(latlng);
        document.getElementById("pickup").value = `${placeName}`;
        document.getElementById("pickupLat").value = latlng.lat;
        document.getElementById("pickupLng").value = latlng.lng;
        markers.push(L.marker(latlng).addTo(map).bindPopup("Pickup").openPopup());
    } else if (!delivery) {
        delivery = latlng;
        const placeName = await getPlaceName(latlng);
        document.getElementById("delivery").value = `${placeName}`;
        document.getElementById("deliveryLat").value = latlng.lat;
        document.getElementById("deliveryLng").value = latlng.lng;
        markers.push(L.marker(latlng).addTo(map).bindPopup("Delivery").openPopup());
    } else {
        alert("Pickup and Delivery already selected! Reset if you want to change.");
    }
});

// 📍 Reverse Geocode
async function getPlaceName(latlng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`);
        const data = await response.json();
        return data.display_name || `${latlng.lat}, ${latlng.lng}`;
    } catch (err) {
        console.error("Geocoding error:", err);
        return `${latlng.lat}, ${latlng.lng}`;
    }
}

// 🧹 Reset Button
document.getElementById("resetButton").addEventListener("click", () => {
    pickup = null;
    delivery = null;
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    document.getElementById("pickup").value = "";
    document.getElementById("pickupLat").value = "";
    document.getElementById("pickupLng").value = "";
    document.getElementById("delivery").value = "";
    document.getElementById("deliveryLat").value = "";
    document.getElementById("deliveryLng").value = "";
});

// 📦 Search Form Submit
document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    if (!pickup || !delivery) {
        alert("Please select pickup and delivery locations on the map!");
        return;
    }

    const date = document.getElementById("date").value;
    const cargoType = document.getElementById("cargo-type").value;
    const cargoSpaceRequired = document.getElementById("cargo").value;
    const cargoImage = document.getElementById("cargo-image").files[0];

    // const formData = new FormData();
    // formData.append("pickupLocation[name]", document.getElementById("pickup").value);
    // formData.append("pickupLocation[coordinates][lat]", pickup.lat);
    // formData.append("pickupLocation[coordinates][lng]", pickup.lng);
    // formData.append("deliveryLocation[name]", document.getElementById("delivery").value);
    // formData.append("deliveryLocation[coordinates][lat]", delivery.lat);
    // formData.append("deliveryLocation[coordinates][lng]", delivery.lng);
    // formData.append("date", date);
    // formData.append("cargoType", cargoType);
    // formData.append("cargoSpaceRequired", cargoSpaceRequired);
    // if (cargoImage) {
    //     formData.append("image", cargoImage);
    // }
    const formData = new FormData();
    formData.append("pickupLocation[name]", document.getElementById("pickup").value);
    formData.append("pickupLocation[location][type]", "Point");
    formData.append("pickupLocation[location][coordinates][]", pickup.lng);
    formData.append("pickupLocation[location][coordinates][]", pickup.lat);

    formData.append("deliveryLocation[name]", document.getElementById("delivery").value);
    formData.append("deliveryLocation[location][type]", "Point");
    formData.append("deliveryLocation[location][coordinates][]", delivery.lng);
    formData.append("deliveryLocation[location][coordinates][]", delivery.lat);

    formData.append("date", date);
    formData.append("cargoType", cargoType);
    formData.append("cargoSpaceRequired", cargoSpaceRequired);

    if (cargoImage) {
        formData.append("image", cargoImage);
    }


    try {
        const response = await fetch("http://127.0.0.1:5000/api/search/searchride", {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        

        const result = await response.json();
        console.log(result); 

        if (response.ok) {
             // ✅ Save all important search data including coordinates
             const searchData = {
                pickupLocation: {
                    name: document.getElementById("pickup").value,
                    coordinates: {
                        lat: pickup.lat,
                        lng: pickup.lng
                    }
                },
                deliveryLocation: {
                    name: document.getElementById("delivery").value,
                    coordinates: {
                        lat: delivery.lat,
                        lng: delivery.lng
                    }
                },
                date: date,
                cargoType: cargoType,
                cargoSpaceRequired: cargoSpaceRequired
            };
            sessionStorage.setItem("searchData", JSON.stringify(searchData));

            alert("✅ Search submitted successfully!");
            console.log("Redirecting to listofrides.html");
            setTimeout(() => {
                window.location.href = "listofrides.html";
            }, 0);
        }
         else {
            alert(result.message || "❌ Failed to submit search.");
        }
    } catch (err) {
        console.error("❌ Error during search submission:", err);
        alert("❌ Server error while submitting search.");
    }
});
