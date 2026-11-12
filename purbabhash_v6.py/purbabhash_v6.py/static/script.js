// ============================================================
// PURBABHASH V6
// FRONTEND JAVASCRIPT
// Flood Management Dashboard
// ============================================================


// ============================================================
// SECTION 1 — GENERAL HELPERS
// ============================================================

function getElement(id) {
    return document.getElementById(id);
}


function safeArray(value) {

    if (Array.isArray(value)) {
        return value;
    }

    if (value && Array.isArray(value.results)) {
        return value.results;
    }

    if (value && Array.isArray(value.zones)) {
        return value.zones;
    }

    if (value && Array.isArray(value.data)) {
        return value.data;
    }

    if (value && Array.isArray(value.rescue_operations)) {
        return value.rescue_operations;
    }

    return [];
}


function showError(element, message) {

    if (!element) {
        console.error(message);
        return;
    }

    element.innerHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
    `;
}


// ============================================================
// SECTION 2 — SECTION NAVIGATION
// ============================================================

function showSection(sectionId) {

    console.log("Opening section:", sectionId);

    const sections = document.querySelectorAll(".section");

    sections.forEach(function(section) {
        section.classList.remove("active");
    });


    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {

        selectedSection.classList.add("active");

        // Scroll to top of content
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } else {

        console.warn(
            "Section not found:",
            sectionId
        );
    }


    // Special actions
    if (sectionId === "map-section") {
        initializeMap();
    }

    if (sectionId === "rescue") {
        loadRescueOperations();
    }

}


// ============================================================
// SECTION 3 — INITIAL PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

    console.log("PURBABHASH frontend loaded.");

    // Dashboard is shown initially
    const dashboard = document.getElementById("dashboard");

    if (dashboard) {
        dashboard.classList.add("active");
    }


    // Close any accidental duplicate active sections
    const sections = document.querySelectorAll(".section");

    let foundActive = false;

    (sections || []).forEach(function(section) {

        if (section.classList.contains("active")) {

            if (!foundActive) {
                foundActive = true;
            } else {
                section.classList.remove("active");
            }

        }

    });

});


// ============================================================
// SECTION 4 — FLOOD PREDICTION
// ============================================================

async function runPrediction() {

    console.log("Starting flood prediction...");


    const rainfallElement =
        document.getElementById("rainfall");

    const riverLevelElement =
        document.getElementById("river-level");

    const waterRiseElement =
        document.getElementById("water-rise");

    const soilMoistureElement =
        document.getElementById("soil-moisture");

    const status =
        document.getElementById("prediction-status");


    if (!status) {

        console.error(
            "prediction-status element not found."
        );

        return;
    }


    // --------------------------------------------------------
    // Read values
    // --------------------------------------------------------

    const rainfall =
        parseFloat(
            rainfallElement ? rainfallElement.value : 0
        );

    const riverLevel =
        parseFloat(
            riverLevelElement ? riverLevelElement.value : 0
        );

    const waterRise =
        parseFloat(
            waterRiseElement ? waterRiseElement.value : 0
        );

    const soilMoisture =
        parseFloat(
            soilMoistureElement ? soilMoistureElement.value : 0
        );


    // --------------------------------------------------------
    // Validate
    // --------------------------------------------------------

    if (
        Number.isNaN(rainfall) ||
        Number.isNaN(riverLevel) ||
        Number.isNaN(waterRise) ||
        Number.isNaN(soilMoisture)
    ) {

        showError(
            status,
            "Please enter valid numerical values."
        );

        return;
    }


    // --------------------------------------------------------
    // Loading message
    // --------------------------------------------------------

    status.innerHTML = `
        <div class="prediction-result">
            <h3>Analysing Conditions...</h3>

            <p>
                PURBABHASH is processing the
                environmental parameters.
            </p>
        </div>
    `;


    // --------------------------------------------------------
    // Send data to Flask
    // --------------------------------------------------------

    try {

        const response = await fetch(
            "/api/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    rainfall: rainfall,

                    river_level: riverLevel,

                    water_rise: waterRise,

                    soil_moisture: soilMoisture

                })
            }
        );


        // ----------------------------------------------------
        // Check response
        // ----------------------------------------------------

        const text = await response.text();

        let data;

        try {

            data = JSON.parse(text);

        } catch (jsonError) {

            console.error(
                "Server returned non-JSON:",
                text
            );

            throw new Error(
                "Server returned an invalid response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Prediction request failed."
            );

        }


        console.log(
            "Prediction response:",
            data
        );


        // ----------------------------------------------------
        // Display result
        // ----------------------------------------------------

        displayPrediction(data);


    } catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        showError(
            status,
            error.message ||
            "Unable to run prediction."
        );

    }

}


// ============================================================
// SECTION 5 — DISPLAY PREDICTION
// ============================================================

function displayPrediction(data) {

    const status =
        document.getElementById("prediction-status");


    if (!status) {
        return;
    }


    // --------------------------------------------------------
    // Extract prediction
    // --------------------------------------------------------

    const prediction =
        data.prediction ||
        data.result ||
        data.risk_level ||
        data.risk ||
        "Unknown";


    // --------------------------------------------------------
    // Extract summary
    // --------------------------------------------------------

    const summary =
        data.summary ||
        {};


    const highestRisk =
        summary.highest_risk ||
        data.highest_risk ||
        prediction;


    const critical =
        summary.critical ||
        data.critical ||
        0;


    const high =
        summary.high ||
        data.high ||
        0;


    const moderate =
        summary.moderate ||
        data.moderate ||
        0;


    const low =
        summary.low ||
        data.low ||
        0;


    // --------------------------------------------------------
    // Display
    // --------------------------------------------------------

    status.innerHTML = `

        <div class="prediction-result">

            <h3>
                Analysis Complete
            </h3>


            <div class="prediction-main">

                <strong>Flood Risk:</strong>

                <span class="risk-value">
                    ${prediction}
                </span>

            </div>


            <p>

                <strong>
                    Highest Risk:
                </strong>

                ${highestRisk}

            </p>


            <p>

                <strong>
                    Critical Zones:
                </strong>

                ${critical}

            </p>


            <p>

                <strong>
                    High Risk Zones:
                </strong>

                ${high}

            </p>


            <p>

                <strong>
                    Moderate Risk Zones:
                </strong>

                ${moderate}

            </p>


            <p>

                <strong>
                    Low Risk Zones:
                </strong>

                ${low}

            </p>


        </div>

    `;


    // Update rescue table if backend supplied data
    if (data.rescue_operations) {

        updateRescueTable(
            data.rescue_operations
        );

    }
    else if (data.results) {

        updateRescueTable(
            data.results
        );

    }
    else if (data.zones) {

        updateRescueTable(
            data.zones
        );

    }

}


// ============================================================
// SECTION 6 — RISK MAP
// ============================================================

let floodMap = null;


function initializeMap() {

    const mapContainer =
        document.getElementById("map");


    if (!mapContainer) {

        console.warn(
            "Map container not found."
        );

        return;
    }


    // Don't create the map twice
    if (floodMap) {

        setTimeout(function() {

            floodMap.invalidateSize();

        }, 200);

        return;
    }


    try {

        floodMap = L.map("map").setView(
            [22.5726, 88.3639],
            11
        );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(floodMap);


        // Sample Kolkata risk zones
        addRiskMarker(
            22.5726,
            88.3639,
            "Central Kolkata",
            "High"
        );


        addRiskMarker(
            22.5958,
            88.2636,
            "Howrah",
            "Moderate"
        );


        addRiskMarker(
            22.7196,
            88.3820,
            "North Kolkata",
            "Low"
        );


        addRiskMarker(
            22.4987,
            88.3696,
            "South Kolkata",
            "High"
        );


    } catch (error) {

        console.error(
            "Map initialization failed:",
            error
        );

    }

}


function addRiskMarker(
    latitude,
    longitude,
    zoneName,
    riskLevel
) {

    if (!floodMap) {
        return;
    }


    const marker =
        L.marker(
            [latitude, longitude]
        ).addTo(floodMap);


    marker.bindPopup(`

        <strong>
            ${zoneName}
        </strong>

        <br>

        Risk Level:

        <strong>
            ${riskLevel}
        </strong>

    `);

}


// ============================================================
// SECTION 7 — LOAD RISK MAP DATA
// ============================================================

async function loadRiskMapData() {

    try {

        const response =
            await fetch("/api/risk-map");


        if (!response.ok) {

            throw new Error(
                "Could not load risk map data."
            );

        }


        const data =
            await response.json();


        console.log(
            "Risk map data:",
            data
        );


        const zones =
            safeArray(data);


        if (!zones.length) {

            console.warn(
                "No risk zones returned."
            );

            return;
        }


        if (!floodMap) {
            initializeMap();
        }


        (zones || []).forEach(function(zone) {

            if (
                zone.latitude !== undefined &&
                zone.longitude !== undefined
            ) {

                addRiskMarker(

                    zone.latitude,

                    zone.longitude,

                    zone.zone ||
                    zone.name ||
                    "Risk Zone",

                    zone.risk_level ||
                    zone.risk ||
                    "Unknown"

                );

            }

        });


    } catch (error) {

        console.warn(
            "Risk map API unavailable:",
            error
        );

    }

}


// ============================================================
// SECTION 8 — RESCUE OPERATIONS
// ============================================================

async function loadRescueOperations() {

    console.log(
        "Loading rescue operations..."
    );


    try {

        const response =
            await fetch("/api/rescue");


        if (!response.ok) {

            throw new Error(
                "Rescue API unavailable."
            );

        }


        const data =
            await response.json();


        console.log(
            "Rescue response:",
            data
        );


        updateRescueTable(data);


    } catch (error) {

        console.warn(
            "Could not load rescue data:",
            error
        );


        // Show demonstration data instead
        const demoData = [

            {
                priority: "P1",
                zone: "Zone A",
                risk_level: "Critical",
                rescue_score: 95,
                population: 1200,
                action: "Immediate evacuation",
                status: "Active"
            },

            {
                priority: "P2",
                zone: "Zone B",
                risk_level: "High",
                rescue_score: 78,
                population: 850,
                action: "Prepare rescue teams",
                status: "Standby"
            },

            {
                priority: "P3",
                zone: "Zone C",
                risk_level: "Moderate",
                rescue_score: 55,
                population: 500,
                action: "Monitor situation",
                status: "Monitoring"
            }

        ];


        updateRescueTable(
            demoData
        );

    }

}


// ============================================================
// SECTION 9 — UPDATE RESCUE TABLE
// ============================================================

function updateRescueTable(results) {

    const table =
        document.getElementById(
            "rescue-table"
        );


    if (!table) {

        console.warn(
            "Rescue table element not found."
        );

        return;
    }


    // --------------------------------------------------------
    // IMPORTANT FIX
    // Always convert response to an array
    // --------------------------------------------------------

    let rescueResults = [];


    if (Array.isArray(results)) {

        rescueResults = results;

    }

    else if (
        results &&
        Array.isArray(results.results)
    ) {

        rescueResults =
            results.results;

    }

    else if (
        results &&
        Array.isArray(results.zones)
    ) {

        rescueResults =
            results.zones;

    }

    else if (
        results &&
        Array.isArray(
            results.rescue_operations
        )
    ) {

        rescueResults =
            results.rescue_operations;

    }


    // --------------------------------------------------------
    // No results
    // --------------------------------------------------------

    if (
        rescueResults.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >

                    No rescue operations available.

                </td>

            </tr>

        `;

        return;

    }


    // --------------------------------------------------------
    // Clear old rows
    // --------------------------------------------------------

    table.innerHTML = "";


    // --------------------------------------------------------
    // Create rows
    // --------------------------------------------------------

    (rescueResults || []).forEach(function(zone) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${zone.priority || "-"}
                </td>


                <td>
                    ${
                        zone.zone ||
                        zone.name ||
                        "-"
                    }
                </td>


                <td>
                    ${
                        zone.risk_level ||

                        zone.risk ||
                        "-"
                    }
                </td>


                <td>
                    ${
                        zone.rescue_score ||
                        zone.score ||
                        "-"
                    }
                </td>


                <td>
                    ${
                        zone.population ||
                        "-"
                    }
                </td>


                <td>
                    ${
                        zone.action ||
                        zone.recommended_action ||
                        "-"
                    }
                </td>


                <td>
                    ${
                        zone.status ||
                        "Pending"
                    }
                </td>


                <td>

                    <button
                        class="small-btn"
                        onclick="selectRescueZone('${

                            String(
                                zone.zone ||
                                zone.name ||
                                "this zone"
                            ).replace(
                                /'/g,
                                "\\'"
                            )

                        }')"
                    >

                        Select

                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );

}


