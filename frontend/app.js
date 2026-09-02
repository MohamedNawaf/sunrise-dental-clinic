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