    // Base URL for API
    const API_BASE_URL = "http://localhost:5000/api";


// Wait for DOM to be fully loaded

document.addEventListener('DOMContentLoaded', function () {
    // Get elements
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const usersTable = document.getElementById("usersTable");
    const donationForm = document.getElementById("donationForm");
    const appointmentForm = document.getElementById("appointmentForm");
    const donorDashboard = document.getElementById("donorDashboard");
    const adminDashboard = document.getElementById("adminDashboard");
    const inventoryDisplay = document.getElementById("inventoryDisplay");









    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Show/hide elements based on authentication status
    function updateUIForAuth() {
        const authLinks = document.querySelectorAll('.auth-required');
        const guestLinks = document.querySelectorAll('.guest-only');
        const adminLinks = document.querySelectorAll('.admin-only');
        const donorLinks = document.querySelectorAll('.donor-only');
        
        if (token) {
            // User is logged in
            authLinks.forEach(el => el.style.display = 'block');
            guestLinks.forEach(el => el.style.display = 'none');
            
            // Show/hide based on role
            if (userRole === 'admin' || userRole === 'staff') {
                adminLinks.forEach(el => el.style.display = 'block');
                donorLinks.forEach(el => el.style.display = 'none');
            } else if (userRole === 'donor') {
                adminLinks.forEach(el => el.style.display = 'none');
                donorLinks.forEach(el => el.style.display = 'block');
            }
        } else {
            // User is not logged in
            authLinks.forEach(el => el.style.display = 'none');
            guestLinks.forEach(el => el.style.display = 'block');
            adminLinks.forEach(el => el.style.display = 'none');
            donorLinks.forEach(el => el.style.display = 'none');
        }
    }

    // Call this function when the page loads
    updateUIForAuth();

    /** ============================ 🔹 REGISTER FUNCTIONALITY ============================ **/


    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Prevent default form submission

            // Get form values
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const bloodType = document.getElementById("bloodGroup").value;
            const phone = document.getElementById("phone")?.value || "";
            const city = document.getElementById("city")?.value || "";
            const address = {
                city: city,
                // Add other address fields if available
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password, 
                        bloodType, 
                        phone,
                        address
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token and user info
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userId', data.id);
                    console.log("Response data:", data);

                    alert("Registration successful!");
                    window.location.href = "/dashboard.html"; // Redirect to dashboard
                    console.log("Received Registration Data:", req.body);


                } else {
                    alert("Error: " + (data.msg || data.error || "Registration failed"));
                    console.error("Registration Error:", data);
                }
            } catch (error) {
                console.error("Error connecting to backend:", error);
                alert("Server Error: Unable to connect.");
            }
        });
    }

    /** ============================ 🔹 LOGIN FUNCTIONALITY ============================ **/
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Get login input values
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store token and user info
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userId', data.user.id);
                    
                    const messageEl = document.getElementById("message");
                    if (messageEl) {
                        messageEl.innerText = "Login Successful!";
                    }
                    
                    // Redirect based on role
                    if (data.user.role === 'admin' || data.user.role === 'staff') {
                        window.location.href = "/admin-dashboard.html";
                    } else {
                        window.location.href = "/donor-dashboard.html";
                    }
                } else {
                    const messageEl = document.getElementById("message");
                    if (messageEl) {
                        messageEl.innerText = "Error: " + (data.msg || data.error || "Login failed");
                    } else {
                        alert("Error: " + (data.msg || data.error || "Login failed"));
                    }
                    console.log("Login Error:", data);
                }
            } catch (error) {
                console.error("Error connecting to backend:", error);
                const messageEl = document.getElementById("message");
                if (messageEl) {
                    messageEl.innerText = "Server Error";
                } else {
                    alert("Server Error: Unable to connect.");
                }
            }
        });
    }

    /** ============================ 🔹 LOGOUT FUNCTIONALITY ============================ **/
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.location.href = "/index.html";
        });
    }

    /** ============================ 🔹 FETCH & DISPLAY USERS ============================ **/
    async function fetchUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/donors`, {
                headers: {
                    'x-auth-token': token
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function displayUsers(users) {
        if (!usersTable) return;
        
        usersTable.innerHTML = ""; // Clear previous data
        users.forEach(user => {
            let row = usersTable.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.bloodType}</td>
                <td>${user.address?.city || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <button class="btn-contact" data-id="${user._id}">Contact</button>
                </td>
            `;
        });
        
        // Add event listeners to contact buttons
        document.querySelectorAll('.btn-contact').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                // Open contact modal or redirect to contact page
                showContactModal(userId);
            });
        });
    }

    // Contact modal functionality
    function showContactModal(userId) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('contactModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'contactModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Contact Donor</h2>
                    <form id="contactForm">
                        <input type="hidden" id="contactUserId" value="${userId}">
                        <div class="form-group">
                            <label for="subject">Subject</label>
                            <input type="text" id="subject" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Send Message</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close').addEventListener('click', function() {
                modal.style.display = 'none';
            });
            
            modal.querySelector('#contactForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const recipientId = document.getElementById('contactUserId').value;
                const subject = document.getElementById('subject').value;
                const message = document.getElementById('message').value;
                
                try {
                    const response = await fetch(`${API_BASE_URL}/messages`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({
                            recipient: recipientId,
                            subject,
                            message
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        alert('Message sent successfully!');
                        modal.style.display = 'none';
                    } else {
                        alert('Error: ' + (data.msg || 'Failed to send message'));
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                    alert('Server Error: Unable to send message');
                }
            });
        } else {
            document.getElementById('contactUserId').value = userId;
        }
        
        modal.style.display = 'block';
    }

    // Fetch users only if the table exists and user is authenticated
    if (usersTable && token) {
        fetchUsers();
    }

    /** ============================ 🔹 DONATION FORM FUNCTIONALITY ============================ **/
    if (donationForm) {
        donationForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const donor = document.getElementById("donorId").value;
            const bloodType = document.getElementById("bloodType").value;
            const quantity = document.getElementById("quantity").value;
            const center = document.getElementById("center").value;
            const healthParams = {
                hemoglobin: document.getElementById("hemoglobin").value,
                bloodPressure: document.getElementById("bloodPressure").value,
                pulse: document.getElementById("pulse").value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/donations`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-auth-token": token
                    },
                    body: JSON.stringify({ 
                        donor, 
                        bloodType, 
                        quantity, 
                        center, 
                        healthParameters: healthParams
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Donation recorded successfully!");
                    donationForm.reset();
                    // Refresh inventory if on admin page
                    if (inventoryDisplay) {
                        loadInventory();
                    }
                } else {
                    alert("Error: " + (data.msg || "Failed to record donation"));
                }
            } catch (error) {
                console.error("Error connecting to backend:", error);
                alert("Server Error: Unable to connect.");
            }
        });
    }

    /** ============================ 🔹 APPOINTMENT FORM FUNCTIONALITY ============================ **/
    if (appointmentForm) {
        appointmentForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const donorId = localStorage.getItem('userId') || document.getElementById("donorId").value;
            const center = document.getElementById("center").value;
            const scheduledDate = document.getElementById("scheduledDate").value;
            const donationType = document.getElementById("donationType").value;
            const notes = document.getElementById("notes").value;

            try {
                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "x-auth-token": token
                    },
                    body: JSON.stringify({ 
                        donor: donorId, 
                        center, 
                        scheduledDate, 
                        donationType, 
                        notes
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Appointment scheduled successfully!");
                    appointmentForm.reset();
                    // Refresh dashboard if on donor page
                    if (donorDashboard) {
                        loadDonorDashboard();
                    }
                } else {
                    alert("Error: " + (data.msg || "Failed to schedule appointment"));
                }
            } catch (error) {
                console.error("Error connecting to backend:", error);
                alert("Server Error: Unable to connect.");
            }
        });
    }


            /** ============================ 🔹 DONOR DASHBOARD FUNCTIONALITY ============================ **/
async function loadDonorDashboard() {
    if (!donorDashboard) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/donor`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display donor information
        document.getElementById("donorName").textContent = data.donor.name;
        document.getElementById("donorBloodType").textContent = data.donor.bloodType;
        document.getElementById("totalDonations").textContent = data.statistics.totalDonations;
        document.getElementById("lastDonation").textContent = data.statistics.lastDonation ? 
            new Date(data.statistics.lastDonation).toLocaleDateString() : "No donations yet";
        document.getElementById("eligibilityStatus").textContent = data.statistics.isEligible ? 
            "Eligible" : "Not eligible until " + new Date(data.statistics.nextEligibleDate).toLocaleDateString();
        
        // Display donation history
        const historyTable = document.getElementById("donationHistory");
        if (historyTable) {
            historyTable.innerHTML = ""; // Clear previous data
            
            if (data.donationHistory.length === 0) {
                historyTable.innerHTML = "<tr><td colspan='4'>No donation history found</td></tr>";
            } else {
                data.donationHistory.forEach(donation => {
                    let row = historyTable.insertRow();
                    row.innerHTML = `
                        <td>${new Date(donation.date).toLocaleDateString()}</td>
                        <td>${donation.center.name}</td>
                        <td>${donation.quantity} ml</td>
                        <td>${donation.status}</td>
                    `;
                });
            }
        }
        
        // Display upcoming appointments
        const appointmentsTable = document.getElementById("upcomingAppointments");
        if (appointmentsTable) {
            appointmentsTable.innerHTML = ""; // Clear previous data
            
            if (data.upcomingAppointments.length === 0) {
                appointmentsTable.innerHTML = "<tr><td colspan='4'>No upcoming appointments</td></tr>";
            } else {
                data.upcomingAppointments.forEach(appointment => {
                    let row = appointmentsTable.insertRow();
                    row.innerHTML = `
                        <td>${new Date(appointment.scheduledDate).toLocaleDateString()}</td>
                        <td>${appointment.center.name}</td>
                        <td>${appointment.donationType}</td>
                        <td>
                            <button class="btn-cancel" data-id="${appointment._id}">Cancel</button>
                        </td>
                    `;
                });
            }
            
            // Add event listeners to cancel buttons
            appointmentsTable.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const appointmentId = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to cancel this appointment?')) {
                        try {
                            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-auth-token': token
                                }
                            });
                            
                            if (response.ok) {
                                alert('Appointment cancelled successfully!');
                                loadDonorDashboard(); // Reload dashboard data
                            } else {
                                const data = await response.json();
                                alert('Error: ' + (data.msg || 'Failed to cancel appointment'));
                            }
                        } catch (error) {
                            console.error('Error cancelling appointment:', error);
                            alert('Server Error: Unable to cancel appointment');
                        }
                    }
                });
            });
        }
        
        // Display nearby centers
        const nearbyCentersContainer = document.getElementById("nearbyCenters");
        if (nearbyCentersContainer) {
            nearbyCentersContainer.innerHTML = ""; // Clear previous data
            
            if (data.nearbyCenters.length === 0) {
                nearbyCentersContainer.innerHTML = "<p>No nearby centers found</p>";
            } else {
                data.nearbyCenters.forEach(center => {
                    const centerEl = document.createElement("div");
                    centerEl.className = "center-card";
                    centerEl.innerHTML = `
                        <h3>${center.name}</h3>
                        <p>${center.address?.street || ''}, ${center.address?.city || ''}</p>
                        <p>Phone: ${center.contactInfo?.phone || 'N/A'}</p>
                        <button class="btn-schedule" data-id="${center._id}">Schedule</button>
                    `;
                    nearbyCentersContainer.appendChild(centerEl);
                });
                
                // Add event listeners to schedule buttons
                nearbyCentersContainer.querySelectorAll('.btn-schedule').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const centerId = this.getAttribute('data-id');
                        window.location.href = `/schedule-appointment.html?center=${centerId}`;
                    });
                });
            }
        }
        
        // Display messages
        const messagesContainer = document.getElementById("messages");
        if (messagesContainer && data.messages) {
            messagesContainer.innerHTML = ""; // Clear previous data
            
            if (data.messages.length === 0) {
                messagesContainer.innerHTML = "<p>No messages</p>";
            } else {
                data.messages.forEach(message => {
                    const messageEl = document.createElement("div");
                    messageEl.className = "message-card";
                    messageEl.innerHTML = `
                        <h3>${message.subject}</h3>
                        <p class="message-info">From: ${message.sender.name} | ${new Date(message.date).toLocaleDateString()}</p>
                        <p>${message.message}</p>
                        <button class="btn-reply" data-id="${message.sender._id}">Reply</button>
                    `;
                    messagesContainer.appendChild(messageEl);
                });
                
                // Add event listeners to reply buttons
                messagesContainer.querySelectorAll('.btn-reply').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const senderId = this.getAttribute('data-id');
                        showContactModal(senderId);
                    });
                });
            }
        }
    } catch (error) {
        console.error("Error loading donor dashboard:", error);
    }
}

