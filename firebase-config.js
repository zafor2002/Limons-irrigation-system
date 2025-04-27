// firebase-config.js - Move Firebase config to separate file for better security
// Initialize Firebase with configuration
function initializeFirebase() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
        authDomain: "limon-irrigation-system.firebaseapp.com",
        databaseURL: "https://limon-irrigation-system-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "limon-irrigation-system",
        storageBucket: "limon-irrigation-system.firebasestorage.app",
        messagingSenderId: "1029566605988",
        appId: "1:1029566605988:web:f090a3d4a1647464175431"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    return firebase.database();
}

// Export the database for use in app.js
const database = initializeFirebase();

// Error handler for Firebase operations
function handleFirebaseError(error, operation) {
    console.error(`Firebase ${operation} error:`, error);
    showToast(`Error: ${error.message}`, 'danger');
}

// Show toast messages for user feedback
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">Limon Irrigation System</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    </div>
    `;
    
    document.getElementById('toastContainer').innerHTML += toastHTML;
    const toastElement = new bootstrap.Toast(document.getElementById(toastId));
    toastElement.show();
}

// Function to monitor system connection status
function monitorConnectionStatus() {
    const connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
            console.log("Connected to Firebase");
            showToast("Connected to irrigation system", "success");
            document.getElementById('connectionStatus').className = "badge bg-success";
            document.getElementById('connectionStatus').innerText = "Online";
        } else {
            console.log("Disconnected from Firebase");
            document.getElementById('connectionStatus').className = "badge bg-danger";
            document.getElementById('connectionStatus').innerText = "Offline";
        }
    });
}

// Export the functions
window.irrigationSystem = {
    database,
    handleFirebaseError,
    showToast,
    monitorConnectionStatus
};
