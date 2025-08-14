const apiKey = "5b3ce3597851110001cf6248c873a3b685144637975f32758a1411c8";

let map = L.map("map").setView([18.5204, 73.8567], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let pickup = null;
let delivery = null;
let stops = [];
let markers = [];
let routeLayer = null;
let routeCoordinates = [];
let stopPending = false;
let totalDistanceKM = 0;
let totalDurationHrs = 0;

// 📍 Map Click
map.on("click", async (e) => {
  const latlng = e.latlng;

  if (!pickup) {
    pickup = latlng;
    const placeName = await getPlaceName(latlng);
    document.getElementById("pickup-location").value = `${placeName}, ${latlng.lat}, ${latlng.lng}`;
    markers.push(L.marker(latlng).addTo(map).bindPopup("Pickup").openPopup());
  } else if (!delivery) {
    delivery = latlng;
    const placeName = await getPlaceName(latlng);
    document.getElementById("delivery-location").value = `${placeName}, ${latlng.lat}, ${latlng.lng}`;
    markers.push(L.marker(latlng).addTo(map).bindPopup("Delivery").openPopup());
  } else if (stopPending) {
    const name = await getPlaceName(latlng);
    const stop = { name, lat: latlng.lat, lng: latlng.lng };
    stops.push(stop);
    markers.push(L.marker(latlng).addTo(map).bindPopup("Stop").openPopup());
    addStopInput(stop, stops.length - 1);
    stopPending = false;
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

// ➕ Add Stop
document.getElementById("addStopBtn").addEventListener("click", () => {
  stopPending = true;
  alert("Click on the map to choose stop location.");
});

// 🗑️ Delete Stop
function deleteStop(index) {
  stops.splice(index, 1);
  redrawMap();
}

// 🔄 Redraw Markers
function redrawMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  if (pickup) {
    markers.push(L.marker(pickup).addTo(map).bindPopup("Pickup"));
    document.getElementById("pickup-location").value = `${pickup.lat}, ${pickup.lng}`;
  }
  if (delivery) {
    markers.push(L.marker(delivery).addTo(map).bindPopup("Delivery"));
    document.getElementById("delivery-location").value = `${delivery.lat}, ${delivery.lng}`;
  }

  document.getElementById("stops-container").innerHTML = "";
  stops.forEach((stop, index) => {
    markers.push(L.marker({ lat: stop.lat, lng: stop.lng }).addTo(map).bindPopup("Stop"));
    addStopInput(stop, index);
  });
}

// ➕ Add Stop Input
function addStopInput(stop, index) {
  const div = document.createElement("div");
  div.className = "stop-item";
  div.id = `stop-${index}`;
  div.innerHTML = `
    <label>Stop ${index + 1}:
      <input type="text" value="${stop.name}" onchange="updateStop(${index}, this)">
    </label>
    <button onclick="deleteStop(${index})">❌ Delete</button>
  `;
  document.getElementById("stops-container").appendChild(div);
}

// 🔁 Update Stop
async function updateStop(index, input) {
  const name = input.value;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`);
    const data = await response.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      stops[index] = { name, lat, lng };
      redrawMap();
    } else {
      alert("Location not found.");
    }
  } catch (err) {
    console.error("Update stop error:", err);
    alert("Failed to update location.");
  }
}

// 🧹 Clear All
document.getElementById("resetButton").addEventListener("click", () => {
  pickup = null;
  delivery = null;
  stops = [];
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = null;
  routeCoordinates = [];
  totalDistanceKM = 0;
  totalDurationHrs = 0;
  document.getElementById("pickup-location").value = "";
  document.getElementById("delivery-location").value = "";
  document.getElementById("stops-container").innerHTML = "";
  document.getElementById("distance-duration-output").textContent = "";
  document.getElementById("distance").value = "";
  document.getElementById("duration").value = "";
});

// 🚀 Get Route and Distance
document.getElementById("showRouteBtn").addEventListener("click", async () => {
  if (!pickup || !delivery) return alert("Please select both pickup and delivery!");

  const coords = [
    [pickup.lng, pickup.lat],
    ...stops.map(s => [s.lng, s.lat]),
    [delivery.lng, delivery.lat]
  ];

  const body = {
    coordinates: coords,
    instructions: false,
    preference: "fastest",
  };

  try {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/geo+json",  // Request GeoJSON
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) throw new Error("Failed to fetch route");
    const data = await res.json();

    if (routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(data, {
      style: { color: "blue", weight: 4 }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

    routeCoordinates = data.features[0].geometry.coordinates.map(c => ({
      lng: c[0],
      lat: c[1],
    }));

    const summary = data.features[0].properties.summary;
    totalDistanceKM = summary.distance / 1000;
    const avgSpeed = 60;
    const timeInHours = totalDistanceKM / avgSpeed;

    totalDurationHrs = timeInHours.toFixed(2);

    // document.getElementById("distance-duration-output").textContent =
    //   `🛣️ Distance: ${totalDistanceKM.toFixed(2)} km | ⏱️ Duration: ${totalDurationHrs} hr (at 60 km/h)`;

    document.getElementById("distance").value = totalDistanceKM.toFixed(2);
    document.getElementById("duration").value = totalDurationHrs;

  } catch (err) {
    console.error("Route error:", err);
    alert("Failed to fetch route");
  }
});

// 📦 Submit Form
document.getElementById("publishForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!pickup || !delivery) {
    alert("Please select pickup and delivery!");
    return;
  }

  const departureTime = document.getElementById("start-time").value;
  const date = document.getElementById("date").value;
  const vehicleType = document.getElementById("vehicle-type").value;
  const cargoType = document.getElementById("cargo-type").value;
  const space = document.getElementById("space").value;

  const rideData = {
    pickupLocation: {
      name: document.getElementById("pickup-location").value,
      coordinates: [pickup.lng, pickup.lat]  // format as [lng, lat]
    },
    deliveryLocation: {
      name: document.getElementById("delivery-location").value,
      coordinates: [delivery.lng, delivery.lat]  // format as [lng, lat]
    },
    stops: stops.map(stop => ({
      name: stop.name,
      coordinates: [stop.lng, stop.lat]  // format as [lng, lat]
    })),
    departureTime,
    date,
    vehicleType,
    cargoType,
    space: parseFloat(space),
    totalDistance: totalDistanceKM.toFixed(2),
    totalDuration: totalDurationHrs,
    fullRoutePath: routeCoordinates
    // fullRoutePath: routeCoordinates.map(point => ({
    //   type: "Point",
    //   coordinates: [point.lng, point.lat]
    // }))    
  };

  console.log("📦 Sending Ride Data:", rideData);

  try {
    const response = await fetch("http://127.0.0.1:5000/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(rideData)
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Ride Published Successfully!");
      window.location.href = "homepage.html";
    } else {
      alert(result.message || "❌ Failed to Publish Ride");
    }
  } catch (err) {
    console.error("❌ Server Error:", err);
    alert("❌ Server error while publishing ride.");
  }
});
