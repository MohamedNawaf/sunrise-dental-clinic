document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    if(loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Stop the page reload on form submission

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const errorDiv = document.getElementById("loginError");

            // Create API request (Java Servlet ekata yawanna)
            const loginData = {
                username: username,
                password: password
            };

            fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            })
            .then(response => {
                if(response.ok) {
                    // If login is successfull, user can be redirected to the dashboard page
                    sessionStorage.setItem("isLoggedIn", "true");
                    sessionStorage.setItem("staffName", username);
                    window.location.href = "dashboard.html";
                } else {
                    // Password or username is incorrect, show error message
                    errorDiv.style.display = "block";
                }
            })
            .catch(error => {
                console.error("Error connecting to server:", error);
                alert("Cannot connect to the server. Make sure Tomcat is running!");
            });
        });
    }
});

// --- Dashboard Logic & Security ---
document.addEventListener("DOMContentLoaded", function() {
    
    // Check if on dashboard page
    if(window.location.pathname.includes("dashboard.html")) {
        
        // 1. Security Check: Block direct access
        if(sessionStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "index.html";
        }

        // 2. Set username in sidebar
        const staffName = sessionStorage.getItem("staffName");
        if(staffName) {
            document.getElementById("loggedInUser").innerText = "Welcome, " + staffName;
        }

        // 3. Handle Logout (Requirement 6: Exit System)
        document.getElementById("logoutBtn").addEventListener("click", function() {
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});

// Sidebar Navigation Function
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.style.display = 'none');
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
}


// --- Register Appointment API Call ---
document.addEventListener("DOMContentLoaded", function() {
    const appointmentForm = document.getElementById("appointmentForm");
    
    if(appointmentForm) {
        appointmentForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Form eka submit weddi page reload wena eka nawathwanawa

            // Form eke thiyena data tika object ekakata ganeema
            const aptData = {
                appointmentNumber: document.getElementById("aptNumber").value,
                appointmentDate: document.getElementById("aptDate").value,
                appointmentTime: document.getElementById("aptTime").value + ":00", // MySQL TIME format ekata galapenna seconds ekathu kireema
                patientName: document.getElementById("patientName").value,
                contactNumber: document.getElementById("contactNumber").value,
                address: document.getElementById("address").value,
                dentistId: parseInt(document.getElementById("dentistId").value),
                treatmentId: parseInt(document.getElementById("treatmentId").value)
            };

            // Backend API ekata data yawima
            fetch("http://localhost:8080/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(aptData)
            })
            .then(async (response) => {
                if (response.status === 201) {
                    alert("Success: Appointment successfully registered!");
                    appointmentForm.reset(); // Success unama form eka clear kireema
                } else {
                    const resData = await response.json();
                    alert("Error: " + (resData.error || "Failed to register appointment."));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server. Is Tomcat running?");
            });
        });
    }
});