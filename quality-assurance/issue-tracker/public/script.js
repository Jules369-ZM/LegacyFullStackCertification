// Issue Tracker Frontend JavaScript

class IssueTracker {
    constructor() {
        this.currentProject = '';
        this.currentFilters = {};
        this.selectedIssueId = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialIssues();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('issueForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createIssue();
        });

        // Filter buttons
        document.getElementById('applyFilter').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilter').addEventListener('click', () => {
            this.clearFilters();
        });

        document.getElementById('refreshIssues').addEventListener('click', () => {
            this.loadIssues();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('issueModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Modal actions
        document.getElementById('updateIssueBtn').addEventListener('click', () => {
            this.openUpdateModal();
        });

        document.getElementById('deleteIssueBtn').addEventListener('click', () => {
            this.deleteIssue();
        });
    }

    async createIssue() {
        const formData = new FormData(document.getElementById('issueForm'));
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/issues/${data.project}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Issue created successfully!', 'success');
                document.getElementById('issueForm').reset();
                this.loadIssues();
            } else {
                this.showNotification(result.error || 'Failed to create issue', 'error');
            }
        } catch (error) {
            this.showNotification('Network error: ' + error.message, 'error');
        }
    }

    async loadIssues() {
        const project = this.currentProject || document.getElementById('filterProject').value;
        if (!project) {
            this.showNotification('Please enter a project name to view issues', 'info');
            this.displayIssues([]);
            return;
        }

        try {
            const params = new URLSearchParams(this.currentFilters);
            const response = await fetch(`/api/issues/${project}${params.toString() ? '?' + params.toString() : ''}`);
            const issues = await response.json();

            this.displayIssues(issues);
        } catch (error) {
            this.showNotification('Failed to load issues: ' + error.message, 'error');
            this.displayIssues([]);
        }
    }

    loadInitialIssues() {
        // Try to load issues for a default project
        this.currentProject = 'test-project';
        document.getElementById('filterProject').value = 'test-project';
        this.loadIssues();
    }

    displayIssues(issues) {
        const container = document.getElementById('issuesContainer');

        if (issues.length === 0) {
            container.innerHTML = '<p class="loading">No issues found. Create your first issue above!</p>';
            return;
        }

        container.innerHTML = issues.map(issue => `
            <div class="issue-item" onclick="issueTracker.selectIssue('${issue._id}')">
                <div class="issue-title">${this.escapeHtml(issue.issue_title)}</div>
                <div class="issue-meta">
                    Project: <strong>${this.escapeHtml(issue.project)}</strong> |
                    Created by: <strong>${this.escapeHtml(issue.created_by)}</strong> |
                    Created: ${new Date(issue.created_on).toLocaleDateString()}
                </div>
                <div class="issue-description">${this.escapeHtml(issue.issue_text)}</div>
                <div class="issue-meta">
                    Assigned to: ${issue.assigned_to || 'Unassigned'} |
                    Status: ${issue.status_text || 'No status'}
                </div>
                <span class="issue-status ${issue.open ? 'status-open' : 'status-closed'}">
                    ${issue.open ? 'OPEN' : 'CLOSED'}
                </span>
            </div>
        `).join('');
    }

    selectIssue(issueId) {
        this.selectedIssueId = issueId;
        this.showModal(issueId);
    }

    async showModal(issueId) {
        try {
            const project = this.currentProject || document.getElementById('filterProject').value;
            const response = await fetch(`/api/issues/${project}?_id=${issueId}`);
            const issues = await response.json();

            if (issues.length > 0) {
                const issue = issues[0];
                const modalContent = document.getElementById('modalContent');

                modalContent.innerHTML = `
                    <div class="modal-field">
                        <label><strong>Project:</strong></label>
                        <p>${this.escapeHtml(issue.project)}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Title:</strong></label>
                        <p>${this.escapeHtml(issue.issue_title)}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Description:</strong></label>
                        <p>${this.escapeHtml(issue.issue_text)}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Created By:</strong></label>
                        <p>${this.escapeHtml(issue.created_by)}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Assigned To:</strong></label>
                        <p>${issue.assigned_to || 'Unassigned'}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Status:</strong></label>
                        <p>${issue.status_text || 'No status'}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Status:</strong></label>
                        <p><span class="issue-status ${issue.open ? 'status-open' : 'status-closed'}">${issue.open ? 'OPEN' : 'CLOSED'}</span></p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Created:</strong></label>
                        <p>${new Date(issue.created_on).toLocaleString()}</p>
                    </div>
                    <div class="modal-field">
                        <label><strong>Last Updated:</strong></label>
                        <p>${new Date(issue.updated_on).toLocaleString()}</p>
                    </div>
                `;

                document.getElementById('issueModal').style.display = 'block';
            }
        } catch (error) {
            this.showNotification('Failed to load issue details: ' + error.message, 'error');
        }
    }

    closeModal() {
        document.getElementById('issueModal').style.display = 'none';
        this.selectedIssueId = null;
    }

    async openUpdateModal() {
        if (!this.selectedIssueId) return;

        const project = this.currentProject || document.getElementById('filterProject').value;
        const response = await fetch(`/api/issues/${project}?_id=${this.selectedIssueId}`);
        const issues = await response.json();

        if (issues.length > 0) {
            const issue = issues[0];
            const modalContent = document.getElementById('modalContent');

            modalContent.innerHTML = `
                <div class="form-group">
                    <label for="updateTitle">Title:</label>
                    <input type="text" id="updateTitle" value="${this.escapeHtml(issue.issue_title)}">
                </div>
                <div class="form-group">
                    <label for="updateText">Description:</label>
                    <textarea id="updateText" rows="3">${this.escapeHtml(issue.issue_text)}</textarea>
                </div>
                <div class="form-group">
                    <label for="updateCreatedBy">Created By:</label>
                    <input type="text" id="updateCreatedBy" value="${this.escapeHtml(issue.created_by)}">
                </div>
                <div class="form-group">
                    <label for="updateAssignedTo">Assigned To:</label>
                    <input type="text" id="updateAssignedTo" value="${issue.assigned_to || ''}">
                </div>
                <div class="form-group">
                    <label for="updateStatusText">Status:</label>
                    <input type="text" id="updateStatusText" value="${issue.status_text || ''}">
                </div>
                <div class="form-group">
                    <label for="updateOpen">Open:</label>
                    <select id="updateOpen">
                        <option value="true" ${issue.open ? 'selected' : ''}>Open</option>
                        <option value="false" ${!issue.open ? 'selected' : ''}>Closed</option>
                    </select>
                </div>
            `;

            // Update the update button action
            const updateBtn = document.getElementById('updateIssueBtn');
            updateBtn.textContent = 'Save Changes';
            updateBtn.onclick = () => this.updateIssue();
        }
    }

    async updateIssue() {
        const data = {
            _id: this.selectedIssueId,
            issue_title: document.getElementById('updateTitle').value,
            issue_text: document.getElementById('updateText').value,
            created_by: document.getElementById('updateCreatedBy').value,
            assigned_to: document.getElementById('updateAssignedTo').value,
            status_text: document.getElementById('updateStatusText').value,
            open: document.getElementById('updateOpen').value === 'true'
        };

        try {
            const project = this.currentProject || document.getElementById('filterProject').value;
            const response = await fetch(`/api/issues/${project}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Issue updated successfully!', 'success');
                this.closeModal();
                this.loadIssues();
            } else {
                this.showNotification(result.error || 'Failed to update issue', 'error');
            }
        } catch (error) {
            this.showNotification('Network error: ' + error.message, 'error');
        }
    }

    async deleteIssue() {
        if (!this.selectedIssueId) return;

        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }

        try {
            const project = this.currentProject || document.getElementById('filterProject').value;
            const response = await fetch(`/api/issues/${project}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _id: this.selectedIssueId })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Issue deleted successfully!', 'success');
                this.closeModal();
                this.loadIssues();
            } else {
                this.showNotification(result.error || 'Failed to delete issue', 'error');
            }
        } catch (error) {
            this.showNotification('Network error: ' + error.message, 'error');
        }
    }

    applyFilters() {
        this.currentFilters = {};

        const project = document.getElementById('filterProject').value;
        const createdBy = document.getElementById('filterCreatedBy').value;
        const assignedTo = document.getElementById('filterAssignedTo').value;
        const status = document.getElementById('filterStatus').value;
        const open = document.getElementById('filterOpen').value;

        if (project) this.currentFilters.project = project;
        if (createdBy) this.currentFilters.created_by = createdBy;
        if (assignedTo) this.currentFilters.assigned_to = assignedTo;
        if (status) this.currentFilters.status_text = status;
        if (open) this.currentFilters.open = open;

        this.currentProject = project;
        this.loadIssues();
    }

    clearFilters() {
        this.currentFilters = {};
        this.currentProject = '';
        document.getElementById('filterProject').value = '';
        document.getElementById('filterCreatedBy').value = '';
        document.getElementById('filterAssignedTo').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterOpen').value = '';
        this.loadIssues();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add styles
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1001';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';

        // Set colors based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                notification.style.color = 'white';
                break;
            case 'info':
                notification.style.backgroundColor = '#3498db';
                notification.style.color = 'white';
                break;
            default:
                notification.style.backgroundColor = '#95a5a6';
                notification.style.color = 'white';
        }

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
const issueTracker = new IssueTracker();