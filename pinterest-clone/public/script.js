document.addEventListener('DOMContentLoaded', () => {
  loadPins();
  checkAuthStatus();
  initializeMasonry();

  // Modal functionality
  const modal = document.getElementById('pinModal');
  const closeBtn = document.getElementsByClassName('close')[0];

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Pin creation form
  const pinForm = document.getElementById('pinForm');
  pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pinData = {
      title: document.getElementById('pinTitle').value,
      description: document.getElementById('pinDescription').value,
      imageUrl: document.getElementById('pinImageUrl').value,
      board: document.getElementById('pinBoard').value,
      tags: document.getElementById('pinTags').value
    };

    try {
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pinData)
      });

      if (response.ok) {
        loadPins();
        pinForm.reset();
        document.getElementById('createPin').style.display = 'none';
      } else {
        alert('Failed to create pin');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  // Board creation form
  const boardForm = document.getElementById('boardForm');
  boardForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const boardData = {
      name: document.getElementById('boardName').value,
      description: document.getElementById('boardDescription').value,
      isPrivate: document.getElementById('boardPrivate').checked
    };

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(boardData)
      });

      if (response.ok) {
        loadBoards();
        boardForm.reset();
        document.getElementById('createBoard').style.display = 'none';
      } else {
        alert('Failed to create board');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      showAuthenticatedFeatures();
      loadBoards();
    } else {
      hideAuthenticatedFeatures();
    }
  } catch (error) {
    hideAuthenticatedFeatures();
  }
}

async function loadPins() {
  try {
    const response = await fetch('/api/pins');
    const pins = await response.json();
    displayPins(pins);
  } catch (error) {
    console.error('Error loading pins:', error);
  }
}

async function loadBoards() {
  try {
    const response = await fetch('/api/boards');
    const boards = await response.json();
    populateBoardSelect(boards);
  } catch (error) {
    console.error('Error loading boards:', error);
  }
}

function displayPins(pins) {
  const container = document.getElementById('pinsContainer');
  container.innerHTML = '';

  pins.forEach(pin => {
    const pinDiv = document.createElement('div');
    pinDiv.className = 'pin';

    pinDiv.innerHTML = `
      <img src="${pin.image}" alt="${pin.title}" onclick="openPinModal('${pin._id}')">
      <div class="pin-content">
        <div class="pin-title">${pin.title}</div>
        <div class="pin-meta">
          <span>by ${pin.creator.username}</span>
          <button class="like-btn ${pin.likes.length > 0 ? 'liked' : ''}" onclick="toggleLike('${pin._id}', this)">
            ❤️ ${pin.likes.length}
          </button>
        </div>
      </div>
    `;

    container.appendChild(pinDiv);
  });
}

function populateBoardSelect(boards) {
  const select = document.getElementById('pinBoard');
  select.innerHTML = '<option value="">Select Board (optional)</option>';

  boards.forEach(board => {
    const option = document.createElement('option');
    option.value = board._id;
    option.textContent = board.name;
    select.appendChild(option);
  });
}

