// Issue Tracker Frontend JavaScript

class IssueTracker {
    constructor() {
        this.currentProject = 'apitest';

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Submit Issue Form
        document.getElementById('submitIssueForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitIssue();
        });

        // Update Issue Form
        document.getElementById('updateIssueForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateIssue();
        });

        // Delete Issue Form
        document.getElementById('deleteIssueForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.deleteIssue();
        });
    }

    async submitIssue() {
        const formData = new FormData(document.getElementById('submitIssueForm'));
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/issues/${this.currentProject}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            this.displayResult(result, response.ok ? 'success' : 'error');
        } catch (error) {
            this.displayResult({ error: 'Network error: ' + error.message }, 'error');
        }
    }

    async updateIssue() {
        const formData = new FormData(document.getElementById('updateIssueForm'));
        const data = Object.fromEntries(formData.entries());

        // Handle checkbox for open status
        const openCheckbox = document.getElementById('updateOpen');
        if (openCheckbox.checked) {
            data.open = false; // Check to close issue
        } else if (data.open === 'on') {
            data.open = true; // If checkbox was checked but not changed
        } else {
            delete data.open; // Don't update open status if checkbox not checked
        }

        try {
            const response = await fetch(`/api/issues/${this.currentProject}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            this.displayResult(result, response.ok ? 'success' : 'error');
        } catch (error) {
            this.displayResult({ error: 'Network error: ' + error.message }, 'error');
        }
    }

    async deleteIssue() {
        const issueId = document.getElementById('deleteId').value;

        if (!issueId) {
            this.displayResult({ error: 'Please provide an issue ID' }, 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }

        try {
            const response = await fetch(`/api/issues/${this.currentProject}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _id: issueId })
            });

            const result = await response.json();
            this.displayResult(result, response.ok ? 'success' : 'error');
        } catch (error) {
            this.displayResult({ error: 'Network error: ' + error.message }, 'error');
        }
    }

    displayResult(result, type) {
        const container = document.getElementById('resultsContainer');

        // Format the result as JSON
        const formattedResult = JSON.stringify(result, null, 2);

        container.innerHTML = `
            <h4>Response (${type === 'success' ? 'Success' : 'Error'})</h4>
            <pre>${this.escapeHtml(formattedResult)}</pre>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const issueTracker = new IssueTracker();
