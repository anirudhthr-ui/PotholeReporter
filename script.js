console.log("My JavaScript is connected!");

const form = document.getElementById("reportForm");
const locationInput = document.getElementById("location");
const descriptionInput = document.getElementById("description");
const reportsList = document.getElementById("reportsList");
const photoInput = document.getElementById("photo");
const getLocationButton = document.getElementById("getLocation");
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
getLocationButton.addEventListener("click", function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        locationInput.value = `${latitude}, ${longitude}`;
    });
});

console.log(form);

form.addEventListener("submit", function(event) {
    event.preventDefault();

    console.log("FORM SUBMITTED!");

    const location = locationInput.value;
    const description = descriptionInput.value;
    const photo = photoInput.files[0];

    form.reset();

    reportsList.innerHTML += `
        <div class="report">
            <h3>${location}</h3>
            <p>${description}</p>
            <img src="${URL.createObjectURL(photo)}" alt="Pothole photo">
            <p class="status">Status: Pending</p>
        </div>
    `;
});