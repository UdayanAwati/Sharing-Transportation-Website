
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

document.getElementById("driverInfoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("userEmail").value;
    const name = document.getElementById("driver-name").value.trim();
    const mobile = document.getElementById("mobile-number").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const experience = parseInt(document.getElementById("experience").value);
    const vehicleName = document.getElementById("vehicle-name").value.trim();
    const vehicleNumber = document.getElementById("vehicle-number").value.trim();
    const rideType = document.querySelector('input[name="rideType"]:checked').value;

    const nameRegex = /^[A-Za-z\s]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const vehicleNumberRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/i;

    if (!nameRegex.test(name)) return alert("Driver name should only contain letters.");
    if (!mobileRegex.test(mobile)) return alert("Enter a valid 10-digit mobile number.");
    if (isNaN(age) || age < 18) return alert("Driver must be at least 18 years old.");
    if (isNaN(experience) || experience < 0 || experience > (age - 18)) {
        return alert(`Experience must be between 0 and ${age - 18} years.`);
    }
    if (!vehicleNumberRegex.test(vehicleNumber)) {
        return alert("Enter a valid Indian vehicle number like MH12AB1234.");
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/api/driverinfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, mobile, age, experience, vehicleName, vehicleNumber })
        });

        const result = await res.json();

        if (res.ok) {
            if (rideType === "sharing") {
                window.location.href = "publish.html";
            } else if (rideType === "live") {
                window.location.href = "livepublish.html";
            }
        } else {
            alert(result.message || "Failed to save driver info.");
        }
    } catch (err) {
        alert("Something went wrong. Please try again.");
        console.error("Submit Error:", err);
    }
});

function goBack() {
        window.location.href = "homepage.html";
     }