// ============================================================
// SECTION 10 — SELECT RESCUE ZONE
// ============================================================

function selectRescueZone(zoneName) {

    alert(
        "Rescue operation selected for " +
        zoneName
    );

}


// ============================================================
// SECTION 11 — EMERGENCY SOS
// ============================================================

function sendSOS() {

    const confirmed =
        confirm(
            "Are you sure you want to activate Emergency SOS?"
        );


    if (!confirmed) {
        return;
    }


    console.log(
        "Emergency SOS activated."
    );


    // Try backend first
    fetch(
        "/api/sos",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                emergency: true,

                timestamp:
                    new Date().toISOString()

            })

        }
    )
    .then(
        function(response) {

            return response.json()
                .catch(
                    function() {
                        return {};
                    }
                );

        }
    )
    .then(
        function(data) {

            console.log(
                "SOS response:",
                data
            );

            alert(
                "🚨 Emergency SOS activated."
            );

        }
    )
    .catch(
        function(error) {

            console.warn(
                "SOS API unavailable:",
                error
            );

            alert(
                "🚨 Emergency SOS activated locally."
            );

        }
    );

}


// ============================================================
// SECTION 12 — DASHBOARD REFRESH
// ============================================================

async function refreshDashboard() {

    console.log(
        "Refreshing dashboard..."
    );


    try {

        const response =
            await fetch(
                "/api/dashboard"
            );


        if (!response.ok) {
            throw new Error(
                "Dashboard API unavailable."
            );
        }


        const data =
            await response.json();


        console.log(
            "Dashboard data:",
            data
        );


        updateDashboardCards(
            data
        );


    } catch (error) {

        console.warn(
            "Dashboard refresh failed:",
            error
        );

    }

}


