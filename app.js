// Firebase configuration with actual values
const firebaseConfig = {
    apiKey: "AIzaSyAFsyV736q3Yq7IPEh8IJh9tUJzgzod1Cc",
    authDomain: "limon-irrigation-system.firebaseapp.com",
    databaseURL: "https://limon-irrigation-system-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "limon-irrigation-system",
    storageBucket: "limon-irrigation-system.firebasestorage.app",
    messagingSenderId: "1029566605988",
    appId: "1:1029566605988:web:f090a3d4a1647464175431"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// UI elements
const autoModeSwitch = document.getElementById('autoModeSwitch');
const moistureThreshold = document.getElementById('moistureThreshold');
const thresholdValue = document.getElementById('thresholdValue');
const scheduleStart = document.getElementById('scheduleStart');
const startHourValue = document.getElementById('startHourValue');
const scheduleEnd = document.getElementById('scheduleEnd');
const endHourValue = document.getElementById('endHourValue');
const customDuration = document.getElementById('customDuration');
const durationValue = document.getElementById('durationValue');
const manualControls = document.getElementById('manualControls');

// Sensor display elements
const soil1Value = document.getElementById('soil1Value');
const soil2Value = document.getElementById('soil2Value');
const soil3Value = document.getElementById('soil3Value');
const soil1Indicator = document.getElementById('soil1Indicator');
const soil2Indicator = document.getElementById('soil2Indicator');
const soil3Indicator = document.getElementById('soil3Indicator');
const waterLevelValue = document.getElementById('waterLevelValue');
const waterPercentage = document.getElementById('waterPercentage');
const waterLevelDisplay = document.getElementById('waterLevelDisplay');

// Load config from Firebase
database.ref('/config').on('value', (snapshot) => {
    const config = snapshot.val();
    autoModeSwitch.checked = config.autoMode;
    moistureThreshold.value = config.moistureThreshold;
    thresholdValue.textContent = config.moistureThreshold;
    scheduleStart.value = config.scheduleStartHour;
    startHourValue.textContent = config.scheduleStartHour;
    scheduleEnd.value = config.scheduleEndHour;
    endHourValue.textContent = config.scheduleEndHour;
    customDuration.value = config.customDuration;
    durationValue.textContent = config.customDuration;

    toggleManualControls(config.autoMode);
});

// Load sensor data from Firebase
database.ref('/sensors/current').on('value', (snapshot) => {
    const sensors = snapshot.val();
    if (sensors) {
        soil1Value.textContent = sensors.soil1;
        soil2Value.textContent = sensors.soil2;
        soil3Value.textContent = sensors.soil3;

        // Calculate position for indicators (0-4095 range)
        const pos1 = (sensors.soil1 / 4095) * 100;
        const pos2 = (sensors.soil2 / 4095) * 100;
        const pos3 = (sensors.soil3 / 4095) * 100;

        soil1Indicator.style.left = pos1 + '%';
        soil2Indicator.style.left = pos2 + '%';
        soil3Indicator.style.left = pos3 + '%';

        waterLevelValue.textContent = sensors.waterLevel;
        waterPercentage.textContent = sensors.waterPercentage;
        waterLevelDisplay.style.height = sensors.waterPercentage + '%';

        // Update last updated time
        const date = new Date(sensors.timestamp * 1000);
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = date.toLocaleTimeString();
        }
    }
});

// Load pump status from Firebase
database.ref('/status').on('value', (snapshot) => {
    const status = snapshot.val();
    if (status) {
        // Highlight buttons based on current pump states
        updatePumpButtons(1, status.pump1);
        updatePumpButtons(2, status.pump2);
        updatePumpButtons(3, status.pump3);
    }
});

// Load irrigation events
database.ref('/events/irrigation').limitToLast(10).on('value', (snapshot) => {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';

    const events = snapshot.val();
    if (events) {
        // Convert object to array and sort by timestamp (newest first)
        const eventArray = Object.entries(events).map(([key, value]) => {
            return { key, ...value };
        }).sort((a, b) => b.timestamp - a.timestamp);

        // Display the events in the table
        eventArray.forEach(event => {
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            const date = new Date(event.timestamp * 1000);
            timeCell.textContent = date.toLocaleString();

            const zoneCell = document.createElement('td');
            zoneCell.textContent = 'Zone ' + event.zone;

            const actionCell = document.createElement('td');
            actionCell.textContent = event.action === 'on' ? 'Turned ON' : 'Turned OFF';
            if (event.action === 'on') {
                actionCell.classList.add('text-success');
            } else {
                actionCell.classList.add('text-danger');
            }

            row.appendChild(timeCell);
            row.appendChild(zoneCell);
            row.appendChild(actionCell);
            eventsList.appendChild(row);
        });
    }
});