async function toggleLike(pinId, button) {
  try {
    const response = await fetch(`/api/pins/${pinId}/like`, {
      method: 'POST'
    });

    if (response.ok) {
      const data = await response.json();
      button.textContent = `❤️ ${data.likes}`;
      button.classList.toggle('liked');
    } else {
      alert('Please login to like pins');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function openPinModal(pinId) {
  try {
    const response = await fetch(`/api/pins`);
    const pins = await response.json();
    const pin = pins.find(p => p._id === pinId);

    if (!pin) return;

    const commentsResponse = await fetch(`/api/pins/${pinId}/comments`);
    const comments = await commentsResponse.json();

    const modal = document.getElementById('pinModal');
    const pinDetail = document.getElementById('pinDetail');

    pinDetail.innerHTML = `
      <img src="${pin.image}" alt="${pin.title}" class="pin-detail-image">
      <div class="pin-detail-content">
        <h2 class="pin-detail-title">${pin.title}</h2>
        <p class="pin-detail-description">${pin.description || 'No description'}</p>
        <div class="pin-detail-meta">
          <span>by <a href="#" onclick="viewUserWall('${pin.creator.username}')">${pin.creator.username}</a></span>
          <button class="like-btn ${pin.likes.length > 0 ? 'liked' : ''}" onclick="toggleLike('${pin._id}', this)">
            ❤️ ${pin.likes.length}
          </button>
        </div>

        <div class="comments-section">
          <h3>Comments</h3>
          <div id="commentsList">
            ${comments.map(comment => `
              <div class="comment">
                <div class="comment-author">${comment.author.username}</div>
                <div>${comment.text}</div>
              </div>
            `).join('')}
          </div>

          <div class="add-comment">
            <textarea placeholder="Add a comment..." id="commentText"></textarea>
            <button onclick="addComment('${pinId}')">Comment</button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'block';
  } catch (error) {
    console.error('Error loading pin details:', error);
  }
}

async function addComment(pinId) {
  const commentText = document.getElementById('commentText').value.trim();
  if (!commentText) return;

  try {
    const response = await fetch(`/api/pins/${pinId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: commentText })
    });

    if (response.ok) {
      document.getElementById('commentText').value = '';
      // Reload comments
      const commentsResponse = await fetch(`/api/pins/${pinId}/comments`);
      const comments = await commentsResponse.json();

      const commentsList = document.getElementById('commentsList');
      commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
          <div class="comment-author">${comment.author.username}</div>
          <div>${comment.text}</div>
        </div>
      `).join('');
    } else {
      alert('Failed to add comment');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function showAuthenticatedFeatures() {
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <div>
      <button onclick="toggleCreatePin()">Create Pin</button>
      <button onclick="toggleCreateBoard()">Create Board</button>
    </div>
    <div>
      <a href="/">Home</a>
      <a href="/logout">Logout</a>
    </div>
  `;
}

function hideAuthenticatedFeatures() {
  const nav = document.getElementById('nav');
  nav.innerHTML = `
    <a href="/">Home</a>
    <a href="/login">Login</a>
    <a href="/register">Register</a>
  `;
}

function toggleCreatePin() {
  const createPin = document.getElementById('createPin');
  const createBoard = document.getElementById('createBoard');
  createBoard.style.display = 'none';
  createPin.style.display = createPin.style.display === 'none' ? 'block' : 'none';
}

function toggleCreateBoard() {
  const createBoard = document.getElementById('createBoard');
  const createPin = document.getElementById('createPin');
  createPin.style.display = 'none';
  createBoard.style.display = createBoard.style.display === 'none' ? 'block' : 'none';
}

// Initialize Masonry layout
function initializeMasonry() {
  const container = document.querySelector('.pins-grid');
  if (container) {
    const msnry = new Masonry(container, {
      itemSelector: '.pin',
      columnWidth: 250,
      gutter: 20,
      fitWidth: true
    });

    // Re-layout after images load
    imagesLoaded(container).on('progress', function() {
      msnry.layout();
    });
  }
}

// Handle broken images
function handleBrokenImages() {
  const images = document.querySelectorAll('.pin img, .pin-detail-image');
  images.forEach(img => {
    img.addEventListener('error', function() {
      this.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
      this.alt = 'Image not available';
    });
  });
}

// Delete pin function
async function deletePin(pinId) {
  if (!confirm('Are you sure you want to delete this pin?')) return;

  try {
    const response = await fetch(`/api/pins/${pinId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadPins(); // Reload pins
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete pin');
    }
  } catch (error) {
    console.error('Error deleting pin:', error);
    alert('Failed to delete pin');
  }
}

// Update displayPins to include delete button and clickable usernames
function displayPins(pins) {
  const container = document.getElementById('pinsContainer');
  container.innerHTML = '';

  pins.forEach(pin => {
    const pinDiv = document.createElement('div');
    pinDiv.className = 'pin';

    const deleteButton = pin.canDelete ? `<button class="delete-btn" onclick="deletePin('${pin._id}')">🗑️</button>` : '';

    pinDiv.innerHTML = `
      <img src="${pin.image}" alt="${pin.title}" onclick="openPinModal('${pin._id}')">
      <div class="pin-content">
        <div class="pin-title">${pin.title}</div>
        <div class="pin-meta">
          <span>by <a href="#" onclick="viewUserWall('${pin.creator.username}')">${pin.creator.username}</a></span>
          <button class="like-btn ${pin.likes.length > 0 ? 'liked' : ''}" onclick="toggleLike('${pin._id}', this)">
            ❤️ ${pin.likes.length}
          </button>
          ${deleteButton}
        </div>
      </div>
    `;

    container.appendChild(pinDiv);
  });

  // Initialize Masonry after adding pins
  initializeMasonry();
  handleBrokenImages();
}

// Check if current user can delete a pin
async function checkDeletePermissions(pins) {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      const user = await response.json();
      pins.forEach(pin => {
        pin.canDelete = pin.creator._id === user.id;
      });
    }
  } catch (error) {
    // User not authenticated, can't delete any pins
    pins.forEach(pin => {
      pin.canDelete = false;
    });
  }
  return pins;
}

// View user wall
function viewUserWall(username) {
  window.location.href = `/user/${username}`;
}

// Update loadPins to check delete permissions and handle user pages
async function loadPins() {
  try {
    // Check if we're on a user page
    const urlParts = window.location.pathname.split('/');
    const isUserPage = urlParts[1] === 'user';
    const username = isUserPage ? urlParts[2] : null;

    let response;
    if (isUserPage && username) {
      response = await fetch(`/api/users/${username}`);
      const data = await response.json();
      if (data.user) {
        // Update page title and header
        document.querySelector('h1').textContent = `${data.user.displayName || data.user.username}'s Wall`;
        document.title = `${data.user.displayName || data.user.username}'s Wall - Pinterest Clone`;
      }
      let pins = data.pins || [];
      pins = await checkDeletePermissions(pins);
      displayPins(pins);
    } else {
      response = await fetch('/api/pins');
      let pins = await response.json();
      pins = await checkDeletePermissions(pins);
      displayPins(pins);
    }
  } catch (error) {
    console.error('Error loading pins:', error);
  }
}
