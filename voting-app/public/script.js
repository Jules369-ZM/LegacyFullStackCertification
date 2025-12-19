// Global variables
let currentUser = null;
let currentView = 'all'; // 'all' or 'my'
let charts = {}; // Store chart instances

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadPolls();

  // Event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Navigation
  document.getElementById('myPollsLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchToMyPolls();
  });

  // Poll creation
  document.getElementById('createPollBtn').addEventListener('click', showCreatePollForm);
  document.getElementById('cancelCreateBtn').addEventListener('click', hideCreatePollForm);
  document.getElementById('addOptionBtn').addEventListener('click', addOptionInput);

  // Poll form submission
  document.getElementById('pollForm').addEventListener('submit', handlePollCreation);

  // Modal
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.getElementById('pollModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
}

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      currentUser = await response.json();
      showAuthenticatedUI();
    } else {
      currentUser = null;
      showUnauthenticatedUI();
    }
  } catch (error) {
    currentUser = null;
    showUnauthenticatedUI();
  }
}

function showAuthenticatedUI() {
  document.getElementById('loginLink').style.display = 'none';
  document.getElementById('logoutLink').style.display = 'inline-block';
  document.getElementById('myPollsLink').style.display = 'inline-block';
  document.getElementById('createPollBtn').style.display = 'inline-block';
  document.getElementById('welcomeSection').style.display = 'none';
}

function showUnauthenticatedUI() {
  document.getElementById('loginLink').style.display = 'inline-block';
  document.getElementById('logoutLink').style.display = 'none';
  document.getElementById('myPollsLink').style.display = 'none';
  document.getElementById('createPollBtn').style.display = 'none';
  document.getElementById('welcomeSection').style.display = 'block';
}

function switchToMyPolls() {
  currentView = 'my';
  document.getElementById('pollsTitle').textContent = 'My Polls';
  document.getElementById('myPollsLink').classList.add('active');
  document.querySelector('.nav-left a:first-child').classList.remove('active');
  loadPolls();
}

function switchToAllPolls() {
  currentView = 'all';
  document.getElementById('pollsTitle').textContent = 'All Polls';
  document.querySelector('.nav-left a:first-child').classList.add('active');
  document.getElementById('myPollsLink').classList.remove('active');
  loadPolls();
}

async function loadPolls() {
  const container = document.getElementById('pollsContainer');
  container.innerHTML = '<div class="loading">Loading polls...</div>';

  try {
    let url = '/api/polls';
    if (currentView === 'my' && currentUser) {
      url = '/api/my-polls';
    }

    const response = await fetch(url);
    const polls = await response.json();

    displayPolls(polls);
  } catch (error) {
    console.error('Error loading polls:', error);
    container.innerHTML = '<div class="error">Failed to load polls. Please try again.</div>';
  }
}

function displayPolls(polls) {
  const container = document.getElementById('pollsContainer');

  if (polls.length === 0) {
    const message = currentView === 'my'
      ? 'You haven\'t created any polls yet. <a href="#" onclick="showCreatePollForm()">Create your first poll!</a>'
      : 'No polls available yet. <a href="/login">Login</a> to create the first poll!';
    container.innerHTML = `<div class="no-polls">${message}</div>`;
    return;
  }

  container.innerHTML = '';

  polls.forEach(poll => {
    const pollCard = createPollCard(poll);
    container.appendChild(pollCard);
  });
}

function createPollCard(poll) {
  const card = document.createElement('div');
  card.className = 'poll-card';

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const userHasVoted = localStorage.getItem(`voted_${poll._id}`);
  const isOwner = currentUser && poll.createdBy._id === currentUser.id;

  card.innerHTML = `
    <div class="poll-header">
      <h3 class="poll-title">${poll.title}</h3>
      <div class="poll-meta">
        <span class="poll-author">by ${poll.createdBy.username}</span>
        <span class="poll-date">${new Date(poll.createdAt).toLocaleDateString()}</span>
      </div>
    </div>

    <div class="poll-content">
      ${userHasVoted ? createResultsView(poll, totalVotes) : createVotingView(poll)}
    </div>

    <div class="poll-footer">
      <div class="poll-stats">
        <span class="total-votes">${totalVotes} vote${totalVotes !== 1 ? 's' : ''}</span>
      </div>
      <div class="poll-actions">
        <button onclick="viewPollDetails('${poll._id}')" class="view-details-btn">
          📊
        </button>
        <button onclick="sharePoll('${poll._id}')" class="share-btn">
          📤
        </button>
        ${isOwner ? `
          <button onclick="deletePoll('${poll._id}')" class="delete-btn">
            🗑️
          </button>
        ` : ''}
        ${currentUser && !userHasVoted ? `
          <button onclick="addCustomOption('${poll._id}')" class="add-option-btn">
            ➕
          </button>
        ` : ''}
      </div>
    </div>
  `;

  return card;
}

