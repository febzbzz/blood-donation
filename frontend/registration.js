document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript file loaded successfully."); // Debugging

    const recipientForm = document.getElementById("recipientForm");
    const statusMessage = document.getElementById("statusMessage");

    if (!recipientForm) {
        console.error("Form element not found!");
        return;
    }

    recipientForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("Form submitted"); // Debugging

        if (!validateForm()) {
            console.log("Form validation failed");
            return;
        }

        const formData = new FormData(recipientForm);
        const recipientData = Object.fromEntries(formData.entries());

        try {
            console.log("Sending data:", recipientData); // Debugging

            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(recipientData),
            });

            const result = await response.json();
            console.log("Server response:", result);

            if (response.ok) {
                statusMessage.innerHTML = `
                    <div class="success-message">
                        <h3>Registration Successful!</h3>
                        <p>Your request ID is: <strong>${result.requestId}</strong></p>
                        <p>Please save this ID for tracking your request status.</p>
                        <a href="/recipient-status?id=${result.requestId}" class="btn-primary">Track Status</a>
                    </div>
                `;
                recipientForm.reset();
            } else {
                throw new Error(result.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error.message);
            statusMessage.innerHTML = `
                <div class="error-message">
                    <h3>Registration Failed</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    });

    function validateForm() {
        console.log("Validating form"); // Debugging

        const errorElements = document.querySelectorAll(".error-text");
        errorElements.forEach(element => element.remove());

        let isValid = true;

        function showError(input, message) {
            const errorElement = document.createElement("div");
            errorElement.className = "error-text";
            errorElement.textContent = message;
            input.parentElement.appendChild(errorElement);
            input.classList.add("error-input");
        }

        const nameInput = document.getElementById("name");
        if (!nameInput.value.trim()) {
            showError(nameInput, "Name is required");
            isValid = false;
        }

        const contactInput = document.getElementById("contactNumber");
        if (!contactInput.value.trim() || !/^\d{10}$/.test(contactInput.value)) {
            showError(contactInput, "Enter a valid 10-digit contact number");
            isValid = false;
        }

        const bloodTypeInput = document.getElementById("bloodType");
        if (!bloodTypeInput.value) {
            showError(bloodTypeInput, "Blood type is required");
            isValid = false;
        }

        const unitsInput = document.getElementById("unitsRequired");
        if (!unitsInput.value || unitsInput.value < 1) {
            showError(unitsInput, "At least 1 unit is required");
            isValid = false;
        }

        const hospitalInput = document.getElementById("hospital");
        if (!hospitalInput.value.trim()) {
            showError(hospitalInput, "Hospital/Collection center is required");
            isValid = false;
        }

        return isValid;
    }
});
