// Initialize Leaflet map
var map = L.map('map').setView([51.0447, -114.0719], 12);

// Add map tiles layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Initialize MarkerCluster
var markers = L.markerClusterGroup();

// Initialize OverlappingMarkerSpiderfier
var oms = new OverlappingMarkerSpiderfier(map);

// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle search for building permits
    document.getElementById('search-button').addEventListener('click', function() {
        // Get start date and end date from date picker
        var startDate = document.getElementById('start-date').value;
        var endDate = document.getElementById('end-date').value;

        // Convert dates to the format expected by the API
        startDate = formatDate(startDate);
        endDate = formatDate(endDate);

        // Construct API URL with date range
        var apiUrl = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate > '${startDate}' AND issueddate < '${endDate}'`;

        // Fetch data from API
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Remove existing markers from the map
                markers.clearLayers();

                // Process data and add markers to map
                data.features.forEach(feature => {
                    var coordinates = feature.geometry.coordinates;
                    var properties = feature.properties;
                    var marker = L.marker([coordinates[1], coordinates[0]])
                        .bindPopup(`
                            <strong>Issued Date:</strong> ${properties.issueddate}<br>
                            <strong>Work Class Group:</strong> ${properties.workclassgroup}<br>
                            <strong>Contractor Name:</strong> ${properties.contractorname}<br>
                            <strong>Community Name:</strong> ${properties.communityname}<br>
                            <strong>Original Address:</strong> ${properties.originaladdress}
                        `);
                    
                    // Add marker to MarkerCluster
                    markers.addLayer(marker);
                    // Add marker to OverlappingMarkerSpiderfier
                    oms.addMarker(marker);
                });

                // Add MarkerCluster to the map
                map.addLayer(markers);
            })
            .catch(error => console.error('Error fetching data:', error));
    });
});

// Helper function to format dates
function formatDate(dateString) {
    var date = new Date(dateString);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}
