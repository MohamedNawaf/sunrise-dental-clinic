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

        setTimeout(loadAppointmentDropdowns, 300);
        setTimeout(fetchNextAppointmentNumber, 300);

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
                    appointmentForm.reset(); // Form eka clear wenawa
                    loadAppointmentDropdowns(); // Aluth number ekai dropdowns ui apahu load wenawa
                    if (typeof loadAllAppointments === "function") {
                        loadAllAppointments(); // Appointments table ekath update wenawa
                    }
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

// ==========================================
// --- MANAGE STAFF (Admin Only) ---
// ==========================================

function loadStaff() {
    fetch("http://localhost:8080/api/staff")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("staffTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach((staff, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${staff.fullName}</td>
                    <td>${staff.username}</td>
                    <td><span style="background:#e8f4f8; padding:3px 8px; border-radius:12px; font-size:12px; color:#2980b9; font-weight:bold;">${staff.role}</span></td>
                    <td>
                        <button onclick="editStaff(${staff.id}, '${staff.fullName}', '${staff.role}', '${staff.username}')" style="background:#3498db; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold;">Edit</button>
                        <button onclick="deleteStaff(${staff.id})" style="background:#e74c3c; color:white; border:none; padding:6px 12px; cursor:pointer; border-radius:4px; margin-left:5px; font-weight:bold;">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    })
    .catch(error => console.error("Error loading staff:", error));
}

function resetStaffForm() {
    document.getElementById("addStaffForm").reset();
    document.getElementById("editStaffId").value = "";
    // Re-add required attribute for password since it's a new entry
    document.getElementById("newStaffPassword").setAttribute("required", "true");
    document.getElementById("saveStaffBtn").innerText = "Save Staff Member";
    document.getElementById("cancelEditStaffBtn").style.display = "none";
}

function editStaff(id, name, role, username) {
    document.getElementById("editStaffId").value = id;
    document.getElementById("newStaffName").value = name;
    document.getElementById("newStaffRole").value = role;
    document.getElementById("newStaffUsername").value = username;
    
    // Remove required for password during edit (so they can leave it blank)
    document.getElementById("newStaffPassword").removeAttribute("required");
    document.getElementById("newStaffPassword").value = ""; 
    
    document.getElementById("saveStaffBtn").innerText = "Update Staff";
    document.getElementById("cancelEditStaffBtn").style.display = "inline-block";
    window.scrollTo(0, 0); 
}

function deleteStaff(id) {
    if(confirm("Are you sure you want to remove this staff member?")) {
        fetch(`http://localhost:8080/api/staff?id=${id}`, { method: 'DELETE' })
        .then(response => {
            if(response.ok) {
                alert("Staff removed successfully!");
                loadStaff();
            } else {
                alert("Failed to delete staff.");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if(sessionStorage.getItem("userRole") === "ADMIN") {
        setTimeout(loadStaff, 500); 
    }

    const addStaffForm = document.getElementById("addStaffForm");
    if(addStaffForm) {
        addStaffForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const id = document.getElementById("editStaffId").value;
            const method = id ? "PUT" : "POST";
            
            const staffData = {
                fullName: document.getElementById("newStaffName").value,
                role: document.getElementById("newStaffRole").value,
                username: document.getElementById("newStaffUsername").value,
                password: document.getElementById("newStaffPassword").value
            };
            
            if(id) {
                staffData.id = parseInt(id);
            }

            fetch("http://localhost:8080/api/staff", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(staffData)
            })
            .then(response => {
                if (response.ok || response.status === 201) {
                    alert(id ? "Success: Staff updated!" : "Success: Staff added!");
                    resetStaffForm();
                    loadStaff(); 
                } else {
                    alert("Error: Username might already exist.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Cannot connect to the server.");
            });
        });
    }
});

// --- Load Dynamic Dropdowns & Auto-Generate Appointment Number ---
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
    .catch(error => console.error("Error loading dentists:", error));

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
    .catch(error => console.error("Error loading treatments:", error));

    // 3. Auto-Generate Next Appointment Number
    fetch("http://localhost:8080/api/appointments?action=nextNumber")
    .then(response => response.json())
    .then(data => {
        const aptInput = document.getElementById("aptNumber");
        if(aptInput && data.nextNumber) {
            aptInput.value = data.nextNumber;
        }
    })
    .catch(error => console.error("Error generating apt number:", error));
}

// ==========================================
// --- CLINIC INFO & PRICING (All Roles) ---
// ==========================================

function loadClinicInfo() {
    // 1. Load Dentists for Info Section
    fetch("http://localhost:8080/api/dentists")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("infoDentistTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach(dentist => {
                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight: bold; color: #2c3e50;">${dentist.dentistName}</td>
                        <td>${dentist.specialization}</td>
                        <td>${dentist.contactNumber}</td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.error("Error loading dentists info:", error));

    // 2. Load Treatments and Calculate Total Cost
    fetch("http://localhost:8080/api/treatments")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("infoTreatmentTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach(treatment => {
                const cost = parseFloat(treatment.treatmentCost);
                const fee = parseFloat(treatment.standardConsultationFee);
                const total = cost + fee; // Mulukawama yana wiyadama

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight: bold; color: #2c3e50;">${treatment.treatmentName}</td>
                        <td style="font-size: 13px; color: #7f8c8d;">${treatment.description}</td>
                        <td>${cost.toFixed(2)}</td>
                        <td>${fee.toFixed(2)}</td>
                        <td style="color: #27ae60; font-weight: bold; font-size: 15px;">${total.toFixed(2)}</td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.error("Error loading treatments info:", error));
}