// ============================================================
// SECTION 13 — DASHBOARD CARDS
// ============================================================

function updateDashboardCards(data) {

    if (!data) {
        return;
    }


    // Critical zones
    const critical =
        document.getElementById(
            "critical-zones"
        );


    if (critical) {

        critical.textContent =
            data.critical ||
            data.critical_zones ||
            0;

    }


    // High risk zones
    const high =
        document.getElementById(
            "high-risk-zones"
        );


    if (high) {

        high.textContent =
            data.high ||
            data.high_risk_zones ||
            0;

    }


    // Moderate zones
    const moderate =
        document.getElementById(
            "moderate-zones"
        );


    if (moderate) {

        moderate.textContent =
            data.moderate ||
            data.moderate_zones ||
            0;

    }


    // Low risk zones
    const low =
        document.getElementById(
            "low-risk-zones"
        );


    if (low) {

        low.textContent =
            data.low ||
            data.low_risk_zones ||
            0;

    }

}


// ============================================================
// SECTION 14 — BUTTON EVENT BACKUP
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        // ----------------------------------------------------
        // Prediction button
        // ----------------------------------------------------

        const predictionButtons =
            document.querySelectorAll(
                "#prediction button, " +
                "#prediction .predict-btn, " +
                "button"
            );


        (predictionButtons || []).forEach(function(button) {

                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes(
                        "run ai prediction"
                    )
                ) {

                    button.addEventListener(
                        "click",
                        runPrediction
                    );

                }

            }
        );


        // ----------------------------------------------------
        // Load initial map if map section is already active
        // ----------------------------------------------------

        const mapSection =
            document.getElementById(
                "map-section"
            );


        if (
            mapSection &&
            mapSection.classList.contains(
                "active"
            )
        ) {

            initializeMap();

        }

    }
);


// ============================================================
// SECTION 15 — GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
    "error",
    function(event) {

        console.error(
            "Frontend error:",
            event.error ||
            event.message
        );

    }
);


// ============================================================
// SECTION 16 — STARTUP
// ============================================================

console.log(
    "================================================"
);

console.log(
    "PURBABHASH V6 frontend initialized."
);

console.log(
    "Flood Management Dashboard ready."
);

console.log(
    "================================================"
);