// Update configuration when changed
autoModeSwitch.addEventListener('change', () => {
    database.ref('/config/autoMode').set(autoModeSwitch.checked);
    toggleManualControls(autoModeSwitch.checked);
});

moistureThreshold.addEventListener('input', () => {
    thresholdValue.textContent = moistureThreshold.value;
});

moistureThreshold.addEventListener('change', () => {
    database.ref('/config/moistureThreshold').set(parseInt(moistureThreshold.value));
});

scheduleStart.addEventListener('input', () => {
    startHourValue.textContent = scheduleStart.value;
});

scheduleStart.addEventListener('change', () => {
    database.ref('/config/scheduleStartHour').set(parseInt(scheduleStart.value));
});

scheduleEnd.addEventListener('input', () => {
    endHourValue.textContent = scheduleEnd.value;
});

scheduleEnd.addEventListener('change', () => {
    database.ref('/config/scheduleEndHour').set(parseInt(scheduleEnd.value));
});

customDuration.addEventListener('input', () => {
    durationValue.textContent = customDuration.value;
});

customDuration.addEventListener('change', () => {
    database.ref('/config/customDuration').set(parseInt(customDuration.value));
});

// Manual control functions
document.getElementById('pump1On').addEventListener('click', () => {
    database.ref('/control/pump1').set(true);
});

document.getElementById('pump1Off').addEventListener('click', () => {
    database.ref('/control/pump1').set(false);
});

document.getElementById('pump2On').addEventListener('click', () => {
    database.ref('/control/pump2').set(true);
});

document.getElementById('pump2Off').addEventListener('click', () => {
    database.ref('/control/pump2').set(false);
});

document.getElementById('pump3On').addEventListener('click', () => {
    database.ref('/control/pump3').set(true);
});

document.getElementById('pump3Off').addEventListener('click', () => {
    database.ref('/control/pump3').set(false);
});

document.getElementById('timedWater1').addEventListener('click', () => {
    database.ref('/control/timedWater1').set(true);
});

document.getElementById('timedWater2').addEventListener('click', () => {
    database.ref('/control/timedWater2').set(true);
});

document.getElementById('timedWater3').addEventListener('click', () => {
    database.ref('/control/timedWater3').set(true);
});

// Helper functions
function toggleManualControls(autoMode) {
    const buttons = manualControls.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = autoMode;
    });

    if (autoMode) {
        manualControls.classList.add('text-muted');
        manualControls.innerHTML += '<div class="alert alert-info mt-3">Manual controls disabled in Auto Mode</div>';
    } else {
        manualControls.classList.remove('text-muted');
        const alertElement = manualControls.querySelector('.alert');
        if (alertElement) {
            alertElement.remove();
        }
    }
}

function updatePumpButtons(zone, isOn) {
    const onButton = document.getElementById(`pump${zone}On`);
    const offButton = document.getElementById(`pump${zone}Off`);

    if (isOn) {
        onButton.classList.add('active');
        offButton.classList.remove('active');
    } else {
        onButton.classList.remove('active');
        offButton.classList.add('active');
    }
}

// Add system status indicators
const statusRow = document.createElement('div');
statusRow.className = 'row mt-3';
statusRow.innerHTML = `
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5>System Information</h5>
            </div>
            <div class="card-body">
                <p><strong>Last Update:</strong> <span id="lastUpdate">--</span></p>
                <p><strong>Device Status:</strong> <span class="badge bg-success">Online</span></p>
                <p class="text-muted">Dashboard v1.0 - Firebase Edition</p>
            </div>
        </div>
    </div>
`;
document.querySelector('.container').appendChild(statusRow);

// Add charts section for historical data
const chartsRow = document.createElement('div');
chartsRow.className = 'row mt-3';
chartsRow.innerHTML = `
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Historical Data</h5>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="day1">24h</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="day7">7d</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="day30">30d</button>
                </div>
            </div>
            <div class="card-body">
                <div id="moistureChart" style="height: 300px;">
                    <p class="text-center text-muted pt-5">
                        Historical charts will be available after collecting more data
                    </p>
                </div>
            </div>
        </div>
    </div>
`;
document.querySelector('.container').appendChild(chartsRow);

// Set a favicon to make the page look more professional
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">💧</text></svg>';
document.head.appendChild(favicon);
