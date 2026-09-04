document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    if(loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Stop the page reload on form submission

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const errorDiv = document.getElementById("loginError");

            // Create API request (to the Java servlet) with the login credentials
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
                    sessionStorage.setItem("userRole", data.role); // Store the user role in session storage
                    
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
    
    if(window.location.pathname.includes("dashboard.html")) {
        
        if(sessionStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "index.html";
        }

        const staffName = sessionStorage.getItem("staffName");
        const userRole = sessionStorage.getItem("userRole"); // Get the user role from session storage

        if(staffName) {
            document.getElementById("loggedInUser").innerText = "Welcome, " + staffName + " (" + userRole + ")";
        }

        // --- Role Based Access Control (RBAC) UI Logic ---
        if (userRole === "ADMIN") {
            // If the user is an admin, show admin-only elements
            const adminElements = document.querySelectorAll('.admin-only');
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
        }

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

// --- Add Dentist API Call (Admin Only) ---
document.addEventListener("DOMContentLoaded", function() {
    const addDentistForm = document.getElementById("addDentistForm");
    
    if(addDentistForm) {
        addDentistForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const dentistData = {
                dentistName: document.getElementById("newDentistName").value,
                contactNumber: document.getElementById("newDentistContact").value,
                specialization: document.getElementById("newDentistSpec").value
            };

            fetch("http://localhost:8080/api/dentists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dentistData)
            })
            .then(async (response) => {
                if (response.status === 201) {
                    alert("Success: Dentist successfully added!");
                    addDentistForm.reset();
                } else {
                    const resData = await response.json();
                    alert("Error: " + (resData.error || "Failed to add dentist."));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server.");
            });
        });
    }
});

// --- Add Treatment API Call (Admin Only) ---
document.addEventListener("DOMContentLoaded", function() {
    const addTreatmentForm = document.getElementById("addTreatmentForm");
    
    if(addTreatmentForm) {
        addTreatmentForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const treatmentData = {
                treatmentName: document.getElementById("newTreatmentName").value,
                description: document.getElementById("newTreatmentDesc").value,
                treatmentCost: parseFloat(document.getElementById("newTreatmentCost").value),
                standardConsultationFee: parseFloat(document.getElementById("newConsultationFee").value)
            };

            fetch("http://localhost:8080/api/treatments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(treatmentData)
            })
            .then(async (response) => {
                if (response.status === 201) {
                    alert("Success: Treatment successfully added!");
                    addTreatmentForm.reset();
                } else {
                    const resData = await response.json();
                    alert("Error: " + (resData.error || "Failed to add treatment."));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server.");
            });
        });
    }
});

// --- Add Staff API Call (Admin Only) ---
document.addEventListener("DOMContentLoaded", function() {
    const addStaffForm = document.getElementById("addStaffForm");
    
    if(addStaffForm) {
        addStaffForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const staffData = {
                fullName: document.getElementById("newStaffName").value,
                role: document.getElementById("newStaffRole").value,
                username: document.getElementById("newStaffUsername").value,
                password: document.getElementById("newStaffPassword").value
            };

            fetch("http://localhost:8080/api/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(staffData)
            })
            .then(async (response) => {
                if (response.status === 201) {
                    alert("Success: Staff member successfully added!");
                    addStaffForm.reset();
                } else {
                    const resData = await response.json();
                    alert("Error: " + (resData.error || "Failed to add staff member."));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server.");
            });
        });
    }
});