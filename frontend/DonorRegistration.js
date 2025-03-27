// DonorRegistration.js (for traditional approach)
function renderDonorRegistrationForm(container) {
    // Create form
    const form = document.createElement('form');
    form.innerHTML = `
        <h2>Donor Registration</h2>
        <input type="text" id="name" placeholder="Full Name" required>
        <select id="bloodGroup" required>
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
        </select>
        <input type="number" id="age" placeholder="Age" required>
        <input type="tel" id="contact" placeholder="Contact Number" required>
        <textarea id="address" placeholder="Address" required></textarea>
        <button type="submit">Register</button>
        <p id="message"></p>
    `;
    
    // Add form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const messageElement = document.getElementById('message');
        
        const formData = {
            name: document.getElementById('name').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            age: document.getElementById('age').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value
        };
        
        try {
            const response = await registerDonor(formData);
            messageElement.textContent = 'Registration successful!';
            form.reset();
        } catch (error) {
            messageElement.textContent = 'Registration failed. Please try again.';
        }
    });
    
    container.appendChild(form);
}