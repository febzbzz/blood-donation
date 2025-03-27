// recipient-status.js
document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('trackingForm');
    const resultContainer = document.getElementById('resultContainer');
    
    // Check if there's a request ID in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const requestIdParam = urlParams.get('id');
    
    if (requestIdParam) {
        document.getElementById('requestId').value = requestIdParam;
        fetchRequestStatus(requestIdParam);
    }
    
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const requestId = document.getElementById('requestId').value.trim();
        
        if (requestId) {
            fetchRequestStatus(requestId);
        }
    });
    
    async function fetchRequestStatus(requestId) {
        try {
            resultContainer.innerHTML = '<div class="loading">Loading request data...</div>';
            resultContainer.classList.remove('hidden');
            
            const response = await fetch(`/api/recipients/status/${requestId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch request status');
            }
            
            displayRequestData(data.data);
        } catch (error) {
            resultContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${error.message || 'An error occurred while fetching the request status'}</p>
                </div>
            `;
        }
    }
    
    function displayRequestData(recipient) {
        // Format dates
        const requestDate = new Date(recipient.requestDate).toLocaleDateString();
        const approvalDate = recipient.approvalDate ? new Date(recipient.approvalDate).toLocaleDateString() : 'N/A';
        const completionDate = recipient.completionDate ? new Date(recipient.completionDate).toLocaleDateString() : 'N/A';
        
        // Create status timeline
        let timelineHTML = `
            <div class="status-timeline">
                <div class="timeline-item ${recipient.status === 'pending' || recipient.status === 'approved' || recipient.status === 'completed' ? 'active' : ''}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Request Submitted</h4>
                        <p>${requestDate}</p>
                    </div>
                </div>
                <div class="timeline-item ${recipient.status === 'approved' || recipient.status === 'completed' ? 'active' : ''}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Donors Matched</h4>
                        <p>${approvalDate}</p>
                    </div>
                </div>
                <div class="timeline-item ${recipient.status === 'completed' ? 'active' : ''}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Blood Collected</h4>
                        <p>${completionDate}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Format status badge
        const statusBadge = `<span class="status-badge ${recipient.status}">${recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}</span>`;
        
        // Create progress bar for units collected
        const progressPercentage = (recipient.unitsReceived / recipient.unitsRequired) * 100;
        const progressBar = `
            <div class="progress-container">
                <div class="progress-label">Blood Units: ${recipient.unitsReceived} of ${recipient.unitsRequired} collected</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
        `;
        
        // Build the complete HTML
        resultContainer.innerHTML = `
            <div class="request-details">
                <div class="request-header">
                    <h2>Request ID: ${recipient.requestId}</h2>
                    <div class="status-container">${statusBadge}</div>
                </div>
                
                <div class="request-info">
                    <div class="info-column">
                        <div class="info-item">
                            <label>Name:</label>
                            <span>${recipient.name}</span>
                        </div>
                        <div class="info-item">
                            <label>Blood Type:</label>
                            <span>${recipient.bloodType}</span>
                        </div>
                        // recipient-status.js (continued)
                        </div>
                        <div class="info-item">
                            <label>Hospital:</label>
                            <span>${recipient.hospital}</span>
                        </div>
                    </div>
                    <div class="info-column">
                        <div class="info-item">
                            <label>Request Date:</label>
                            <span>${requestDate}</span>
                        </div>
                        <div class="info-item">
                            <label>Urgency:</label>
                            <span class="urgency-${recipient.urgency}">${recipient.urgency.charAt(0).toUpperCase() + recipient.urgency.slice(1)}</span>
                        </div>
                        <div class="info-item">
                            <label>Last Updated:</label>
                            <span>${new Date(recipient.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                ${progressBar}
                
                <div class="timeline-section">
                    <h3>Request Timeline</h3>
                    ${timelineHTML}
                </div>
                
                ${recipient.matchedDonors && recipient.matchedDonors.length > 0 ? `
                    <div class="matched-donors">
                        <h3>Matched Donors</h3>
                        <p>${recipient.matchedDonors.length} donor(s) matched to your request.</p>
                    </div>
                ` : ''}
                
                ${recipient.adminNotes ? `
                    <div class="admin-notes">
                        <h3>Additional Information</h3>
                        <p>${recipient.adminNotes}</p>
                    </div>
                ` : ''}
                
                <div class="actions">
                    <a href="contact.html" class="btn-secondary">Contact Support</a>
                    ${recipient.status === 'pending' ? `
                        <a href="recipient-update.html?id=${recipient.requestId}" class="btn-primary">Update Request</a>
                    ` : ''}
                </div>
            </div>
        `;
    }
});