function createVotingView(poll) {
  return `
    <div class="voting-view">
      <div class="options-list">
        ${poll.options.map((option, index) => `
          <button class="vote-option" onclick="voteOnPoll('${poll._id}', ${index})">
            ${option.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function createResultsView(poll, totalVotes) {
  return `
    <div class="results-view">
      <div class="mini-chart">
        <canvas id="mini-chart-${poll._id}" width="200" height="100"></canvas>
      </div>
      <div class="results-list">
        ${poll.options.map(option => {
          const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
          return `
            <div class="result-item">
              <span class="option-text">${option.text}</span>
              <span class="vote-count">${option.votes} (${percentage}%)</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function showCreatePollForm() {
  document.getElementById('createPollSection').style.display = 'block';
  document.getElementById('pollsSection').style.display = 'none';
  document.getElementById('welcomeSection').style.display = 'none';
}

function hideCreatePollForm() {
  document.getElementById('createPollSection').style.display = 'none';
  document.getElementById('pollsSection').style.display = 'block';
  if (!currentUser) {
    document.getElementById('welcomeSection').style.display = 'block';
  }
  document.getElementById('pollForm').reset();
  // Reset options to 2
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = `
    <div class="option-input">
      <input type="text" class="option" placeholder="Option 1" required>
      <button type="button" class="remove-option" style="display: none;">×</button>
    </div>
    <div class="option-input">
      <input type="text" class="option" placeholder="Option 2" required>
      <button type="button" class="remove-option" style="display: none;">×</button>
    </div>
  `;
}

function addOptionInput() {
  const optionsContainer = document.getElementById('optionsContainer');
  const optionInputs = optionsContainer.querySelectorAll('.option-input');

  if (optionInputs.length >= 10) {
    alert('Maximum 10 options allowed');
    return;
  }

  const optionInput = document.createElement('div');
  optionInput.className = 'option-input';
  optionInput.innerHTML = `
    <input type="text" class="option" placeholder="Option ${optionInputs.length + 1}" required>
    <button type="button" class="remove-option">×</button>
  `;

  optionInput.querySelector('.remove-option').addEventListener('click', function() {
    if (optionsContainer.children.length > 2) {
      optionInput.remove();
    }
  });

  optionsContainer.appendChild(optionInput);
}

async function handlePollCreation(e) {
  e.preventDefault();

  const title = document.getElementById('pollTitle').value.trim();
  const optionInputs = document.querySelectorAll('.option');
  const options = Array.from(optionInputs).map(input => input.value.trim()).filter(opt => opt);

  if (!title || options.length < 2) {
    alert('Please provide a title and at least 2 options');
    return;
  }

  try {
    const response = await fetch('/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, options })
    });

    if (response.ok) {
      hideCreatePollForm();
      loadPolls();
      showNotification('✅ Poll created successfully!');
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to create poll');
    }
  } catch (error) {
    console.error('Error creating poll:', error);
    alert('Failed to create poll');
  }
}

async function voteOnPoll(pollId, optionIndex) {
  try {
    const response = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ optionIndex })
    });

    if (response.ok) {
      // Mark as voted in localStorage
      localStorage.setItem(`voted_${pollId}`, 'true');
      // Reload polls to show results
      loadPolls();
      showNotification('✅ Vote recorded!');
    } else if (response.status === 401) {
      alert('Please login to vote');
      window.location.href = '/login';
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to vote');
    }
  } catch (error) {
    console.error('Error voting:', error);
    alert('Failed to vote');
  }
}

async function deletePoll(pollId) {
  if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`/api/polls/${pollId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadPolls();
      showNotification('🗑️ Poll deleted');
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete poll');
    }
  } catch (error) {
    console.error('Error deleting poll:', error);
    alert('Failed to delete poll');
  }
}

async function addCustomOption(pollId) {
  const optionText = prompt('Enter your custom option:');
  if (!optionText || !optionText.trim()) return;

  try {
    const response = await fetch(`/api/polls/${pollId}/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ optionText: optionText.trim() })
    });

    const data = await response.json();

    if (response.ok) {
      loadPolls();
      showNotification('✅ Custom option added!');
    } else {
      alert(data.error || 'Failed to add option');
    }
  } catch (error) {
    console.error('Error adding option:', error);
    alert('Failed to add option');
  }
}

async function sharePoll(pollId) {
  try {
    const response = await fetch(`/api/polls/${pollId}/share`);
    const data = await response.json();

    if (response.ok) {
      // Try to copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.shareUrl);
        showNotification('📤 Poll link copied to clipboard!');
      } else {
        // Fallback: show the URL in a prompt
        prompt('Copy this link:', data.shareUrl);
      }
    }
  } catch (error) {
    console.error('Error getting share link:', error);
    alert('Failed to generate share link');
  }
}

function viewPollDetails(pollId) {
  window.open(`/poll/${pollId}`, '_blank');
}

function closeModal() {
  document.getElementById('pollModal').style.display = 'none';
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize - switch to all polls view by default
document.addEventListener('click', (e) => {
  if (e.target.matches('.nav-left a:first-child')) {
    switchToAllPolls();
  }
});