// Load donor dashboard if on donor dashboard page
if (donorDashboard && token && (userRole === 'donor')) {
    loadDonorDashboard();
}

/** ============================ 🔹 ADMIN DASHBOARD FUNCTIONALITY ============================ **/
async function loadAdminDashboard() {
    if (!adminDashboard) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/admin`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display overview statistics
        document.getElementById("totalDonors").textContent = data.statistics.totalDonors;
        document.getElementById("totalDonations").textContent = data.statistics.totalDonations;
        document.getElementById("donationsThisMonth").textContent = data.statistics.donationsThisMonth;
        document.getElementById("upcomingAppointments").textContent = data.statistics.upcomingAppointments;
        
        // Display blood inventory
        const inventoryTable = document.getElementById("bloodInventory");
        if (inventoryTable) {
            inventoryTable.innerHTML = ""; // Clear previous data
            
            Object.entries(data.bloodInventory).forEach(([bloodType, info]) => {
                let row = inventoryTable.insertRow();
                row.innerHTML = `
                    <td>${bloodType}</td>
                    <td>${info.quantity} ml</td>
                    <td>${info.status}</td>
                    <td>${new Date(info.lastUpdated).toLocaleDateString()}</td>
                `;
                
                // Add color indicator based on status
                if (info.status === 'Low') {
                    row.classList.add('low-stock');
                } else if (info.status === 'Critical') {
                    row.classList.add('critical-stock');
                }
            });
        }
        
        // Display recent donations
        const recentDonationsTable = document.getElementById("recentDonations");
        if (recentDonationsTable) {
            recentDonationsTable.innerHTML = ""; // Clear previous data
            
            if (data.recentDonations.length === 0) {
                recentDonationsTable.innerHTML = "<tr><td colspan='5'>No recent donations</td></tr>";
            } else {
                data.recentDonations.forEach(donation => {
                    let row = recentDonationsTable.insertRow();
                    row.innerHTML = `
                        <td>${donation.donor.name}</td>
                        <td>${donation.bloodType}</td>
                        <td>${donation.quantity} ml</td>
                        <td>${new Date(donation.date).toLocaleDateString()}</td>
                        <td>${donation.status}</td>
                    `;
                });
            }
        }
        
        // Display upcoming appointments
        const appointmentsTable = document.getElementById("adminAppointments");
        if (appointmentsTable) {
            appointmentsTable.innerHTML = ""; // Clear previous data
            
            if (data.upcomingAppointmentsList.length === 0) {
                appointmentsTable.innerHTML = "<tr><td colspan='5'>No upcoming appointments</td></tr>";
            } else {
                data.upcomingAppointmentsList.forEach(appointment => {
                    let row = appointmentsTable.insertRow();
                    row.innerHTML = `
                        <td>${appointment.donor.name}</td>
                        <td>${appointment.donor.bloodType}</td>
                        <td>${new Date(appointment.scheduledDate).toLocaleDateString()}</td>
                        <td>${appointment.donationType}</td>
                        <td>
                            <button class="btn-complete" data-id="${appointment._id}">Complete</button>
                            <button class="btn-reschedule" data-id="${appointment._id}">Reschedule</button>
                        </td>
                    `;
                });
                
                // Add event listeners to action buttons
                appointmentsTable.querySelectorAll('.btn-complete').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const appointmentId = this.getAttribute('data-id');
                        showDonationModal(appointmentId);
                    });
                });
                
                appointmentsTable.querySelectorAll('.btn-reschedule').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const appointmentId = this.getAttribute('data-id');
                        showRescheduleModal(appointmentId);
                    });
                });
            }
        }
        
        // Display alerts
        const alertsContainer = document.getElementById("alerts");
        if (alertsContainer) {
            alertsContainer.innerHTML = ""; // Clear previous data
            
            if (data.alerts.length === 0) {
                alertsContainer.innerHTML = "<p>No alerts</p>";
            } else {
                data.alerts.forEach(alert => {
                    const alertEl = document.createElement("div");
                    alertEl.className = `alert ${alert.priority}`;
                    alertEl.innerHTML = `
                        <h3>${alert.title}</h3>
                        <p>${alert.message}</p>
                        <p>Generated: ${new Date(alert.date).toLocaleDateString()}</p>
                    `;
                    alertsContainer.appendChild(alertEl);
                });
            }
        }
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
    }
}

// Load admin dashboard if on admin dashboard page
if (adminDashboard && token && (userRole === 'admin' || userRole === 'staff')) {
    loadAdminDashboard();
}

/** ============================ 🔹 INVENTORY MANAGEMENT ============================ **/
async function loadInventory() {
    if (!inventoryDisplay) return;

    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            headers: {
                'x-auth-token': token
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display blood inventory
        const inventoryTable = document.getElementById("bloodInventoryTable");
        if (inventoryTable) {
            inventoryTable.innerHTML = ""; // Clear previous data
            
            Object.entries(data).forEach(([bloodType, info]) => {
                let row = inventoryTable.insertRow();
                row.innerHTML = `
                    <td>${bloodType}</td>
                    <td>${info.quantity} ml</td>
                    <td>${info.status}</td>
                    <td>${new Date(info.lastUpdated).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-update" data-type="${bloodType}">Update</button>
                    </td>
                `;
                
                // Add color indicator based on status
                if (info.status === 'Low') {
                    row.classList.add('low-stock');
                } else if (info.status === 'Critical') {
                    row.classList.add('critical-stock');
                }
            });
            
            // Add event listeners to update buttons
            inventoryTable.querySelectorAll('.btn-update').forEach(btn => {
                btn.addEventListener('click', function() {
                    const bloodType = this.getAttribute('data-type');
                    showInventoryUpdateModal(bloodType);
                });
            });
        }
    } catch (error) {
        console.error("Error loading inventory:", error);
    }
}

// Load inventory if on inventory page
if (inventoryDisplay && token && (userRole === 'admin' || userRole === 'staff')) {
    loadInventory();
}

/** ============================ 🔹 MODALS FUNCTIONALITY ============================ **/
function showInventoryUpdateModal(bloodType) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('inventoryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inventoryModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Blood Inventory</h2>
                <form id="inventoryForm">
                    <input type="hidden" id="bloodTypeInput" value="${bloodType}">
                    <div class="form-group">
                        <label for="quantityInput">Blood Type: <span id="bloodTypeDisplay">${bloodType}</span></label>
                    </div>
                    <div class="form-group">
                        <label for="quantityInput">Quantity (ml)</label>
                        <input type="number" id="quantityInput" required min="0">
                    </div>
                    <div class="form-group">
                        <label for="actionSelect">Action</label>
                        <select id="actionSelect" required>
                            <option value="add">Add to inventory
                            <option value="add">Add to inventory</option>
                            <option value="subtract">Subtract from inventory</option>
                            <option value="set">Set inventory level</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="notesInput">Notes</label>
                        <textarea id="notesInput" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Update Inventory</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#inventoryForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const bloodType = document.getElementById('bloodTypeInput').value;
            const quantity = document.getElementById('quantityInput').value;
            const action = document.getElementById('actionSelect').value;
            const notes = document.getElementById('notesInput').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/inventory/${bloodType}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        quantity: parseInt(quantity),
                        action,
                        notes
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Inventory updated successfully!');
                    modal.style.display = 'none';
                    loadInventory(); // Reload inventory data
                } else {
                    alert('Error: ' + (data.msg || 'Failed to update inventory'));
                }
            } catch (error) {
                console.error('Error updating inventory:', error);
                alert('Server Error: Unable to update inventory');
            }
        });
    } else {
        document.getElementById('bloodTypeInput').value = bloodType;
        document.getElementById('bloodTypeDisplay').textContent = bloodType;
    }
    
    modal.style.display = 'block';
}

function showDonationModal(appointmentId) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('donationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'donationModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Complete Donation</h2>
                <form id="completeDonationForm">
                    <input type="hidden" id="appointmentIdInput" value="${appointmentId}">
                    <div class="form-group">
                        <label for="bloodTypeSelect">Blood Type</label>
                        <select id="bloodTypeSelect" required>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quantityInput">Quantity (ml)</label>
                        <input type="number" id="quantityInput" required min="0" value="450">
                    </div>
                    <div class="form-group">
                        <label for="hemoglobinInput">Hemoglobin (g/dL)</label>
                        <input type="number" id="hemoglobinInput" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="bloodPressureInput">Blood Pressure (mmHg)</label>
                        <input type="text" id="bloodPressureInput" placeholder="120/80" required>
                    </div>
                    <div class="form-group">
                        <label for="pulseInput">Pulse (bpm)</label>
                        <input type="number" id="pulseInput" required>
                    </div>
                    <div class="form-group">
                        <label for="notesInput">Notes</label>
                        <textarea id="notesInput" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Complete Donation</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#completeDonationForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const appointmentId = document.getElementById('appointmentIdInput').value;
            const bloodType = document.getElementById('bloodTypeSelect').value;
            const quantity = document.getElementById('quantityInput').value;
            const hemoglobin = document.getElementById('hemoglobinInput').value;
            const bloodPressure = document.getElementById('bloodPressureInput').value;
            const pulse = document.getElementById('pulseInput').value;
            const notes = document.getElementById('notesInput').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        bloodType,
                        quantity: parseInt(quantity),
                        healthParameters: {
                            hemoglobin: parseFloat(hemoglobin),
                            bloodPressure,
                            pulse: parseInt(pulse)
                        },
                        notes
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Donation completed successfully!');
                    modal.style.display = 'none';
                    loadAdminDashboard(); // Reload dashboard data
                } else {
                    alert('Error: ' + (data.msg || 'Failed to complete donation'));
                }
            } catch (error) {
                console.error('Error completing donation:', error);
                alert('Server Error: Unable to complete donation');
            }
        });
    } else {
        document.getElementById('appointmentIdInput').value = appointmentId;
    }
    
    modal.style.display = 'block';
}

function showRescheduleModal(appointmentId) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('rescheduleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rescheduleModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Reschedule Appointment</h2>
                <form id="rescheduleForm">
                    <input type="hidden" id="appointmentIdInput" value="${appointmentId}">
                    <div class="form-group">
                        <label for="newDateInput">New Date</label>
                        <input type="datetime-local" id="newDateInput" required>
                    </div>
                    <div class="form-group">
                        <label for="reasonInput">Reason for Rescheduling</label>
                        <textarea id="reasonInput" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn-primary">Reschedule</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#rescheduleForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const appointmentId = document.getElementById('appointmentIdInput').value;
            const newDate = document.getElementById('newDateInput').value;
            const reason = document.getElementById('reasonInput').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/reschedule`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        scheduledDate: newDate,
                        reason
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Appointment rescheduled successfully!');
                    modal.style.display = 'none';
                    loadAdminDashboard(); // Reload dashboard data
                } else {
                    alert('Error: ' + (data.msg || 'Failed to reschedule appointment'));
                }
            } catch (error) {
                console.error('Error rescheduling appointment:', error);
                alert('Server Error: Unable to reschedule appointment');
            }
        });
    } else {
        document.getElementById('appointmentIdInput').value = appointmentId;
    }
    
    modal.style.display = 'block';
}
});