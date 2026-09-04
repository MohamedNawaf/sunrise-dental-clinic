// -- Login logic --
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
            event.preventDefault(); // The Form stops reloading when the form is submitted

            // Getting the data from the form into an object
            const aptData = {
                appointmentNumber: document.getElementById("aptNumber").value,
                appointmentDate: document.getElementById("aptDate").value,
                appointmentTime: document.getElementById("aptTime").value + ":00", // Adding seconds to match the MySQL time format
                patientName: document.getElementById("patientName").value,
                contactNumber: document.getElementById("contactNumber").value,
                address: document.getElementById("address").value,
                dentistId: parseInt(document.getElementById("dentistId").value),
                treatmentId: parseInt(document.getElementById("treatmentId").value)
            };

            // Send the data to the backend API
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

// ==========================================
// --- MANAGE DENTISTS (Admin Only) ---
// ==========================================

function loadDentists() {
    fetch("http://localhost:8080/api/dentists")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("dentistTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach((dentist, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td> <!-- 1, 2, 3... piliwelata display weema -->
                    <td>${dentist.dentistName}</td>
                    <td>${dentist.specialization}</td>
                    <td>${dentist.contactNumber}</td>
                    <td>
                        <button onclick="editDentist(${dentist.id}, '${dentist.dentistName}', '${dentist.specialization}', '${dentist.contactNumber}')" style="background:#3498db; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Edit</button>
                        <button onclick="deleteDentist(${dentist.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; margin-left:5px; font-weight:bold;">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    })
    .catch(error => console.error("Error loading dentists:", error));
}

function resetDentistForm() {
    document.getElementById("addDentistForm").reset();
    document.getElementById("editDentistId").value = "";
    document.getElementById("saveDentistBtn").innerText = "Save Dentist";
    document.getElementById("cancelEditDentistBtn").style.display = "none";
}

function editDentist(id, name, spec, contact) {
    document.getElementById("editDentistId").value = id;
    document.getElementById("newDentistName").value = name;
    document.getElementById("newDentistSpec").value = spec;
    document.getElementById("newDentistContact").value = contact;
    
    document.getElementById("saveDentistBtn").innerText = "Update Dentist";
    document.getElementById("cancelEditDentistBtn").style.display = "inline-block";
    window.scrollTo(0, 0); 
}

function deleteDentist(id) {
    if(confirm("Are you sure you want to remove this dentist?")) {
        fetch(`http://localhost:8080/api/dentists?id=${id}`, { method: 'DELETE' })
        .then(response => {
            if(response.ok) {
                alert("Dentist removed successfully!");
                loadDentists(); // Table eka auto refresh wenawa
            } else {
                alert("Failed to delete dentist.");
            }
        });
    }
}

// Event Listeners for Dentist Form
document.addEventListener("DOMContentLoaded", function() {
    // If ADMIN is logged in, auto-load the dentists table
    if(sessionStorage.getItem("userRole") === "ADMIN") {
        setTimeout(loadDentists, 500); // Small delay to ensure UI is ready
    }

    const addDentistForm = document.getElementById("addDentistForm");
    if(addDentistForm) {
        addDentistForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const id = document.getElementById("editDentistId").value;
            const method = id ? "PUT" : "POST";
            
            const dentistData = {
                dentistName: document.getElementById("newDentistName").value,
                contactNumber: document.getElementById("newDentistContact").value,
                specialization: document.getElementById("newDentistSpec").value
            };
            
            if(id) {
                dentistData.id = parseInt(id);
            }

            fetch("http://localhost:8080/api/dentists", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dentistData)
            })
            .then(response => {
                if (response.ok || response.status === 201) {
                    alert(id ? "Success: Dentist updated!" : "Success: Dentist added!");
                    resetDentistForm();
                    loadDentists(); // Reload the table with new data
                } else {
                    alert("Error processing request.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server.");
            });
        });
    }
});

// ==========================================
// --- MANAGE TREATMENTS (Admin Only) ---
// ==========================================

