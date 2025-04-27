// Initialize charts after page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize time period buttons
    document.getElementById('day1').addEventListener('click', () => loadChartData(1));
    document.getElementById('day7').addEventListener('click', () => loadChartData(7));
    document.getElementById('day30').addEventListener('click', () => loadChartData(30));
    
    // Default to 24h view
    loadChartData(1);
});

// Load chart data from Firebase
function loadChartData(days) {
    // Highlight selected button
    document.querySelectorAll('#day1, #day7, #day30').forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline-secondary');
    });
    document.getElementById(`day${days}`).classList.add('active', 'btn-primary');
    document.getElementById(`day${days}`).classList.remove('btn-outline-secondary');
    
    // Calculate time range
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (days * 24 * 60 * 60);
    
    // Query Firebase for historical data
    const historyRef = database.ref('/sensors/history')
        .orderByKey()
        .startAt(startTime.toString())
        .endAt(endTime.toString());
    
    historyRef.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (!data) {
                document.getElementById('moistureChart').innerHTML = `
                    <p class="text-center text-muted pt-5">
                        No historical data available for the selected period
                    </p>`;
                return;
            }
            
            // Process data for chart
            const chartData = processChartData(data);
            renderChart(chartData, days);
        })
        .catch((error) => {
            console.error("Error loading chart data:", error);
            document.getElementById('moistureChart').innerHTML = `
                <p class="text-center text-danger pt-5">
                    Error loading data: ${error.message}
                </p>`;
        });
}

// Process raw data into chart format
function processChartData(data) {
    const timeSeriesData = {
        timestamps: [],
        soil1: [],
        soil2: [],
        soil3: [],
        waterLevel: []
    };
    
    // Sort by timestamp
    const sortedEntries = Object.entries(data).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
    sortedEntries.forEach(([timestamp, reading]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        timeSeriesData.timestamps.push(date);
        timeSeriesData.soil1.push(reading.soil1);
        timeSeriesData.soil2.push(reading.soil2);
        timeSeriesData.soil3.push(reading.soil3);
        timeSeriesData.waterLevel.push(reading.waterPercentage);
    });
    
    return timeSeriesData;
}

// Render chart using Chart.js
function renderChart(data, days) {
    const ctx = document.getElementById('moistureChart');
    
    // Clear previous chart if exists
    if (window.moistureHistoryChart) {
        window.moistureHistoryChart.destroy();
    }
    
    // Format X axis labels based on time period
    const timeFormat = days === 1 ? 'HH:mm' : 'MM/DD HH:mm';
    
    // Create chart
    window.moistureHistoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: [
                {
                    label: 'Zone 1 Moisture',
                    data: data.soil1,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4
                },
                {
                    label: 'Zone 2 Moisture',
                    data: data.soil2,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.4
                },
                {
                    label: 'Zone 3 Moisture',
                    data: data.soil3,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4
                },
                {
                    label: 'Water Level %',
                    data: data.waterLevel,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.4,
                    yAxisID: 'percentage'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: days === 1 ? 'hour' : 'day',
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'MM/DD'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    min: 0,
                    max: 4095,
                    title: {
                        display: true,
                        text: 'Moisture Reading'
                    }
                },
                percentage: {
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Water Level (%)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${days === 1 ? '24 Hours' : days === 7 ? '7 Days' : '30 Days'} Irrigation History`
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}
