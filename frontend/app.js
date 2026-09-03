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
            .then(async response => {
                if(response.ok) {
                    const data = await response.json();
                    sessionStorage.setItem("isLoggedIn", "true");
                    sessionStorage.setItem("staffName", username);
                    sessionStorage.setItem("userRole", data.role); // Role eka save kara ganima
                    
                    window.location.href = "dashboard.html";
                } else {
                    errorDiv.style.display = "block";
                }
            })
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

// --- Search Appointment API Call ---
function searchAppointment() {
    const aptNo = document.getElementById("searchAptNo").value.trim();
    
    if(!aptNo) {
        alert("Please enter an Appointment Number!");
        return;
    }

    fetch(`http://localhost:8080/api/search?aptNo=${aptNo}`)
    .then(async (response) => {
        if(response.ok) {
            const data = await response.json();
            // Show the results div
            document.getElementById("searchResults").style.display = "block";
            
            // Populate data
            document.getElementById("resPatientName").innerText = data.patient_name;
            document.getElementById("resContact").innerText = data.patient_contact;
            document.getElementById("resAddress").innerText = data.patient_address;
            document.getElementById("resDentist").innerText = data.dentist_name;
            document.getElementById("resTreatment").innerText = data.treatment_name;
            document.getElementById("resDateTime").innerText = data.appointment_date + " at " + data.appointment_time;
            document.getElementById("resStatus").innerText = data.appointment_status;
        } else {
            const errData = await response.json();
            alert("Error: " + errData.error);
            document.getElementById("searchResults").style.display = "none";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Cannot connect to the server.");
    });
}

// --- Generate Bill API Call ---
function generateBill() {
    const aptNo = document.getElementById("billAptNo").value.trim();
    
    if(!aptNo) {
        alert("Please enter an Appointment Number!");
        return;
    }

    fetch("http://localhost:8080/api/billing", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ appointmentNumber: aptNo })
    })
    .then(async (response) => {
        if(response.ok) {
            const billData = await response.json();
            
            // Show Invoice
            document.getElementById("invoiceArea").style.display = "block";
            document.getElementById("invNumber").innerText = billData.invoiceNumber;
            document.getElementById("invAptNumber").innerText = billData.appointmentNumber;
            document.getElementById("invDate").innerText = new Date().toLocaleDateString();
            document.getElementById("invTotal").innerText = billData.totalAmount.toFixed(2);
            
        } else {
            const errData = await response.json();
            alert("Error: " + errData.error);
            document.getElementById("invoiceArea").style.display = "none";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Cannot connect to the server.");
    });
}