function loadTreatments() {
    fetch("http://localhost:8080/api/treatments")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("treatmentTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach((treatment, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${treatment.treatmentName}</td>
                    <td>${parseFloat(treatment.treatmentCost).toFixed(2)}</td>
                    <td>${parseFloat(treatment.standardConsultationFee).toFixed(2)}</td>
                    <td>
                        <button onclick="editTreatment(${treatment.id}, '${treatment.treatmentName}', '${treatment.description}', ${treatment.treatmentCost}, ${treatment.standardConsultationFee})" style="background:#3498db; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Edit</button>
                        <button onclick="deleteTreatment(${treatment.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; margin-left:5px; font-weight:bold;">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    })
    .catch(error => console.error("Error loading treatments:", error));
}

function resetTreatmentForm() {
    document.getElementById("addTreatmentForm").reset();
    document.getElementById("editTreatmentId").value = "";
    document.getElementById("saveTreatmentBtn").innerText = "Save Treatment";
    document.getElementById("cancelEditTreatmentBtn").style.display = "none";
}

function editTreatment(id, name, desc, cost, fee) {
    document.getElementById("editTreatmentId").value = id;
    document.getElementById("newTreatmentName").value = name;
    document.getElementById("newTreatmentDesc").value = desc;
    document.getElementById("newTreatmentCost").value = cost;
    document.getElementById("newConsultationFee").value = fee;
    
    document.getElementById("saveTreatmentBtn").innerText = "Update Treatment";
    document.getElementById("cancelEditTreatmentBtn").style.display = "inline-block";
    window.scrollTo(0, 0); 
}

function deleteTreatment(id) {
    if(confirm("Are you sure you want to remove this treatment?")) {
        fetch(`http://localhost:8080/api/treatments?id=${id}`, { method: 'DELETE' })
        .then(response => {
            if(response.ok) {
                alert("Treatment removed successfully!");
                loadTreatments();
                loadAppointmentDropdowns(); // Update new appointment dropdown
            } else {
                alert("Failed to delete treatment.");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if(sessionStorage.getItem("userRole") === "ADMIN") {
        setTimeout(loadTreatments, 500); 
    }

    const addTreatmentForm = document.getElementById("addTreatmentForm");
    if(addTreatmentForm) {
        addTreatmentForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const id = document.getElementById("editTreatmentId").value;
            const method = id ? "PUT" : "POST";
            
            const treatmentData = {
                treatmentName: document.getElementById("newTreatmentName").value,
                description: document.getElementById("newTreatmentDesc").value,
                treatmentCost: parseFloat(document.getElementById("newTreatmentCost").value),
                standardConsultationFee: parseFloat(document.getElementById("newConsultationFee").value)
            };
            
            if(id) {
                treatmentData.id = parseInt(id);
            }

            fetch("http://localhost:8080/api/treatments", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(treatmentData)
            })
            .then(response => {
                if (response.ok || response.status === 201) {
                    alert(id ? "Success: Treatment updated!" : "Success: Treatment added!");
                    resetTreatmentForm();
                    loadTreatments(); 
                    loadAppointmentDropdowns(); // Update dropdown
                } else {
                    alert("Error: Treatment name might already exist.");
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

// --- Load Dynamic Dropdowns for Appointment Registration ---
function loadAppointmentDropdowns() {
    // 1. Load Active Dentists
    fetch("http://localhost:8080/api/dentists")
    .then(response => response.json())
    .then(data => {
        const dentistSelect = document.getElementById("dentistId");
        if(dentistSelect) {
            dentistSelect.innerHTML = '<option value="">-- Select Dentist --</option>'; 
            data.forEach(dentist => {
                dentistSelect.innerHTML += `<option value="${dentist.id}">${dentist.dentistName} (${dentist.specialization})</option>`;
            });
        }
    })
    .catch(error => console.error("Error loading dentists for dropdown:", error));

    // 2. Load Treatments
    fetch("http://localhost:8080/api/treatments")
    .then(response => response.json())
    .then(data => {
        const treatmentSelect = document.getElementById("treatmentId");
        if(treatmentSelect) {
            treatmentSelect.innerHTML = '<option value="">-- Select Treatment --</option>'; 
            data.forEach(treatment => {
                treatmentSelect.innerHTML += `<option value="${treatment.id}">${treatment.treatmentName} (LKR ${treatment.treatmentCost})</option>`;
            });
        }
    })
    .catch(error => console.error("Error loading treatments for dropdown:", error));
}

// Call dropdown function when dashboard loads
document.addEventListener("DOMContentLoaded", function() {
    if(window.location.pathname.includes("dashboard.html")) {
        setTimeout(loadAppointmentDropdowns, 500); // Load dynamic data
    }
});