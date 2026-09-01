import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


console.log("My JavaScript is connected!");


// ===============================
// FIREBASE
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyDc_S37EbeMpNagPOUH7PsKbLmwwmRjLjw",
    authDomain: "pothole-reporter-d3106.firebaseapp.com",
    projectId: "pothole-reporter-d3106",
    storageBucket: "pothole-reporter-d3106.firebasestorage.app",
    messagingSenderId: "1066650937630",
    appId: "1:1066650937630:web:6cb5af118b5529ab32c10f",
    measurementId: "G-5HKX1REJ9J"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;


// Check who is logged in

onAuthStateChanged(auth, function(user) {

    currentUser = user;

    if (user) {
        console.log("Logged in as:", user.email);
    } else {
        console.log("No user is logged in.");
    }

});


// ===============================
// REPORT PAGE
// ===============================

const form = document.getElementById("reportForm");
const locationInput = document.getElementById("location");
const descriptionInput = document.getElementById("description");
const photoInput = document.getElementById("photo");
const getLocationButton = document.getElementById("getLocation");


// ===============================
// MAP
// ===============================

const map = L.map("map").setView([17.3850, 78.4867], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let marker;


map.on("click", function(event) {

    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([latitude, longitude]).addTo(map);

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        .then(response => response.json())
        .then(data => {

            locationInput.value = data.display_name;

        });

});


// ===============================
// GET LOCATION
// ===============================

getLocationButton.addEventListener("click", function() {

    navigator.geolocation.getCurrentPosition(function(position) {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        locationInput.value = `${latitude}, ${longitude}`;

    });

});


// ===============================
// SUBMIT REPORT
// ===============================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    console.log("FORM SUBMITTED!");

    const notification = document.getElementById("notification");

    const location = locationInput.value;
    const description = descriptionInput.value;
    const photo = photoInput.files[0];


    if (!photo) {

        alert("Please select a photo before submitting.");
        return;

    }


    // Make sure the user is logged in

    if (!currentUser) {

        alert("Please login before submitting a pothole report.");
        return;

    }


    const reader = new FileReader();


    reader.onload = async function() {

        try {

            // Save report to Firestore

            await addDoc(collection(db, "potholeReports"), {

                userId: currentUser.uid,

                userEmail: currentUser.email,

                location: location,

                description: description,

                photo: reader.result,

                status: "Pending",

                createdAt: new Date()

            });


            console.log("Report saved to Firestore!");


            // Show notification

            notification.style.display = "block";

            setTimeout(function() {

                notification.style.display = "none";

            }, 3000);


            // Clear form

            form.reset();


        } catch (error) {

            console.error("Error saving report:", error);

            alert("There was a problem saving your report.");

        }

    };


    reader.readAsDataURL(photo);

});   // ← closes Submit Report


// ===============================
// AUTHORIZED PERSONNEL BUTTON
// ===============================

onAuthStateChanged(auth, async function(user) {

    console.log("Checking authority access...");

    if (!user) {
        console.log("No user logged in.");
        return;
    }

    console.log("Logged-in UID:", user.uid);
    console.log("Logged-in email:", user.email);

    try {

        const userDocument = await getDoc(
            doc(db, "users", user.uid)
        );

        console.log("User document exists:", userDocument.exists());

        if (!userDocument.exists()) {
            console.log("❌ No users document found for this UID.");
            return;
        }

        const userData = userDocument.data();

        console.log("Firestore user data:", userData);
        console.log("Role:", userData.role);

        if (userData.role === "authority") {

            console.log("✅ AUTHORITY CONFIRMED!");

            const nav = document.getElementById("mainNav");

            if (nav) {

                const authorityLink = document.createElement("a");

                authorityLink.href = "authority.html";

                authorityLink.textContent =
                    "🏛️ Authorized Personnel";

                nav.appendChild(authorityLink);

                console.log("✅ Authority button added!");

            } else {

                console.log("❌ mainNav was not found.");

            }

        } else {

            console.log("❌ User is not an authority.");

        }

    } catch (error) {

        console.error("❌ Authority check failed:", error);

    }

});