// ==========================================
// --- LOAD ALL APPOINTMENTS ---
// ==========================================
function loadAllAppointments() {
    fetch("http://localhost:8080/api/appointments")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("allAppointmentsTableBody");
        if(tbody) {
            tbody.innerHTML = "";
            data.forEach(apt => {
                // Color change is optional, when change the status
                let statusColor = "#e67e22"; // SCHEDULED (Orange)
                if(apt.appointmentStatus === "COMPLETED") statusColor = "#27ae60"; // Green
                if(apt.appointmentStatus === "CANCELLED") statusColor = "#e74c3c"; // Red

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight: bold; color: #2980b9;">${apt.appointmentNumber}</td>
                        <td>
                            <strong>${apt.patientName}</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">${apt.contactNumber}</span>
                        </td>
                        <td>${apt.dentistName}</td>
                        <td>
                            ${apt.appointmentDate}<br>
                            <span style="font-size: 12px; color: #7f8c8d;">${apt.appointmentTime}</span>
                        </td>
                        <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${apt.appointmentStatus}</span></td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.error("Error loading all appointments:", error));
}

// ==========================================
// --- LOAD & MANAGE ALL APPOINTMENTS ---
// ==========================================
function loadAllAppointments() {
    fetch("http://localhost:8080/api/appointments")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById("allAppointmentsTableBody");
        const isAdmin = sessionStorage.getItem("userRole") === "ADMIN";
        
        if (isAdmin) {
            document.getElementById("adminActionHeader").style.display = "table-cell";
        }

        if(tbody) {
            tbody.innerHTML = "";
            data.forEach(apt => {
                let statusColor = "#e67e22"; 
                if(apt.appointmentStatus === "COMPLETED") statusColor = "#27ae60"; 
                if(apt.appointmentStatus === "CANCELLED") statusColor = "#e74c3c"; 

                let actionHtml = "";
                if (isAdmin) {
                    // Update: Passing Date and Time directly into the cancelAppointment function
                    actionHtml = `
                        <td>
                            <button onclick="openEditAppointment('${apt.appointmentNumber}', '${apt.appointmentDate}', '${apt.appointmentTime}', '${apt.appointmentStatus}')" style="background:#f39c12; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px; font-size:12px;">Edit</button>
                            <button onclick="cancelAppointment('${apt.appointmentNumber}', '${apt.appointmentDate}', '${apt.appointmentTime}')" style="background:#c0392b; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px; font-size:12px; margin-left:5px;">Cancel</button>
                        </td>
                    `;
                }

                tbody.innerHTML += `
                    <tr>
                        <td style="font-weight: bold; color: #2980b9;">${apt.appointmentNumber}</td>
                        <td>
                            <strong>${apt.patientName}</strong><br>
                            <span style="font-size: 12px; color: #7f8c8d;">${apt.contactNumber}</span>
                        </td>
                        <td>${apt.dentistName}</td>
                        <td>
                            ${apt.appointmentDate}<br>
                            <span style="font-size: 12px; color: #7f8c8d;">${apt.appointmentTime}</span>
                        </td>
                        <td><span style="background: ${statusColor}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${apt.appointmentStatus}</span></td>
                        ${actionHtml}
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.error("Error loading all appointments:", error));
}

// --- Direct Cancel Appointment Logic ---
function cancelAppointment(aptNo, date, time) {
    if(confirm(`Are you sure you want to CANCEL appointment ${aptNo}?`)) {
        
        // Ensure time format matches MySQL (HH:MM:SS)
        let timeStr = time;
        if(timeStr.length === 5) {
            timeStr += ":00"; 
        }

        const cancelData = {
            appointmentNumber: aptNo,
            appointmentDate: date,
            appointmentTime: timeStr,
            status: "CANCELLED" // Explicitly sending CANCELLED
        };

        fetch("http://localhost:8080/api/appointments", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cancelData)
        })
        .then(response => {
            if (response.ok) {
                alert(`Success: Appointment ${aptNo} has been marked as CANCELLED.`);
                loadAllAppointments(); // Refresh the table
            } else {
                alert("Failed to cancel the appointment. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Network error occurred.");
        });
    }
}

// --- Admin Reschedule / Update Appointment ---
function openEditAppointment(aptNo, date, time, status) {
    document.getElementById("editAppointmentBox").style.display = "block";
    document.getElementById("updateAptNo").value = aptNo;
    document.getElementById("updateAptDate").value = date;
    document.getElementById("updateAptTime").value = time;
    document.getElementById("updateAptStatus").value = status;
    
    // Smooth scroll to the edit box
    document.getElementById("editAppointmentBox").scrollIntoView({ behavior: 'smooth' });
}

function saveAppointmentUpdate() {
    const updateData = {
        appointmentNumber: document.getElementById("updateAptNo").value,
        appointmentDate: document.getElementById("updateAptDate").value,
        appointmentTime: document.getElementById("updateAptTime").value,
        status: document.getElementById("updateAptStatus").value
    };

    if(updateData.appointmentTime.length === 5) {
        updateData.appointmentTime += ":00"; // MySQL TIME format compatibility
    }

    fetch("http://localhost:8080/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (response.ok) {
            alert("Appointment successfully updated/rescheduled!");
            document.getElementById("editAppointmentBox").style.display = "none";
            loadAllAppointments(); // Refresh table
        } else {
            alert("Failed to update appointment.");
        }
    });
}

function fetchNextAppointmentNumber() {
    fetch("http://localhost:8080/api/appointments?action=nextNumber")
    .then(response => response.json())
    .then(data => {
        const aptInput = document.getElementById("aptNumber");
        if(aptInput && data.nextNumber) {
            aptInput.value = data.nextNumber;
            console.log("Successfully loaded next number: " + data.nextNumber);
        }
    })
    .catch(error => console.error("Error fetching number:", error));
}
