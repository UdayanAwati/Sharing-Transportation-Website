document.addEventListener('DOMContentLoaded', async () => {
    const ridesContainer = document.getElementById('ridesContainer');
    const loading = document.getElementById('loading');
    const noRides = document.getElementById('noRides');

    // 🧠 Read searchData from sessionStorage
    const searchData = JSON.parse(sessionStorage.getItem('searchData'));

    if (!searchData) {
        alert("No search data found in session! Please search again.");
        window.location.href = "main.html"; // or wherever your search page is
        return;
    }

    try {
        loading.style.display = 'block'; // Show loading

        // 🛜 POST request to /api/searchride (NOT /match anymore)
        const response = await fetch('http://127.0.0.1:5000/api/searchride', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(searchData)
        });

        const data = await response.json();

        loading.style.display = 'none'; // Hide loading

        if (data.matches.length === 0) {
            noRides.style.display = 'block'; // No matches
            return;
        }

        // Display matched rides
        data.matches.forEach(ride => {
            const card = document.createElement('div');
            card.className = 'ride-card';

            let rideType = ride.type === 'publish' ? 'Shared Ride (PublishRide)' : 'Live Ride (LivePublishRide)';

            card.innerHTML = `
                <h3>${rideType}</h3>
                <p><strong>Pickup:</strong> ${ride.startLocation?.name || 'Live Driver Location'}</p>
                <p><strong>Destination:</strong> ${ride.destination?.name || 'Not specified'}</p>
                <p><strong>Vehicle Type:</strong> ${ride.vehicleType}</p>
                <p><strong>Cargo Type:</strong> ${ride.cargoType}</p>
                <p><strong>Available Space:</strong> ${ride.space || ride.vehicleSpace} m³</p>
                <p><strong>Date:</strong> ${ride.date ? new Date(ride.date).toLocaleDateString() : 'Live Available'}</p>
                <div class="button-container">
                    <button class="book-now-btn" data-ride-id="${ride._id}">Book Now</button>
                </div>
            `;

            ridesContainer.appendChild(card);
        });

    } catch (error) {
        console.error('❌ Error fetching rides:', error);
        loading.style.display = 'none';
        alert('❌ Error fetching matching rides.');
    }
});

// Optional: Book Now button functionality
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('book-now-btn')) {
        const rideId = e.target.getAttribute('data-ride-id');
        console.log(`Booking ride with ID: ${rideId}`);
        // You can add functionality to handle the booking logic here
        alert('Booking functionality not implemented yet.');
    }
});

// document.addEventListener("DOMContentLoaded", async () => {
//   const searchInput = JSON.parse(sessionStorage.getItem("searchInput"));
//   console.log(searchInput);  // Check if search input is properly stored in sessionStorage

//   // If search input is invalid or missing essential fields (e.g., date), fallback to showing all rides
//   if (!searchInput || !searchInput.date) {
//     alert("Search input is incomplete. Showing all available rides.");
//     displayAllRides();  // Function to show all available rides
//     return;
//   }

//   // If search input is valid, fetch matching rides
//   try {
//     const matchingRides = await fetchMatchingRides(searchInput);
//     if (matchingRides && matchingRides.length > 0) {
//       displayMatchingRides(matchingRides);
//     } else {
//       alert("No matching rides found.");
//       displayAllRides();  // If no matching rides, fallback to showing all rides
//     }
//   } catch (err) {
//     console.error("Error fetching matching rides:", err);
//     alert("Something went wrong while fetching rides.");
//   }

//   const showAllRidesButton = document.getElementById("show-all-rides-btn");
//   showAllRidesButton.addEventListener("click", displayAllRides);
// });
// // Function to fetch matching rides based on the search input
// async function fetchMatchingRides(searchInput) {
//   try {
//     const token = document.cookie.split('=')[1]; // Get token from cookies (if needed, else cookies will be sent automatically)

//     const response = await fetch("http://127.0.0.1:5000/api/publish/searchride", {

//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include", // Ensures cookies (including token) are sent with the request
//       body: JSON.stringify(searchInput), // Send search input as JSON
//     });

//     if (!response.ok) {
//       throw new Error("Error fetching matching rides");
//     }

//     const data = await response.json();
//     console.log("Fetched matching rides:", data); // Log the fetched rides for debugging
//     return data;  // Return the fetched matching rides
//   } catch (err) {
//     console.error("Error:", err);
//     return [];  // Return an empty array in case of error
//   }
// }

// // Function to display matching rides in the UI
// function displayMatchingRides(rides) {
//   const matchingRidesContainer = document.getElementById("matching-rides");
//   matchingRidesContainer.innerHTML = "";  // Clear previous content

//   rides.forEach(ride => {
//     const rideElement = document.createElement("div");
//     rideElement.classList.add("ride-item");
//     rideElement.innerHTML = `
//       <h3>From: ${ride.startLocation} to ${ride.destination}</h3>
//       <p>Date: ${ride.date}</p>
//       <p>Vehicle: ${ride.vehicleType}</p>
//       <p>Cargo: ${ride.cargoType}</p>
//       <p>Space Available: ${ride.space}</p>
//     `;
//     matchingRidesContainer.appendChild(rideElement);
//   });
// }

// // Function to display all available rides in the UI
// async function displayAllRides() {
//   try {
//     const response = await fetch("http://127.0.0.1:5000/api/publish/allrides", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: "include",  // Ensure cookies are sent with the request
//     });

//     if (!response.ok) {
//       throw new Error("Error fetching all rides");
//     }

//     const data = await response.json();
//     if (data && data.length > 0) {
//       const allRidesContainer = document.getElementById("all-rides");
//       allRidesContainer.innerHTML = "";  // Clear previous content
//       data.forEach(ride => {
//         const rideElement = document.createElement("div");
//         rideElement.classList.add("ride-item");
//         rideElement.innerHTML = `
//           <h3>From: ${ride.startLocation} to ${ride.destination}</h3>
//           <p>Date: ${ride.date}</p>
//           <p>Vehicle: ${ride.vehicleType}</p>
//           <p>Cargo: ${ride.cargoType}</p>
//           <p>Space Available: ${ride.space}</p>
//         `;
//         allRidesContainer.appendChild(rideElement);
//       });
//     } else {
//       alert("No rides available.");
//     }
//   } catch (err) {
//     console.error("Error fetching all rides:", err);
//     alert("Something went wrong while fetching all rides.");
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const matchingRides = JSON.parse(localStorage.getItem("matchingRides"));

//   const ridesContainer = document.getElementById("ridesContainer");

//   if (matchingRides && matchingRides.length > 0) {
//       matchingRides.forEach(ride => {
//           const rideElement = document.createElement("div");
//           rideElement.classList.add("ride-card");

//           rideElement.innerHTML = `
//               <h3>Pickup: ${ride.startLocation?.name || ride.driverLocation?.name}</h3>
//               <h4>Delivery: ${ride.destination?.name || "N/A"}</h4>
//               <p>Cargo Type: ${ride.cargoType}</p>
//               <p>Available Space: ${ride.space} cubic meters</p>
//           `;

//           ridesContainer.appendChild(rideElement);
//       });
//   } else {
//       ridesContainer.innerHTML = "<p>No matching rides found.</p>";
//   }
// });
// listofrides.js

